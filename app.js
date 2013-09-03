var express = require('express');
var mongodb = require('mongodb');

module.exports = function(cfg,db){
  var app = express();

  app.use('/api/v0',require('./subapps/api.js')(db));
  if (cfg.adminpath) {
    app.use(cfg.adminpath,require('./subapps/admin/app.js')(db,cfg.adminpath));
  }

  var site = require('./routes/site.js')(db);

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

  return app;
};
