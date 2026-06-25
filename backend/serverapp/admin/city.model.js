var mongoose = require('mongoose');
const Schema = mongoose.Schema;

var City = new Schema(
{
    ctid: {
        type: Number,
        required: true,
        unique: true
    },
    ctname: {
        type: String,
        required: true,
        unique: true
    },
    stid: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 1
    }
},
{
    collection: 'city'
});

module.exports = mongoose.model('City', City);