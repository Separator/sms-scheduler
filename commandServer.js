var db = require( "./db" );
var socketIO = require( "socket.io" );
var io;

var usersList = {};

function auth( user, form ) {
    if ( user.data && user.data.isAlreadyLoggedIn ) {
        user.socket.emit( "auth" , { result: false, message: "Вы уже вошли в систему!" } );
        return false;
    };
    var login = form.login;
    var password = form.password;
    var someUser;
    for ( var socketID in usersList ) {
        someUser = usersList[ socketID ];
        if ( someUser.data && someUser.data.login == login ) {
            user.socket.emit( "auth" , { result: false, message: "Пользователь с таким именем уже авторизован!" } );
            return false;
        };
    };
    var users = db.user.getAll();
    for ( var iserID in users ) {
        someUser = users[ iserID ];
        if ( someUser.login == login ) {
            if ( someUser.password == password ) {
                user.data = someUser;
                user.data.isAlreadyLoggedIn = true;
                user.socket.emit( "auth" , { result: true, message: "Вы успешно авторизованы!" } );
                return true;
            } else {
                user.socket.emit( "auth" , { result: false, message: "Неверно указан пароль!" } );
                return false;
            };
        };
    };
    user.socket.emit( "auth" , { result: false, message: "Пользователь с указанным именем не найден!" } );
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
        // авторизация:
        socket.on( "auth", function( form ) {
            auth( user, form );
        } );
        // выход:
        socket.on( "disconnect", function() {
            delete usersList[ socket.id ];
        } );
    });
};