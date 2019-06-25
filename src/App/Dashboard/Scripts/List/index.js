import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import Display from './Display';

export class List extends React.Component {
  componentWillMount() {
    setTimeout(() => this.props.actions.updateApiData({
      scripts: [
        {
          id: '-KO1TK4zMvLhxTw6eKia',
          createdAt: 1469994062321,
          description: 'Admission',
          scriptId: '-KO1TK4zMvLhxTw6eKia',
          source: 'editor',
          title: 'NeoTree - Malawi',
          updatedAt: 1558422326088
        },
        {
          id: '-KYDiO2BTM4kSGZDVXAO',
          createdAt: 1480937049584,
          description: 'Outcome data',
          scriptId: '-KYDiO2BTM4kSGZDVXAO',
          source: 'editor',
          title: 'NeoDischarge - Malawi',
          updatedAt: 1558555325389
        },
        {
          id: '-LFOH5fWtWEKk1yJPwfo',
          createdAt: 1529432533850,
          description: 'Infection outcome data',
          scriptId: '-LFOH5fWtWEKk1yJPwfo',
          source: 'editor',
          title: 'NeoLab - Zimbabwe',
          updatedAt: 1557316699378
        }
      ]
    }), 1000);
  }

  componentWillUnmount() {
    this.props.actions.updateApiData({ scripts: [] });
  }

  render() {
    return <Display {...this.props} />;
  }
}

List.propTypes = {
  scripts: PropTypes.array
};

export default hot(withRouter(
  reduxComponent(List, state => ({
    scripts: state.apiData.scripts || []
  }))
));
