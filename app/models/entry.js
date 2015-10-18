var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var EntrySchema = new Schema({

    // reference to payment recipient
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    // amount of money user has paid
    amount: {
        type: Number
    },

    // saved to db timestamp
    saved: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Entry', EntrySchema);
