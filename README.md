# Simple NODE.js and Socket.io chat application.
This is a simple node.js chat app that allows for user based identification. 

# Installation
```sh
$ git clone GIT-CLONE-URL NodeSocketChat
$ cd NodeSocketChat
$ npm install
```

# The Code
**First we include the relevant libs**
```javascript
// LIBS
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
```
**We then create the people holder, this will be our list of active chat users**
```javascript
// Variables
var people = {};
```
**We then setup the express engine settings by setting the render engine to jade, the template folder to use and the route for the home page.**
```javascript
// setup app settings
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

    // Set the routes
    app.get('/', function (req, res) {
        res.render('home');
    });
```

##### The chat server listens for 3 events
- **join** This is when a user joins the channel
- **send** This is when a user sends a message
- **disconnect** This is when the user leaves the channel.

All these events are placed in the socket on connection method so that we can assign them to the client variable based back in the on connection event listener
```javascript
// Web Sockets Starts
io.on('connection', function(client){

    // Client join event
    client.on('join', function(name){
        // Covered later
    });

    // Client on message send
    client.on('send', function(msg){
        // Covered later
    });

    // Client Disconnects
    client.on('disconnect', function(){
        // Covered later
    });

});
```

**In the join event we add the person to the people object associated with the client id, then we emit the update event to update the joined user list on the frontend. we then emit a notification to all users that someone has joined the server.**
```javascript
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
```
**The send event broadcasts the message to all those in the channel**
```javascript
// Client on message send
    client.on('send', function(msg){
    
        // Emit to chat
        io.emit('chat', people[client.id], msg);
        
    });
```

**The disconnect event removes the user from the people list and notifies everyone that a user has left then updates the user list on the frontend.**
```javascript
    // Client Disconnects
    client.on('disconnect', function(){

        // Emit update that user has disconnected
        io.emit('update', people[client.id] + ' has left the server');

        // Remove the user from the roster
        delete people[client.id];

        // Emit the new roster
        io.emit('update-people', people);

    });
```

#Frontend event handler
The front end code is contained in **/public/js/eventmanager.js**
I am not going to cover all the ins and outs of the javascript, hopefully you are familliar with jQuery and Javascript in general, we will only look at the Socket events.


**This is the basic jade template for the front end.**
```jade
doctype html
head
    title!= title
    link(rel='stylesheet', href='https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.css')
    link(rel='stylesheet', href='/css/bootstrap.min.css')
body

    div.row
        div.span2
            ul#people.unstyled
        div.span4
            ul#msgs.unstyled
    div.row
        div.span5.offset2#login
            form.form-inline
                input#name.input-small(type="text",placeholder="Your name")
                input#join.btn.btn-primary(type="button",name="join",value="Join")
        div.span5.offset2#chat
            form#2.form-inline
                input#msg.input(type="text",placeholder="Your message")
                input#send.btn.btn-success(type="button",name="send",value="Send")

    script(src='https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js')
    script(src='https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js')
    script(src='/socket.io/socket.io.js')
    script(src='/js/eventmanager.js')
```

**When JQuery is initialised we call the initSocketIo method, this will instantiate the socket connection on the server.**
```javascript
jQuery(document).ready(function(){
    initSocketIo();
});


function initSocketIo(){

    socket = io();
    // more to come....
}
```
**Then we hide all elements that are not relevant until you have entered a name to join the channel, we also prevent the fomrs from being submitted by preventing default actions with preventDefault()**
```javascript
function initSocketIo(){

    socket = io();

    jQuery('#chat').hide();
    jQuery('#name').focus();
    jQuery('form').on('submit', function(event){
        event.preventDefault();
    });
    
    // More to come
    
}
```
**When you enter your name and click the join buttne we validate that a name has been entered. We then emit the join event to the listener on the server that will add the user to the people list. This will then hide the join form and show the chat form and set the ready status to true**
```javascript
    jQuery('#join').on('click', function(evt){

        jQuery('#name').css({'border':''});
        var name = jQuery('#name').val();

        if(name != ''){

            socket.emit('join', name);
            jQuery('#login').detach();
            jQuery('#chat').show();
            jQuery('#msg').focus();
            ready = true;

        }else{
            jQuery('#name').focus();
            jQuery('#name').css({'border':'2px solid red'});
        }

    });
    
    // More to come..
    
}
```
**When you enter a message and click the send button we emit the send event to the server with the message. This will handle the emit and bradcast the message to the other users in the chat box.**
```javascript
    jQuery('#send').on('click', function(event){

        event.preventDefault();

        socket.emit('send', $('#msg').val());

        $('#msg').val("");

    });
```

**We then register 3 event listeners to listen for events emited from the server**
- **update** This updates the message to the chat box.
- **update-people** This sends a update message to all users.
- **chat** This send the message to the chat box for other users to see.

```javascript
    socket.on('update', function(msg){
        if(ready){
            jQuery('#msgs').append("<li>"+msg+"</li>");
        }
    });

    socket.on("update-people", function(people){
        if(ready) {

            console.log(people);

            jQuery("#people").empty();
            jQuery.each(people, function(clientid, name) {
                jQuery('#people').append("<li>" + name + "</li>");
            });
        }
    });

    socket.on('chat', function(who, msg){
        if(ready){
            jQuery('#msgs').append("<li style='margin-bottom: 2px'><strong>"+who+" says: </strong>"+msg+"</li>");
        }
    })
```

