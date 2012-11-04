//Admin stuff for metapoint.
//Currently, the only thing that keeps this protected
//from everybody accessing it is that the path to it is
//kept secret in config.json. That's probably not a great
//authentication scheme, but it's OK for now.

var express = require('express');
var ObjectID = require('mongodb').ObjectID;

function suggestions(db,adminpath){
  //The topics collection might be useful at some point in the future
  //(list any conflict with existing topic), but not now.

  var suggs = db.collection('suggestions')

  return function(req,res){
    suggs.find().sort({_id:-1}).limit(20).toArray(function(err,top20){
      res.render('suggestions',{suggestions: top20, adminpath:adminpath})
    })
  }
}

function report(db, query, name){
  var suggs = db.collection('suggestions')

  return function(req,res){
    suggs.find(query).toArray(function(err,arr){
      res.render('reports',{reportItems: arr, reportName: name})
    })
  }
}

//POST /api/merge
//Works basically like /suggest
//in the main API, but with the topic being a query
//parameter instead of a path parameter.
//Also takes a "sid" parameter for the
//suggestion to drop, as hypothetically, pretty much
//every invocation of this operation is going to be tied
//to a suggestion that should then be immediately deleted,
//and why require two API calls?
function apimerge(db){
  //All actions taken in the admin cp should be logged.
  var oplog = db.collection('oplog')
  var topix = db.collection('topics')
  var suggs = db.collection('suggestions')

  return function(req,res){
    var reqtopic = req.param('topic')
    var reqscope = req.param('scope')
    var reqhost = req.param('host')
    var reqpath = req.param('path')
    var reqnotes = req.param('notes')
    var reqsid = req.param('sid')

    var updata = {}
    updata['sites.'+reqhost.replace(/\./g,'_')] = reqpath

    topix.update({
      topic: reqtopic,
      scope: reqscope
    },{$set: updata}, true)
    if(reqsid){
      var sidoid = new ObjectID(reqsid)
      oplog.insert({
        action: 'upsert',
        suggestion: {
          topic: reqtopic,
          scope: reqscope,
          host: reqhost,
          path: reqpath,
          notes: reqnotes,
          _id: sidoid
        }
      })
      suggs.remove({_id: sidoid})
    } else {
      oplog.insert({
        action: 'write',
        suggestion: {
          topic: reqtopic,
          scope: reqscope,
          host: reqhost,
          path: reqpath,
          notes: reqnotes,
        }
      })
    }
    res.send(200,'OK')
  }
}

//POST /api/drop
//Just the "delete suggestion" part of the above API call.
function apidrop(db){
  var suggs = db.collection('suggestions')

  return function(req,res){
    var reqsid = req.param('sid')
    var sidoid = new ObjectID(reqsid)
    suggs.findOne({_id: reqsid},function(err,doc){
      if(err){
        res.send(500,err)
      else {
        oplog.insert({
          action: 'forget',
          suggestion: doc
        })
        suggs.remove({_id: reqsid})}
        res.send(200)
      }
    })
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
  admin.get('/reports/films',report(db,{scope: /film$/,host:'en.wikipedia.org'},"Films"))
  admin.post('/api/merge',apimerge(db))
  admin.post('/api/drop',apidrop(db))
  admin.use('/static',express.static(__dirname+'/static'))


  return admin
}
