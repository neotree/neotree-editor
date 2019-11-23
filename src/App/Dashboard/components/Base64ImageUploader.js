import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FABButton } from 'react-mdl';
import { MdDelete, MdAdd } from 'react-icons/md';

export default class Base64ImageUploader extends Component {
    // componentWillMount() {
    //     const { name, fileInfo } = this.props;
    //
    //     console.log(JSON.stringify(fileInfo, null, 2));
    //     this.setState({...this.state, fileInfo: fileInfo});
    // }

    componentWillReceiveProps(props) {
      const { fileInfo } = props;
      this.setState({ ...this.state, fileInfo });
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
                            <MdAdd />
                        </FABButton>
                    </div>
                    <div style={styles.iconRight}>
                        <FABButton mini onClick={this.handleFileDelete.bind(this, "delete")}>
                            <MdDelete />
                        </FABButton>
                    </div>
                </div>
                {/*<Button onClick={this.handleFileUploadRequest.bind(this, "upload")} raised ripple>Upload...</Button>*/}
                <div style={styles.caption}>Max size 200 KB</div>
            </div>
        );
    }
}

Base64ImageUploader.propTypes = {
    name: PropTypes.string.isRequired,
    fileInfo: PropTypes.object,
    onFileUploaded: PropTypes.func.isRequired,
    onFileDeleted: PropTypes.func.isRequired,
};
