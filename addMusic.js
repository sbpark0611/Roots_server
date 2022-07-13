const Music = require('./musicSchema');
const mongoose = require("mongoose");
mongooseVar = "mongodb+srv://sangbin:qlalfqjsgh@cluster0.41yxjx5.mongodb.net/?retryWrites=true&w=majority";


mongoose
    .connect(mongooseVar)
    .then(()=>console.log("db 연결 성공"))
    .catch(e => console.error(e));

var music = new Music({name : "Painkiller",
    singer : "Luel",
    comment : []});

music.save()
    .then(()=>{
    console.log("저장 성공");
    })
    .catch((err)=>{
    console.error(err);
    });
