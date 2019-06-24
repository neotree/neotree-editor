import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import { Button, Textfield } from 'react-mdl';
import reduxComponent from 'reduxComponent';  // eslint-disable-line
import FormButtonBar from 'FormButtonBar'; // eslint-disable-line

export class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: 'm.giaccone@neotree.org',
            password: 'password'
        };
    }

    handleInputChange = (name, event) => {
        this.setState({ ...this.state, [name]: event.target.value });
    };

    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.handleSubmitClick();
        }
    };

    handleSubmitClick = () => {
        const { actions, history } = this.props;
        const { username, password } = this.state;
        this.setState({ authenticating: true });
        actions.post('sign-in', {
          username,
          password,
          onResponse: () => {
            this.setState({ authenticating: false });
          },
          onSuccess: () => {
            history.push('/dashboard');
          },
          onFailure: authenticateError => {
            this.setState({ authenticateError });
          }
        });
    };

    render() {
        const { authenticateError } = this.state;
        const styles = {
            container: {
                display: 'flex',
                boxSizing: 'border-box',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
            },
            form: {
                width: '420px'
            }
        };

        return (
            <div style={styles.container}>
                <div style={styles.form}>

                    {authenticateError ?
                      <div>{authenticateError.msg || authenticateError.message
                        | JSON.stringify(authenticateError)}</div> : null}

                    <Textfield
                        style={{ width: '100%' }}
                        floatingLabel
                        label="Email address"
                        onChange={this.handleInputChange.bind(this, 'username')}
                        onKeyPress={this.handleKeyPress}
                    />
                    <Textfield
                        style={{ width: '100%' }}
                        type="password"
                        floatingLabel
                        label="Password"
                        onChange={this.handleInputChange.bind(this, 'password')}
                        onKeyPress={this.handleKeyPress}
                    />

                    <FormButtonBar>
                        <Button onClick={this.handleSubmitClick}raised accent ripple>Login</Button>
                    </FormButtonBar>
                </div>
            </div>
        );
    }
}

export default hot(withRouter(reduxComponent(LoginPage)));
