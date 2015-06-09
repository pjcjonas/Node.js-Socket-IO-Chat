// LIBS
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Variables
var people = {};

// setup app settings
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

    // Set the routes
    app.get('/', function (req, res) {
        res.render('home');
    });



// Web Sockets Starts
io.on('connection', function(client){

    // Client join event
    client.on('join', function(name){

        // Add the client to the people roster
        people[client.id] = name;

        // Emit the update event
        client.emit('update', 'You have connected to the server.');

        // Emit update to all sockets
        io.emit('update',name + ' has joined the server');
        io.emit('update-people', people);

    });

    // Client on message send
    client.on('send', function(msg){

        // Emit to chat
        io.emit('chat', people[client.id], msg);

    });

    // Client Disconnects
    client.on('disconnect', function(){

        // Emit update that user has disconnected
        io.emit('update', people[client.id] + ' has left the server');

        // Remove the user from the roster
        delete people[client.id];

        // Emit the new roster
        io.emit('update-people', people);

    });

});



// Web Sockets Ends
http.listen(3000, function(){
    console.log('listening on *:8080');
});