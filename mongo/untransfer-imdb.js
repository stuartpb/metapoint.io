/*global db*/

db.oplog.find({action:'transfer','suggestion.host':'www.imdb.com'})
  //excercise great caution
  .sort({_id:-1}).limit(1).forEach(function(doc){
    db.oplog.insert({action:'untransfer',
      unopid:doc._id,suggid:doc.suggestion._id});
    db.suggestions.insert(doc.suggestion);
    //I'd really be more boned if this weren't exactly how it went down -
    //if I'd clobbered existing data, who knows how I'd have gotten it back?
    db.topics.update({topic:doc.suggestion.topic},
      {$unset:{'sites.www_imdb_com':''}});
});