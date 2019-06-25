import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import Display from './Display';

export class List extends React.Component {
  componentWillMount() {
    setTimeout(() => this.props.actions.updateApiData({
      diagnosis: [
        {
          createdAt: 1484640928235,
          description: 'VLBW',
          diagnosisId: '-KafUfvh9W0W2mgpRkUi',
          expression: '$BW > 999 and $BW < 1500',
          name: 'Very Low Birth Weight (1000-1499g)',
          source: 'editor',
          updatedAt: 1484989464332
        },
        {
          createdAt: 1484640023982,
          description: 'LBW',
          diagnosisId: '-KafRE9lw2W10fIlXulm',
          expression: '$BW > 1499 and $BW < 2500',
          name: 'Low Birth Weight (1500-2499g)',
          source: 'editor',
          text1: 'Keep warm',
          updatedAt: 1511374119781
        },
        {
          createdAt: 1484639885664,
          description: 'Jaundice',
          diagnosisId: '-KafQhNoWNH1PBcd2wYW',
          expression: '$Colour = "Yell"',
          name: 'Neonatal Jaundice',
          source: 'editor',
          updatedAt: 1484989440514
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
  actions: PropTypes.object
};

export default hot(withRouter(
  reduxComponent(List, state => ({
    diagnosis: state.apiData.diagnosis || []
  }))
));
