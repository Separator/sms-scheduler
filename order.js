var db = require( "./db" );
var settings = db.settings.get();
var orderStatuses = db.order.getStatuses();
var sms = require( "./sms" );
var messages = require( "./messages" );

function getTimeByDate( dateStr ) {
    dateStr = dateStr.split( "." );
    var date  = parseInt( dateStr[0], 10 );
    var month = parseInt( dateStr[1], 10 ) - 1;
    var year  = parseInt( dateStr[2], 10 );
    return ( new Date( year, month, date, 0, 0, 0 ) ).getTime();
};

function getTimeByHoursAndMinutes( hours, minutes ) {
    hours   = parseInt( hours   || 0, 10 );
    minutes = parseInt( minutes || 0, 10 );
    return 1000 * 60 * 60 * hours + 1000 * 60 * minutes;
};

function computeSms( order ) {
    var computedSmsList = [];
    var currentTime = ( new Date() ).getTime();
    var beginTime = getTimeByDate( order.beginDate );
    var dayTime = 1000 * 60 * 60 * 24;
    var smsList = order.smsList;
    // формируем список пользовательских сообщений:
    var users = order.users;
    var i, j, k;
    for ( k = 0; k < users.length; k++ ) {
        var user = db.user.get( users[ k ] );
        for ( i = 0; i < smsList.length; i++ ) {
            var smsOnDay = smsList[ i ];
            for ( j = 0; j < smsOnDay.length; j++ ) {
                var smsItem = smsOnDay[ j ];
                var time = beginTime + getTimeByHoursAndMinutes( smsItem.hours, smsItem.minutes ) + dayTime * i;
                if ( time >= currentTime ) {
                    computedSmsList.push( messages.generate( user.id, db.sms.get( smsItem.id ), time, order ) );
                };
            };
        };
    };
    // формируем список служебных sms:
    if ( computedSmsList.length ) {
        var sendTime = ( new Date() ).getTime() + 1000 * 60 * 2;
        var cookPhones = settings.cook;
        for ( i = 0; i < cookPhones.length; i++ ) {
            computedSmsList.push( messages.generate( cookPhones[ i ], sms.getTechMessageText( order, "cook" ), sendTime, order ));
        };
        var deliveryPhones = settings.delivery;
        for ( i = 0; i < deliveryPhones.length; i++ ) {
            computedSmsList.push( messages.generate( deliveryPhones[ i ], sms.getTechMessageText( order, "delivery" ), sendTime, order ));
        };
    };
    return computedSmsList;
};

function addOrder( order ) {
    var orderId = db.order.add( order );
    db.log.write( "Заказ №" + orderId + " успешно добавлен" );
    return orderId;
};

function confirmOrder( id ) {
    var order = db.order.get( id );
    if ( order.status == orderStatuses.CONFIRMED ) {
        return false;
    } else {
        var computedSmsList = computeSms( order );
        if ( computedSmsList.length ) {
            messages.append( computedSmsList );
            order.status = orderStatuses.CONFIRMED;
            db.order.update( order );
            db.log.write( "Заказ №" + order.id + " успешно подтверждён" );
            return true;
        } else {
            return false;
        };
    };
};

function cancelOrder( id ) {
    var order = db.order.get( id );
    if ( order.status == orderStatuses.CANCELLED ) {
        return false;
    } else {
        messages.remove( id );
        order.status = orderStatuses.CANCELLED;
        db.order.update( order );
        db.log.write( "Заказ №" + order.id + " успешно отменён" );
        return true;
    };
}

module.exports = {
    add: addOrder,
    confirm: confirmOrder,
    cancel: cancelOrder
};