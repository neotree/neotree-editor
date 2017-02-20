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
    Textfield,
    Switch
} from 'react-mdl';

import { DataType } from '../../../constants';

export default class YesNoMetadata extends Component {

    static propTypes = {
        metadata: React.PropTypes.object,
        onUpdateMetadata: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        const { confidential, key, label, positiveLabel, negativeLabel } = (this.props.metadata || {});
        this.setState({
            dataType: DataType.BOOLEAN,
            confidential: (confidential) ? confidential : false,
            key : (key) ? key : null,
            label : (label) ? label : null,
            negativeLabel: (negativeLabel) ? negativeLabel : null,
            positiveLabel: (positiveLabel) ? positiveLabel : null
        });
    }

    handleInputChange = (name, event) => {
        const state = {...this.state, [name]: event.target.value};

        const { confidential, key, label, positiveLabel, negativeLabel } = state;
        this.props.onUpdateMetadata({
            dataType: DataType.BOOLEAN,
            confidential: confidential,
            key: key,
            label: label,
            positiveLabel: positiveLabel,
            negativeLabel: negativeLabel
        });

        this.setState(state);
    };

    handleSwitchChange = (name) => {
        return () => {
            const currentValue = (this.state[name]) ? this.state[name] : false;
            this.props.onUpdateMetadata({...this.state, [name]: !currentValue});
            this.setState({...this.state, [name]: !currentValue});
        }
    };

    render() {
        const styles = {
            flexContainer: {
                display: 'flex',
                flexDirection: 'row',
                width: '100%'
            },
            fieldLeft: {
                flex: 1,
                marginRight: '12px'
            },
            fieldRight: {
                flex: 1,
                marginLeft: '12px'
            }
        };

        const { confidential, key, label, positiveLabel, negativeLabel } = this.state;
        return (
            <div>
                <Textfield
                    style={{width : "100%"}}
                    floatingLabel
                    label="Key"
                    required={true}
                    pattern="[a-zA-Z0-9]+"
                    onChange={this.handleInputChange.bind(this, 'key')}
                    value={key || ""}
                />

                <Textfield
                    style={{width : "100%"}}
                    floatingLabel
                    label="Output Label"
                    required={true}
                    onChange={this.handleInputChange.bind(this, 'label')}
                    value={label || ""}
                />

                {/*confidential*/}
                <div style={{ width: '100%', display: 'flex', alignContent: 'flex-end', marginBottom: '24px'}}>
                    <Switch id="confidential"
                            checked={confidential || false}
                            onChange={this.handleSwitchChange('confidential')}>
                        Confidential
                    </Switch>
                </div>

                <div style={styles.flexContainer}>
                    <Textfield
                        style={styles.fieldLeft}
                        floatingLabel
                        label="Positive label"
                        required={true}
                        onChange={this.handleInputChange.bind(this, 'positiveLabel')}
                        value={positiveLabel || ""}
                    />

                    <Textfield
                        style={styles.fieldRight}
                        floatingLabel
                        label="Negative label"
                        required={true}
                        value={negativeLabel || ""}
                        onChange={this.handleInputChange.bind(this, 'negativeLabel')}
                    />
                </div>

            </div>
        );
    }

}
