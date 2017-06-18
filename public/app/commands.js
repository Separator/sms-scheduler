const io = require( "socket.io-client" );
const socket = io();

function auth ( form ) {
    socket.emit( "auth", form );
};

module.exports = {
    socket: socket,
    auth: auth
};