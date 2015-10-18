var User = require('../models/user');
var Entry = require('../models/entry');
var async = require('async');

/**
 * @param data
 * @param callback
 */
function processPayment(data, callback) {
    async.waterfall([

        // fetch currently logged user data
        function (next) {
            User.findOne({
                email: data.email
            }).select('+entries').exec(function (err, user) {
                next(err, user);
            });
        },

        // fetch payment recipient data
        function (user, next) {
            User.findOne({
                email: data.recipient
            }).select('+entries').exec(function (err, recipient) {
                next(err, user, recipient);
            });
        },

        // create a new payment
        function (user, recipient, next) {
            var payment = new Entry({
                recipient: recipient,
                amount: data.amount
            });

            payment.save(function (err) {
                next(err, user, recipient, payment);
            });
        },

        // save new payment
        function (user, recipient, payment, next) {
            user.entries.push(payment);

            user.save(function (err) {
                next(err, user, recipient);
            });
        },

        // compute total balance for the recipient
        function (user, recipient, next) {
            user.totalBalance(recipient._id, function (err, balance) {
                next(err, user, balance);
            });
        }
    ], callback);
}

/**
 * Perform payment for some user.
 *
 * @param router express router
 */
module.exports = function (router) {

    router.post('/pay', function (req, res) {

        var amount = req.body.amount;
        var recipient_email = req.body.recipient;
        var user_email = req.decoded.email;

        processPayment({
            email: user_email,
            recipient: recipient_email,
            amount: amount
        }, function (err, user, balance) {

            if (err) throw err;

            var plain_user = user.toObject();
            delete plain_user.entries; // remove unnecessary field

            res.json({
                success: true,
                user: plain_user,
                balance: balance
            });
        });
    });
};
