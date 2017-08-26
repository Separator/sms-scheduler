var db = require( "./db" );
var messages = db.messages.getAll();
var messageStatuses = db.messages.getStatuses();
var sms = require( "./sms" );
var email = require( "./email" );
var telegram = require( "./telegram" );

var timeOuts = {};

function send( index, message ) {
    var CONTACT = 0;
    var STATUS = 1;

    message.status = messageStatuses.FINISHED;
    db.messages.update( index, message );
    var contacts = db.user.get( message.userId ).contacts;
    for ( var contactType in contacts ) {
        switch ( contactType ) {
            case "phone": {
                var phones = contacts[ contactType ];
                for ( var i = 0; i < phones.length; i++ ) {
                    var phone = phones[ i ];
                    if ( phone[ STATUS ] ) {
                        sms.sendSMS( phone[ CONTACT ], message.message );
                        telegram.send( message.userId, message.message );
                    };
                };
                break;
            }
            case "email": {
                var emails = contacts[ contactType ];
                for ( var i = 0; i < emails.length; i++ ) {
                    var emailInfo = emails[ i ];
                    if ( emailInfo[ STATUS ] ) {
                        email.sendEmail( emailInfo[ CONTACT ], message.message );
                    };
                };
                break;
            }
        };
    };
};

function generate( userId, message, time, order ) {
    return {
        userId: userId,
        message: message,
        time: time,
        status: messageStatuses.NEW,
        orderId: order.id
    };
};

function stopTimeOuts() {
    for ( var index in timeOuts ) {
        clearTimeout( timeOuts[ index ] );
        delete timeOuts[ index ];
    };
    messages = db.messages.removeOutdated();
};

function startTimeOuts() {
    stopTimeOuts();
    var currentTime = Date.now();
    messages.forEach( function ( message, i ) {
        switch ( message.status ) {
            case messageStatuses.NEW:
            case messageStatuses.ACTIVE: {
                if ( currentTime > message.time ) {
                    message.status = messageStatuses.OUTDATED;
                } else {
                    message.status = messageStatuses.ACTIVE;
                    var timeOut = setTimeout( function () {
                        send( i, message );
                    }, message.time - currentTime );
                    timeOuts[ i ] = timeOut;
                };
                db.messages.update( i, message );
                break;
            }
        };
    } );
};

function start() {
    startTimeOuts();
};

function append( messagesList ) {
    messagesList.forEach( function ( message ) {
        db.messages.append( message );
    } );
    messages = db.messages.getAll();
    startTimeOuts();
};

function remove( orderId ) {
    messages = db.messages.removeByOption( "orderId", orderId );
    startTimeOuts();
};

module.exports = {
    generate: generate,
    append: append,
    start: start,
    remove: remove
};