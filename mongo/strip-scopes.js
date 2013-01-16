/*global db*/

var cursor = db.suggestions.find({
  scope: {$ne: null}
});
var count = cursor.count();
if (count > 0) {
  var i = 0, lastPct = 0;
  cursor.forEach(function(doc) {

    var pscope = '('+doc.scope+')';

    if(doc.topic.slice(-pscope.length) == pscope){
      db.suggestions.update({
        _id: doc._id
      },{ $set: {topic: doc.topic.slice(0, -pscope.length-1) }});
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
