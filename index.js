var express = require('express');
var mongo = require('mongodb');
var https = require('https');
var http = require('http');


var mongoserver = new mongodb.Server('localhost', 27017, {auto_reconnect: true});
var db_connector = new mongodb.Db('wikilinker', mongoserver, {});
var db = db_connector.open(function(){})
var topix = db.collection('topics')

var api = express();

api.GET('/topics/:topic',function(req,res){
  topics.findOne({topic: req.params.topic},function(err,doc){

  })
})

var app = express();
app.use('/api/v0',api)
var httpsopts = {}

http.createServer(app).listen(80);
https.createServer(httpsopts, app).listen(443);
