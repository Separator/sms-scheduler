import React from 'react';
import Loader from './loader';
import Error from './error';
import OrderLine from './orderLine';

export default class Orders extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            orders: [],
            isSubmit: true
        };
        this.onActivateOrder = this.onActivateOrder.bind( this );
        this.onDisableOrder = this.onDisableOrder.bind( this );
        this.onLogout = this.onLogout.bind( this );
        this.onGetOrders = this.onGetOrders.bind( this );
    }

    onActivateOrder( e ) {
        let index = e.target.getAttribute( "tabIndex" );
        let order = this.state.orders[ index ];
        var socket = this.props.route.socket;
        socket.emit( "activateOrder", order.id );
        this.setState( { isSubmit: true } );
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    }

    onDisableOrder( e ) {
        let index = e.target.getAttribute( "tabIndex" );
        let order = this.state.orders[ index ];
        var socket = this.props.route.socket;
        socket.emit( "disableOrder", order.id );
        this.setState( { isSubmit: true } );
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    }

    onLogout () {
        var socket = this.props.route.socket;
        socket.emit( "logout", null );
        this.setState( { isSubmit: true } );
    }

    onAddOrder () {
        window.location.hash = 'addOrder';
    }

    onGoToSmsList () {
        window.location.hash = 'sms';
    }

    onGoToUsersList () {
        window.location.hash = 'users';
    }

    onGetOrders() {
        var socket = this.props.route.socket;
        socket.emit( "getOrders", null );
        this.setState( { isSubmit: true } );
    }

    componentDidMount() {
        document.title = this.props.titleText;
        var socket = this.props.route.socket;
        // обработка активации заявки:
        socket.on( "activateOrder", function( orders ) {
            this.setState( { orders: orders, isSubmit: false } );
        }.bind( this ) );
        // обработка отключения заявки:
        socket.on( "disableOrder", function( orders ) {
            this.setState( { orders: orders, isSubmit: false } );
        }.bind( this ) );
        // обработка получения списка заявок:
        socket.on( "getOrders", function( orders ) {
            this.setState( { orders: orders, isSubmit: false } );
        }.bind( this ) );
        // обработка выхода:
        socket.on( "logout", function( data ) {
            window.location.hash = '/';
        }.bind( this ) );
        // запустить получение списка заявок:
        this.onGetOrders();
    }

    componentWillUnmount() {
        var socket = this.props.route.socket;
        socket.removeAllListeners( "activateOrder" );
        socket.removeAllListeners( "disableOrder" );
        socket.removeAllListeners( "getOrders" );
        socket.removeAllListeners( "logout" );
    }

    render() {
        return <div className="page">
            <div>
                <Loader isVisible={this.state.isSubmit} />

                <div className="orders">
                    <Error message={this.state.error} />

                    {
                        this.state.orders.map( function ( order, key ) {
                            return <OrderLine
                                index={key}
                                key={key}
                                order={order}
                                activate={this.onActivateOrder}
                                disable={this.onDisableOrder}
                            />
                        }.bind( this ) )
                    }
                </div>

                <div className="control-panel">
                    <input type="button" value={this.props.exitText} onClick={this.onLogout} />
                    <input type="button" value={this.props.updateText} onClick={this.onGetOrders} />
                    <input type="button" value={this.props.addText} onClick={this.onAddOrder} />
                    <input type="button" value={this.props.smsText} onClick={this.onGoToSmsList} />
                    <input type="button" value={this.props.usersText} onClick={this.onGoToUsersList} />
                </div>
            </div>
        </div>;
    }
};

Orders.defaultProps = {
    titleText: "Список заявок",
    updateText: "Обновить",
    addText: "Добавить заявку",
    smsText: "SMS",
    usersText: "Получатели",
    exitText: "Выйти",
    socket: null
};