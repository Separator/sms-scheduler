var fs = require( "fs" );

var logs = require( "./data/logs.json" );
var orders = require( "./data/orders.json" );
var settings = require( "./data/settings.json" );
var sms = require( "./data/sms.json" );
var users = require( "./data/users.json" );
var messages = require( "./data/messages.json" );

var orderStatuses = require( "./data/orderStatuses.json" );
var messageStatuses = require( "./data/messageStatuses.json" );

module.exports = {
    log: {
        write: function( message ) {
            logs.push( [ ( new Date() ).getTime(), message ] );
            if ( settings.logging && settings.logging.maxEntries < logs.length ) {
                logs.shift();
            };
            fs.writeFileSync( "./data/logs.json", JSON.stringify( logs ), { encoding: "utf8" } );
        },
        clear: function () {
            logs = [];
            fs.writeFileSync( "./data/logs.json", JSON.stringify( logs ), { encoding: "utf8" } );
        }
    },
    order: {
        get: function ( id ) {
            return orders[ id ];
        },
        getAll: function () {
            return orders;
        },
        getStatuses: function () {
            return orderStatuses;
        },
        add: function ( order ) {
            var id = Math.max.apply( null, Object.keys( orders ) ) + 1;
            order.id = id;
            order.status = orderStatuses.NEW;
            order.createTime = ( new Date() ).getTime();
            orders[ id ] = order;
            fs.writeFileSync( "./data/orders.json", JSON.stringify( orders ), { encoding: "utf8" } );
            return id;
        },
        update: function ( order ) {
            orders[ order.id ] = order;
            fs.writeFileSync( "./data/orders.json", JSON.stringify( orders ), { encoding: "utf8" } );
        }
    },
    sms: {
        get: function ( id ) {
            return sms[ id ];
        },
        getAll: function () {
            return sms;
        },
        append: function ( text ) {
            var id = Math.max.apply( Math, Object.keys( sms ).sort() ) + 1;
            sms[ id ] = text;
            fs.writeFileSync( "./data/sms.json", JSON.stringify( sms ), { encoding: "utf8" } );
        }
    },
    user: {
        get: function ( id ) {
            return users[ id ];
        },
        getAll: function () {
            return users;
        }
    },
    messages: {
        getAll: function() {
            return messages;
        },
        getStatuses: function () {
            return messageStatuses;
        },
        update: function ( index, message ) {
            if ( messages[ index ] ) {
                messages[ index ] = message;
                fs.writeFileSync( "./data/messages.json", JSON.stringify( messages ), { encoding: "utf8" } );
                return true;
            } else {
                return false;
            };
        },
        append: function ( message ) {
            messages.push( message );
            fs.writeFileSync( "./data/messages.json", JSON.stringify( messages ), { encoding: "utf8" } );
            return messages.length - 1;
        },
        removeByOption: function ( key, value ) {
            var result = [];
            messages.forEach( function ( message ) {
                if ( message[ key ] != value ) {
                    result.push( message );
                };
            } );
            messages = result;
            fs.writeFileSync( "./data/messages.json", JSON.stringify( messages ), { encoding: "utf8" } );
            return result;
        },
        removeOutdated: function() {
            return this.removeByOption( "status", messageStatuses.OUTDATED );
        }
    },
    settings: {
        get: function () {
            return settings;
        }
    }
};