var db = require( "./db" );
var settings = db.settings.get();
var StaticServer = require( "./staticServer" );
var commandServer = require( "./commandServer" );
var messages = require( "./messages" );
var order = require( "./order" );

// запуск очереди отправки sms:
messages.start();

var staticServer = StaticServer();
staticServer.listen( settings.server.port );
commandServer.listen( staticServer );

console.log( "Приложение запущено!" );

setTimeout( function() {
    order.confirm( 1 );
}, 5000 );