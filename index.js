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

  //FEATURE: Non-API app, with a human page or two
  app.use('/api/v0',api(db))

  //the options for the HTTPS connection.
  var httpsopts = {}

  http.createServer(app).listen(8080);
  //https.createServer(httpsopts, app).listen(443);
}); //db.connector.open({
