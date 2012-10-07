//Admin control panel for wikilinker.
//Note that this, as written, has no authentication.

//USING THINGS THAT MODIFY THE DATABASE SHOULD HAVE AUTHENTICATION.

//In its current state, authentication would just be overkill
//(since it doesn't do anything and there's no database to ruin),
//but obviously, SOME FORM OF AUTHENTICATION SHOULD BE ADDED
//BEFORE GOING LIVE WITH THIS.

//REM: The moving-suggestions-to-production-type code should probably
//be kept somewhere like /lib/admin.js, so it can be used by
//stuff like automated server-side scripts.

var express = require('express');
var mongo = require('mongodb');
var https = require('https');
var http = require('http');

var config = require('config.json');

var nop = function(){}

var mongoserver = new mongodb.Server(config.mongo.server,
  config.mongo.port, {auto_reconnect: true});
var db_connector = new mongodb.Db(config.mongo.database, mongoserver, {});
var db = db_connector.open(nop)
var topix = db.collection('topics')
var suggs = db.collection('suggestions')
//All actions taken in the admin cp should be logged.
var log = db.collection('log')

var admin = express();

//GET /suggestions
//A page that lists all current suggestions,
//with editing and a "Merge" (make it official) button.
//Each suggestion also has a "Drop" checkbox:
//if checked, the suggestion is deleted when merged
//(and its UI element disappears).
//WRITEME

//POST /api/merge
//Works basically like /topics/:topic/suggest
//in the main API, but with the topic being a query
//parameter instead of a path parameter.
//Also takes a "sid" parameter for the
//suggestion to drop, as hypothetically, pretty much
//every invocation of this operation is going to be tied
//to a suggestion that should then be immediately deleted,
//and why require two API calls?
//WRITEME

//POST /api/drop
//Just the "delete suggestion" part of the above API call.
//WRITEME

//Removing/editing the existing topics database entries
//is the kind of thing I'll just leave to the straight Mongo CLI.
