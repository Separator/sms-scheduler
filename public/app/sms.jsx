import React from 'react';
import Loader from './loader';
import Error from './error';

export default class Sms extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            error: "",
            smsText: "",
            sms: [],
            isSubmit: true,
            isValid: false
        };

        this.onChange = this.onChange.bind( this );
        this.onSubmit = this.onSubmit.bind( this );
        this.onBack = this.onBack.bind( this );
    }

    onChange( e ) {
        let field = e.target.name;
        let text = e.target.value;
        this.setState( function ( prevState ) {
            prevState[ field ] = text;
            prevState.isValid = prevState.smsText.trim().length > 0;
            return prevState;
        } );
    }

    onSubmit() {
        var smsText = this.state.smsText.trim();
        if ( smsText ) {
            let socket = this.props.route.socket;
            this.setState( { isSubmit: true } );
            socket.emit( "appendSms", smsText );
        };
    }

    onBack () {
        window.location.hash = 'orders';
    }

    onGetSms() {
        var socket = this.props.route.socket;
        socket.emit( "getSms", null );
        this.setState( { isSubmit: true } );
    }

    componentDidMount() {
        document.title = this.props.titleText;
        var socket = this.props.route.socket;
        // обработка сохранения sms:
        socket.on( "appendSms", function( sms ) {
            this.setState( {
                smsText: "",
                sms: sms,
                isSubmit: false,
                isValid: false
            } );
        }.bind( this ) );
        // обработка получения sms:
        socket.on( "getSms", function( sms ) {
            this.setState( { sms: sms, isSubmit: false  } );
        }.bind( this ) );
        // запустить получение списка заявок:
        this.onGetSms();
    }

    componentWillUnmount() {
        var socket = this.props.route.socket;
        socket.removeAllListeners( "appendSms" );
        socket.removeAllListeners( "getSms" );
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

                <div className="add-sms">
                    <Error message={this.state.error} />

                    <label>Добавить sms:</label>
                    <textarea value={this.state.smsText} name="smsText" onChange={this.onChange} />
                    <input type="button" value="Добавить" onClick={this.onSubmit} />

                    <label>Список sms:</label>
                    <div>
                    {
                        this.state.sms.map( function ( sms, key ) {
                            return <div key={key} className="sms">{key + 1}) {sms.text}</div>
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

Sms.defaultProps = {
    titleText: "Список sms",
    socket: null
};