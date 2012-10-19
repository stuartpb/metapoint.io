db.suggestions.find({
  host: 'en.wikipedia.org', scope: {$exists:false}
}).forEach(function(this) {
  db.topics.update({
    topic: this.topic,
    scope: {$exists:false}
  },{ $set:{
    'sites.en_wikipedia_org': this.path
  }},true)
  db.oplog.insert({
    action: 'transfer',
    suggestion: this
  })
  db.suggestions.remove({_id: this._id})
})
