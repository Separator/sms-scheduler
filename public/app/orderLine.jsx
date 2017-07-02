import React from 'react';

export default class OrderLine extends React.Component {
    constructor( props ) {
        super( props );
        this.state = { isOpened: false };
        this.onToggle = this.onToggle.bind( this );
    }

    onToggle() {
        this.setState( function ( oldState ) {
            return {
                isOpened: ! oldState.isOpened
            };
        } );
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

    getClassName() {
        if ( this.state.isOpened ) {
            return "order is-opened";
        } else {
            return "order";
        };
    }

    getDateTextByDayNumber( dayNumber ) {
        var daysOfWeek = [
            "воскресенье",
            "понедельник",
            "вторник",
            "среда",
            "четверг",
            "пятница",
            "суббота"
        ];
        var order = this.props.order;
        var beginDate = order.beginDate;
        beginDate = beginDate.split( "." );
        var date = new Date(
            beginDate[2],
            parseInt( beginDate[1], 10 ) - 1,
            parseInt( beginDate[0], 10 )
        );
        date.setTime( date.getTime() + 1000 * 60 * 60 * 24 * dayNumber );
        return [
            date.getDate() < 10 ? "0" + date.getDate() : date.getDate(),
            date.getMonth() < 9 ? "0" + ( date.getMonth() + 1 ) : date.getMonth() + 1,
            date.getFullYear()
        ].join( "." ) + " (" + daysOfWeek[ date.getDay() ] + ")";
    }

    render() {
        var that = this;
        var order = this.props.order;
        var isCanActivate = order.status == 1 || order.status == 3;
        var isCanCancel = order.status == 2;
        return <div className={this.getClassName()}>
            <div className="order-header" onClick={this.onToggle}>
                <div>{order.name}</div><div>
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
            </div>
            <div className="order-data" >
                <div><label>Дата создания:</label> {this.getCreateTimeText()}</div>
                <div><label>Дата начала:</label> {order.beginDate}</div>
                <div><label>Текущий статус:</label> {this.getStatusText()}</div>
                <div><label>Список пользователей:</label></div>
                <div className="users-list">
                    {order.users.map(function ( user, index ) {
                        return <div className="user" key={index.toString()}>
                            <div><label>ФИО:</label> {user.fio}</div>
                            <div><label>Телефон:</label> {user.phone}</div>
                            <div><label>E-mail:</label> {user.email}</div>
                        </div>
                    } ) }
                </div>
                <div><label>Список sms по дням:</label></div>
                <div className="order-sms-list">
                    {order.smsList.map( function ( smsDay, index ) {
                        return <div className="sms-day" key={index.toString()}>
                            <div><label>Дата:</label> {that.getDateTextByDayNumber( index )}</div>
                            {smsDay.map( function ( sms, index ) {
                                return <div className="sms" key={index.toString()}>
                                    <div>
                                        <label>Время отправки:</label>&nbsp;
                                        {sms.hours} часов, {sms.minutes} минут
                                    </div>
                                    <div>
                                        <label>Текст:</label> {sms.text}
                                    </div>
                                </div>
                            } ) }
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