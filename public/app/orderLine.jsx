import React from 'react';

export default class OrderLine extends React.Component {
    constructor( props ) {
        super( props );
    }

    getStatusText() {
        var props = this.props;
        switch ( props.order.status ) {
            case 1: {
                return props.newText;
            }
            case 2: {
                return props.activeText;
            }
            case 3: {
                return props.cancelledText;
            }
        };
    }

    getCreateTimeText() {
        var createTime = new Date( this.props.order.createTime );
        var day = createTime.getDate();
        day = day < 10 ? "0" + day : day;
        var month = createTime.getMonth() + 1;
        month = month < 10 ? "0" + month : month;
        var year = createTime.getFullYear();
        return day + "." + month + "." + year;
    }

    render() {
        var order = this.props.order;
        var isCanActivate = order.status == 1 || order.status == 3;
        var isCanCancel = order.status == 2;
        return <div className="order">
            <div className="order-header">
                <label>{order.name}</label>
                <input
                    style={ { display: ( isCanActivate ? "block" : "none" ) } }
                    type="button"
                    onClick={this.props.activate}
                    value={this.props.activateText}
                    tabIndex={this.props.index}
                />
                <input
                    style={ { display: ( isCanCancel ? "block" : "none" ) } }
                    type="button"
                    onClick={this.props.disable}
                    value={this.props.cancelText}
                    tabIndex={this.props.index}
                />
            </div>
            <div className="order-data">
                <div><label>Дата создания:</label> {this.getCreateTimeText()}</div>
                <div><label>Дата начала:</label> {order.beginDate}</div>
                <div><label>Текущий статус:</label> {this.getStatusText()}</div>
                <div className="users-list">
                    {order.users.map(function ( user, index ) {
                        return <div className="user" key={index.toString()}>
                            <div><label>ФИО:</label> {user.fio}</div>
                            <div><label>Телефон:</label> {user.phone}</div>
                            <div><label>E-mail:</label> {user.email}</div>
                        </div>
                    } ) }
                </div>
                <div className="sms-list">
                    {order.smsList.map( function ( smsDay, index ) {
                        return <div className="sms-day" key={index.toString()}>
                            
                        </div>
                    } ) }
                </div>
            </div>
        </div>
    }
};

OrderLine.defaultProps = {
    index: 0,
    order: null,
    activate: null,
    disable: null,
    newText: "Новая",
    activeText: "Активирована",
    cancelledText: "Отменена",
    activateText: "Активировать",
    cancelText: "Отменить"
};