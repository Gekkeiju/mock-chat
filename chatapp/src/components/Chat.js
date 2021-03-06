import React from 'react'
import axios from 'axios'
import { Redirect } from 'react-router-dom'

import config from '../config'

class Chat extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            user: this.props.location.state ? this.props.location.state.user : {},
            session_id: this.props.location.state ? this.props.location.state.session_id : '',
            messages: [],
            newMessage: null,
            errorMessage: '',
            isAuthenticated: this.props.location.state ? this.props.location.state.isAuthenticated : false
        }
    }
    
    sendMessage = () => {
        const {
            newMessage: body,
            user: { username: sender }
        } = this.state

        axios({
            method: 'post',
            url: `${config.DEFAULT_API}/message`,
            data: {
                body,
                sender
            }
        })
        .then((result) => {
            this.setState(prev => {
                const messages = prev.messages
                messages.push(result.data)

                return {
                    newMessage: null,
                    messages
                }
            })
        })
        .catch(er => {
            this.setState({
                errorMessage: er.response.data.message
            })

            console.error(er)
        })
    }

    scrollToBottom = () => {
        const chat = document.getElementById("chats")
        if(chat)
            chat.scrollTop = chat.scrollHeight
    }

    handleSubmit = event => {
        event.preventDefault()
        this.sendMessage()
        event.target.reset()
        this.scrollToBottom()
    }

    handleChange = event => {
        this.setState({
            newMessage: event.target.value
        })
    }

    messageListener = () => {
        axios({
            method: 'get',
            url: `${config.DEFAULT_API}/message`
        })
        .then(({ data: messages }) => {
            this.setState({
                messages
            })

            this.scrollToBottom()
        })
    }

    logout = () => {
        axios({
            method: 'post',
            url: `${config.DEFAULT_API}/logout`,
            data: {
                session_id: this.state.session_id
            }
        })
        .then(result => {
            const { data: logged_out } = result

            if(logged_out)
                this.setState({
                    isAuthenticated: false,
                    session_id: false,
                    user: {},
                    messages: [],
                    newMessage: null,
                    errorMessage: ''
                })
        })
    }

    componentDidMount() {
        this.messageListener()
    }

    componentDidUpdate(){
    }

    render() {
        if(!this.state.isAuthenticated) {
            return <Redirect to="/" state={{isAuthenticated: this.state.isAuthenticated, user: this.state.user, session_id: this.state.session_id}} />
        }

        return (
            <div className="chatWindow">
                <div className="chathead">
                    <div className="title">
                        <h1>Chat app</h1>
                    </div>
                    <form className="logoutform" onSubmit={this.logout}>
                        <input className="logout" type="submit" value="Log out" />
                    </form>
                </div>
                <hr></hr>
                <ul className="chat" id="chats">
                    {this.state.messages.map(msg => (
                        <div key={msg._id}>
                            <li className={this.state.user.username === msg.sender ? "self" : "other"}>
                                <div className="msg">
                                    <div className="message">
                                        {msg.body}        
                                    </div>
                                    <p className={this.state.user.username === msg.sender ? "selfuser" : "otheruser"}>{msg.sender}</p>
                                </div>
                            </li>
                        </div>
                    ))}
                </ul>
                <div className="chatInputWrapper">
                    <form className="chatInputWrapper" onSubmit={this.handleSubmit}>
                        <input
                            className="textarea input"
                            type="text"
                            placeholder="Start a new message"
                            onChange={this.handleChange}
                        />
                        <input
                            className="send"
                            type="submit"
                            value="send"
                            disabled={this.state.newMessage === null}
                        />
                    </form>
                </div>
            </div>
        )
    }
}

export default Chat