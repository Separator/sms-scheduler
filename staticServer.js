var db = require( "./db" );
var fs = require( "fs" );
var http = require( "http" );
var path = require( "path" );
var mime = require( "mime" );

var settings = db.settings.get().server;
var cache = {};

function send404( response ) {
    response.writeHead( 404, { "Content-Type": "text/plain" } );
    response.write( "Error 404: Файл не найден." );
    response.end();
};

function sendFile( response, filePath, fileContents ) {
    response.writeHead( 200, {
        "Content-Type": mime.lookup( path.basename( filePath ) )
    } );
    response.end( fileContents );
};

function serveStatic( response, cache, absPath ) {
    if ( cache[ absPath ] && settings.cache ) {
        sendFile( response, absPath, cache[ absPath ] );
    } else {
        fs.exists( absPath, function ( exists ) {
            if ( exists ) {
                fs.readFile( absPath, function ( err, data ) {
                    if ( err ) {
                        send404( response );
                    } else {
                        cache[ absPath ] = data;
                        sendFile( response, absPath, data );
                    };
                } );
            } else {
                send404( response );
            };
        } );
    };
};

module.exports = function() {
    return http.createServer( function( request, response ) {
        var filePath = false;
        if ( request.url == "/" ) {
            filePath = "public/index.htm";
        } else {
            filePath = "public" + request.url;
        };
        var absPath = "./" + filePath;
        serveStatic( response, cache, absPath );
    } );
};