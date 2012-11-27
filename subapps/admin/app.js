//Admin stuff for metapoint.
//Currently, the only thing that keeps this protected
//from everybody accessing it is that the path to it is
//kept secret in config.json. That's probably not a great
//authentication scheme, but it's OK for now.

var express = require('express');

function suggestions(db,adminpath){
  //The topics collection might be useful at some point in the future
  //(list any conflict with existing topic), but not now.

  var suggs = db.collection('suggestions')

  return function(req,res){
    suggs.find().sort({_id:-1}).limit(20).toArray(function(err,top20){
      
      //Ensure the suggestions are always recent
      res.setHeader('Cache-control','no-cache, must-revalidate')
      
      res.render('suggestions',{suggestions: top20, adminpath:adminpath})
    })
  }
}

function report(db, query, name){
  var suggs = db.collection('suggestions')

  return function(req,res){
    suggs.find(query).sort({topic:1}).toArray(function(err,arr){
      
      //Ensure the suggestions are always recent
      res.setHeader('Cache-control','no-cache, must-revalidate')

      res.render('reports',{reportItems: arr, reportName: name})
    })
  }
}

function collisions(db,adminpath){
  //The topics collection might be useful at some point in the future
  //(list any conflict with existing topic), but not now.

  var suggs = db.collection('suggestions')

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
        res.setHeader('Cache-control','no-cache, must-revalidate')
      
        res.render('welp-collisions',{collisions: result, adminpath:adminpath})
      }
    )
  }
}

//Removing/editing the existing topics database entries
//is the kind of thing I'll just leave to the straight Mongo CLI.


//App constructor
module.exports = function(db,path){
  var admin = express();

  admin.set('views', __dirname + '/views');
  admin.set('view engine', 'jade');
  admin.locals.pretty = true;

  admin.use(express.bodyParser())

  //FEATURE: return 405 codes for incorrect verbs
    //on valid API paths

  admin.get('/suggestions',suggestions(db,path))
  admin.get('/collisions',collisions(db,path))
  admin.get('/reports/films',report(db,{scope: /film$/,host:'en.wikipedia.org'},"Films"))
  admin.get('/reports/seasons',report(db,{scope: /[Ss]eason/,host:'en.wikipedia.org'},"Seasons"))
  admin.use('/api',require('./api.js')(db))
  admin.use('/static',express.static(__dirname+'/static'))


  return admin
}
