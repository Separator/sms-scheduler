import settings from './settings';
import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory} from 'react-router';
import Login from './login';
import NotFound from './notFound';
import io from 'socket.io-client';

const socket = io.connect( settings.socket.host + ":" + settings.socket.port );

ReactDOM.render( <Router history={hashHistory}>
    <Route path="/" component={Login} socket={socket} />
    <Route path="*" component={NotFound} />
</Router>, document.getElementById("container") );