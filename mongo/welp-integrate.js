//run this script with `--eval "var iScope = /film$/"`
//to integrate all films

var integrateScope = iScope || null

//I'll figure out the other ones later, they're more complicated.
var integrateHost = 'en.wikipedia.org'

db = db.getSiblingDB("metapoint")

var cursor = db.suggestions.find({
  host: integrateHost
  scope: integrateScope
})
var count = cursor.count()
if (count > 0) {
  var i = 0, lastPct = 0
  cursor.forEach(function(doc) {
    var updata = {}
    updata['sites.'+doc.host.replace(/\./g,'_')] = doc.path

    db.topics.update({
      topic: doc.topic,
      scope: doc.scope
    },{ $set: updata },true)
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
