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

import { Button } from 'react-mdl';

export default class NotFoundPage extends Component {

    static contextTypes = {
        router: React.PropTypes.object.isRequired
    };

    handleBackClick = () => {
        const { router } = this.context;
        router.goBack();
    };

    render() {
        const styles = {
            container : {
                display: 'flex',
                boxSizing: 'border-box',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                backgroundColor: '#f0f0f0'
            }
        };
        return (
            <div style={styles.container}>
                <div>
                    <h1>Page not found</h1>
                    <Button onClick={this.handleBackClick} raised accent ripple>Back</Button>
                </div>
            </div>
        );
    }

}