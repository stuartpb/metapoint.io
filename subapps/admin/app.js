//Admin stuff for metapoint.
//Currently, the only thing that keeps this protected
//from everybody accessing it is that the path to it is
//kept secret in config.json. That's probably not a great
//authentication scheme, but it's OK for now.

var express = require('express');
var queue = require('queue-async');

function suggestions(db,adminpath){

  var suggs = db.collection('suggestions');
  var topix = db.collection('topics');

  return function(req,res){
    suggs.count(function(err,count){
      var cursor, queryobj, notify;
      try {
        queryobj = JSON.parse(req.query.query);
      } catch (e) {
        queryobj = null;
        notify = e.message;
      }
      if(queryobj){
        cursor = suggs.find(queryobj).sort({_id:-1}).limit(500);
      } else {
        cursor = suggs.find().sort({_id:-1}).limit(20);
      }
      cursor.toArray(function(err,sugglist){
        var q = queue();

        function topixFindOne(doc,cb){
          return topix.findOne(doc,cb);
        }

        for(var i = 0; i < sugglist.length; ++i) {
          q.defer(topixFindOne, {
            topic: sugglist[i].topic,
            scope: sugglist[i].scope
          });
        }
        q.awaitAll(function(err,currents){
          //Ensure the suggestions are always recent
          res.setHeader('Cache-control','no-cache, must-revalidate');

          res.render('suggestions',{suggestions: sugglist, currents: currents,
            count: count, query: req.query.query, notify: notify,
            adminpath:adminpath});
        });
      });
    });
  };
}

function report(db, query, name){
  var suggs = db.collection('suggestions');

  return function(req,res){
    suggs.find(query).sort([['topic',1],['scope',1]]).toArray(function(err,arr){

      //Ensure the suggestions are always recent
      res.setHeader('Cache-control','no-cache, must-revalidate');

      res.render('reports',{reportItems: arr, reportName: name});
    });
  };
}

function collisions(db,adminpath){
  //The topics collection might be useful at some point in the future
  //(list any conflict with existing topic), but not now.

  var suggs = db.collection('suggestions');

  return function(req,res){
    suggs.aggregate([
      // Count instances of each path
      { $group: {
        _id: {host: '$host', path: '$path'},
        suggestions: { $push: {
          _id: '$_id',
          topic: '$topic',
          scope: '$scope',
          notes: '$notes'
        } },
        dupes: { $sum: 1 }
      }},

      // Return suggestions with colliding paths
      { $match: {
        dupes: { $gt:1 }
      }},

      { $project: {
        suggestions: 1,
        host: '$_id.host',
        path: '$_id.path',
        _id: 0
      }}],
      function(err,result) {

        //Ensure the suggestions are always recent
        res.setHeader('Cache-control','no-cache, must-revalidate');

        res.render('welp-collisions',{collisions: result, adminpath:adminpath});
      }
    );
  };
}

//Removing/editing the existing topics database entries
//is the kind of thing I'll just leave to the straight Mongo CLI.


//App constructor
module.exports = function(db,path){
  var admin = express();

  admin.set('views', __dirname + '/views');
  admin.set('view engine', 'jade');
  admin.locals.pretty = true;

  admin.use(express.bodyParser());

  //FEATURE: return 405 codes for incorrect verbs
    //on valid API paths

  admin.get('/suggestions',suggestions(db,path));
  admin.get('/collisions',collisions(db,path));
  admin.get('/reports/films',report(db,{scope: /film$/,
    host:'en.wikipedia.org'},"Films"));
  admin.get('/reports/series',report(db,{scope: /TV series$/,
    host:'en.wikipedia.org'},"TV Series"));
  admin.get('/reports/years',report(db,{scope: /^\d+$/,
    host:'en.wikipedia.org'},"Number scopes"));
  admin.get('/reports/scoped',report(db,{scope: {$ne:null},
    host:'en.wikipedia.org'},"Scoped suggestions"));
  admin.use('/api',require('./api.js')(db));
  admin.use('/static',express.static(__dirname+'/static'));


  return admin;
};
