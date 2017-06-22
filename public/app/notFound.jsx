import React from 'react';

export default class NotFound extends React.Component {
    constructor( props ){
        super( props );
    }

    componentDidMount() {
        document.title = this.props.titleText;
    }

    render() {
        return <div className="page not-found">
            <div>
                <b>{this.props.message}</b>
            </div>
        </div>;
    }
};

NotFound.defaultProps = {
    titleText: "Error 404: Файл не найден.",
    message: "Error 404: Файл не найден."
};