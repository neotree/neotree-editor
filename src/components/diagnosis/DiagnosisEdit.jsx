/*
 * The MIT License (MIT)
 * Copyright (c) 2017 Ubiqueworks Ltd and contributors
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
import { push, replace } from 'react-router-redux'

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

import Base64ImageUploader from '../Base64ImageUploader';
import FormButtonBar from 'components/FormButtonBar';
import FormSection from 'components/FormSection';
import Toolbar from 'components/Toolbar';

import SymptomList from './metadata/SymptomList';

import { fetchDiagnosis, createDiagnosis, updateDiagnosis } from '../../actions/datastore';

export default class DiagnosisEdit extends Component {

    static contextTypes = {
        router: React.PropTypes.object.isRequired,
        store: React.PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        const { diagnosisId, scriptId } = this.props.routeParams;
        const isEditMode = (diagnosisId !== 'new');

        this.state = {
            isEditMode: isEditMode,
            diagnosisId: diagnosisId,
            scriptId: scriptId,
            name: null,
            description: null,
            expression: null,
            text1: null,
            image1: null,
            text2: null,
            image2: null,
            text3: null,
            image3: null,
            symptoms: null
        };
    }

    componentWillMount() {
        const { isEditMode, scriptId, diagnosisId } = this.state;
        if (isEditMode) {
            fetchDiagnosis(scriptId, diagnosisId)
                .then((diagnosis) => {
                    // console.log("fetched diagnosis");
                    // console.log(JSON.stringify(diagnosis, null, 2));

                    this.setState({
                        ...this.state,
                        diagnosisId: diagnosisId,
                        name: diagnosis.name,
                        description: diagnosis.description,
                        expression: diagnosis.expression,
                        text1: diagnosis.text1,
                        image1: diagnosis.image1,
                        text2: diagnosis.text2,
                        image2: diagnosis.image2,
                        text3: diagnosis.text3,
                        image3: diagnosis.image3,
                        symptoms: diagnosis.symptoms
                    });
                })
                .catch(error => {
                    console.error(error)
                });
        }
    }

    handleInputChange = (name, event) => {
        this.setState({...this.state, [name]: event.target.value, isModified: true});
    };

    handleImageUpload = (name, fileInfo) => {
        const data = {...this.state, [name]: fileInfo};
        this.setState(data);
    };

    handleImageDelete = (name) => {
        const data = {...this.state, [name]: null};
        this.setState(data);
    };

    handleBackClick = () => {
        const { router } = this.context;
        router.goBack();
    };

    handleSubmitClick = (action) => {
        const {
            isEditMode,
            scriptId,
            diagnosisId,
            name,
            description,
            expression,
            text1,
            image1,
            text2,
            image2,
            text3,
            image3,
            symptoms
        } = this.state;

        const { router } = this.context;
        const { dispatch } = this.context.store;

        if (isEditMode) {
            console.log('update diagnosis');
            updateDiagnosis(scriptId, diagnosisId, name, description, expression, text1, image1, text2, image2, text3, image3, symptoms)
                .then(() => {
                    console.log('update diagnosis success');
                    if (action === 'update') {
                        router.goBack();
                    }
                })
                .catch(error => {
                    console.error(error)
                });
        } else {
            console.log('create diagnosis');
            createDiagnosis(scriptId, name, description)
                .then((id) => {
                    console.log('create diagnosis success [id=' + id + ']');
                    router.goBack();
                    // console.log('/scripts/' + scriptId + '/diagnosis/' + id);
                    // dispatch(replace('/scripts/' + scriptId + '/diagnosis/' + id));
                })
                .catch(error => {
                    console.error(error)
                });
        }
    };

    handleUpdateSymptoms = (update) => {
        this.setState({...this.state, symptoms: update.symptoms});
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

        const { isEditMode, name, description, expression, text1, image1, text2, image2, text3, image3, symptoms } = this.state;
        const formTitle = (isEditMode) ? "Edit Diagnosis" : "Add Diagnosis";
        const actionLabel = (isEditMode) ? "Update" : "Create";

        return (
            <div style={styles.container}>
                <div>
                    <Card shadow={1} style={styles.form}>
                        <Toolbar leftNavIcon="arrow_back" title={formTitle} onLeftNavItemClicked={this.handleBackClick} />

                        <CardText>
                            <Textfield
                                style={{width: '100%'}}
                                floatingLabel
                                label="Name"
                                required={true}
                                onChange={this.handleInputChange.bind(this, 'name')}
                                value={name || ""}
                            />

                            <Textfield
                                style={{width : "100%"}}
                                floatingLabel
                                label="Description"
                                value={description || ""}
                                onChange={this.handleInputChange.bind(this, 'description')}
                            />

                            { !isEditMode ? null :
                                <div>
                                    <Textfield
                                        style={{width : "100%"}}
                                        floatingLabel
                                        label="Diagnosis expression"
                                        required={true}
                                        value={expression || ""}
                                        onChange={this.handleInputChange.bind(this, 'expression')}
                                    />
                                    <div style={{fontSize: '12px', fontStyle: 'italic', marginBottom: '12px'}}>Note: Usual expression syntax plus <span style={{fontWeight:'bold'}}>$riskCount</span> and <span style={{fontWeight:'bold'}}>$signCount</span> containing the number of expressions that match a risk factor or a sign/symptom</div>

                                    <div style={styles.flexContainer}>
                                        <Textfield
                                            style={{width: '100%'}}
                                            floatingLabel
                                            label="Text 1"
                                            rows={6}
                                            onChange={this.handleInputChange.bind(this, 'text1')}
                                            value={text1 || ""}
                                        />

                                        <div style={styles.fieldRight}>
                                            <Base64ImageUploader
                                                name={"image1"}
                                                fileInfo={image1}
                                                onFileUploaded={this.handleImageUpload}
                                                onFileDeleted={this.handleImageDelete}
                                            />
                                        </div>
                                    </div>

                                    <div style={styles.flexContainer}>
                                        <Textfield
                                            style={{width : "100%"}}
                                            floatingLabel
                                            label="Text 2"
                                            rows={6}
                                            onChange={this.handleInputChange.bind(this, 'text2')}
                                            value={text2 || ""}
                                        />

                                        <div style={styles.fieldRight}>
                                            <Base64ImageUploader
                                                name={"image2"}
                                                fileInfo={image2}
                                                onFileUploaded={this.handleImageUpload}
                                                onFileDeleted={this.handleImageDelete}
                                            />
                                        </div>
                                    </div>

                                    <div style={styles.flexContainer}>
                                        <Textfield
                                            style={{width : "100%"}}
                                            floatingLabel
                                            label="Text 3"
                                            rows={6}
                                            onChange={this.handleInputChange.bind(this, 'text3')}
                                            value={text3 || ""}
                                        />

                                        <div style={styles.fieldRight}>
                                            <Base64ImageUploader
                                                name={"image3"}
                                                fileInfo={image3}
                                                onFileUploaded={this.handleImageUpload}
                                                onFileDeleted={this.handleImageDelete}
                                            />
                                        </div>
                                    </div>

                                </div>
                            }

                            <FormButtonBar>
                                {(isEditMode) ? <Button style={{...styles.fieldLeft}} onClick={this.handleSubmitClick.bind(this, "apply")} raised ripple>Apply</Button> : null }
                                <Button style={{...styles.fieldRight}} onClick={this.handleSubmitClick.bind(this, "update")} raised accent ripple>{actionLabel}</Button>
                            </FormButtonBar>
                        </CardText>
                    </Card>

                    <SymptomList items={symptoms} onUpdateSymptoms={this.handleUpdateSymptoms}/>
                </div>
            </div>
        );
    }

}
