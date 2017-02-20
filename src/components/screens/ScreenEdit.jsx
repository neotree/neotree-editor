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
    Dialog,
    DialogActions,
    DialogContent,
    Textfield,
    Switch
} from 'react-mdl';

import FormButtonBar from 'components/FormButtonBar';
import FormSection from 'components/FormSection';
import Toolbar from 'components/Toolbar';

import SelectMetadata from './metadata/SelectMetadata';
import FieldList from './metadata/FieldList';
import ItemList from './metadata/ItemList';
import ManagementMetadata from './metadata/ManagementMetadata';
import TimerMetadata from './metadata/TimerMetadata';
import YesNoMetadata from './metadata/YesNoMetadata';

import { DataType, ScreenType } from '../../constants';
import { fetchScreen, updateScreen } from '../../actions/datastore';

export default class ScreenEdit extends Component {

    static childContextTypes = {
        screenType: React.PropTypes.string
    };

    static contextTypes = {
        router: React.PropTypes.object.isRequired,
        store: React.PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        const { scriptId, screenId } = this.props.routeParams;

        this.state = {
            openUnsavedChangesDialog: false,
            scriptId: scriptId,
            screenId: screenId,
            isModified: false,
            isModifiedConfirmed: false,
            epicId: null,
            storyId: null,
            refId: null,
            step: null,
            type: null,
            title: null,
            sectionTitle: null,
            actionText: null,
            contentText: null,
            infoText: null,
            notes: null,
            condition: null,
            skippable: false,
            metadata: null
        };
    }

    getChildContext () {
        const { type } = this.state;
        return {
            screenType: type
        }
    }

    componentWillMount() {
        const { scriptId, screenId } = this.state;
        const { router } = this.context;

        // // Confirm navigation hook
        // router.setRouteLeaveHook(this.props.route, this.routerWillLeave)

        fetchScreen(scriptId, screenId)
            .then((screen) => {
                this.setState({
                    ...this.state,
                    epicId: screen.epicId,
                    storyId: screen.storyId,
                    refId: screen.refId,
                    step: screen.step,
                    type: screen.type,
                    title: screen.title,
                    sectionTitle: screen.sectionTitle,
                    actionText: screen.actionText,
                    contentText: screen.contentText,
                    infoText: screen.infoText,
                    notes: screen.notes,
                    condition: screen.condition,
                    skippable: screen.skippable,
                    metadata: screen.metadata
                });
            })
            .catch(error => {
                console.error(error)
            });
    }

    // TODO: Add route change listener to check if content has changed and ask user

    handleInputChange = (name, event) => {
        this.setState({...this.state, [name]: event.target.value, isModified: true});
    };

    handleSwitchChange = (name) => {
        return () => {
            const currentValue = (this.state[name]) ? this.state[name] : false;
            this.setState({...this.state, [name]: !currentValue});
        }
    };

    handleBackClick = () => {
        const { router } = this.context;
        router.goBack();
    };

    handleSubmitClick = (action) => {
        const { scriptId, screenId, epicId, storyId, refId, step, title, sectionTitle, actionText, contentText, infoText, notes, condition, skippable, metadata } = this.state;
        const { router } = this.context;

        console.log('update script');
        updateScreen(scriptId, screenId, epicId, storyId, refId, step, title, sectionTitle, actionText, contentText, infoText, notes, condition, skippable, metadata)
            .then(() => {
                console.log('update screen success');
                if (action === 'update') {
                    router.goBack();
                }
            })
            .catch(error => {
                console.error(error)
            });
    };

    handleItemsChanged = () => {
        this.setState({...this.state, isModified: true});
    };

    handleUpdateMetadata = (update) => {
        const { metadata } = this.state;
        const value = Object.assign({}, metadata, update);
        this.setState({...this.state, metadata: value});
    };

    openUnsavedChangesDialog = () => {
        return () => {
            this.setState({
                ...this.state,
                openUnsavedChangesDialog
            });
        }
    };

    closeUnsavedChangesDialog = () => {
        this.setState({
            ...this.state,
            openUnsavedChangesDialog: false
        });
    };

    render() {
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
            flexContainer: {
                display: 'flex',
                flexDirection: 'row',
                width: '100%'
            },
            fieldLeft: {
                marginRight: '12px'
            },
            fieldMiddle: {
                marginLeft: '12px',
                marginRight: '12px'
            },
            fieldRight: {
                marginLeft: '12px'
            }
        };

        const { epicId, storyId, refId, step, type, title, sectionTitle, actionText, contentText, infoText, notes, condition, skippable, metadata } = this.state;

        var metadataEditor = null;
        var itemsEditor = null;

        switch (type) {
            case ScreenType.CHECKLIST:
            case ScreenType.LIST:
            case ScreenType.PROGRESS:
            case ScreenType.MULTI_SELECT:
            case ScreenType.SINGLE_SELECT:
                if (type === ScreenType.MULTI_SELECT || type === ScreenType.SINGLE_SELECT) {
                    metadataEditor = <SelectMetadata metadata={metadata} onUpdateMetadata={this.handleUpdateMetadata}/>;
                }
                itemsEditor = (
                    <ItemList metadata={metadata}
                              onItemsChanged={this.handleItemsChanged}
                              onUpdateMetadata={this.handleUpdateMetadata}/>
                );
                break;
            case ScreenType.FORM:
                itemsEditor = (
                    <FieldList metadata={metadata}
                               onFieldsChanged={this.handleItemsChanged}
                               onUpdateMetadata={this.handleUpdateMetadata}/>
                );
                break;
            case ScreenType.TIMER:
                metadataEditor = <TimerMetadata metadata={metadata} onUpdateMetadata={this.handleUpdateMetadata}/>;
                break;
            case ScreenType.YESNO:
                metadataEditor = <YesNoMetadata metadata={metadata} onUpdateMetadata={this.handleUpdateMetadata}/>;
                break;
            case ScreenType.MANAGEMENT:
                metadataEditor = <ManagementMetadata metadata={metadata} onUpdateMetadata={this.handleUpdateMetadata}/>;
                break;
            default:
                console.log('unknown metadata editor for type: ' + type);
        }

        // TODO: Fix me!
        const confirmUnsavedChangesDialog = (
            <Dialog open={this.state.openUnsavedChangesDialog}>
                <DialogContent>
                    <p>You have unsaved changes. If you continue they will be lost.</p>
                </DialogContent>
                <DialogActions>
                    {/*<Button type='button' onClick={this.handleDeleteItemClick} accent>Delete</Button>*/}
                    {/*<Button type='button' onClick={this.closeConfirmDeleteItemDialog}>Cancel</Button>*/}
                </DialogActions>
            </Dialog>
        );

        return (
            <div style={styles.container}>
                <div>
                    <Card shadow={1} style={styles.form}>

                        <Toolbar leftNavIcon="arrow_back" title="Edit Screen" onLeftNavItemClicked={this.handleBackClick} />

                        <CardText>
                            <FormSection label="FLOW CONTROL" />

                            <div style={{ width: '100%', display: 'flex', alignContent: 'flex-end', marginBottom: '24px'}}>
                                <Switch id="screenSkippable"
                                        checked={skippable || false}
                                        onChange={this.handleSwitchChange('skippable')}>
                                    Allow the user to skip this screen
                                </Switch>
                            </div>

                            <Textfield
                                style={{width : "100%"}}
                                floatingLabel
                                label="Conditional expression"
                                value={condition || ""}
                                onChange={this.handleInputChange.bind(this, 'condition')}
                            />
                            <div style={{fontSize: '12px', fontStyle: 'italic', marginBottom: '12px'}}>Example: <span style={{fontWeight:'bold'}}>($key = true and $key2 = false) or $key3 = 'HD'</span></div>

                            <FormSection label="PROPERTIES" topSpace/>

                            <div style={styles.flexContainer}>
                                <Textfield
                                    style={{flex: 1, ...styles.fieldLeft}}
                                    floatingLabel
                                    label="Epic ID"
                                    onChange={this.handleInputChange.bind(this, 'epicId')}
                                    value={epicId || ""}
                                />
                                <Textfield
                                    style={{flex: 1, ...styles.fieldMiddle}}
                                    floatingLabel
                                    label="Story ID"
                                    onChange={this.handleInputChange.bind(this, 'storyId')}
                                    value={storyId || ""}
                                />
                                <Textfield
                                    style={{flex: 1, ...styles.fieldMiddle}}
                                    floatingLabel
                                    label="Ref."
                                    onChange={this.handleInputChange.bind(this, 'refId')}
                                    value={refId || ""}
                                />
                                <Textfield
                                    style={{flex: 1, ...styles.fieldLeft}}
                                    floatingLabel
                                    label="Step"
                                    onChange={this.handleInputChange.bind(this, 'step')}
                                    value={step || ""}
                                />
                            </div>

                            <Textfield
                                style={{width: '100%'}}
                                floatingLabel
                                label="Title"
                                required={true}
                                onChange={this.handleInputChange.bind(this, 'title')}
                                value={title || ""}
                            />

                            <Textfield
                                style={{width: '100%'}}
                                floatingLabel
                                label="Print section title"
                                required={true}
                                onChange={this.handleInputChange.bind(this, 'sectionTitle')}
                                value={sectionTitle || ""}
                            />

                            <Textfield
                                style={{width : "100%"}}
                                floatingLabel
                                label="Action"
                                value={actionText || ""}
                                onChange={this.handleInputChange.bind(this, 'actionText')}
                            />

                            <Textfield
                                style={{width : "100%"}}
                                floatingLabel
                                label="Content"
                                rows={6}
                                value={contentText || ""}
                                onChange={this.handleInputChange.bind(this, 'contentText')}
                            />

                            {/*{(metadataEditor != null) ? <FormSection label="CUSTOM PROPERTIES" topSpace /> : null}*/}

                            {metadataEditor}

                            <Textfield
                                style={{width : "100%"}}
                                floatingLabel
                                label="Instructions"
                                rows={6}
                                value={infoText || ""}
                                onChange={this.handleInputChange.bind(this, 'infoText')}
                            />

                            <Textfield
                                style={{width : "100%"}}
                                floatingLabel
                                label="Notes"
                                rows={6}
                                value={notes || ""}
                                onChange={this.handleInputChange.bind(this, 'notes')}
                            />

                            <FormButtonBar>
                                <Button style={{...styles.fieldLeft}} onClick={this.handleSubmitClick.bind(this, "apply")} raised ripple>Apply</Button>
                                <Button style={{...styles.fieldRight}} onClick={this.handleSubmitClick.bind(this, "update")} raised accent ripple>Update</Button>
                            </FormButtonBar>

                        </CardText>
                    </Card>
                    {itemsEditor}
                </div>
                {confirmUnsavedChangesDialog}
            </div>
        );
    }

}
