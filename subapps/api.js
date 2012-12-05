var express = require('express');
var url = require('url');

//Take a response object and respond with the
//given HTTP code and error message.
function errespond(res, code, message) {
  res.send(code,{
    message: message
    //the HTTP code should indicate it's an error-
    //JS Error objects also have "name" fields but nah
  })
}

function pagelist(db){
  var topix = db.collection('topics')

  return function(req,res){
    //allow pages on any domain to read this data,
    //even if it's an error or something
    res.setHeader("Access-Control-Allow-Origin",'*')

    var cursor = topix.find({
      topic: req.param('topic'),
      //TODO: scope should be handled better than this
      scope: req.param('scope')
    })
    cursor.count(function(err,count){
      if(err){
        errespond(res,500,err)
      } else if(count==0){
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
        cursor.nextObject(function (err,doc){
          //FEATURE: allow requests for a subset of the data
          //(ie. just the en.wikipedia.org page) via query string
          res.send(doc);
        }) //cursor.nextObject callback
      } // if (err) else if (count==0) else
    }) //cursor.count callback
  } // /pagelist callback
}// pagelist constructor

function suggest(db){
  //The collection to add to.
  var suggs = db.collection('suggestions')

  //Bounce redundant suggestions (in the future there may be better ways)
  //Need topic connection to do that
  var topix = db.collection('topics')

  return function(req,res){
    var topic = req.param('topic')
    var scope = req.param('scope')
    if(scope===''){scope=null}
    if(req.param('url')) {
      var urlObj = url.parse(req.param('url'))

      //CONSIDER: What to do with the scheme and slashes? It's not out of the
        //question that http vs. https could matter for the host.

      //this is kind of redundant but not quite?
      if(urlObj.host && urlObj.path) {
        var host = urlObj.host
        var path = urlObj.path

        //FEATURE: Strip/use URL prefixes from hosts?
    
        //FEATURE: verify valid host/path
          //Ensure they don't contain invalid characters
          //Check if the host/page exists?
            //Don't want to be a proxy request spam vector
        
        //Create preliminary suggestion object (searchable for collisions)
        var suggestion = {
          topic: topic,
          scope: scope,
          host: host,
          path: path,
        }
        
        var topicResult, suggestionResult
        
        var topicQuery = {
          topic: topic,
          scope: scope,
          sites:{}  
        }
        
        topicQuery.sites[host.replace(/\./g,'_')] = path
        
        topix.count(topicQuery,function(err,count){
          if(err){
            errespond(res,500,err)
          } else if(count > 0){
            topicResult = 'found'
            moveForward()
          } else {
            topicResult = 'not found'
            moveForward()
          }
        })
        
        suggs.count(suggestion,function(err,count){
          if(err){
            errespond(res,500,err)
          } else if(count > 0){
            suggestionResult = 'found'
            moveForward()
          } else {
            suggestionResult = 'not found'
            moveForward()
          }
        })
        
        var moveForward = function() {
          if(topicResult && suggestionResult) {
            if(topicResult == 'found'){
              res.send({result:'Host already resolves to path for given topic'})
            } else if(suggestionResult == 'found') {
              res.send({result:'Suggestion already noted'})
            } else {
              //Add remaining suggestion parameters
              suggestion.notes = req.param('notes')
              //FEATURE: log identity in some way (key, session, IP address)
                //Currently this is kind of what the "notes" thing is for
         
              //Add suggestion object to suggestions database
              suggs.insert(suggestion)
          
              //Return a success code
              res.send({result:"Suggestion added"})
            }
          }
        } //otherwise we're still waiting for all the results, do nothing
      } else {
        errespond(res,400,"URL malformed")
      }
    } else {
      //Respond with an error saying that a URL must be included
      //if site and path are not
      errespond(res,400,"No URL or site/path pair")
    }
  } // /suggest callback
}// suggest constructor

//App constructor
module.exports = function(db){
  var api = express();

  api.use(express.bodyParser())

  //FEATURE: return 405 codes for incorrect verbs
    //on valid API paths

  api.get('/pagelist',pagelist(db))
  api.post('/suggest',suggest(db))

  return api
}
