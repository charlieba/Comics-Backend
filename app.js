var http = require('http');
var md5 = require('MD5');
var mongoose = require("mongoose");
//var port = process.env.port || 3021;
var uristring = 'mongodb://localhost/db_comics';
var options = {
    db: { native_parser: true },
    server: { poolSize: 5, socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: {}
};
var db = mongoose.connection;
db.on('connecting', function () {
    console.log('connecting to MongoDB...');
});
db.on('error', function (error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});
db.on('connected', function () {
    console.log('MongoDB connected!');
});
db.once('open', function () {
    console.log('MongoDB connection opened!');
});
db.on('reconnected', function () {
    console.log('MongoDB reconnected!');
});
db.on('disconnected', function () {
    console.log('MongoDB disconnected!');
});
mongoose.connect(uristring, options);


var character_model = require('./includes/schemas/character.js');
var CharacterSchema = character_model.character_model(mongoose);

http.createServer(function (req, res) {
    if (req.method == 'GET') {
        var body = '';
        var parametros = req.url.split('?');
        switch (parametros[0]) {
            case '/update_character': {
                var update_character = require('./includes/update_character.js');
                update_character.execute_insert_news(req, res, mongoose, CharacterSchema, md5);
            }
        }
    }
    res.writeHead(404, "Not found", { 'Content-Type': 'text/html' });
    res.end('<html><head><title>404 - Not found</title></head><body><h1>Not found.</h1></body></html>');
}).listen(80);