import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Textfield,
    Switch
} from 'react-mdl';
import { DataType } from 'App/constants'; 

export default class YesNoMetadata extends Component {
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

YesNoMetadata.propTypes = {
    metadata: PropTypes.object,
    onUpdateMetadata: PropTypes.func.isRequired
};
