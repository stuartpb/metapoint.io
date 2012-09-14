var express = require('express');
var mongo = require('mongodb');
var https = require('https');
var http = require('http');


var mongoserver = new mongodb.Server('localhost', 27017, {auto_reconnect: true});
var db_connector = new mongodb.Db('wikilinker', mongoserver, {});
var db = db_connector.open(function(){})
var topix = db.collection('topics')
var suggs = db.collection('suggestions')

var api = express();

api.GET('/topics/:topic',function(req,res){
  var cursor = topix.find({topic: req.params.topic})
  cursor.count(function(count,doc){
    if(count==0){
      //return a 404
    }else{
      //return first document from cursor
    }
  })
})

api.POST('/topics/:topic/suggest',function(req,res){
  var site, path
  if(req.params.site && req.params.path) {
    site = req.params.site
    path = req.params.path
  }
  else {
    if(req.params.url) {

    } else {

    }

  }
  var sugcurs = suggs.find({topic: req.params.topic})
  sugcurs.count(function(err,sugct){
    //if a suggestion item for this topic name already exists
    if(sugct>0) {
      sugct.nextObject(function(err,doc){
      //if this site already has a suggestion
      if sites[site]
    }
  })
})

var app = express();
app.use('/api/v0',api)
var httpsopts = {}

http.createServer(app).listen(80);
https.createServer(httpsopts, app).listen(443);
