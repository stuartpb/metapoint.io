db = db.getSiblingDB("metapoint")

printjson(db.suggestions.aggregate(
  // Count instances of each path
  { $group: {
    _id: {host: "$host", path: '$path'},
    noteses: { $push: '$notes' },
    dupes: { $sum: 1 }
  }},

  // Return suggestions with colliding paths
  { $match: {
    dupes: { $gt:1 }
  }},

  // Only return the noteses, precious
  { $project: {
    noteses: 1
  }}
))
