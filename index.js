var express = require('express');
var mongo = require('mongodb');
var https = require('https');
var http = require('http');

var config = require('config.json');

var nop = function(){}

var mongoserver = new mongodb.Server(config.mongo.server,
  config.mongo.port, {auto_reconnect: true});
var db_connector = new mongodb.Db('wikilinker', mongoserver, {});
var db = db_connector.open(nop)
var topix = db.collection('topics')
var suggs = db.collection('suggestions')

var api = express();

api.GET('/topics/:topic',function(req,res){
  var cursor = topix.find({topic: req.query.topic})
  cursor.count(function(count,doc){
    if(count==0){
      //FEATURE: case-insensitivity
        //NEEDS: lc_topic field on topic entries
        //NEEDS: disambiguation object support
          //Two topics differentiated by case (for instance, Gnu and GNU)
          //would be made ambiguous in the case of the same name.
        //HACK: try again with the first letter capitalized (Mediawiki style)

      //FEATURE: redirects / aliases

      //return a 404
      //WRITEME
    } else {
      //FEATURE: Disambiguation (if count > 1)
        //NEEDS: Scope fields (and scope query support)
        //NEEDS: Descriptions
        //I'm thinking entries for the most basic form of disambiguation,
        //where one name refers to multiple things, get constructed here.
        //Cases where one name *can* refer to things with *other* names
        //get added in a "see also" field.
        //More complex cases have a topic with the name and a scope of
        //"disambiguation", with the non-same-named pages being in the
        //aforementioned "see also" array.
        //EXAMPLE:
        //  {topic: "Charade", scope: "disambiguaton",
        //   seealso: [{topic: "Charades", scope: "game"}]}
        //  The return object would be a disambiguation object
        //  featuring the topics named in the "seealso", merged with the
        //  other topics named "Charade" found in the query (the movies,
        //  the songs, the Soulcalibur character).

      //return first document from cursor
      //FEATURE: allow subset requests via query string
    }
  })
})

api.POST('/topics/:topic/suggest',function(req,res){
  //FEATURE: strip http / https from paths
  var site, path
  if(req.query.site && req.query.path) {
    site = req.query.site
    path = req.query.path
  }
  else {
    if(req.query.url) {
      //split the URL and figure it out from there
      //WRITEME
    } else {
      //Respond with an error saying that a URL must be included
      //if site and path are not
      //WRITEME
    }
  }

  //FEATURE: verify valid paths

  //Create a new suggestion object
  var suggestion = {
    topic: req.params.topic,
    site: site,
    path: path
  //FEATURE: log identity in some way (key, session, IP address)
  }

  //Add suggestion object to suggestions database
  //WRITEME

}) // /topics/:topic/suggest

var app = express();
app.use('/api/v0',api)

//the options for the HTTPS connection.
var httpsopts = {}

http.createServer(app).listen(80);
https.createServer(httpsopts, app).listen(443);
