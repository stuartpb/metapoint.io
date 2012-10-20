db = db.getSiblingDB("metapoint")

db.suggestions.find({
  host: 'en.wikipedia.org', scope: null
}).forEach(function(doc) {
  db.topics.update({
    topic: doc.topic,
    scope: null
  },{ $set:{
    'sites.en_wikipedia_org': doc.path
  }},true)
  db.oplog.insert({
    action: 'transfer',
    suggestion: doc
  })
  db.suggestions.remove({_id: doc._id})
})
