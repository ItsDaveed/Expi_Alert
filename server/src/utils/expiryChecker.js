const Product = require('../models/Product');
const Alert = require('../models/Alert');
const Business = require('../models/Business');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmailAlert = async (business, products) => {
  if (!business.notifyByEmail || !business.email) return;

  const productList = products
    .map((p) => {
      const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return `<li><strong>${p.name}</strong> — ${days < 0 ? 'EXPIRED' : `expires in ${days} day(s)`} (${new Date(p.expiryDate).toDateString()})</li>`;
    })
    .join('');

  const mailOptions = {
    from: `ExpiAlert 🔔 <${process.env.EMAIL_USER}>`,
    to: business.email,
    subject: `⚠️ ExpiAlert: Product Expiry Notice for ${business.businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #e53e3e;">⚠️ Product Expiry Alert</h2>
        <p>Hello <strong>${business.businessName}</strong>,</p>
        <p>The following products require your attention:</p>
        <ul>${productList}</ul>
        <p>Please log in to <strong>ExpiAlert</strong> to take action.</p>
        <hr/>
        <small style="color: #999;">This is an automated alert from ExpiAlert.</small>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${business.email}`);
  } catch (err) {
    console.error(`Failed to send email to ${business.email}:`, err.message);
  }
};

const runExpiryCheck = async (io) => {
  try {
    const businesses = await Business.find();

    for (const business of businesses) {
      const warningDays = business.expiryWarningDays || 7;
      const today = new Date();
      const warningDate = new Date();
      warningDate.setDate(today.getDate() + warningDays);

      // Find all products expiring soon or already expired
      const atRiskProducts = await Product.find({
        business: business._id,
        expiryDate: { $lte: warningDate },
      });

      const alertedProducts = [];

      for (const product of atRiskProducts) {
        const daysLeft = Math.ceil((new Date(product.expiryDate) - today) / (1000 * 60 * 60 * 24));
        const type = daysLeft < 0 ? 'expired' : 'expiring_soon';
        const newStatus = daysLeft < 0 ? 'expired' : 'expiring_soon';

        // Update product status
        if (product.status !== newStatus) {
          product.status = newStatus;
          await product.save();
        }

        // Avoid duplicate alerts created today
        const existingAlert = await Alert.findOne({
          business: business._id,
          product: product._id,
          type,
          createdAt: { $gte: new Date(today.setHours(0, 0, 0, 0)) },
        });

        if (!existingAlert) {
          const message =
            type === 'expired'
              ? `${product.name} has expired.`
              : `${product.name} expires in ${daysLeft} day(s).`;

          const alert = await Alert.create({
            business: business._id,
            product: product._id,
            type,
            message,
            daysLeft,
          });

          // Emit real-time socket alert
          if (io) {
            io.to(business._id.toString()).emit('new_alert', {
              ...alert.toObject(),
              product: { name: product.name, expiryDate: product.expiryDate },
            });
          }

          alertedProducts.push(product);
        }
      }

      // Send email summary if there are new alerts
      if (alertedProducts.length > 0) {
        await sendEmailAlert(business, alertedProducts);
      }
    }

    console.log('Expiry check complete.');
  } catch (err) {
    console.error('Expiry check error:', err.message);
  }
};

module.exports = { runExpiryCheck };
