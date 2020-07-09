import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import { useScriptContext } from '@/contexts/script';
import { Link } from 'react-router-dom';

import CopyDiagnoses from '../Forms/CopyDiagnoses';

function Actions({ selected }) {
  const { state: { script } } = useScriptContext();

  return (
    <>
      {selected.length > 0 && (
        <>
          <CopyDiagnoses ids={selected.map(({ row }) => row.id)}>
            <Button>Copy</Button>
          </CopyDiagnoses>
        </>
      )}

      <Link to={`/scripts/${script.id}/diagnoses/new`}>
        <IconButton>
          <AddIcon />
        </IconButton>
      </Link>
    </>
  );
}

Actions.propTypes = {
  selected: PropTypes.array.isRequired
};

export default params => <Actions {...params} />;
