import React from 'react';

export default class SmsList extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            allSms: props.allSms,
            smsList: props.smsList,
            currentSmsId: this.getDefaultSmsId(),
            currentDay: 1,
            daysList: this.getDaysList(),
            currentHour: 0,
            hoursList: this.getHoursList(),
            currentMinute: 0,
            minutesList: this.getMinutesList()
        };

        this.onChangeCurrentSms = this.onChangeCurrentSms.bind( this );
        this.onChangeCurrentDay = this.onChangeCurrentDay.bind( this );
        this.onChangeCurrentHour = this.onChangeCurrentHour.bind( this );
        this.onChangeCurrentMinute = this.onChangeCurrentMinute.bind( this );
        this.onAppend = this.onAppend.bind( this );
        this.onRemove = this.onRemove.bind( this );
    }

    getDaysList() {
        var result = [];
        for ( var i = 1; i <= 30; i++ ) {
            result.push( i );
        };
        return result;
    }

    getHoursList() {
        var result = [];
        for ( var i = 0; i < 24; i++ ) {
            result.push( i );
        };
        return result;
    }

    getMinutesList() {
        var result = [];
        for ( var i = 0; i < 60; i++ ) {
            result.push( i  );
        };
        return result;
    }

    getDefaultSmsId() {
        if ( this.props.allSms.length ) {
            return this.props.allSms[0].id;
        } else {
            return "";
        }
    }

    onChangeCurrentSms( e ) {
        this.setState( { currentSmsId: e.target.value } );
    }

    onChangeCurrentDay( e ) {
        this.setState( { currentDay: e.target.value } );
    }

    onChangeCurrentHour( e ) {
        this.setState( { currentHour: e.target.value } );
    }

    onChangeCurrentMinute( e ) {
        this.setState( { currentMinute: e.target.value } );
    }

    onAppend() {
        var currentSmsId = this.state.currentSmsId;
        var currentDay = this.state.currentDay - 1;
        var currentHour = this.state.currentHour;
        var currentMinute = this.state.currentMinute;
        var buffer = JSON.parse( JSON.stringify( this.state.smsList ) );
        if ( ! buffer[ currentDay ] ) {
            buffer[ currentDay ] = [];
        };
        buffer[ currentDay ].push( {
            "id": currentSmsId,
            "hours": currentHour < 10 ? "0" + currentHour : "" + currentHour,
            "minutes": currentMinute < 10 ? "0" + currentMinute : "" + currentMinute
        } );
        for ( var i = 0; i < buffer.length; i++ ) {
            if ( ! buffer[ i ] ) {
                buffer[ i ] = [];
            };
        };
        if ( this.props.updateSmsList ) {
            this.props.updateSmsList( buffer );
        };
    }

    onRemove( dayIndex, smsIndex ) {
        var buffer = JSON.parse( JSON.stringify( this.state.smsList ) );
        if ( buffer[ dayIndex ] && buffer[ dayIndex ][ smsIndex ] ) {
            buffer[ dayIndex ].splice( smsIndex, 1 );
        };
        for ( var i = buffer.length; --i >= 0; ) {
            if ( buffer[ i ].length ) {
                break;
            } else {
                buffer.pop();
            };
        };
        if ( this.props.updateSmsList ) {
            this.props.updateSmsList( buffer );
        };
    }

    isUserAlreadyAdded( userId ) {
        return this.state.users.indexOf( userId ) > -1;
    }

    componentWillReceiveProps( nextProps ) {
        var smdId = this.state.currentSmsId;
        if ( ! smdId && nextProps.allSms.length ) {
            smdId = nextProps.allSms[0].id;
        };
        this.setState( {
            allSms: nextProps.allSms,
            smsList: nextProps.smsList,
            currentSmsId: smdId
        } );
    }

    render() {
        var that = this;
        var allSms = this.state.allSms;
        var smsList = this.state.smsList;
        var daysList = this.state.daysList;
        var hoursList = this.state.hoursList;
        var minutesList = this.state.minutesList;
        return <div className="sms-list">
            <table>
                <thead>
                    <tr>
                        <th>sms:</th>
                        <th>день:</th>
                        <th>час:</th>
                        <th>минута:</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <select value={this.state.currentSmsId} onChange={this.onChangeCurrentSms}>{
                                allSms.map( function ( sms ) {
                                    return <option key={sms.id} value={sms.id}>{sms.text}</option>;
                                })
                            }</select>
                        </td>
                        <td>
                            <select value={this.state.currentDay} onChange={this.onChangeCurrentDay}>{
                                daysList.map( function ( day ) {
                                    return <option key={day} value={day}>{day}</option>;
                                })
                            }</select>
                        </td>
                        <td>
                            <select value={this.state.currentHour} onChange={this.onChangeCurrentHour}>{
                                hoursList.map( function ( hour ) {
                                    return <option key={hour} value={hour}>{hour}</option>;
                                })
                            }</select>
                        </td>
                        <td>
                            <select value={this.state.currentMinute} onChange={this.onChangeCurrentMinute}>{
                                minutesList.map( function ( minute ) {
                                    return <option key={minute} value={minute}>{minute}</option>;
                                })
                            }</select>
                        </td>
                        <td>
                            <input type="button" value="Добавить" onClick={this.onAppend} />
                        </td>
                    </tr>
                </tbody>
            </table>

            <div>{
                smsList.map( function ( smsDay, dayIndex ) {
                    if ( smsDay.length ) {
                        return (<div className="sms-day" key={dayIndex}>
                            <label>День {dayIndex + 1}</label>
                            <div>{
                                smsDay.map( function ( sms, smsIndex ) {
                                    for ( var i = 0; i < allSms.length; i++ ) {
                                        if ( allSms[ i ].id == sms.id ) {
                                            return (<div className="sms" key={smsIndex}>
                                                <label>{allSms[ i ].text} ( {sms.hours}:{sms.minutes} )</label>
                                                <input type="button" value="Удалить" onClick={function() {
                                                that.onRemove( dayIndex, smsIndex );
                                            }} />
                                            </div>);
                                        };
                                    };
                                } )
                            }</div>
                        </div>);
                    };
                })
            }</div>
        </div>;
    }
};

SmsList.defaultProps = {
    allSms: [],
    smsList: [],
    updateSmsList: null
};