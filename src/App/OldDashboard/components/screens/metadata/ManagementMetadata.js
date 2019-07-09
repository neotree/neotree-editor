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
    Textfield
} from 'react-mdl';

import { DataType } from '../../../constants';
import Base64ImageUploader from '../../Base64ImageUploader';

export default class ManagementMetadata extends Component {

    static propTypes = {
        metadata: React.PropTypes.object,
        onUpdateMetadata: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        const { title1, title2, title3, text1, text2, text3, image1, image2, image3 } = (this.props.metadata || {});
        const state = {
            dataType: DataType.VOID,
            title1: (title1) ? title1 : null,
            text1: (text1) ? text1 : null,
            image1: (image1) ? image1 : null,
            title2: (title2) ? title2 : null,
            text2: (text2) ? text2 : null,
            image2: (image2) ? image2 : null,
            title3: (title3) ? title3 : null,
            text3: (text3) ? text3 : null,
            image3: (image3) ? image3 : null

        };
        this.setState(state);
        this.props.onUpdateMetadata(state);
    }

    handleInputChange = (name, event) => {
        const state = {...this.state, [name]: event.target.value};
        const { title1, title2, title3, text1, text2, text3, image1, image2, image3 } = state;
        this.props.onUpdateMetadata({
            dataType: DataType.VOID,
            title1: (title1) ? title1 : null,
            text1: (text1) ? text1 : null,
            image1: (image1) ? image1 : null,
            title2: (title2) ? title2 : null,
            text2: (text2) ? text2 : null,
            image2: (image2) ? image2 : null,
            title3: (title3) ? title3 : null,
            text3: (text3) ? text3 : null,
            image3: (image3) ? image3 : null
        });
        this.setState(state);
    };

    handleImageUpload = (name, fileInfo) => {
        const data = {...this.state, [name]: fileInfo};
        this.props.onUpdateMetadata(data);
        this.setState(data);
    };

    handleImageDelete = (name) => {
        const data = {...this.state, [name]: null};
        this.props.onUpdateMetadata(data);
        this.setState(data);
    };

    render() {
        const { title1, title2, title3, text1, text2, text3, image1, image2, image3 } = this.state;
        const styles = {
            flexContainer: {
                display: 'flex',
                flexDirection: 'row',
                width: '100%'
            },
            fieldLeft: {
                width: '100%'
            },
            fieldRight: {
                marginLeft: '24px'
            }
        };

        return (
            <div>
                <Textfield
                    style={{width : "100%"}}
                    floatingLabel
                    label="Title 1"
                    onChange={this.handleInputChange.bind(this, 'title1')}
                    value={title1 || ""}
                />

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

                <Textfield
                    style={{width : "100%"}}
                    floatingLabel
                    label="Title 2"
                    onChange={this.handleInputChange.bind(this, 'title2')}
                    value={title2 || ""}
                />

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

                <Textfield
                    style={{width : "100%"}}
                    floatingLabel
                    label="Title 3"
                    onChange={this.handleInputChange.bind(this, 'title3')}
                    value={title3 || ""}
                />

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
        );
    }

}
