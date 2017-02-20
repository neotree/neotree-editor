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

import {
    Button,
    Card,
    CardText,
    Textfield
} from 'react-mdl';

import FormButtonBar from 'components/FormButtonBar';
import FormSection from 'components/FormSection';
import Toolbar from 'components/Toolbar';

import { updateAdminPassword } from 'actions/datastore';

export default class AdminPasswordForm extends Component {

    static contextTypes = {
        router: React.PropTypes.object.isRequired,
        store: React.PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            password: null
        };
    }

    // componentWillMount() {
    //     fetchAdminPassword()
    //         .then((data) => {
    //             this.setState({
    //                 ...this.state,
    //                 password: data.password
    //             });
    //         })
    //         .catch(error => {
    //             console.error(error)
    //         });
    // }

    handleBackClick = () => {
        const { router } = this.context;
        router.goBack();
    };

    handleInputChange = (name, event) => {
        this.setState({...this.state, [name]: event.target.value});
    };

    handleSubmitClick = () => {
        const { password } = this.state;
        const { router } = this.context;

        console.log('update admin password');
        updateAdminPassword(password)
            .then(() => {
                console.log('update admin password success');
                router.goBack();
            })
            .catch(error => {
                console.error(error)
            });
    };

    render() {
        const { password } = this.state;

        const title = "Administrator password";
        const actionLabel = "Update";
        const styles = {
            container : {
                display: 'flex',
                boxSizing: 'border-box',
                justifyContent: 'center',
                height: '100%'
            },
            form: {
                width: '520px'
            }
        };

        return (
            <div style={styles.container}>
                <div>
                    <Card shadow={1} style={styles.form}>

                        <Toolbar leftNavIcon="arrow_back" title={title} onLeftNavItemClicked={this.handleBackClick} />

                        <CardText>
                            <Textfield
                                style={{width : "100%"}}
                                floatingLabel
                                label="Password"
                                onChange={this.handleInputChange.bind(this, 'password')}
                            />

                            <FormButtonBar>
                                <Button onClick={this.handleSubmitClick}raised accent ripple>{actionLabel}</Button>
                            </FormButtonBar>

                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }

}
