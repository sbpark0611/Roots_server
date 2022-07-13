var mongoose = require('mongoose');

//define scheme
var Music = new mongoose.Schema({
    name : String,
    singer : String,
    comment : Array
});

module.exports = mongoose.model('Music', Music);