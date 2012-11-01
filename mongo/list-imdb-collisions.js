db = db.getSiblingDB("metapoint")

printjson(db.suggestions.aggregate(
  // Restrict to IMDb suggestions
  { $match: {
    host: 'www.imdb.com'
  }},

  // Count instances of each path
  { $group: {
    _id: '$path',
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
