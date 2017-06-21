let React = require( "react" );

class Loader extends React.Component{
    constructor( props ) {
        super( props );
        this.state = {
            isVisible: false
        };
    }

    render() {
        var isVisible = this.state.isVisible;
        return <div style={display} id="loader">
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
        </div>;
    }
};

Login.defaultProps = {
    titleText: "Авторизация",
    submitText: "Войти",
    socket: null
};

module.exports = Login;