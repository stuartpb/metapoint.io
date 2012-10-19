//Admin control panel for metapoint.
//Note that this, as written, has no authentication.

//USING THINGS THAT MODIFY THE DATABASE SHOULD HAVE AUTHENTICATION.

//In its current state, authentication would just be overkill
//(since it doesn't do anything and there's no database to ruin),
//but obviously, SOME FORM OF AUTHENTICATION SHOULD BE ADDED
//BEFORE GOING LIVE WITH THIS.

var express = require('express');
var mongo = require('mongodb');
var https = require('https');
var http = require('http');

var config = require('./config.json');
var adminlib = require('.lib/admin.js');

var mongoserver = new mongodb.Server(config.mongo.server,
  config.mongo.port, {auto_reconnect: true});
var db_connector = new mongodb.Db(config.mongo.database, mongoserver, {});
var db = db_connector.open()
var topix = db.collection('topics')
var suggs = db.collection('suggestions')
//All actions taken in the admin cp should be logged.
var log = db.collection('oplog')

var admin = express();

admin.get('/suggestions',function(req,res){
  var top20 = suggs.find().limit(20)
  res.render('admin/suggestions',{suggestions: top20})
})

//POST /api/merge
//Works basically like /suggest
//in the main API, but with the topic being a query
//parameter instead of a path parameter.
//Also takes a "sid" parameter for the
//suggestion to drop, as hypothetically, pretty much
//every invocation of this operation is going to be tied
//to a suggestion that should then be immediately deleted,
//and why require two API calls?
admin.post('/api/merge',function(req,res){
  res.send(501,'Not Implemented')
})

//POST /api/drop
//Just the "delete suggestion" part of the above API call.
admin.post('/api/drop',function(req,res){
  res.send(501,'Not Implemented')
})

//Removing/editing the existing topics database entries
//is the kind of thing I'll just leave to the straight Mongo CLI.
