var mongoose = require('mongoose');

//define scheme
var Playlist = new mongoose.Schema({
    name : String,
    playlist : Array
});

module.exports = mongoose.model('Playlist', Playlist);