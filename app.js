var db = require( "./db" );
var settings = db.settings.get();
var StaticServer = require( "./staticServer" );
var socketServer = require( "./socketServer" );
var messages = require( "./messages" );
var order = require( "./order" );

// запуск очереди отправки sms:
//messages.start();

var staticServer = StaticServer();
staticServer.listen( settings.server.port );
socketServer.listen( staticServer );

console.log( "Приложение запущено!" );

/*
setTimeout( function() {
    order.confirm( 1 );
}, 5000 );*/
