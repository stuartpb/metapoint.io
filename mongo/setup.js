/*global db*/

db.topics.ensureIndex({topic:1,scope:1},{
  unique: true,
  //you can technically run setup on a properly-structured database
  //at any time, so don't impede its running
  background: true
});