var db = require( "./db" );
var socketIO = require( "socket.io" );
var trim = require( "trim" );
var order = require( "./order" );
var io;

var usersList = {};

function ordersToArray( orders ) {
    var result = [];
    var users = db.user.getAll();
    var sms = db.sms.getAll();
    for ( var orderId in orders ) {
        var order = orders[ orderId ];
        var item = Object.assign( {}, order );
        // заполняем данные связанных пользователей:
        item.users = [];
        var i, j;
        for ( i = 0; i < order.users.length; i++ ) {
            var userId = order.users[ i ];
            var user = Object.assign( {}, users[ userId ] );
            delete user.login;
            delete user.password;
            item.users.push( user );
        };
        // заполняем список sms:
        item.smsList = [];
        for ( i = 0; i < order.smsList.length; i++ ) {
            var daySms = [];
            var orderDaySms = order.smsList[ i ];
            for ( j = 0; j < orderDaySms.length; j++ ) {
                var smsClone = Object.assign( {}, orderDaySms[ j ] );
                smsClone.text = sms[ smsClone.id ];
                daySms.push( smsClone );
            };
            item.smsList.push( daySms );
        };
        result.push( item );
    };
    return result;
};

function login( user, form ) {
    if ( user.data ) {
        user.socket.emit( "login" , { result: true, message: "Вы уже вошли в систему!" } );
        return false;
    };
    var login = trim( form.login );
    var password = trim( form.password );
    if ( ! login || ! password ) {
        user.socket.emit( "login" , { result: false, message: "Вы не ввели логин или пароль!" } );
    };
    var someUser;
    for ( var socketID in usersList ) {
        someUser = usersList[ socketID ];
        if ( someUser.data && someUser.data.login == login ) {
            user.socket.emit( "login" , { result: false, message: "Пользователь с таким именем уже авторизован!" } );
            return false;
        };
    };
    var users = db.user.getAll();
    for ( var iserID in users ) {
        someUser = users[ iserID ];
        if ( someUser.login == login ) {
            if ( someUser.password == password ) {
                user.data = someUser;
                user.socket.emit( "login" , { result: true, message: "Вы успешно авторизованы!" } );
                return true;
            } else {
                user.socket.emit( "login" , { result: false, message: "Неверно указан пароль!" } );
                return false;
            };
        };
    };
    user.socket.emit( "login" , { result: false, message: "Пользователь с указанным именем не найден!" } );
};

function logout( user ) {
    if ( user && user.data ) {
        user.data = null;
        user.socket.emit( "logout" , { result: true, message: "Вы вышли!" } );
    } else {
        user.socket.emit( "logout" , { result: false, message: "Вы ещё не авторизованы!" } );
    };
};

function activateOrder( user, orderId ) {
    if ( user.data ) {
        order.confirm( orderId );
        var orders = ordersToArray( db.order.getAll() );
        user.socket.emit( "activateOrder" , orders );
    } else {
        user.socket.emit( "activateOrder" , [] );
    };
};

function disableOrder( user, orderId ) {
    if ( user.data ) {
        order.cancel( orderId );
        var orders = ordersToArray( db.order.getAll() );
        user.socket.emit( "activateOrder" , orders );
    } else {
        user.socket.emit( "activateOrder" , [] );
    };
};

function getOrders( user ) {
    if ( user.data ) {
        var orders = ordersToArray( db.order.getAll() );
        user.socket.emit( "getOrders" , orders );
    } else {
        user.socket.emit( "getOrders" , [] );
    };
};

exports.listen = function( server ) {
    io = socketIO.listen( server );
    io.set( "log level", 1 );
    io.sockets.on( 'connection', function ( socket ) {
        // сохранение пользователя:
        var user = {
            socket: socket,
            data: null
        };
        usersList[ socket.id ] = user;
        // вход:
        socket.on( "login", function( form ) {
            login( user, form );
        } );
        // выход:
        socket.on( "logout", function() {
            logout( user );
        } );
        // Активировать заявку:
        socket.on( "activateOrder", function( orderId ) {
            activateOrder( user, orderId );
        } );
        // Отключить заявку:
        socket.on( "disableOrder", function( orderId ) {
            disableOrder( user, orderId );
        } );
        // Получить список заявок:
        socket.on( "getOrders", function() {
            getOrders( user );
        } );
        // отключение:
        socket.on( "disconnect", function() {
            delete usersList[ socket.id ];
        } );
    });
};