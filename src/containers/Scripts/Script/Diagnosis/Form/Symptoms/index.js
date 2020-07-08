import React from 'react';
import DataTable from '@/components/DataTable';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import { useDiagnosisContext } from '@/contexts/diagnosis';
import SymptomForm from './SymptomForm';
import SymptomRowActions from './SymptomRowActions';

function Symptoms() {
  const { setForm, state: { form }, } = useDiagnosisContext();

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

export default Symptoms;
