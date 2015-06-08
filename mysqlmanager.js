var mysql = require('mysql');
var connection = null;

exports.mysqlconnect = function(){
    connection = mysql.createConnection({host:'HOST ADDRESS', user:'DB USER', password:'DB PASS', database:'DB NAME'});
    connection.connect(function(err) {
        if (err) {throw err;}
        console.log('connected as id ' + connection.threadId);
    });
}


exports.end = function(){
    connection.end();
}