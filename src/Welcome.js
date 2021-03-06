import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';

class Welcome extends Component {
    render() {
        return (
            <div>
                <h1>Welcome to All Tunes!</h1>
                <p>Log in to Spotify to get started.</p>
                <Button href='https://all-tunes-server.herokuapp.com/login' variant="outline-success">Get started</Button>{' '}
            </div>
        )
    }
}

export default Welcome;