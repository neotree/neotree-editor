import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Textfield, Switch } from 'react-mdl';

import { DataType, ScreenType } from 'App/constants'; // eslint-disable-line

export default class SelectMetadata extends Component {
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

SelectMetadata.contextTypes = {
    screenType: PropTypes.string
};

SelectMetadata.propTypes = {
    metadata: PropTypes.object,
    onUpdateMetadata: PropTypes.func.isRequired
};
