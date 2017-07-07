import React from 'react';
import Loader from './loader';
import Error from './error';

export default class Login extends React.Component {
    constructor( props ){
        super( props );
        this.state = {
            error: "",
            login: props.login || "",
            password: props.password || "",
            isValid: false,
            isSubmit: false
        };
        this.onChange = this.onChange.bind( this );
        this.onSubmit = this.onSubmit.bind( this );
    }

    onChange( e ) {
        let field = e.target.name;
        let text = e.target.value.trim();
        if ( field == "login" ) {
            text = text.trim();
        };
        this.setState( function ( prevState ) {
            prevState[ field ] = text;
            prevState.isValid = prevState.login && prevState.password;
            return prevState;
        } );
    }

    onSubmit() {
        var socket = this.props.route.socket;
        this.setState( { isSubmit: true } );
        socket.emit( "login", this.state );
    }

    componentDidMount() {
        document.title = this.props.titleText;
        var socket = this.props.route.socket;
        socket.on( "login", function( data ) {
            setTimeout( function () {
                if ( data.result ) {
                    window.location.hash = "orders";
                } else {
                    this.setState( { error: data.message, isSubmit: false } );
                };
            }.bind( this ), 2000 );
        }.bind( this ) );
    }

    componentWillUnmount() {
        var socket = this.props.route.socket;
        socket.removeAllListeners( "login" );
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

                <div className="login">
                    <Error message={this.state.error} />

                    <label>Логин:</label>
                    <input type="text" name="login" value={this.state.login} onChange={this.onChange} />
                    <label>Пароль:</label>
                    <input type="password" name="password" value={this.state.password} onChange={this.onChange} />
                    <input type="button" value={this.props.submitText} onClick={this.onSubmit} disabled={!isValid} />
                </div>
            </div>
        </div>;
    }
};

Login.defaultProps = {
    titleText: "Авторизация",
    submitText: "Войти",
    socket: null
};