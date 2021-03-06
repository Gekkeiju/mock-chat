import React from 'react'
import axios from 'axios'
import { Redirect } from 'react-router-dom'
import Spinner from 'react-svg-spinner'

import config from '../config'

class Login extends React.Component {
    constructor(props) {
        super(props)
        
        this.state = {
            username: '',
            password: '',
            user: this.props.location.state ? this.props.location.state.user : null,
            session_id: this.props.location.state ? this.props.location.state.session_id : '',
            isSubmitting: false,
            errorMessage: '',
            isAuthenticated: this.props.location.state ? this.props.location.state.user : false,
            isSigningUp: false
        }
    }

    onSubmit = (e) => {
        if(this.state.isSigningUp) {
            e.preventDefault()
            this.signup()
        }else if(this.state.username !== '') {
            e.preventDefault()
            this.login()
        }
    }

    signup = () => {
        this.toggleIsSubmitting()
        axios({
            method: 'post',
            url: `${config.DEFAULT_API}/create_account`,
            data: {
                username: this.state.username,
                password: this.state.password
            }
        })
        .then(({ data: { user } }) => {
            this.setState({
                isSigningUp: false
            })
            this.login()
        })
        .catch((er) => {
            if(er.response) {
                this.setState({
                    errorMessage: er.response.data.message,
                })
            }
        })
    }

    login = () => {
        this.toggleIsSubmitting()
        axios({
            method: 'post',
            url: `${config.DEFAULT_API}/login`,
            data: {
                username: this.state.username,
                password: this.state.password
            }
        })
        .then(({ data: { user, session_id }}) => {
            this.setState({
                user,
                session_id,
                isAuthenticated: true
            })
        })
        .catch((er) => {
            if(er.response) {
                const newUser = er.response.data.message === "User does not exist."
                const errorMessage = newUser ?  "Press the button again to sign up and log in!" : er.response.data.message
                this.setState({
                    errorMessage,
                    isSigningUp: newUser
                })
            }
            

            this.toggleIsSubmitting()
            console.error(er)
        })
    }

    toggleIsSubmitting = () => {
        this.setState(prev => ({
            isSubmitting: !prev.isSubmitting
        }))

        return this.state.isSubmitting
    }

    handleUsername = (e) => {
        this.setState({
            username: e.target.value
        })
    }

    handlePassword = (e) => {
        this.setState({
            password: e.target.value
        })
    }

    componentDidUpdate(){
    }
  
    render() {
        if(this.state.isAuthenticated){
            return (
                <Redirect
                    to = {{
                        pathname: "/chat",
                        state: {user: this.state.user, session_id: this.state.session_id, isAuthenticated: this.state.isAuthenticated }
                    }}
                />
            )
        }

        return ( 
            <div className="App">
                <h1>Chat app</h1>
                <hr></hr>
                <form className="form" onSubmit={this.onSubmit}>
                    <input className="login" onChange={this.handleUsername} type="text" placeholder="User name"/>
                    <input className="login" onChange={this.handlePassword} type="password" placeholder="password"/>
                    <span className="error">{this.state.errorMessage}</span>
                    { this.state.isSubmitting ? (
                        <Spinner />
                    ) : (
                        <input
                            className="green-button"
                            type="submit"
                            disabled={this.state.username === ""}
                            value="Sign up / Log in"
                        />
                    )}
                </form>
                { this.state.isSigningUp ? (
                    <p className="disclaimer">
                        By signing up, you agree to the Terms of service and Privacy Policy, including Cookie Use. Others will be able to find you by searching for your email address or phone number when provided.
                    </p> ) : (<p>
                        Type any username and password for new account.
                    </p>)
                }
                
            </div>
        )
    }
}

export default Login