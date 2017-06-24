var db = require( "./db" );
var settings = db.settings.get().sms;
var md5 = require( "md5" );
var sha1 = require( "sha1" );
var curl = require( "curl" );


function getSign( options, apiKey ) {
    var buffer = [];
    var keys = Object.keys( options ).sort();
    keys.forEach( function ( value ) {
        buffer.push( options[ value ] );
    } );
    buffer.push( apiKey );
    return md5( sha1( buffer.join( ";" ) ) );
};

function getUrlByObject( options ) {
    var result = [];
    for ( var name in options ) {
        result.push( name + "=" + encodeURIComponent( options[ name ] ) );
    };
    return result.join( "&" );
};

module.exports = {
    sendRequest: function ( url, options, handler ) {
        options.sign = getSign( options, settings.apiKey );
        url = url + "?" + getUrlByObject( options );
        curl.get( url, options, handler );
    },
    sendSMS: function ( number, message, handler ) {
        if ( settings.debug ) {
            db.log.write( number + ": " + message );
        } else {
            this.sendRequest( settings.url.send, {
                message: message,
                project: settings.project,
                sender: settings.sender,
                recipients: number
            }, function( err, response, body ) {
                if ( err ) {
                    db.log.write( err );
                } else {
                    body = JSON.parse( body );
                    if ( body.status == "success" ) {
                        db.log.write( "sms '" + number + "' успешно отправлена на номер " + number );
                    } else {
                        db.log.write( " ошибка отправки sms '" + message + "' на номер " + number + ": " + body.message );
                    };
                };
                if ( handler ) {
                    handler( err, response, body );
                };
            } );
        };
    },
    getTechMessageText: function ( order, userType ) {
        var dateStr = new Date( order.beginTime );
        switch ( userType ) {
            case "cook": {
                return "Добавлена заявка на курс на " + order.beginDate;
            }
            case "delivery": {
               return  "Добавлена заявка на курс на " + order.beginDate;
            }
            default: {
                return "";
            }
        }
    }
};