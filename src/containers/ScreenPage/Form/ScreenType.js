import React from 'react';
import PropTypes from 'prop-types';
import Collapse from '@material-ui/core/Collapse';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import { ScreenTypes } from '@/constants/types';
import Title from './Title';

function ScreenType({ setForm, form }) {
  const [type, setType] = React.useState('');

  return (
    <>
      <Collapse in={!form.type}>
        <div>
          <Title>Screen type</Title>

          <RadioGroup name="type" value={type} onChange={e => setType(e.target.value)}>
            {ScreenTypes.map(t => (
              <FormControlLabel
                key={t.name}
                value={t.name}
                control={<Radio />}
                label={t.label}
              />
            ))}
          </RadioGroup>

          <br />

          <div style={{ textAlign: 'right' }}>
            <Button
              color="primary"
              disabled={!type}
              onClick={() => setForm({ type })}
            >
              Continue
            </Button>
          </div>
        </div>
      </Collapse>
    </>
  );
}

ScreenType.propTypes = {
  screen: PropTypes.object,
  script: PropTypes.object,
  form: PropTypes.object,
  setForm: PropTypes.func,
};

export default ScreenType;
