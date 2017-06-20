var db = require( "./db" );
var messages = db.messages.getAll();
var messageStatuses = db.messages.getStatuses();
var sms = require( "./sms" );

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

function handle( isStart ) {
    var currentTime = Date.now();
    messages.forEach( function ( message, i ) {
        switch ( message.status ) {
            case messageStatuses.NEW: {
                if ( currentTime > message.time ) {
                    message.status = messageStatuses.OUTDATED;
                } else {
                    message.status = messageStatuses.ACTIVE;
                    setTimeout( function () {
                        send( i, message );
                    }, message.time - currentTime );
                };
                db.messages.update( i, message );
                break;
            }
            case messageStatuses.ACTIVE: {
                if ( isStart ) {
                    if ( currentTime > message.time ) {
                        message.status = messageStatuses.OUTDATED;
                    } else {
                        message.status = messageStatuses.ACTIVE;
                        setTimeout( function () {
                            send( i, message );
                        }, message.time - currentTime );
                    };
                    db.messages.update( i, message );
                };
                break;
            }
        };
    } );
};

function start() {
    handle( true );
};

function append( messagesList ) {
    messagesList.forEach( function ( message ) {
        db.messages.append( message );
    } );
    messages = db.messages.getAll();
    handle();
};

module.exports = {
    generate: generate,
    append: append,
    start: start
}