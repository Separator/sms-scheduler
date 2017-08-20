var email 	= require( "emailjs" );
var db = require( "./db" );
var settings = db.settings.get().email;

var server 	= email.server.connect( settings );

module.exports = {
    sendEmail: function( email, text ) {
        var message	= {
            text: text,
            from: settings.user,
            to: email,
            subject: "Диета",
            attachment: []
        };
        server.send(message, function(err, message) {});
    }
};