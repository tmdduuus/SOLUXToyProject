const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
const MongoClient = require('mongodb').MongoClient;

var db;
MongoClient.connect('mongodb+srv://soluxweb:soluxweb1@cluster0.nzkvapw.mongodb.net/?retryWrites=true&w=majority', function(에러, client){

    if(에러){return console.log(에러)}

    db = client.db('soluxweb');

    app.listen(8080, function(){
        console.log('listening on 8080')
    });    
})

app.post('/add', function(req, res){
    res.send('전송완료');

    db.collection('soluxweb').insertOne({ name : req.body.name, phone : req.body.phone, date : req.body.date, text : req.body.text }, function(error, result){
        console.log('저장완료');
    });

});

//app.get('/', function(req, res){
//    res.sendFile(__dirname + '/index.html');
//})

app.get('/writeappli', function(req, res){ // 지원서 작성 페이지
    res.sendFile(__dirname + '/writeappli.html');
})

app.post('/add', function(req, res){
    res.send('전송완료');
    console.log(req.body.name);
    console.log(req.body.phone);
    console.log(req.body.date);
    console.log(req.body.text);
})