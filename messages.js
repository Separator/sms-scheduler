var db = require( "./db" );
var messages = db.messages.getAll();
var messageStatuses = db.messages.getStatuses();
var sms = require( "./sms" );

var timeOuts = {};

function send( index, message ) {
    message.status = messageStatuses.FINISHED;
    db.messages.update( index, message );
    sms.sendSMS( message.phone, message.message );
};

function generate( phone, message, time, order ) {
    return {
        phone: phone,
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