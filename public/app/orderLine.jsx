import React from 'react';

export default class OrderLine extends React.Component {
    constructor( props ) {
        super( props );
        this.state = { status: props.order.status };
    }

    getStatusText() {

    }

    getCreateTimeText() {

    }

    render() {
        var order = this.props.order;
        return <div class="order">
            <div>{this.props.index + 1}</div>
            <div>{order.name}</div>
            <div>Дата создания: {this.getCreateTimeText()}</div>
            <div>Дата начала: {order.beginDate}</div>
            <div>Текущий статус: {this.getStatusText()}</div>
            <div>Список пользователей:</div>
            
        </div>
    }
};

OrderLine.defaultProps = {
    index: 0,
    order: null,
    activate: null,
    disable: null
};