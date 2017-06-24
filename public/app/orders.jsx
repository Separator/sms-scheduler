import React from 'react';

export default class Orders extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            orders: [],
            isSubmit: true
        };
        this.onActivateOrder = this.onActivateOrder.bind( this );
        this.onDisableOrder = this.onDisableOrder.bind( this );
    }

    onActivateOrder( e ) {
        this.setState( { isSubmit: true } );
        let index = e.target.getAttribute( "index" );
        let order = this.state.orders[ index ];
        var socket = this.props.route.socket;
        socket.emit( "activateOrder", order.id );
    }

    onDisableOrder( e ) {
        this.setState( { isSubmit: true } );
        let index = e.target.getAttribute( "index" );
        let order = this.state.orders[ index ];
        var socket = this.props.route.socket;
        socket.emit( "disableOrder", order.id );
    }

    getOrders() {
        this.setState( { isSubmit: true } );
        var socket = this.props.route.socket;
        socket.emit( "getOrders", null );
    }

    componentDidMount() {
        document.title = this.props.titleText;
        var socket = this.props.route.socket;
        // обработка активации заявки:
        socket.on( "activateOrder", function( orders ) {
            setTimeout( function () {
                this.setState( { orders: orders } );
            }.bind( this ), 2000 );
        }.bind( this ) );
        // обработка отключения заявки:
        socket.on( "disableOrder", function( orders ) {
            setTimeout( function () {
                this.setState( { orders: orders } );
            }.bind( this ), 2000 );
        }.bind( this ) );
        // обработка получения списка заявок:
        socket.on( "getOrders", function( orders ) {
            setTimeout( function () {
                this.setState( { orders: orders } );
            }.bind( this ), 2000 );
        }.bind( this ) );
    }

    componentWillUnmount() {
        var socket = this.props.route.socket;
        socket.removeAllListeners( "activateOrder" );
        socket.removeAllListeners( "disableOrder" );
    }

    render() {
        return <div className="page">
            <div>
                <div className="orders">
                    <Loader isVisible={this.state.isSubmit} />
                    {
                        this.state.orders.map( function ( order, index ) {
                            return <OrderLine
                                index={index}
                                order={order}
                                activate={this.onActivateOrder}
                                disable={this.onDisableOrder}
                            />
                        }.bind( this ) )
                    }
                    <Button text={this.props.exitText} onClick="" />
                </div>
            </div>
        </div>;
    }
};

Orders.defaultProps = {
    titleText: "Список заявок",
    exitText: "Выйти",
    socket: null
};