/*global db*/

//run this script with `--eval "var iScope = /film$/"`
//to integrate all films

//Don't forget to specify the database on the command line!

var iScope = iScope || null;
var integrateScope = iScope;

var integrateHost = 'www.imdb.com';

function parseTemplateParams(captures){
  var position = 1;
  var results = {};

  //Skip 0, since that's just the whole match
  for(var i=1; i < captures.length; i++){
    var sep = captures[i].indexOf('=');

    if(sep >= 0){
      results[captures[i].slice(0,sep).trim()] = captures[i].slice(sep+1).trim;
    } else {
      results[position] = captures[i].trim();
      ++position;
    }
  }

  return results;
}

var cursor = db.suggestions.find({
  host: integrateHost,
  scope: integrateScope
});
var count = cursor.count();
if (count > 0) {
  var i = 0, lastPct = 0;
  cursor.forEach(function(doc) {
    var params = parseTemplateParams(doc.notes.match(
      /^Capture: \{\{[^|]*(?:\|([^\|]*))*\}\}$/m));

    var id = params['1'] || params.id;
    var title = params['2'] || params.title;
    var description = params['3'] || params.description;

    if(
      //everything would have needed an ID to get this far-
      //this is basically just a sanity check
      id &&
      //If there's a description, it probably needs future scrutiny
      !description &&
      //If there's a title, only approve it if it's the same as the page title
      (!title || title == doc.title)){

      var updata = {};
      updata['sites.'+doc.host.replace(/\./g,'_')] = doc.path;

      db.topics.update({
        topic: doc.topic,
        scope: doc.scope
      },{ $set: updata },true);
      db.oplog.insert({
        action: 'transfer',
        suggestion: doc
      });
      db.suggestions.remove({_id: doc._id});
    }
    ++i;
    if (Math.floor((i/count)*100) > lastPct) {
      print( i + ' of ' + count + ' processed '+
        '(' + Math.floor((i/count)*100) + '%)');
      lastPct = Math.floor((i/count)*100);
    }
  });
} else {
  print("No such suggestions found "+
    "(did you set iScope and specify the database?)");
}
