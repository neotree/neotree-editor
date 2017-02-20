/*
 * The MIT License (MIT)
 * Copyright (c) 2016 Ubiqueworks Ltd and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
 * SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import React, { Component } from 'react';

import { Button, Textfield } from 'react-mdl';
import FormButtonBar from 'components/FormButtonBar';

import { login } from 'actions/authentication';

export default class LoginPage extends Component {

    static contextTypes = {
        store: React.PropTypes.object
    };

    constructor(props) {
        super(props);

        const { location } = this.props;
        this.state = {
            username: 'm.giaccone@neotree.org',
            password: 'password',
            redirectTo: location.query.next
        };
    }

    handleInputChange = (name, event) => {
        this.setState({...this.state, [name]: event.target.value});
    };

    handleKeyPress = (event) => {
        if (event.key == 'Enter') {
            this.handleSubmitClick();
        }
    };

    handleSubmitClick = () => {
        const { store } = this.context;
        const { username, password, redirectTo } = this.state;

        store.dispatch(
            login({ username: username, password: password}, redirectTo)
        );
    };

    render() {
        const { location } = this.props;
        const styles = {
            container : {
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
                    <div>{location.query.err}</div>

                    <Textfield
                        style={{width : "100%"}}
                        floatingLabel
                        label="Email address"
                        onChange={this.handleInputChange.bind(this, 'username')}
                        onKeyPress={this.handleKeyPress}
                    />
                    <Textfield
                        style={{width : "100%"}}
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
