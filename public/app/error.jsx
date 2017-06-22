import React from 'react';

export default class Error extends React.Component {
    render() {
        var message = this.props.message;
        return <div style={{display: (message) ? "block" : "none"}} className="error">{message}</div>;
    }
};

Error.defaultProps = { message: "" };