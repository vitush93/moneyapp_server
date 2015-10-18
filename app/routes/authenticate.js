var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var config = require('../../config');

/**
 * Authentication routes.
 *
 * @param router express router
 */
module.exports = function (router) {

    // user authentication
    router.post('/authenticate', function (req, res) {

        User.findOne({
            email: req.body.email
        }, function (err, user) {

            if (err) throw err;

            if (!user) {
                res.json({success: false, message: 'Authentication failed. User not found.'});
            } else {
                bcrypt.compare(req.body.password, user.password, function (error, result) {

                    if (error) throw error;

                    if (result) {
                        // if user is found and password is right
                        // create a token
                        var token = jwt.sign(user, config.secret, {
                            expiresIn: 3600 // expires in 1 hour
                        });

                        // return the information including token as JSON
                        res.json({
                            success: true,
                            message: 'Enjoy your token!',
                            token: token
                        });
                    } else {
                        res.json({success: false, message: 'Authentication failed. Wrong password.'});
                    }
                });
            }
        }).select('+password');
    });
};