import React from 'react';

export default class Loader extends React.Component {
    render() {
        var isVisible = this.props.isVisible;
        return <div style={{display: (isVisible) ? "block" : "none"}} id="loader">
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

Loader.defaultProps = { isVisible: false };