var express = require('express');
var mongodb = require('mongodb');
var https = require('https');
var http = require('http');

//for reading in files for HTTPS setup
var fs = require('fs')

var config = require('./config.json');

var api = require('./api.js')

var mongoserver = new mongodb.Server(config.mongo.server,
  config.mongo.port, {auto_reconnect: true});
var db_connector = new mongodb.Db(config.mongo.database, mongoserver, {});

db_connector.open(function(err,db) {
  var app = express();

  app.use('/api/v0',api(db))
  if (config.admin) {
    app.use(config.admin,require('./admin.js')(db))
  }

  app.use(express.static(__dirname+'/static'))

  if (config.http) {
    http.createServer(app).listen(config.http.port);
  }
  if (config.https) {
    var httpsoptions = config.https.options || {}
    //The list of configurable filenames.
    var httpsfiles = ['pfx','key','cert','ca']
    //Read in any specified files
    for (var i = 0; i < httpsfiles.length; i++) {
      if (config.https.files[httpsfiles[i]]) {
        httpsoptions[httpsfiles[i]] = fs.readFileSync(
          config.https.files[httpsfiles[i]])
      }
    }
    https.createServer(httpsoptions, app).listen(config.https.port);
  }
}); //db.connector.open({
