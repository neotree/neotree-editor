import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-mdl';
import ExportLink from '../components/ExportLink';

export class ExportSection extends React.Component {
  render() {
    return (
      <div>
        <ExportLink>
          <Button raised accent ripple>Export everything</Button>
        </ExportLink>
      </div>
    );
  }
}

ExportSection.propTypes = {
  actions: PropTypes.object.isRequired,
  host: PropTypes.string.isRequired
};

export default ExportSection;
