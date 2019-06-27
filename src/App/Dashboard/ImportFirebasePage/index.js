import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import cx from 'classnames';
import { withRouter } from 'react-router-dom';
import { Button } from 'react-mdl';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import Context from './Context';
import FileInput from 'ui/FileInput';  // eslint-disable-line
import FileUploader from 'FileUploader'; // eslint-disable-line
import Spinner from 'ui/Spinner'; // eslint-disable-line

export class ImportFirebasePage extends React.Component {
  state = {
    importingData: false,
  };

  onFileInputChange = e => {
    const { actions } = this.props;
    this.setState({ importDataError: null, importingData: true });
    const uploader = new FileUploader(e.target.files[0], {
      url: '/import-from-firebase'
    });
    uploader.upload()
      .then(({ payload }) => {
        this.setState({ importingData: false });
        actions.updateAppStatus({ ...payload });
      }).catch(error => this.setState({ error }));
  };

  render() {
    const { data_import_info } = this.props;
    const { error, importingData } = this.state;

    return (
      <Context.Provider value={this}>
        <div className={cx('ui__flex')}>
          <div
            className={cx('ui__shadow')}
            style={{
              background: '#fff',
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
                {importingData ?
                  <Spinner className="ui__flex ui__justifyContent_center" />
                  :
                  (
                    <div>
                      {!data_import_info.date ?
                        <FileInput
                          value=''
                          onChange={this.onFileInputChange}
                        >
                          <Button raised accent ripple>Upload firebase json file</Button>
                        </FileInput> : <div>Firebase data was imported!!!</div>}
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </Context.Provider>
    );
  }
}

ImportFirebasePage.propTypes = {
  actions: PropTypes.object.isRequired
};

export default hot(withRouter(
  reduxComponent(ImportFirebasePage, state => ({
    data_import_info: state.appStatus.data_import_info || {}
  }))
));
