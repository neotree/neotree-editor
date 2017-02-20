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

export default class TimerMetadata extends Component {

    static propTypes = {
        metadata: React.PropTypes.object,
        onUpdateMetadata: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        const { confidential, key, label, timerValue, multiplier, minValue, maxValue } = (this.props.metadata || {});
        const state = {
            dataType: DataType.NUMBER,
            confidential: (confidential) ? confidential : false,
            key : (key) ? key : null,
            label : (label) ? label : null,
            timerValue: (timerValue) ? timerValue : null,
            multiplier: (multiplier) ? multiplier : null,
            minValue: (minValue) ? minValue : null,
            maxValue: (maxValue) ? maxValue : null,
        };
        this.setState(state);
    }

    handleInputChange = (name, event) => {
        const state = {...this.state, [name]: event.target.value};
        const { confidential, key, label, timerValue, multiplier, minValue, maxValue } = state;
        this.props.onUpdateMetadata({
            dataType: DataType.NUMBER,
            confidential: (confidential) ? confidential : false,
            key: (key) ? key : null,
            label : (label) ? label : null,
            timerValue: (timerValue) ? timerValue : null,
            multiplier: (multiplier) ? multiplier : null,
            minValue: (minValue) ? minValue : null,
            maxValue: (maxValue) ? maxValue : null
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
            container: {
                display: 'flex',
                flexDirection: 'row',
                width: '100%'
            },
            label: {
                flex: 3
            },
            field: {
                flex: 1
            },
            fieldLeft: {
                marginRight: '12px'
            },
            fieldRight: {
                marginLeft: '12px'
            },
            fieldMiddle: {
                marginRight: '12px',
                marginLeft: '12px'
            },
        };

        const { confidential, key, label, timerValue, multiplier, minValue, maxValue } = this.state;

        return (
            <div>
                <div style={styles.container}>
                    <Textfield
                        style={{...styles.field, ...styles.field, ...styles.fieldLeft}}
                        floatingLabel
                        label="Input key"
                        required={true}
                        pattern="[a-zA-Z0-9]+"
                        onChange={this.handleInputChange.bind(this, 'key')}
                        value={key || ""}
                    />
                    <Textfield
                        style={{...styles.field, ...styles.field, ...styles.fieldRight}}
                        floatingLabel
                        label="Input label"
                        required={true}
                        onChange={this.handleInputChange.bind(this, 'label')}
                        value={label || ""}
                    />
                </div>
                <div style={styles.container}>
                    <Textfield
                        style={{...styles.field, ...styles.fieldLeft}}
                        floatingLabel
                        label="Timer value (seconds)"
                        pattern="([1-9])[0-9]*"
                        required={true}
                        onChange={this.handleInputChange.bind(this, 'timerValue')}
                        value={timerValue || ""}
                    />
                    <Textfield
                        style={{...styles.field, ...styles.fieldMiddle}}
                        floatingLabel
                        label="Multiplier"
                        pattern="([1-9])[0-9]*"
                        required={true}
                        onChange={this.handleInputChange.bind(this, 'multiplier')}
                        value={multiplier || ""}
                    />
                    <Textfield
                        style={{...styles.field, ...styles.fieldMiddle}}
                        floatingLabel
                        label="Input value min."
                        pattern="-?[0-9]*(\.[0-9]+)?"
                        onChange={this.handleInputChange.bind(this, 'minValue')}
                        value={minValue || ""}
                    />
                    <Textfield
                        style={{...styles.field, ...styles.fieldRight}}
                        floatingLabel
                        label="Input value max."
                        pattern="-?[0-9]*(\.[0-9]+)?"
                        onChange={this.handleInputChange.bind(this, 'maxValue')}
                        value={maxValue || ""}
                    />
                </div>

                {/*confidential*/}
                <div style={{ width: '100%', display: 'flex', alignContent: 'flex-end', marginBottom: '24px'}}>
                    <Switch id="confidential"
                            checked={confidential || false}
                            onChange={this.handleSwitchChange('confidential')}>
                        Confidential
                    </Switch>
                </div>

            </div>
        );
    }

}
