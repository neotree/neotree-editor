import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FABButton } from 'react-mdl';
import { MdDelete, MdAdd } from 'react-icons/md';
import CircularProgress from '@material-ui/core/CircularProgress';

export const _uploadFile = (file) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file, file.filename);

      fetch('/upload-file', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(({ payload: { file: f, error: e, } }) => {
        if (e) return reject(e);
        resolve({
          type: f.content_type,
          size: f.size,
          filename: f.filename,
          fileId: f.id,
          data: `${window.location.origin}/file/${f.id}`,
        });
      })
      .catch(reject);
    });
};

export default class Base64ImageUploader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
    // componentWillMount() {
    //     const { name, fileInfo } = this.props;
    //
    //     console.log(JSON.stringify(fileInfo, null, 2));
    //     this.setState({...this.state, fileInfo: fileInfo});
    // }

    componentDidMount() {
      this.parseFileInfo(this.props);
    }

    componentWillReceiveProps(props) {
      const { fileInfo } = props;
      this.setState({ ...this.state, fileInfo });
      // this.parseFileInfo(props);
    }

    parseFileInfo(props = this.props) {
      if (props.fileInfo && props.fileInfo.data && !props.fileInfo.fileId) {
        const dataURI = props.fileInfo.data;
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        if (!this.state.uploading) {
          const blob = new Blob([ab], { type: mimeString, });
          // this.uploadFile(new File([blob], props.fileInfo.filename), false);
        }
      }
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

    uploadFile = (f, uploaded = true) => {
      this.setState({ uploading: true });
      const done = (e, f) => {
        this.setState({ uploading: false });
        if (e) return alert(e.msg || e.message || JSON.stringify(e));
        this.props.onFileUploaded(this.props.name, f, { uploaded });
      };
      _uploadFile(f)
        .catch(done)
        .then(f => done(null, f));
    };

    render() {
        // const { children, className, label, style, topSpace, ...otherProps } = this.props;
        const { fileInfo, uploading, } = (this.state || {});
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
                    <input
                      value=""
                      accept="image/*"
                      ref={ref => (this.uploadFileInput = ref)}
                      type="file"
                      onChange={e => this.uploadFile(e.target.files[0])}
                    />
                </form>
                <div>
                    {uploading ? <CircularProgress size={20} /> : imagePreview}
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
