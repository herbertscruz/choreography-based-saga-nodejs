const PaymentService = require('./PaymentService');

module.exports = function(app, channel, db) {

    const paymentService = new PaymentService(channel, db);

    app.post('/payments', async (req, res) => {
        try {
            console.log('Got body (/payments):', req.body);
            const payment = await paymentService.createPayment(req.body);
            res.status(200).json(payment);
        } catch (err) {
            const error = err.message || err.toString();
            res.status(500).json({ error });
        }
    });

}