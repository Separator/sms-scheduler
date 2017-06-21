let React = require( "react" );

class Login extends React.Component{
    constructor( props ){
        super( props );
        this.state = {
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
        socket.emit( "auth", this.state );
    }

    componentDidMount() {
        document.title = this.props.titleText;
        var socket = this.props.route.socket;
        socket.on( "auth", function( result ) {
            console.log( result );
        }.bind( this ) );
    }

    componentWillUnmount() {
        var socket = this.props.route.socket;
        socket.removeAllListeners( "auth" );
    }

    render() {
        var isValid = this.state.isValid;
        var isSubmit = this.state.isSubmit;
        var wrapperClass = "page";
        if ( ! isValid ) {
            wrapperClass += " is-not-valid";
        };
        if ( isSubmit ) {
            wrapperClass += " is-submit";
        };
        return <div className={wrapperClass}>
            <div>
                <div className="login">
                    <label>Логин:</label>
                    <input type="text" name="login" value={this.state.login} onChange={this.onChange} />
                    <label>Пароль:</label>
                    <input type="password" name="password" value={this.state.password} onChange={this.onChange} />
                    <input type="button" value={this.props.submitText} onClick={this.onSubmit} disabled={!isValid} />
                    <div className="submit">
                        <div id="fountainG">
                            <div id="fountainG_1" className="fountainG"></div>
                            <div id="fountainG_2" className="fountainG"></div>
                            <div id="fountainG_3" className="fountainG"></div>
                            <div id="fountainG_4" className="fountainG"></div>
                            <div id="fountainG_5" className="fountainG"></div>
                            <div id="fountainG_6" className="fountainG"></div>
                            <div id="fountainG_7" className="fountainG"></div>
                            <div id="fountainG_8" className="fountainG"></div>
                        </div>
                    </div>
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

module.exports = Login;