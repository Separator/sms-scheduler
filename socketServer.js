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

function getUsers( user ) {
    var users = [];
    if ( user.data ) {
        var allUsers = db.user.getAll();
        for ( var userId in allUsers ) {
            var userInfo = Object.assign( {}, allUsers[ userId ] );
            delete userInfo.password;
            users.push( userInfo );
        };
        user.socket.emit( "getUsers" , users );
    } else {
        user.socket.emit( "getUsers" , users );
    };
};

function getSms( user ) {
    var sms = [];
    if ( user.data ) {
        var allSms = db.sms.getAll();
        for ( var smsId in allSms ) {
            sms.push( {
                id: smsId,
                text: allSms[ smsId ]
            } );
        };
        user.socket.emit( "getSms" , sms );
    } else {
        user.socket.emit( "getSms" , sms );
    };
};

function saveOrder( user, orderInfo ) {
    order.add( orderInfo );
    user.socket.emit( "saveOrder" , false );
};

function appendSms( user, smsText ) {
    if ( user.data ) {
        db.sms.append( smsText );
        var sms = [];
        var allSms = db.sms.getAll();
        for ( var smsId in allSms ) {
            sms.push( {
                id: smsId,
                text: allSms[ smsId ]
            } );
        };
        user.socket.emit( "appendSms" , sms );
    } else {
        user.socket.emit( "appendSms" , [] );
    };
};

function appendUser( currentUser, newUser ) {
    if ( currentUser.data ) {
        var allUsers = db.user.getAll();
        for ( var userId in allUsers ) {
            var user = allUsers[ userId ];
            if ( user.login == newUser.login ) {
                currentUser.socket.emit( "appendUser" , { error: "Пользователь с таким ником уже добавлен!" } );
            };
        };
        db.user.append( newUser );
        var users = [];
        allUsers = db.user.getAll();
        for ( var userId in allUsers ) {
            var userInfo = Object.assign( {}, allUsers[ userId ] );
            delete userInfo.password;
            users.push( userInfo );
        };
        currentUser.socket.emit( "appendUser" , { users: users } );
    } else {
        currentUser.socket.emit( "appendUser" , { error: "Вы не авторизованы!" } );
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
        // Получить список sms:
        socket.on( "getSms", function() {
            getSms( user );
        } );
        // Получить список пользователей:
        socket.on( "getUsers", function() {
            getUsers( user );
        } );
        // Добавить заявку:
        socket.on( "saveOrder", function( order ) {
            saveOrder( user, order );
        } );
        // Добавить sms:
        socket.on( "appendSms", function( smsText ) {
            appendSms( user, smsText );
        } );
        // Добавить пользователя:
        socket.on( "appendUser", function( newUser ) {
            appendUser( user, newUser );
        } );
        // отключение:
        socket.on( "disconnect", function() {
            delete usersList[ socket.id ];
        } );
    });
};