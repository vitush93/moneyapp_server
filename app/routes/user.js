var User = require('../models/user');

/**
 * User-related routes
 *
 * @param router express router
 */
module.exports = function (router) {

    // find single user by email
    router.get('/user', function (req, res) {
        User.findOne({
            email: req.decoded.email
        }, function (err, user) {

            if (err) throw err;

            res.json(user);
        });
    });

};