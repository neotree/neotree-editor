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

import { DataType, ScreenType } from '../../../constants';

export default class SelectMetadata extends Component {

    static contextTypes = {
        screenType: React.PropTypes.string
    };

    static propTypes = {
        metadata: React.PropTypes.object,
        onUpdateMetadata: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        const { screenType } = this.context;
        const { confidential, key, label } = (this.props.metadata || {});
        this.setState({
            confidential: (confidential) ? confidential : false,
            key : (key) ? key : null,
            label : (label) ? label : null,
            dataType: (screenType == ScreenType.MULTI_SELECT) ? DataType.SET_ID : DataType.ID,
        });
    }

    handleInputChange = (name, event) => {
        const { screenType } = this.context;
        const state = {...this.state, [name]: event.target.value};
        const { confidential, key, label } = state;
        this.props.onUpdateMetadata({
            confidential: confidential,
            key: key,
            label: label,
            dataType: (screenType == ScreenType.MULTI_SELECT) ? DataType.SET_ID : DataType.ID,
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
        const { confidential, key, label } = this.state;
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
            </div>
        );
    }

}
