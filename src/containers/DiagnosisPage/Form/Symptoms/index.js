import React from 'react';
import PropTypes from 'prop-types';
import DataTable from '@/components/DataTable';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import SymptomForm from './SymptomForm';
import SymptomRowActions from './SymptomRowActions';

function Symptoms({ form, setForm }) {
  return (
    <>
      <DataTable
        selectable={false}
        noDataMsg="No signs/risks"
        title="Signs/Risks"
        data={form.symptoms}
        renderHeaderActions={() => (
          <SymptomForm
            form={form}
            onSave={symptom => setForm({ symptoms: [...form.symptoms, symptom] })}
          >
            <IconButton>
              <AddIcon />
            </IconButton>
          </SymptomForm>
        )}
        renderRowAction={(row, i) => (
          <SymptomRowActions
            row={row}
            form={form}
            rowIndex={i}
            setForm={setForm}
          />
        )}
        displayFields={[
          { key: 'type', label: 'Type', },
          { key: 'name', label: 'Name', },
       ]}
        onSortData={symptoms => {
          setForm({ symptoms });
        }}
      />
    </>
  );
}

Symptoms.propTypes = {
  form: PropTypes.object,
  setForm: PropTypes.func,
};

export default Symptoms;
