import settings from './settings';
import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory} from 'react-router';
import Login from './login';
import Orders from './orders';
import AddOrder from './addOrder';
import Sms from './sms';
import Users from './users';
import NotFound from './notFound';
import io from 'socket.io-client';

const socket = io.connect( settings.socket.host + ":" + settings.socket.port );

ReactDOM.render( <Router history={hashHistory}>
    <Route path="/" component={Login} socket={socket} />
    <Route path="orders" component={Orders} socket={socket} />
    <Route path="addOrder" component={AddOrder} socket={socket} />
    <Route path="sms" component={Sms} socket={socket} />
    <Route path="users" component={Users} socket={socket} />
    <Route path="*" component={NotFound} />
</Router>, document.getElementById("container") );