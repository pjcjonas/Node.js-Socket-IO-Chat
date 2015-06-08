// Variables
var socket;
var ready = false;

jQuery(document).ready(function(){
    initSocketIo();
});


function initSocketIo(){

    socket = io();

    jQuery('#chat').hide();
    jQuery('#name').focus();
    jQuery('form').on('submit', function(event){
        event.preventDefault();
    });

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

    jQuery('#send').on('click', function(event){

        event.preventDefault();

        socket.emit('send', $('#msg').val());

        $('#msg').val("");

    });

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

}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}