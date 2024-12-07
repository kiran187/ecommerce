var mysql = require("mysql");
var util = require("util");

var conn = mysql.createConnection({
    "host":"bwbhldwydzajlkylvt2i-mysql.services.clever-cloud.com",
    "user":"urh9qzgrwzh4mqcb",
    "password":"FRFG300Uo8uL0It0cjHm",
    "database":"bwbhldwydzajlkylvt2i"
});

var exe = util.promisify(conn.query).bind(conn);

module.exports = exe;
