import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-mdl';
import Spinner from 'AppComponents/Spinner';
import Api from 'AppUtils/Api';
import Context from './Context';

export class ImportSection extends React.Component {
  state = {
    importingData: false,
    dataImported: false
  };

  render() {
    return (
      <Context.Consumer>
        {() => {
          const { importingData, dataImported } = this.state;

          return (
            <div>
              {dataImported && <p>Data imported</p>}

              <div>
                {importingData ?
                  <Spinner className="ui__flex ui__justifyContent_center" />
                  :
                  <Button
                    raised
                    accent
                    ripple
                    onClick={() => this.setState(
                      { importingData: true, dataImported: false },
                      () => {
                        Api.post('/import-firebase')
                          .then(() => {
                            this.setState({ importingData: false, dataImported: true });
                          }).catch(() => {
                            this.setState({ importingData: false });
                          });
                      })}
                  >Import firebase</Button>}
              </div>
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
