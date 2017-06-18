var React = require( "react" );
var ReactDOM = require( "react-dom" );
var ReactRouter = require( "react-router" );
var Login = require( "./login" );
var NotFound = require( "./notFound" );
var commands = require( "./commands" );

var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var hashHistory = ReactRouter.hashHistory;

ReactDOM.render( <Router history={hashHistory}>
    <Route path="/" component={Login} auth={commands.auth} />
    <Route path="*" component={NotFound} />
</Router>, document.getElementById("container") );