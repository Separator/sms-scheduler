var settings = require( "./settings" );
var React = require( "react" );
var ReactDOM = require( "react-dom" );
var ReactRouter = require( "react-router" );
var Login = require( "./login" );
var NotFound = require( "./notFound" );
const io = require( "socket.io-client" );

var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var hashHistory = ReactRouter.hashHistory;
const socket = io.connect( settings.socket.host + ":" + settings.socket.port );

ReactDOM.render( <Router history={hashHistory}>
    <Route path="/" component={Login} socket={socket} />
    <Route path="*" component={NotFound} />
</Router>, document.getElementById("container") );