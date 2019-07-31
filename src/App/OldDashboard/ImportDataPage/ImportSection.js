import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-mdl';
import FileInput from 'ui/FileInput';
import Spinner from 'ui/Spinner';
import FileUploader from 'FileUploader';
import Context from './Context';

export class ImportSection extends React.Component {
  state = {
    importingData: false,
  };

  onFileInputChange = e => {
    const { actions, host } = this.props;
    this.setState({ importDataError: null, importingData: true });
    const uploader = new FileUploader(e.target.files[0], {
      url: `${host}/import-data`
    });
    uploader.upload()
      .then(({ payload }) => {
        this.setState({ importingData: false, ...payload });
        actions.$updateApp({ ...payload });
      }).catch(error => this.setState({ error }));
  };

  render() {
    return (
      <Context.Consumer>
        {() => {
          const { error, importingData, data_import_info } = this.state;

          return (
            <div>
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
                        {data_import_info && data_import_info.date ?
                          <p>Data was imported!!!</p> : null}

                        <FileInput
                          value=''
                          onChange={this.onFileInputChange}
                        >
                          <Button raised accent ripple>Upload json file</Button>
                        </FileInput>
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        }}
      </Context.Consumer>
    );
  }
}

ImportSection.propTypes = {
  actions: PropTypes.object.isRequired,
  host: PropTypes.string.isRequired
};

export default ImportSection;
