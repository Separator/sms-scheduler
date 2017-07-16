import React from 'react';
import Loader from './loader';
import Error from './error';

import UsersList from './usersList';
import SmsList from './smsList';

export default class AddOrder extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            error: "",
            isValid: false,
            isSubmit: false,

            allUsers: [],
            allSms: [],

            name: "Новая заявка",
            users: [],
            beginDate: this.getCurrentDateString(),
            note: "",
            smsList: []
        };

        this.onChange = this.onChange.bind( this );
        this.onSubmit = this.onSubmit.bind( this );

        this.onBack = this.onBack.bind( this );

        this.onUpdateUsersList = this.onUpdateUsersList.bind( this );
        this.onUpdateSmsList = this.onUpdateSmsList.bind( this );
    }

    onChange( e ) {
        let that = this;
        let field = e.target.name;
        let text = e.target.value;
        this.setState( function ( prevState ) {
            prevState[ field ] = text;
            prevState.isValid = that.isFormValid( prevState );
            return prevState;
        } );
    }

    isFormValid( state ) {
        if (state.name.trim() &&
            state.users.length &&
            this.isBeginDateValid( state.beginDate ) &&
            state.smsList.length ) {
            return true;
        } else {
            return false;
        };
    }

    isBeginDateValid( beginDate ) {
        return /^\d{2}\.\d{2}.\d{4}$/.test( beginDate );
    }

    onSubmit() {
        if ( this.isFormValid( this.state ) ) {
            let socket = this.props.route.socket;
            this.setState( { isSubmit: true } );
            socket.emit( "saveOrder", {
                name: this.state.name,
                users: this.state.users,
                beginDate: this.state.beginDate,
                note: this.state.note,
                smsList: this.state.smsList
            } );
        };
    }

    onBack() {
        window.location.hash = "orders";
    }

    getCurrentDateString() {
        let date = new Date();
        return [
            date.getDate() < 10 ? "0" + date.getDate() : date.getDate(),
            date.getMonth() < 9 ? "0" + ( date.getMonth() + 1 ) : date.getMonth() + 1,
            date.getFullYear()
        ].join( "." )
    }

    onUpdateUsersList( users ) {
        var that = this;
        this.setState( function ( prevState ) {
            prevState.users = users;
            return {
                users: users,
                isValid: that.isFormValid( prevState )
            };
        } );
    }

    onUpdateSmsList( smsList ) {
        var that = this;
        this.setState( function ( prevState ) {
            prevState.smsList = smsList;
            return {
                smsList: smsList,
                isValid: that.isFormValid( prevState )
            };
        } );
    }

    componentDidMount() {
        document.title = this.props.titleText;
        var socket = this.props.route.socket;
        // Обновление списка смс:
        socket.on( "getSms", function( allSms ) {
            this.setState( function () {
                return { allSms: allSms, isSubmit: false };
            } );
        }.bind( this ) );
        // Обновление списка пользователей:
        socket.on( "getUsers", function( allUsers ) {
            this.setState( function () {
                return { allUsers: allUsers, isSubmit: false };
            } );
        }.bind( this ) );
        // обработка активации заявки:
        socket.on( "saveOrder", function( error ) {
            if ( error ) {
                this.setState( { error: error, isSubmit: false } );
            } else {
                window.location.hash = "orders";
            };
        }.bind( this ) );
        // запустить получение списка sms и пользователей:
        this.getSms();
        this.getUsers();
    }

    getSms() {
        var socket = this.props.route.socket;
        socket.emit( "getSms", null );
        this.setState( { isSubmit: true } );
    }

    getUsers() {
        var socket = this.props.route.socket;
        socket.emit( "getUsers", null );
        this.setState( { isSubmit: true } );
    }

    componentWillUnmount() {
        let socket = this.props.route.socket;
        socket.removeAllListeners( "getSms" );
        socket.removeAllListeners( "getUsers" );
        socket.removeAllListeners( "saveOrder" );
    }

    render() {
        var isValid = this.state.isValid;
        var wrapperClass = "page";
        if ( ! isValid ) {
            wrapperClass += " is-not-valid";
        };
        return <div className={wrapperClass}>
            <div>
                <Loader isVisible={this.state.isSubmit} />

                <div className="add-order">
                    <Error message={this.state.error} />
                    <label>Название заявки:</label>
                    <input type="text" name="name" value={this.state.name} onChange={this.onChange} />
                    <label>Дата начала работы:</label>
                    <input type="text" name="beginDate" value={this.state.beginDate} onChange={this.onChange} />
                    <label>Список получателей sms:</label>
                    <UsersList
                        allUsers={this.state.allUsers}
                        users={this.state.users}
                        updateUsersList={this.onUpdateUsersList}
                    />
                    <label>Список sms по дням:</label>
                    <SmsList
                        allSms={this.state.allSms}
                        smsList={this.state.smsList}
                        updateSmsList={this.onUpdateSmsList}
                    />
                    <label>Дополнительная информация:</label>
                    <textarea name="note" value={this.state.note} onChange={this.onChange} />
                </div>

                <div className="control-panel">
                    <input type="button" value={this.props.exitText} onClick={this.onBack} />
                    <input type="button" value={this.props.submitText} onClick={this.onSubmit} disabled={!isValid} name="save" />
                </div>
            </div>
        </div>;
    }
};

AddOrder.defaultProps = {
    titleText: "Добавить заявку",
    addUserText: "Добавить пользоватея",
    submitText: "Сохранить",
    exitText: "Назад",
    socket: null
};