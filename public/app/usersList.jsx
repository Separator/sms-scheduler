import React from 'react';

export default class UsersList extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            allUsers: props.allUsers,
            users: props.users,
            currentUserId: this.getDefaultUserId()
        };

        this.onChangeCurrentUser = this.onChangeCurrentUser.bind( this );
        this.onAppend = this.onAppend.bind( this );
        this.onRemove = this.onRemove.bind( this );
    }

    getDefaultUserId() {
        if ( this.props.allUsers.length ) {
            return this.props.allUsers[0].id;
        } else {
            return "";
        }
    }

    onChangeCurrentUser( e ) {
        this.setState( { currentUserId: e.target.value } );
    }

    onAppend() {
        var userToAdd = this.state.currentUserId;
        if ( userToAdd && ! this.isUserAlreadyAdded( userToAdd ) ) {
            if ( this.props.updateUsersList ) {
                this.props.updateUsersList( this.state.users.concat( [ userToAdd ] ) );
            };
        };
    }

    onRemove( userId ) {
        var userIndex = this.state.users.indexOf( userId );
        if ( this.state.users.length > 1 && userIndex > -1 ) {
            var buffer = JSON.parse( JSON.stringify( this.state.users ) );
            buffer.splice( userIndex, 1 );
            if ( this.props.updateUsersList ) {
                this.props.updateUsersList( buffer );
            };
        };
    }

    isUserAlreadyAdded( userId ) {
        return this.state.users.indexOf( userId ) > -1;
    }

    componentWillReceiveProps( nextProps ) {
        var userId = this.state.currentUserId;
        if ( ! userId && nextProps.allUsers.length ) {
            userId = nextProps.allUsers[0].id;
        };
        this.setState( {
            allUsers: nextProps.allUsers,
            users: nextProps.users,
            currentUserId: userId
        } );
    }

    render() {
        var that = this;
        var allUsers = this.state.allUsers;
        var users = this.state.users;
        return <div className="users-list">
            <div>
                <select value={this.state.currentUserId} onChange={this.onChangeCurrentUser}>{
                    allUsers.map( function ( user ) {
                        return <option key={user.id} value={user.id}>{user.fio} ({user.login})</option>;
                    })
                }</select>
                &nbsp;
                <input type="button" value="Добавить пользователя" onClick={this.onAppend} />
            </div>

            <div>{
                users.map( function ( userId ) {
                    for ( var i = 0; i < allUsers.length; i++ ) {
                        var user = allUsers[ i ];
                        if ( user.id == userId ) {
                            return (<div className="user-add" key={userId}>
                                <label>{user.fio} ({user.login})</label>
                                <input type="button" value="Удалить" onClick={function() {
                                    that.onRemove( user.id );
                                }} />
                            </div>);
                        };
                    };
                })
            }</div>
        </div>;
    }
};

UsersList.defaultProps = {
    allUsers: {},
    users: [],
    updateUsersList: null
};