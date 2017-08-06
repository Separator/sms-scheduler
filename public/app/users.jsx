import React from 'react';
import Loader from './loader';
import Error from './error';

export default class Users extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            error: "",
            user: this.getEmptyUser(),
            users: [],
            isSubmit: true,
            isValid: false
        };

        this.onChange = this.onChange.bind( this );
        this.onSubmit = this.onSubmit.bind( this );
        this.onBack = this.onBack.bind( this );
    }

    getEmptyUser() {
        return {
            "login": "",
            "fio": "",
            "phone": "",
            "email": "",
            "address": "",
            "password": ""
        };
    }

    isFormValid( user ) {
        if (user &&
            user.login.trim() &&
            user.fio.trim() && (
                user.phone.trim() ||
                user.email.trim()
            ) ) {
            return true;
        } else {
            return false;
        };
    }

    onChange( e ) {
        let field = e.target.name;
        let text = e.target.value;
        this.setState( function ( prevState ) {
            prevState.user[ field ] = text;
            prevState.isValid = this.isFormValid( prevState.user );
            console.log( prevState );
            return prevState;
        }.bind( this ) );
    }

    onSubmit() {
        let user = this.state.user;
        if ( this.isFormValid( user ) ) {
            let socket = this.props.route.socket;
            this.setState( { isSubmit: true } );
            socket.emit( "appendUser", user );
        };
    }

    onBack () {
        window.location.hash = 'orders';
    }

    onGetUsers() {
        var socket = this.props.route.socket;
        socket.emit( "getUsers", null );
        this.setState( { isSubmit: true } );
    }

    componentDidMount() {
        document.title = this.props.titleText;
        var socket = this.props.route.socket;
        // обработка сохранения пользователя:
        socket.on( "appendUser", function( data ) {
            if ( data.error ) {
                this.setState( { error: data.error } );
            } else {
                this.setState( {
                    error: "",
                    user: this.getEmptyUser(),
                    users: data.users,
                    isSubmit: false,
                    isValid: false
                } );
            };
        }.bind( this ) );
        // обработка получения списка пользователей:
        socket.on( "getUsers", function( users ) {
            this.setState( { users: users, isSubmit: false  } );
        }.bind( this ) );
        // запустить получение списка заявок:
        this.onGetUsers();
    }

    componentWillUnmount() {
        var socket = this.props.route.socket;
        socket.removeAllListeners( "appendUser" );
        socket.removeAllListeners( "getUsers" );
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

                <div className="add-user">
                    <Error message={this.state.error} />

                    <label>Добавить пользователя:</label>
                    <label>Логин:</label>
                    <input name="login" value={this.state.user.login} onChange={this.onChange} />

                    <label>ФИО:</label>
                    <input name="fio" value={this.state.user.fio} onChange={this.onChange} />

                    <label>Сотовый:</label>
                    <input name="phone" value={this.state.user.phone} onChange={this.onChange} />

                    <label>Email:</label>
                    <input name="email" value={this.state.user.email} onChange={this.onChange} />

                    <label>Адрес:</label>
                    <input name="address" value={this.state.user.address} onChange={this.onChange} />

                    <label>Пароль:</label>
                    <input name="password" value={this.state.user.password} onChange={this.onChange} />

                    <input type="button" value="Добавить" onClick={this.onSubmit} />

                    <label>Список пользователей:</label>
                    <div>
                    {
                        this.state.users.map( function ( user, key ) {
                            return <div key={key} className="user">
                                {key + 1})
                                <label>Логин:</label> {user.login}<br />
                                <label>ФИО:</label> {user.fio}<br />
                                <label>Сотовый:</label> {user.phone}<br />
                                <label>Email:</label> {user.email}<br />
                                <label>Адрес:</label> {user.address}
                            </div>
                        }.bind( this ) )
                    }
                    </div>
                </div>

                <div className="control-panel">
                    <input type="button" value="Выйти" onClick={this.onBack} />
                </div>
            </div>
        </div>;
    }
};

Users.defaultProps = {
    titleText: "Список пользователей",
    socket: null
};