var db = require( "./db" );
var StaticServer = require( "./staticServer" );
var commandServer = require( "./commandServer" );
var settings = db.settings.get();

var staticServer = StaticServer();
staticServer.listen( settings.server.port );
commandServer.listen( staticServer );

console.log( "Приложение запущено!" );