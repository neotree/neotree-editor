import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import { Link, useParams } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';

import CopyDiagnoses from './Forms/CopyDiagnoses';

function Actions({ selected }) {
  const { scriptId } = useParams();

  return (
    <>
      {selected.length > 0 && (
        <>
          <CopyDiagnoses items={selected.map(({ row }) => ({ diagnosisId: row.diagnosisId, scriptId: row.scriptId, id: row.id, }))}>
            <Button>Copy</Button>
          </CopyDiagnoses>
        </>
      )}

      <Link to={`/scripts/${scriptId}/diagnoses/new`}>
        <Tooltip title="New diagnosis">
          <IconButton>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Link>
    </>
  );
}

Actions.propTypes = {
  selected: PropTypes.array.isRequired
};

export default params => <Actions {...params} />;
