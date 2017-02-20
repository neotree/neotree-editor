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
    FABButton,
    Icon,
    IconButton
} from 'react-mdl';

export default class Base64ImageUploader extends Component {

    static propTypes = {
        name: React.PropTypes.string.isRequired,
        fileInfo: React.PropTypes.object,
        onFileUploaded: React.PropTypes.func.isRequired,
        onFileDeleted: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
    }

    // componentWillMount() {
    //     const { name, fileInfo } = this.props;
    //
    //     console.log(JSON.stringify(fileInfo, null, 2));
    //     this.setState({...this.state, fileInfo: fileInfo});
    // }

    componentWillReceiveProps(props) {
        const { name, fileInfo } = props;
        console.log("FILE INFO [" + name + "]:");
        this.setState({...this.state, fileInfo: fileInfo});
    }

    handleFormSubmit = (e) => {
        e.preventDefault();
    };

    handleFileUploadRequest = (event) => {
        console.log(event);
        this.uploadFileInput.click();
    };

    handleFileUploaded = (event) => {
        const self = this;
        const file = event.target.files[0];

        const reader = new FileReader();
        const callbackFn = this.props.onFileUploaded;

        reader.onload = function (upload) {
            // TODO: Filter image types
            if (file.size < 200 * 1024) {
                var fileInfo = {
                    filename: file.name,
                    size: file.size,
                    type: file.type,
                    data: upload.target.result
                };

                self.setState({
                    ...self.state,
                    fileInfo: fileInfo
                });
                callbackFn(self.props.name, fileInfo);
            }
        };
        reader.readAsDataURL(file);
    };

    handleFileDelete = (event) => {
        const callbackFn = this.props.onFileDeleted;
        this.setState({fileInfo: null});
        callbackFn(this.props.name);
    };

    render() {
        // const { children, className, label, style, topSpace, ...otherProps } = this.props;
        const { fileInfo } = (this.state || {});
        const styles = {
            container: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%'
            },
            imagePreview: {
                display: 'block',
                maxWidth: '90px',
                maxHeight: '90px',
                width: 'auto',
                height: 'auto',
                marginBottom: '12px'
            },
            imagePreviewEmpty: {
                display: 'flex',
                width: '90px',
                height: '90px',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '12px'
            },
            caption: {
                fontSize: '12px',
                fontWeight:'bold',
                fontStyle: 'italic',
                marginTop: '8px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            },
            flexContainer: {
                display: 'flex',
                flexDirection: 'row',
                width: '100%'
            },
            iconLeft: {
                marginRight: '12px'
            },
            iconRight: {
                marginLeft: '12px'
            }
        };

        var imagePreview = (<div style={styles.imagePreviewEmpty}>No Image</div>);
        if (fileInfo && fileInfo.data) {
            imagePreview = (<img style={styles.imagePreview} src={fileInfo.data} />);
        }

        return (
            <div style={styles.container}>
                <form style={{display:'none'}} encType="multipart-formdata" onSubmit={this.handleFormSubmit}>
                    <input ref={(ref) => this.uploadFileInput = ref} type="file" onChange={this.handleFileUploaded}/>
                </form>
                <div>
                    {imagePreview}
                </div>
                <div style={styles.flexContainer}>
                    <div style={styles.iconLeft}>
                        <FABButton mini colored onClick={this.handleFileUploadRequest.bind(this, "upload")}>
                            <Icon name="add" />
                        </FABButton>
                    </div>
                    <div style={styles.iconRight}>
                        <FABButton mini onClick={this.handleFileDelete.bind(this, "delete")}>
                            <Icon name="delete" />
                        </FABButton>
                    </div>
                </div>
                {/*<Button onClick={this.handleFileUploadRequest.bind(this, "upload")} raised ripple>Upload...</Button>*/}
                <div style={styles.caption}>Max size 200 KB</div>
            </div>
        );
    }
}
