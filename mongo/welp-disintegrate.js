//run this script with `--eval "var iScope = /[Ss]eason/"`
//to disintegrate all seasons

var integrateScope = iScope || null

db = db.getSiblingDB("metapoint")

var cursor = db.suggestions.find({
  scope: integrateScope
})

var count = cursor.count()

//this second part is a bit of a hack,
//but I don't want to batch-remove null scope (yet)
if (count > 0 && iScope != null) {
  var i = 0, lastPct = 0
  cursor.forEach(function(doc) {
    db.oplog.insert({
      action: 'yank',
      suggestion: doc
    })
    db.suggestions.remove({_id: doc._id})
    ++i;
    if (Math.floor((count/i)*100) > lastPct) {
      print( i + ' of ' + count + ' processed '+
        '(' + Math.floor((count/i)*100) + '%)')
      lastPct = Math.floor((count/i)*100)
    }
  })
} else {
  print("No such suggestions found (did you set iScope?)")
}
