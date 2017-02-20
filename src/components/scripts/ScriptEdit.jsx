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

import { Button, Card, CardText, Navigation, Textfield, Tab, Tabs } from 'react-mdl';

import FormButtonBar from 'components/FormButtonBar';
import Toolbar from 'components/Toolbar';
import ScreenList from '../screens/ScreenList';
import DiagnosisList from '../diagnosis/DiagnosisList';

import {
    createScript,
    fetchScript,
    updateScript,
    updateScreens,
    // subscribeScriptChanges,
    // unsubscribeScriptChanges
} from 'actions/datastore';

import { push, replace } from 'react-router-redux'

export default class ScriptEdit extends Component {

    static contextTypes = {
        router: React.PropTypes.object.isRequired,
        store: React.PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        const scriptId = this.props.routeParams.scriptId;
        const isEditMode = (scriptId !== 'new');

        this.state = {
            isEditMode: isEditMode,
            activeTab: 0,
            scriptId: scriptId,
            title: null,
            description: null
        };
    }

    componentWillMount() {
        const { isEditMode, scriptId } = this.state;
        if (isEditMode) {
            console.log("subscribeScriptChanges() - " + scriptId);
            fetchScript(scriptId)
                .then((script) => {
                    this.setState({
                        ...this.state,
                        title: script.title,
                        description: script.description
                    });
                })
                .catch(error => {
                    console.error(error)
                });
        }
    }

    handleBackClick = () => {
        const { router } = this.context;
        router.goBack();
    };

    handleEditScreenClick = (index) => {
        const { scriptId } = this.state;
        const { dispatch } = this.context.store;
        console.log('scripts/' + scriptId + '/screens/' + index);
        dispatch(push('scripts/' + scriptId + '/screens/' + index));
    };

    handleEditDiagnosisClick = (index) => {
        const { scriptId } = this.state;
        const { dispatch } = this.context.store;
        console.log('scripts/' + scriptId + '/diagnosis/' + index);
        dispatch(push('scripts/' + scriptId + '/diagnosis/' + index));
    };

    handleInputChange = (name, event) => {
        this.setState({...this.state, [name]: event.target.value});
    };

    handleSubmitClick = (action) => {
        const { isEditMode, scriptId, title, description } = this.state;
        const { router } = this.context;

        if (isEditMode) {
            console.log('update script');
            updateScript(scriptId, title, description)
                .then(() => {
                    console.log('update script success');
                    if (action === 'update') {
                        router.goBack();
                    }
                })
                .catch(error => {
                    console.error(error)
                });
        } else {
            console.log('create script');
            createScript(title, description)
                .then(() => {
                    console.log('create script success');
                    router.goBack();
                })
                .catch(error => {
                    console.error(error)
                });
        }
    };

    render() {
        const { isEditMode, scriptId, activeTab, title, description } = this.state;
        const formTitle = (isEditMode) ? "Edit Script" : "Add Script";
        const actionLabel = (isEditMode) ? "Update" : "Create";

        const styles = {
            container : {
                display: 'flex',
                boxSizing: 'border-box',
                justifyContent: 'center',
                height: '100%'
            },
            form: {
                width: '780px'
            },
            fieldLeft: {
                marginRight: '12px'
            },
            fieldRight: {
                marginLeft: '12px'
            }
        };

        console.log('ACTIVE TAB: ' + activeTab);

        // console.log('Rendering');
        // console.log(JSON.stringify(screens, null, 2));
        var activeList;
        switch (activeTab) {
            case 0:
                activeList = <ScreenList scriptId={scriptId} onEditScreenClick={this.handleEditScreenClick} />;
                break;
            case 1:
                activeList = <DiagnosisList scriptId={scriptId} onEditDiagnosisClick={this.handleEditDiagnosisClick} />;
                //activeList = null;
                break;
        }

        const tabs = (
            <div style={{marginTop: '24px'}}>
                <Tabs activeTab={activeTab} onChange={(tabId) => this.setState({ activeTab: tabId })} ripple>
                    <Tab>Screens</Tab>
                    <Tab>Diagnosis</Tab>
                </Tabs>
                <section>{activeList}</section>
            </div>
        );

        return (
            <div style={styles.container}>
                <div>
                    <Card shadow={0} style={styles.form}>
                        <Toolbar leftNavIcon="arrow_back" title={formTitle} onLeftNavItemClicked={this.handleBackClick} />
                        <CardText>

                            <Textfield
                                style={{width : "100%"}}
                                floatingLabel
                                label="Title"
                                required={true}
                                onChange={this.handleInputChange.bind(this, 'title')}
                                value={title || ""}
                            />

                            <Textfield
                                style={{width : "100%"}}
                                floatingLabel
                                label="Description"
                                value={description || ""}
                                onChange={this.handleInputChange.bind(this, 'description')}
                            />

                            <FormButtonBar>
                                {(isEditMode) ? <Button style={{...styles.fieldLeft}} onClick={this.handleSubmitClick.bind(this, "apply")} raised ripple>Apply</Button> : null }
                                <Button style={{...styles.fieldRight}} onClick={this.handleSubmitClick.bind(this, "update")} raised accent ripple>{actionLabel}</Button>
                            </FormButtonBar>

                        </CardText>
                    </Card>

                    { (isEditMode) ? tabs : null }
                </div>
            </div>
        );
    }

}
