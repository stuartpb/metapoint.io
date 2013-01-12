/*global db ObjectId*/

var cursor = db.oplog.find({action:'transfer','suggestion.host':'www.imdb.com',
//do not include the op I already untransferred
 "_id" : {$lt:ObjectId("50ef7889dae964d511fa09fc")}});

  //here goes nothing
var count = cursor.count();
if (count > 0) {
  var i = 0, lastPct = 0;
  cursor.forEach(function(doc) {
    db.oplog.insert({action:'untransfer',
      unopid:doc._id,suggid:doc.suggestion._id});
    db.suggestions.insert(doc.suggestion);
    //I'd really be more boned if this weren't exactly how it went down -
    //if I'd clobbered existing data, who knows how I'd have gotten it back?
    db.topics.update({topic:doc.suggestion.topic},
      {$unset:{'sites.www_imdb_com':''}});
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
