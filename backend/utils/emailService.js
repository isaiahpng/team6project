const nodemailer = require('nodemailer');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send low stock notification
const sendLowStockNotification = async (item) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `Low Stock Alert: ${item.ProductName}`,
            html: `
                <h2>Low Stock Alert</h2>
                <p>The following item is running low on inventory:</p>
                <ul>
                    <li><strong>Product:</strong> ${item.ProductName}</li>
                    <li><strong>Current Quantity:</strong> ${item.InventoryQuantity}</li>
                    <li><strong>Product ID:</strong> ${item.ProductID}</li>
                </ul>
                <p>Please restock this item soon.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Low stock notification sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending low stock notification:', error);
        return false;
    }
};

// Function to check inventory levels and send notifications
const checkInventoryLevels = async (db, threshold = 5) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM inventory WHERE InventoryQuantity <= ?';
        
        db.query(query, [threshold], async (err, results) => {
            if (err) {
                console.error('Error checking inventory levels:', err);
                reject(err);
                return;
            }

            for (const item of results) {
                await sendLowStockNotification(item);
            }

            resolve(results.length);
        });
    });
};

module.exports = {
    sendLowStockNotification,
    checkInventoryLevels
};
