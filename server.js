var cfg = require('./config.js')();
var mongoUri = cfg.mongodb.url || 'mongodb://localhost/default';

mongodb.MongoClient.connect(mongoUri,function(err,db){
  if(err) throw err;
  else {
    var app = require('./app.js')(cfg,db);
    var port = cfg.port || 5000;
    app.listen(port, function() {
      console.log("Listening on " + port);
    });
  }
});
