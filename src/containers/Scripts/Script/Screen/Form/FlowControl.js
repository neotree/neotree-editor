import React from 'react';
import { useScreenContext } from '@/contexts/screen';
import TextField from '@material-ui/core/TextField';
import Title from './Title';

function FlowControl() {
  const { setForm, state: { form }, } = useScreenContext();

  return (
    <>
      <Title>FLOW CONTROL</Title>

      <div>
        <TextField
          fullWidth
          value={form.condition || ''}
          label="Conditional expression"
          onChange={e => setForm({ condition: e.target.value })}
        />
      </div>

      <br />
    </>
  );
}

export default FlowControl;
