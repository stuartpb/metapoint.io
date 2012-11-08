//run this script with `--eval "var iScope = /film$/"`
//to integrate all films

var integrateScope = iScope || null

db = db.getSiblingDB("metapoint")

var cursor = db.suggestions.find({
  host: 'en.wikipedia.org', scope: null
})
var count = cursor.count()
if (count > 0) {
  var i = 0, lastPct = 0
  cursor.forEach(function(doc) {
    db.topics.update({
      topic: doc.topic,
      scope: integrateScope
    },{ $set:{
      'sites.en_wikipedia_org': doc.path
    }},true)
    db.oplog.insert({
      action: 'transfer',
      suggestion: doc
    })
    db.suggestions.remove({_id: doc._id})
    ++i;
    if((count/i)%1>lastPct) {
      print(i+' of '+count+' processed ('+((count/i)%1)+'%)')
    }
  })
} else {
  print("No such suggestions found (did you set iScope?)")
}
