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
            isValid: false,
            isCreateUser: false,
            isEditUser: false
        };

        this.onCreateUser = this.onCreateUser.bind( this );
        this.onEditUser = this.onEditUser.bind( this );
        this.onCloseUserWindow = this.onCloseUserWindow.bind( this );

        this.onCreateUserSubmit = this.onCreateUserSubmit.bind( this );
        this.onEditUserSubmit = this.onEditUserSubmit.bind( this );

        this.onChange = this.onChange.bind( this );
        this.onChangeContactValue = this.onChangeContactValue.bind( this );
        this.onChangeContactStatus = this.onChangeContactStatus.bind( this );
        this.onDeleteContact = this.onDeleteContact.bind( this );
        this.onAppendContact = this.onAppendContact.bind( this );
        this.onBack = this.onBack.bind( this );
    }

    onAppendContact(evt) {
        var contactType = evt.target.getAttribute( "data" );
        this.setState( function ( prevState ) {
            prevState.user.contacts[ contactType ].push( [ "", true ] );
            return prevState;
        } );
    }

    onDeleteContact(evt) {
        var address = evt.target.parentNode.parentNode.getAttribute("data").split( ":" );
        this.setState( function ( prevState ) {
            prevState.user.contacts[ address[0] ].splice( address[1], 1 );
            return prevState;
        } );
    }

    onChangeContactValue(evt) {
        var value = evt.target.value;
        var address = evt.target.parentNode.parentNode.getAttribute("data").split( ":" );
        this.setState( function ( prevState ) {
            prevState.user.contacts[ address[0] ][ + address[1] ][0] = value;
            return prevState;
        } );
    }

    onChangeContactStatus(evt) {
        var address = evt.target.parentNode.parentNode.getAttribute("data").split( ":" );
        this.setState( function ( prevState ) {
            prevState.user.contacts[ address[0] ][ + address[1] ][1] = ! prevState.user.contacts[ address[0] ][ + address[1] ][1];
            return prevState;
        } );
    }

    onCloseUserWindow() {
        this.setState( {
            user: this.getEmptyUser(),
            isEditUser: false,
            isCreateUser: false
        } );
    }

    onCreateUser() {
        this.setState( {
            user: this.getEmptyUser(),
            isEditUser: false,
            isCreateUser: true
        } );
    }

    onEditUser( evt ) {
        var user = this.state.users[ evt.target.getAttribute( "tabIndex" ) ];
        this.setState( {
            user: JSON.parse( JSON.stringify( user ) ),
            isEditUser: true,
            isCreateUser: false
        } );
    }

    onCreateUserSubmit() {
        let user = this.state.user;
        if ( this.isFormValid( user ) ) {
            let socket = this.props.route.socket;
            this.setState( { isSubmit: true } );
            socket.emit( "appendUser", user );
        };
    }

    onEditUserSubmit() {
        let user = this.state.user;
        if ( this.isFormValid( user ) ) {
            let socket = this.props.route.socket;
            this.setState( { isSubmit: true } );
            socket.emit( "editUser", user );
        };
    }

    getEmptyUser() {
        return {
            "id": "",
            "login": "",
            "fio": "",
            "address": "",
            "password": "",
            "contacts": {
                "phone": [],
                "email": []
            }
        };
    }

    isFormValid( user ) {
        return true;
    }

    onChange( e ) {
        let field = e.target.name;
        let text = e.target.value;
        this.setState( function ( prevState ) {
            prevState.user[ field ] = text;
            prevState.isValid = this.isFormValid( prevState.user );
            return prevState;
        }.bind( this ) );
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
                    isValid: false,
                    isCreateUser: false,
                    isEditUser: false
                } );
            };
        }.bind( this ) );
        // обработка редактирования пользователя:
        socket.on( "editUser", function( data ) {
            if ( data.error ) {
                this.setState( { error: data.error } );
            } else {
                this.setState( {
                    error: "",
                    user: this.getEmptyUser(),
                    users: data.users,
                    isSubmit: false,
                    isValid: false,
                    isCreateUser: false,
                    isEditUser: false
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
        socket.removeAllListeners( "editUser" );
        socket.removeAllListeners( "getUsers" );
    }

    render() {
        var isValid = this.state.isValid;
        var wrapperClass = "page";
        if ( ! isValid ) {
            wrapperClass += " is-not-valid";
        };
        var isOpenUserWindow = this.state.isCreateUser || this.state.isEditUser;
        return <div className={wrapperClass}>
            <div>
                <Loader isVisible={this.state.isSubmit} />

                <div className="add-user">
                    <Error message={this.state.error} />

                    <label>Список пользователей:</label>
                    <div style={{display:isOpenUserWindow ? "none" : "block"}}>
                    {
                        this.state.users.map( function ( user, key ) {
                            return <div key={key} className="user">
                                {key + 1})
                                <label>ФИО:</label> {user.fio}<br />
                                <label>Контакты:</label>
                                <div>{Object.keys(user.contacts).map( function( contactType ) {
                                    var contacts = user.contacts[ contactType ];
                                    if ( contacts.length ) {
                                        return (
                                            <div key={contactType}>
                                                <label>{contactType}:</label>
                                                {contacts.map( function ( contact, index ) {
                                                    return <div key={index}>{contact[0]} {(!contact[1]) ? "(выгл)" : ""}</div>
                                                } ) }
                                            </div>
                                        );
                                    };
                                } ) }</div>
                                <input tabIndex={key} type="button" value="Редактировать" onClick={this.onEditUser} />
                            </div>
                        }.bind( this ) )
                    }
                    </div>

                    <div className="add-edit-user-window" style={{display:isOpenUserWindow ? "table" : "none"}}>
                        <div>
                            <label style={{display:this.state.isCreateUser ? "inline" : "none"}}>Добавить пользователя:</label>
                            <label style={{display:this.state.isEditUser ? "inline" : "none"}}>Редактировать пользователя:</label>

                            <div style={{display:this.state.isEditUser ? "block" : "none"}}>
                                <label>Логин:</label><br />
                                <input name="login" value={this.state.user.login} onChange={this.onChange} />
                            </div>

                            <div>
                                <label>ФИО:</label><br />
                                <input name="fio" value={this.state.user.fio} onChange={this.onChange} />
                            </div>

                            <div>
                                <label>Адрес:</label><br />
                                <input name="address" value={this.state.user.address} onChange={this.onChange} />
                            </div>

                            <div style={{display:this.state.isEditUser ? "block" : "none"}}>
                                <label>Пароль:</label><br />
                                <input name="password" value={this.state.user.password} onChange={this.onChange} />
                            </div>

                            <div>
                                <label>Контакты:</label>
                                { Object.keys( this.state.user.contacts ).map( function( contactType ) {
                                    var contacts = this.state.user.contacts[ contactType ];
                                    return (
                                        <div key={contactType}>
                                            <label>{contactType}:</label>
                                            <table>
                                                <tbody>
                                                    {contacts.map( function ( contact, index ) {
                                                        return (
                                                            <tr key={index} data={contactType + ":" + index}>
                                                                <td>{index + 1}</td>
                                                                <td><input type="text" value={contact[0]} onChange={this.onChangeContactValue} /></td>
                                                                <td><input type="checkbox" checked={contact[1]}  onChange={this.onChangeContactStatus} /></td>
                                                                <td><input type="button" value="Удалить" onClick={this.onDeleteContact} /></td>
                                                            </tr>
                                                        );
                                                    }.bind( this ) ) }
                                                </tbody>
                                            </table>
                                            <input data={contactType} type="button" value={"Добавить " + contactType} onClick={this.onAppendContact} />
                                        </div>
                                    );
                                }.bind( this ) ) }
                            </div>

                            <input
                                type="button"
                                value="Добавить"
                                onClick={this.onCreateUserSubmit}
                                style={{display:this.state.isCreateUser ? "inline" : "none"}}
                            />
                            <input
                                type="button"
                                value="Редактировать"
                                onClick={this.onEditUserSubmit}
                                style={{display:this.state.isEditUser ? "inline" : "none"}}
                            />
                            &nbsp;
                            <input
                                type="button"
                                value="Отмена"
                                onClick={this.onCloseUserWindow}
                            />
                        </div>
                    </div>
                </div>

                <div className="control-panel">
                    <input type="button" value="Добавить" onClick={this.onCreateUser} />
                    <input type="button" value="Назад" onClick={this.onBack} />
                </div>
            </div>
        </div>;
    }
};

Users.defaultProps = {
    titleText: "Список пользователей",
    socket: null
};