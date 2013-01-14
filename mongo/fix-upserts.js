/*global db*/

var skip = skip || 0;

var cursor = db.oplog.find({action:'upsert'}).sort({_id:1}).skip(skip);

var count = cursor.count();
if (count > 0) {
  var i = skip, lastPct = 0;
  cursor.forEach(function(doc) {
    var updata = {};
    updata['sites.'+doc.suggestion.host.replace(/\./g,'_')] =
      doc.suggestion.path;

    db.topics.update({
      topic:doc.suggestion.topic,
      scope:doc.suggestion.scope},
      {$set:updata},
      {upsert:true});

    ++i;
    if (Math.floor((i/count)*100) > lastPct) {
      print( i + ' of ' + count + ' processed '+
        '(' + Math.floor((i/count)*100) + '%)');
      lastPct = Math.floor((i/count)*100);
    }
  });
} else {
  print("No such ops found (phew/uh oh?)");
}
