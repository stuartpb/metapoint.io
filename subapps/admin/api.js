//Metapoint admin console API
//Basically there for AJAX calls from the views
var express = require('express');
var queue = require('queue-async');
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
function merge (db) {
  //All actions taken in the admin cp should be logged.
  var oplog = db.collection('oplog');
  var topix = db.collection('topics');
  var suggs = db.collection('suggestions');

  var suggsRemove = suggs.remove.bind(suggs);
  var oplogInsert = oplog.insert.bind(oplog);
  var topixUpdate = topix.update.bind(topix);

  return function(req, res, next){
    var reqtopic = req.param('topic');
    var reqscope = req.param('scope') || null;
    var reqhost = req.param('host');
    var reqpath = req.param('path');
    var reqnotes = req.param('notes');
    var reqsid = req.param('sid');

    var updata = {};
    updata['sites.'+reqhost.replace(/\./g,'_')] = reqpath;

    var q = queue();

    if (reqsid) {
      var sidoid = new ObjectID(reqsid);
      q.defer(oplogInsert,{
        action: 'upsert',
        suggestion: {
          topic: reqtopic,
          scope: reqscope,
          host: reqhost,
          path: reqpath,
          notes: reqnotes,
          _id: sidoid
        }
      });
      q.defer(suggsRemove,{_id: sidoid});
    } else {
      q.defer(oplogInsert,({
        action: 'write',
        suggestion: {
          topic: reqtopic,
          scope: reqscope,
          host: reqhost,
          path: reqpath,
          notes: reqnotes,
        }
      }));
    }

    q.defer(topixUpdate,{
      topic: reqtopic,
      scope: reqscope
    },{$set: updata},
      {upsert:true});

    q.await(function(err) {
      if(err) return next(err);
      res.send(200,'OK');
    });
  }; //return function (req, res, next)
}

//POST /drop
//Just the "delete suggestion" part of the above API call.
function drop (db) {
  //All actions taken in the admin cp should be logged.
  var oplog = db.collection('oplog');
  var suggs = db.collection('suggestions');

  var suggsRemove = suggs.remove.bind(suggs);
  var oplogInsert = oplog.insert.bind(oplog);

  return function(req, res, next){
    var reqsid = req.param('sid');
    if (reqsid) {
      var sidoid = new ObjectID(reqsid);
      suggs.findOne({_id: sidoid}, function (err, doc) {
        if (err) return next(err);
        oplog.insert({
          action: 'forget',
          suggestion: doc
        });
        suggs.remove({_id: sidoid}, function (err){
          if (err) return next(err);
          res.send(200);
        });
      });
    } else {
      var query = {};
      if (req.param('topic')) { query.topic = req.param('topic') }
      if (req.param('scope')) { query.scope = req.param('scope') }
      else if(req.param('scope') === ""){
        query.scope = null;
      }
      if (req.param('host')) { query.host = req.param('host') }
      if (req.param('path')) { query.path = req.param('path') }

      if(query.host && (query.topic || query.path)){
        var cursor = suggs.find(query);
        var found = false;
        cursor.each(function(err,doc) {
          if(err) return next(err);
          if(doc) { //null is returned after iterating through all docs
            found = true;
            queue()
            .defer(oplogInsert,{
              action: 'forget-by-value',
              suggestion: doc
            })
            .defer(suggsRemove,{_id: doc._id})
            .await(function (err) {
              if (err) return next(err);
            });
          } else if(!found) { //if the first run of the each callback did nothing
            res.send(400, "Requested value not found");
          } else {
            res.send(200);
          }
        });
      } else {
        res.send(400, "Insufficient data to find suggestion");
      }
    }
  }; //return function (req, res, next)
}

//App constructor
module.exports = function(db){
  var api = express();

  api.use(express.bodyParser());

  //FEATURE: return 405 codes for incorrect verbs
    //on valid API paths

  api.post('/merge',merge(db));
  api.post('/drop',drop(db));

  return api;
};
