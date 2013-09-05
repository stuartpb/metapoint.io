var envigor = require("envigor");

module.exports = function(cfg) {
  var cfg = cfg || envigor();
  cfg.adminpath = process.env.ADMINPATH;
  return cfg;
};
