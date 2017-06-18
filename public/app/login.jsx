var React = require( "react" );

class Login extends React.Component{
    constructor( props ){
        super( props );
        this.state = {
            login: props.login || "",
            password: props.password || "",
            isValid: false
        };
        this.onChange = this.onChange.bind( this );
        this.onSubmit = this.onSubmit.bind( this );
    }

    onChange( e ) {
        var field = e.target.name;
        var text = e.target.value.trim();
        if ( field == "login" ) {
            text = text.trim();
        };
        this.setState( function ( prevState, props ) {
            prevState[ field ] = text;
            prevState.isValid = prevState.login && prevState.password;
            return prevState;
        } );
    }

    onSubmit() {
        this.props.route.auth( this.state );
    }

    componentDidMount() {
        document.title = this.props.titleText;
    }

    render() {
        var isSubmitDisabled = ( this.state.login && this.state.password ) ? false : true;
        return <div className="page">
            <div>
                <div className="login">
                    <label>Логин:</label>
                    <input type="text" name="login" value={this.state.login} onChange={this.onChange} />
                    <label>Пароль:</label>
                    <input type="password" name="password" value={this.state.password} onChange={this.onChange} />
                    <input type="button" value={this.props.submitText} onClick={this.onSubmit} disabled={isSubmitDisabled} />
                </div>
            </div>
        </div>;
    }
};

Login.defaultProps = {
    titleText: "Авторизация",
    submitText: "Войти",
    submit: function ( data ) {
        console.log( data );
    } };

module.exports = Login;