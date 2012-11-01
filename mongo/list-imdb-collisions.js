db = db.getSiblingDB("metapoint")

printjson(db.suggestions.aggregate(
  // Group by values of 'foo' and count duplicates
  { $group: {
    id: '$path',
    noteses: { $push: '$notes' },
    dupes: { $sum: 1 }
  }},

  // Find the 'foo' values that are unpaired (odd number of dupes)
  { $match: {
    dupes: { $gt:1 }
  }},

  { $project: {
    noteses: 1
  }}
))
