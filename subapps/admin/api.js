//Metapoint admin console API
//Basically there for AJAX calls from the views
var express = require('express');
var url = require('url');
var ObjectID = require('mongodb').ObjectID;

//POST /merge
//Works basically like /suggest
//in the main API, but with the topic being a query
//parameter instead of a path parameter.
//Also takes a "sid" parameter for the
//suggestion to drop, as hypothetically, pretty much
//every invocation of this operation is going to be tied
//to a suggestion that should then be immediately deleted,
//and why require two API calls?
function merge(db){
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

    topix.update({
      topic: reqtopic,
      scope: reqscope
    },{$set: updata}, true)

    res.send(200,'OK')
  }
}

//POST /drop
//Just the "delete suggestion" part of the above API call.
function drop(db){
  //All actions taken in the admin cp should be logged.
  var oplog = db.collection('oplog')
  var suggs = db.collection('suggestions')

  return function(req,res){
    var reqsid = req.param('sid')
    if(reqsid) {
      var sidoid = new ObjectID(reqsid)
      suggs.findOne({_id: sidoid},function(err,doc){
        if(err){
          res.send(500,err)
        } else {
          oplog.insert({
            action: 'forget',
            suggestion: doc
          })
          suggs.remove({_id: sidoid})
          res.send(200)
        }
      })
    } else {
      var query = {
        topic: req.param('topic') || undefined,
        scope: req.param('scope') === "" ? null : undefined,
        host: req.param('host') || undefined,
        path: req.param('path') || undefined
      }
      if(query.host && (query.topic || query.path)){
        var cursor = suggs.find(query)
        cursor.each(function(err,doc) {
          if(err){
            res.send(500,err)
          } else {
            if(doc) { //null is returned after iterating through all docs
              oplog.insert({
                action: 'forget-by-value',
                suggestion: doc
              })
              suggs.remove({_id: doc._id})
            }
          }
        })
      }
    }
  }
}

//App constructor
module.exports = function(db){
  var api = express();

  api.use(express.bodyParser())

  //FEATURE: return 405 codes for incorrect verbs
    //on valid API paths

  api.post('/merge',merge(db))
  api.post('/drop',drop(db))

  return api
}
