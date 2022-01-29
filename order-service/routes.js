const OrderService = require('./OrderService');

module.exports = function(app, channel, db) {

    const orderService = new OrderService(channel, db);

    app.post('/orders', async (req, res) => {
        try {
            console.log('Got body (/orders):', req.body);
            const order = await orderService.createPendingOrder(req.body);
            res.status(200).json(order);
        } catch (err) {
            const error = err.message || err.toString();
            res.status(500).json({ error });
        }
    });

}