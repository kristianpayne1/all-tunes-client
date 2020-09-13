import React, { Component } from 'react';
import { Tabs, Tab, Table, Spinner, Button } from 'react-bootstrap';
import QueueButton from './QueueButton.js';

class PartyView extends Component {
    onDisconnectClicked = () => {
        this.sendDisconnectMessage();
    }

    sendDisconnectMessage = () => {
        var message = {
            messageType: 'DISCONNECT'
        };
        try {
            this.props.socket.send(JSON.stringify(message));
        } catch (error) {
            console.log(error);
        }
    }

    renderTable = (songs) => {
        let num = 0;
        return songs.map(song => {
            num++;
            let artists = ''
            song.artists.forEach(artist => {
                artists += artist.name + ', '
            })
            return (
                <tr key={num}>
                    <td>{song.name}</td>
                    <td>{artists}</td>
                    <td>{song.popularity}</td>
                    <td><QueueButton song={song} socket={this.props.socket}/></td>
                </tr>
            )
        })
    }

    renderTabs = () => {
        let num = 0;
        return this.props.recommended.map((item) => {
            num++;
            return (
                <Tab eventKey={item.genre} title={item.genre} key={num}>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Song</th>
                                <th>Artist(s)</th>
                                <th>Popularity</th>
                                <th>Queue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderTable(item.songs)}
                        </tbody>
                    </Table>
                </Tab>
            )
        })
    }

    renderRecommended = () => {
        if (this.props.recommended.length > 0) {
            return (
                <Tabs eventKey="1" fill >
                    {this.renderTabs()}
                </Tabs>
            )
        } else {
            return (
                <div>
                    <Spinner animation="border" />
                </div>
            )
        }
    }


    render() {
        let isHostView = this.props.isHost ?
            <div>
                <label>You are host</label>
                {this.renderRecommended()}
            </div>
            : null;
        return (
            <div>
                <Button variant='danger' onClick={this.onDisconnectClicked}>Disconnect</Button>
                <br />
                <br />
                <h1>Party: {this.props.partyCode}</h1>
                {isHostView}
            </div>
        )
    }
}

export default PartyView;