import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import cx from 'classnames';
import { withRouter } from 'react-router-dom';
import { Tabs, Tab } from 'react-mdl';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import Context from './Context';
import ImportSection from './ImportSection';
import ExportSection from './ExportSection';

export class ImportDataPage extends React.Component {
  state = { activeTab: 0 };

  render() {
    const { activeTab } = this.state;

    return (
      <Context.Provider value={this}>
        <div className={cx('ui__flex')}>
          <div
            className={cx('ui__shadow')}
            style={{
              background: '#fff',
              margin: 'auto',
              // padding: '25px 10px',
              minWidth: 250,
              textAlign: 'center'
            }}
          >
            <div style={{ padding: '25px 10px' }}>
              <ImportSection {...this.props} />
            </div>
            
            {/*<Tabs
              activeTab={activeTab}
              onChange={activeTab => this.setState({ activeTab })}
            >
              <Tab>Import</Tab>
              <Tab>Export</Tab>
            </Tabs>

            <div style={{ padding: '25px 10px' }}>
              {activeTab === 0 && <ImportSection {...this.props} />}
              {activeTab === 1 && <ExportSection {...this.props} />}
            </div>*/}
          </div>
        </div>
      </Context.Provider>
    );
  }
}

ImportDataPage.propTypes = {
  actions: PropTypes.object.isRequired
};

export default hot(withRouter(
  reduxComponent(ImportDataPage, state => ({
    host: state.$APP.host,
    data_import_info: state.$APP.data_import_info || {}
  }))
));
