import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import cx from 'classnames';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import Container from 'ui/Container';  // eslint-disable-line
import Context from './Context';
import FileInput from 'ui/FileInput';  // eslint-disable-line
import Button from 'ui/Button';  // eslint-disable-line
import seedData from './seedData';
import FileUploader from 'FileUploader'; // eslint-disable-line

export class ImportFirebasePage extends React.Component {
  state = {
    fileInputValue: '',
    readingFile: false,
    readingFileProgress: 0,
    data: null
  };

  onFileInputChange = e => {
    const uploader = new FileUploader(e.target.files[0], { url: '/upload-tmp-file' });
    uploader.upload()
      .then(file => console.log(file))
      .catch(err => console.log(err));
    // const { actions, history } = this.props;
    //
    // const reader = new global.FileReader();
    //
    // this.setState({
    //   readingFile: true,
    //   readingFileProgress: 0,
    //   data: null
    // });
    //
    // reader.onprogress = e => this.setState({
    //   readingFileProgress: Math.ceil((e.loaded / e.total) * 100)
    // });
    //
    // reader.onloadend = e => {
    //   const data = JSON.parse(e.target.result);
    //   seedData(({ data, actions }), error => {
    //     if (error) return this.setState({ error });
    //     history.push('/');
    //   });
    //   this.setState({
    //     data,
    //     readingFile: false,
    //     readingFileProgress: 0
    //   });
    // };
    //
    // reader.readAsText(e.target.files[0]);
  };

  render() {
    const {
      fileInputValue,
      data,
      error,
      readingFile,
      readingFileProgress
    } = this.state;

    return (
      <Context.Provider value={this}>
        <Container>
          {({ windowHeight }) => (
            <div
              className={cx('ui__flex uiBg__faintGreyColor')}
              style={{
                height: windowHeight,
                width: '100%',
                left: 0,
                right: 0,
                position: 'fixed',
                overflowY: 'auto'
              }}
            >
              <div
                className={cx('ui__shadow')}
                style={{
                  margin: 'auto',
                  padding: '25px 10px',
                  minWidth: 250,
                  textAlign: 'center'
                }}
              >
                {error ? (
                  <div
                    className="ui__dangerColor"
                  >{error.msg || error.message || JSON.stringify(error)}</div>
                ) : (
                  <div>
                    {(data || readingFile) ? null : (
                      <FileInput
                        value={fileInputValue}
                        onChange={this.onFileInputChange}
                      >
                        <Button>Upload firebase file (.json)</Button>
                      </FileInput>
                    )}

                    {readingFile ?
                      <span>Reading file... {readingFileProgress}%</span> : null}

                    {data ? <span>Saving data...</span> : null}
                  </div>
                )}
              </div>
            </div>
          )}
        </Container>
      </Context.Provider>
    );
  }
}

ImportFirebasePage.propTypes = {
  actions: PropTypes.object.isRequired
};

export default hot(withRouter(reduxComponent(ImportFirebasePage)));
