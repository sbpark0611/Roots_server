var mongoose = require('mongoose');

//define scheme
var User = new mongoose.Schema({
    kakao_id : String,
    profile_nickname : String,
    profile_image : String,
    like_list : Array,
    playlist_list : Array
});

module.exports = mongoose.model('User', User);