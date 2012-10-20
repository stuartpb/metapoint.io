//Admin stuff for metapoint.
//Currently, the only thing that keeps this protected
//from everybody accessing it is that the path to it is
//kept secret in config.json. That's probably not a great
//authentication scheme, but it's OK for now.

var express = require('express');

function suggestions(db){
  var topix = db.collection('topics')
  var suggs = db.collection('suggestions')

  return function(req,res){
    var top20 = suggs.find().limit(20)
    res.render('admin/suggestions',{suggestions: top20})
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
  var log = db.collection('oplog')

  return function(req,res){
    res.send(501,'Not Implemented')
  }
}

//POST /api/drop
//Just the "delete suggestion" part of the above API call.
function apidrop(db){
  return function(req,res){
    res.send(501,'Not Implemented')
  }
}

//Removing/editing the existing topics database entries
//is the kind of thing I'll just leave to the straight Mongo CLI.


//App constructor
module.exports = function(db){
  var admin = express();

  admin.set('views', __dirname + '/views');

  admin.use(express.bodyParser())

  //FEATURE: return 405 codes for incorrect verbs
    //on valid API paths

  admin.get('/suggestions',suggestions(db))
  admin.post('/api/merge',apimerge(db))
  admin.post('/api/drop',apidrop(db))

  return admin
}
