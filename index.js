var express = require('express');
var mongodb = require('mongodb');
var https = require('https');
var http = require('http');

//for reading in files for HTTPS setup
var fs = require('fs');

var config = require('./config.json');

var mongoserver = new mongodb.Server(config.mongo.server,
  config.mongo.port, {auto_reconnect: true});
var db_connector = new mongodb.Db(config.mongo.database, mongoserver, {});

db_connector.open(function(err,db) {
  var app = express();

  app.use('/api/v0',require('./subapps/api.js')(db));
  if (config.admin) {
    app.use(config.admin,require('./subapps/admin/app.js')(db,config.admin));
  }

  var site = require('./site.js')(db);

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.locals.pretty = true;

  app.use(express.bodyParser());

  app.get('/',site.index);
  app.get('/topiclist',site.topiclist);
  app.get('/inspect/:topic/:scope',site.inspect);
  app.get('/inspect/:topic',site.inspect);

  app.get('/about',site.staticPage('about','About','/about'));
  app.get('/documentation',site.staticPage('documentation','Documentation','/documentation'));
  app.get('/suggest',site.staticPage('suggest','Suggest','/suggest'));

  app.use(express.static(__dirname+'/static'));

  if (config.http) {
    http.createServer(app).listen(config.http.port);
  }
  if (config.https) {
    var httpsoptions = config.https.options || {};
    //The list of configurable filenames.
    var httpsfiles = ['pfx','key','cert','ca'];
    //Read in any specified files
    for (var i = 0; i < httpsfiles.length; i++) {
      if (config.https.files[httpsfiles[i]]) {
        httpsoptions[httpsfiles[i]] = fs.readFileSync(
          config.https.files[httpsfiles[i]]);
      }
    }
    https.createServer(httpsoptions, app).listen(config.https.port);
  }
}); //db.connector.open({
