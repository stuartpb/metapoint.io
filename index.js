var express = require('express');
var mongodb = require('mongodb');
var https = require('https');
var http = require('http');

var config = require('./config.json');

var mongoserver = new mongodb.Server(config.mongo.server,
  config.mongo.port, {auto_reconnect: true});
var db_connector = new mongodb.Db('metapoint', mongoserver, {});

function db_connect_cb(err,db) {
  var topix = db.collection('topics')
  var suggs = db.collection('suggestions')

  var api = express();

  //Take a response object and respond with the
  //given HTTP code and error message.
  function errespond(res, code, message) {
    //I flip-flop between res.send versus res.json.
    res.send(code,{
      message: message
      //the HTTP code should indicate it's an error-
      //JS Error objects also have "name" fields but nah
    })
  }

  //FEATURE: return 405 codes for incorrect verbs
    //on valid API paths

  api.get('/topics/:topic',function(req,res){
    var cursor = topix.find({topic: req.params.topic})
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
        //this could probably be coerced to be a bit more helpful
        errespond(res,404,"Not Found")
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
        cursor.nextObject(function(err,doc){
          //allow pages on any domain to read this data
          res.setHeader("Access-Control-Allow-Origin",'*')

          //FEATURE: allow requests for a subset of the data
          //(ie. just the en.wikipedia.org page) via query string
          res.send(doc)
        })

      }
    })
  })

  api.post('/topics/:topic/suggest',function(req,res){
    var host = req.query.host
    var path = req.query.path
    if(!(host && path)){
      if(req.query.url) {
        //kudos to Douglas Crockford (I'd cut this up into concatenated strings
        //for cleanliness and compile it globally but nah)
        //Note that this has been tweaked so capture group 5 contains
        //the slash, query, and hash parts (and symbols) of the path
        //NOTE: this won't match URLs with IPv6 hosts, but if someone is sending one of those
        //they have a whoooole other class of problem.
        var parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(\/.*)?$/;
        var result = parse_url.exec(req.query.url)

        //CONSIDER: What to do with the scheme and slashes? It's not out of the
          //question that http vs. https could matter for the host.

        //this is kind of redundant but not quite?
        if(result && result[3] && result[5]) {
          host = result[3]
          path = result[5]
        } else {
          errespond(400,"URL malformed")
        }
      } else {
        //Respond with an error saying that a URL must be included
        //if site and path are not
        errespond(400,"No URL or site/path pair")
      }
    }
    //FEATURE: Strip/use URL prefixes from hosts?

    //FEATURE: verify valid host/path
      //Ensure they don't contain invalid characters
      //Check if the host/page exists?

    //Create a new suggestion object
    var suggestion = {
      topic: req.params.topic,
      host: host,
      path: path,
      notes: req.query.notes || req.body.notes
    //FEATURE: log identity in some way (key, session, IP address)
      //Currently this is kind of what the "notes" thing is for
    }

    //Add suggestion object to suggestions database
    suggs.insert(suggestion)

  }) // /topics/:topic/suggest

  //FEATURE: Non-API app, with a human page or two

  var app = express();
  app.use('/api/v0',api)

  //the options for the HTTPS connection.
  var httpsopts = {}

  http.createServer(app).listen(8080);
  //https.createServer(httpsopts, app).listen(443);
}
db_connector.open(db_connect_cb)
