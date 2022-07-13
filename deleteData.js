
const Playlist = require('./playlistSchema');
const mongoose = require("mongoose");

mongooseVar = "mongodb+srv://sangbin:qlalfqjsgh@cluster0.41yxjx5.mongodb.net/?retryWrites=true&w=majority";

mongoose
    .connect(mongooseVar)
    .then(()=>console.log("db 연결 성공"))
    .catch(e => console.error(e));

Playlist.remove({}, function(err) { 
    console.log('collection removed') 
});
     