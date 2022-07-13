const User = require('./userSchema');
const Music = require('./musicSchema');
const Playlist = require('./playlistSchema');

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json()) // To parse the incoming requests with JSON payloads

const server = http.createServer(app);
const io = socketIo(server);
const port = 80;

mongooseVar = "mongodb+srv://sangbin:qlalfqjsgh@cluster0.41yxjx5.mongodb.net/?retryWrites=true&w=majority";

mongoose
    .connect(mongooseVar)
    .then(()=>console.log("db 연결 성공"))
    .catch(e => console.error(e));

app.use(express.static("public"));

app.get("/music-data", async (req, res)=>{

    await Music.findOne({ name : req.query.music_name }).exec()
    .then((result) => {
        res.send(result);
    })
    .catch((err) => {
        console.error(err);
    });
});

app.get("/music-list", async (req, res)=>{
    var musicFolder = './public/musics';
    var fs = require('fs');

    const filelist = fs.readdirSync(musicFolder);

    res.send(filelist);
});

app.get("/is-music-like", async (req, res)=>{
    var musicFolder = './public/musics';
    var fs = require('fs');

    const filelist = fs.readdirSync(musicFolder);
    size = filelist.length;

    await User.findOne({ kakao_id : req.query.kakao_id }).exec()
    .then((result) => {
        if(result == null){
            return;
        }
        for(let i=0; i<size; i++) {
            if(req.query.music_name === filelist[i]){
                if(result.like_list[i] == 1){
                    res.send("true");
                }
                else{
                    res.send("false");
                }
                break;
            }
        }
    })
    .catch((err) => {
        console.error(err);
    });
});

app.get("/playlist-list", async (req, res)=>{
    var list = [];
    await User.findOne({ kakao_id : req.query.kakao_id }).exec()
    .then((result) => {
        for(let i=0; i<result.playlist_list.length; i++) {
            list.push(result.playlist_list[i]);
        }
    })
    .catch((err) => {
        console.error(err);
    });
    res.send(list);
});

app.get("/playlist", async (req, res)=>{
    await Playlist.findById({ _id : req.query.playlist_id }).exec()
    .then((result) => {
        res.send(result);
    })
    .catch((err) => {
        console.error(err);
    });
});

app.post("/register", async (req, res)=>{
    var size = 0;
    var musicFolder = './public/musics';
    var fs = require('fs');

    const filelist = fs.readdirSync(musicFolder);
    size = filelist.length;

    list = [];
    for(let i=0; i<size; i++) {
        list.push(0);
    }

    if(await User.findOne({kakao_id : req.body.kakao_id}) != null){
        res.send("already registered");
    }
    else{
        var user = new User({kakao_id : req.body.kakao_id,
                            profile_nickname : req.body.profile_nickname,
                            profile_image : req.body.profile_image,
                            like_list : list,
                            playlist_list : []});

        user.save()
            .then(()=>{
                console.log("저장 성공");
            })
            .catch((err)=>{
                console.error(err);
            });

        res.send("success");
    }
});

app.post("/new-playlist", async (req, res)=>{
    var playlist = new Playlist({name : "새로운 플레이리스트",
                                playlist : []});

    playlist.save(function(err, playlist) {
        list = [];
        User.findOne({ kakao_id : req.body.kakao_id }).exec()
        .then((result) => {
            for(let i=0; i<result.playlist_list.length; i++) {
                list.push(result.playlist_list[i]);
            }

            list.push(playlist.id);

            User.updateOne({kakao_id : req.body.kakao_id}, {playlist_list : list}).exec()
            .then(() => {
                res.send(playlist.id);
            })
        })
        .catch((err) => {
            console.error(err);
        });
    });
});

app.put("/like", async (req, res)=>{
    var musicFolder = './public/musics';
    var fs = require('fs');

    var music_name = req.body.music_name;

    const filelist = fs.readdirSync(musicFolder);
    size = filelist.length;

    list = [];
    await User.findOne({ kakao_id : req.body.kakao_id }).exec()
    .then((result) => {
        for(let i=0; i<size; i++) {
            list.push(result.like_list[i]);
        }
        
    })
    .catch((err) => {
        console.error(err);
    });

    for(let i=0; i<size; i++) {
        if(req.body.music_name === filelist[i]){
            if(req.body.islike === "true"){
                list[i] = 1;
            }
            else{
                list[i] = 0;
            }
            break;
        }
    }
    await User.updateOne({kakao_id : req.body.kakao_id}, {like_list : list});

    res.send("likelist update success");
});

app.put("/music-to-playlist", async (req, res)=>{
    var musicFolder = './public/musics';
    var fs = require('fs');

    var playlist_id = req.body.playlist_id;
    var music_name = req.body.music_name;

    list = [];
    await Playlist.findById({ _id : playlist_id }).exec()
    .then((result) => {
        for(let i=0; i<result.playlist.length; i++) {
            list.push(result.playlist[i]);
        }
    })
    .catch((err) => {
        console.error(err);
    });

    list.push(music_name);

    await Playlist.findByIdAndUpdate({_id : playlist_id}, {playlist : list});

    res.send("add to playlist success");
});

app.put("/new-comment", async (req, res)=>{
    var musicFolder = './public/musics';
    var fs = require('fs');

    const filelist = fs.readdirSync(musicFolder);

    list = [];
    await Music.findOne({ name : req.body.music_name }).exec()
    .then((result) => {
        for(let i = 0; i < result.comment.length; i++){
            list.push(result.comment[i]);
        }
    })
    .catch((err) => {
        console.error(err);
    });

    list.push(req.body.comment);

    await Music.updateOne({name : req.body.music_name}, {comment : list});

    res.send("comment list update success");
});

app.put("/playlist-name", async (req, res)=>{
    var playlist_id = req.body.playlist_id;
    var playlist_name = req.body.playlist_name;

    await Playlist.findByIdAndUpdate({_id : playlist_id}, {name : playlist_name});

    res.send("put playlist name success");
});

app.put("/music-from-playlist", async (req, res)=>{
    var playlist_id = req.body.playlist_id;
    var index = parseInt(req.body.index);
    list = [];
    await Playlist.findById({ _id : playlist_id }).exec()
    .then((result) => {
        for(let i=0; i<result.playlist.length; i++) {
            if(i != index) {
                list.push(result.playlist[i]);
            }
        }
    })
    .catch((err) => {
        console.error(err);
    });

    await Playlist.findByIdAndUpdate({_id : playlist_id}, {playlist : list});

    res.send("delete music from playlist success");
});

app.put("/delete-playlist", async (req, res)=>{
    var kakao_id = req.body.kakao_id;
    var playlist_id = req.body.playlist_id;
    

    list = [];
    await User.findOne({ "kakao_id" : kakao_id }).exec()
    .then((result) => {
        for(let i=0; i<result.playlist_list.length; i++) {
            if(result.playlist_list[i] != playlist_id) {
                list.push(result.playlist_list[i]);
            }
        }
    })
    .catch((err) => {
        console.error(err);
    });

    await Playlist.findByIdAndRemove(playlist_id).exec();
    
    await User.updateOne({kakao_id : kakao_id}, {playlist_list : list});

    res.send("delete playlist success");
});

app.get("/view-likes", async (req, res)=>{
    var musicFolder = './public/musics';
    var fs = require('fs');
    const filelist = fs.readdirSync(musicFolder);
    list = [];

    await User.findOne({ kakao_id : req.query.kakao_id }).exec()
    .then((result) => {
        for(let i=0; i<result.like_list.length; i++) {
            if(result.like_list[i] == 1){
                list.push(filelist[i]);
            }
        }
    })
    .catch((err) => {
        console.error(err);
    });

    res.send(list);
});

app.get("/comment-data", async (req, res)=>{
    var list = [];
    await Music.findOne({ name : req.query.music_name }).exec()
    .then((result) => {
        for(let i=0; i<result.comment.length; i++) {
            list.push(result.comment[i]);
        }
    })
    .catch((err) => {
        console.error(err);
    });
    res.send(list);
});

app.get("/random-music", async (req, res)=>{
    var musicFolder = './public/musics';
    var fs = require('fs');

    const filelist = fs.readdirSync(musicFolder);
    size = filelist.length;
    
    list = [];
    for(let i=0; i<5; i++){
        await Music.findOne({ name : filelist[req.query.random_index[i]].replace('.wav', '') }).exec()
        .then((result) => {
            list.push(result);
        })
        .catch((err) => {
            console.error(err);
        });
    }
    res.send(list);
});

app.listen(port, ()=>{
    console.log(`start! root://localhost:${port}`);
});