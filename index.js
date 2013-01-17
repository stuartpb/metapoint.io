var express = require('express');
var mongodb = require('mongodb');

var mongoUri = process.env.MONGODB_URL ||
  process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/default';

var adminpath = process.env.ADMINPATH;

mongodb.MongoClient.connect(mongoUri,function(err,db) {
  var app = express();

  app.use('/api/v0',require('./subapps/api.js')(db));
  if (adminpath) {
    app.use(adminpath,require('./subapps/admin/app.js')(db,adminpath));
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

  app.use(site.notFound);

  var port = process.env.PORT || 5000;
  app.listen(port, function() {
    console.log("Listening on port " + port);
  });
}); //db.connector.open({
