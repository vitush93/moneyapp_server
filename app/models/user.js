// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var validator = require('validator');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var UserSchema = new Schema({

    // displayed name
    name: {
        type: String,
        validate: {
            validator: function (name) {
                return validator.isLength(name, 4);
            },
            message: 'Name must be at least 4 characters long'
        }
    },

    // unique email used as primary identification
    email: {
        type: String,
        validate: {
            validator: function (email) {
                return validator.isEmail(email);
            },
            message: '{VALUE} is not a valid e-mail.'
        }
    },

    password: {
        type: String,
        select: false,
        validate: {
            validator: function (pass) {
                return validator.isLength(pass, 6);
            },
            message: 'Password must be at least 6 characters long.'
        }
    },

    registered: {
        type: Date,
        default: Date.now
    }
});

// hash password before save
UserSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) return next(err);

        user.password = hash;
        next();
    });

});

module.exports = mongoose.model('User', UserSchema);