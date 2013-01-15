function respondNotFound(req,res){
  res.status(404).render('notfound');
}

module.exports = function(db){
  var routes = {};
  var topics = db.collection('topics');

  routes.index = function(req,res){
    topics.count(function(err,count){
      if(err){
        res.send(500,err);
      } else {
        res.render('index',{topiccount:count, path:'/'});
      }
    });
  };

  routes.staticPage = function(name,path,title){
    return function(req,res){
      res.render(name,{path: path, title: title});
    };
  };

  routes.inspect = function(req,res){
    var topic = req.params.topic || null;
    var scope = req.params.scope || null;
    topics.findOne({topic:topic, scope:scope},function(err,doc){
      if(err){
        res.send(500,err);
      } else if (!doc) {
        respondNotFound(req,res);
      } else {
        var title = topic;
        if(scope) title += '('+scope+')';
        res.render('inspect',{topic: doc, title: title});
      }
    });
  };

  routes.topiclist = function(req,res){
    topics.find().sort([['topic',1],['scope',1]]).toArray(function(err,arr){
      if(err){
        res.send(500,err);
      } else {
        res.render('topiclist',{topics: arr, title: 'List', path: '/topiclist'});
      }
    });
  };

  routes.notFound = respondNotFound;

  return routes;
};