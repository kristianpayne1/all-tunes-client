import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import PartyForm from './PartyForm.js';
import PartyView from './PartyView.js';
//import { Table, Button } from 'react-bootstrap';

class Home extends Component {
    constructor() {
        super();
        const params = this.getDollarParams();
        const userId = params.id;
        const access_token = params.access_token;
        const refresh_token = params.refresh_token;
        this.state = {
            loggedIn: access_token ? true : false,
            socketURL: "ws://localhost:8888/",
            socket: null,
            userId: userId,
            access_token: access_token,
            refresh_token: refresh_token,
            isHost: false,
            partyCode: '',
            isConnected: false,
            recommended: [],
        }
    }

    componentDidMount() {
        this.connect();
    }

    reconnect = () => {
        console.log("Attempting to reconnect to socket in 5s...");
        setTimeout(() => {
            this.connect();
        }, 5000);
    }

    connect = () => {
        if (this.state.loggedIn) {
            let socket = new WebSocket(this.state.socketURL);
            socket.onerror = () => {
                self.setState({ isConnected: false, partyCode: '', isHost: false, recommended: [] });
                socket.close();
                this.reconnect();
            }
            socket.onopen = () => {
                console.log("Connected to socket");
            }
            this.setState({ socket: socket });

            let self = this;

            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log(message);
                switch (message.messageType) {
                    case 'SEND_ACCESS_TOKEN': {
                        self.sendAccessToken();
                    }
                        break;
                    case 'FAILED_ACCESS_TOKEN': {
                        self.setState({ isConnected: false, partyCode: '', isHost: false });
                        console.log("Sending access token failed \n" + message.error);
                        let states = self.state;
                        if (states.access_token && states.refresh_token && states.userId) {
                            self.sendAccessToken();
                        }else{
                            window.location.replace("http://localhost:8888/login");
                        }
                    }
                        break;
                    case 'CREATE_PARTY_SUCCESS': {
                        let partyCode = message.partyCode;
                        console.log('Hosting party: ' + partyCode);
                        self.setState({ partyCode: partyCode, isHost: true, isConnected: true });
                    }
                        break;
                    case 'JOINED_PARTY': {
                        let partyCode = message.partyCode;
                        console.log('Joined party: ' + partyCode);
                        self.setState({ partyCode: partyCode, isConnected: true });
                    }
                        break;
                    case 'JOIN_PARTY_ERROR': {
                        self.setState({ isConnected: false, partyCode: '', isHost: false });
                        console.log("Failed to join party \n" + message.error)
                    }
                        break;
                    case 'UPDATE_RECOMMENDED': {
                        console.table(message.data);
                        self.setState({ recommended: message.data });
                    }
                        break;
                    case 'DISCONNECT': {
                        console.log('Disconnected');
                        self.setState({ isConnected: false, partyCode: '', isHost: false, recommended: [] });
                    }
                        break;
                    default: {
                        console.log("Recieved unknown message");
                    }
                }

                socket.onclose = () => {
                    self.setState({ isConnected: false, partyCode: '', isHost: false, recommended: [] });
                    console.log('Socket closed')
                    // automatically try to reconnect on connection loss
                    this.reconnect();
                }
            }
        }
    }

    sendAccessToken = () => {
        var response = {
            messageType: 'ACCESS_TOKEN',
            id: this.state.userId,
            access_token: this.state.access_token,
            refresh_token: this.state.refresh_token,
        };
        try {
            this.state.socket.send(JSON.stringify(response));
        } catch (error) {
            console.log(error);
        }
    }

    getDollarParams = () => {
        var dollarParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.href;
        var w = q.split('$')[1];
        e = r.exec(w);
        while (e) {
            dollarParams[e[1]] = decodeURIComponent(e[2]);
            e = r.exec(w);
        }
        return dollarParams;
    }

    render() {
        let redirect = !this.state.loggedIn ? <Redirect to="/" /> : null;
        let partyView = this.state.isConnected ?
            <PartyView
                isHost={this.state.isHost}
                partyCode={this.state.partyCode}
                recommended={this.state.recommended}
                socket={this.state.socket}
            /> :
            <PartyForm socket={this.state.socket} />
        return (
            <div>
                {redirect}
                {partyView}
            </div>
        )
    }
}

export default Home;