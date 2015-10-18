var _ = require('underscore');
var User = require('../models/user');

/**
 * Handles user registration.
 *
 * @param router express router
 */
module.exports = function (router) {

    // user registration
    router.post('/register', function (req, res) {

        var user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        user.save(function (err) {

            // check if error occured
            if (err) {
                if (err.name == 'ValidationError') { // send validation errors
                    var validationErrors = [];
                    _.each(err.errors, function (e) {
                        validationErrors.push({
                            field: e.path,
                            message: e.message
                        });
                    });

                    res.json({
                        success: false,
                        message: 'Validation errors occured.',
                        errors: validationErrors
                    });
                    return;
                } else if (err.code === 11000) {
                    res.json({
                        success: false,
                        message: 'User with this e-mail already exists.'
                    });
                    return;
                } else throw err; // something else happened - throw an error
            }

            res.json({
                success: true,
                message: "User created successfully."
            });
        });
    });
};