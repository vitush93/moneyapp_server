// get an instance of mongoose and mongoose.Schema
var _ = require('underscore');
var mongoose = require('mongoose');
var validator = require('validator');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var Entry = require('./entry');

var UserSchema = new Schema({

    // displayed name
    name: {
        type: String,
        validate: {
            validator: function (name) {
                return validator.isLength(name, 4);
            },
            message: 'Name must be at least 4 characters long'
        },
        required: true
    },

    // unique email used as primary identification
    email: {
        type: String,
        validate: {
            validator: function (email) {
                return validator.isEmail(email);
            },
            message: '{VALUE} is not a valid e-mail.'
        },
        required: true
    },

    // password hash
    password: {
        type: String,
        select: false,
        validate: {
            validator: function (pass) {
                return validator.isLength(pass, 6);
            },
            message: 'Password must be at least 6 characters long.'
        },
        required: true
    },

    // timestamp of registration
    registered: {
        type: Date,
        default: Date.now,
        required: true
    },

    // timestamp of last sync
    sync: {
        type: Date,
        default: Date.now,
        required: true
    },

    // array of user's payments
    entries: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Entry'
        }],
        select: false
    }
});

/**
 * Returns total amount of money this user has paid to another user.
 *
 * @returns {number}
 */
UserSchema.methods.totalBalance = function (recipientId, callback) {
    this.model('User').findOne({
        email: this.email
    }).select('+entries').populate('entries').exec(function (err, data) {

        if (err) callback(err, 0);

        var sum = 0;
        for (var i = 0; i < data.entries.length; i++) {
            var entry = data.entries[i];

            if (entry.recipient.toString() == recipientId.toString()) {
                sum += entry.amount;
            }
        }

        callback(null, sum);
    });
};

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