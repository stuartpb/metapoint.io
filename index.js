var express = require('express');
var mongodb = require('mongodb');
var https = require('https');
var http = require('http');

var config = require('./config.json');

var api = require('./api.js')

var mongoserver = new mongodb.Server(config.mongo.server,
  config.mongo.port, {auto_reconnect: true});
var db_connector = new mongodb.Db(config.mongo.database, mongoserver, {});

db_connector.open(function(err,db) {
  var app = express();

  app.use('/api/v0',api(db))
  app.use(express.static(__dirname+'/static'))

  if(config.http) {
    http.createServer(app).listen(config.http.port);
  }
  if(config.https) {
    https.createServer(config.https.options, app).listen(config.https.port);
  }
}); //db.connector.open({
