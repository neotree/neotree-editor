import React from 'react';
import { provideDiagnosesContext, useDiagnosesContext } from '@/contexts/diagnoses';
import DataTable from '@/components/DataTable';
import OverlayLoader from '@/components/OverlayLoader';
import CircularProgress from '@material-ui/core/CircularProgress';
import copy from '@/constants/copy/diagnoses';

const DiagnosesList = () => {
  const {
    updateDiagnoses,
    setState,
    state: {
      diagnoses,
      diagnosesInitialised,
      loadingDiagnoses,
      duplicatingDiagnoses,
      deletingDiagnoses,
    }
  } = useDiagnosesContext();

  return (
    <>
      {!diagnosesInitialised ? null : (
        <>
          <DataTable
            selectable
            noDataMsg="No diagnoses"
            title={copy.PAGE_TITLE}
            data={diagnoses}
            renderHeaderActions={require('./_renderHeaderActions').default}
            renderRowAction={require('./_renderRowAction').default}
            displayFields={[
              { key: 'position', label: 'Position', render: ({ row }) => row.position, },
              { key: 'name', label: 'Name', },
              { key: 'description', label: 'Description', }
            ]}
            onSortData={diagnoses => {
              setState({ diagnoses });
              updateDiagnoses(diagnoses.map(s => ({
                diagnosisId: s.diagnosisId,
                scriptId: s.scriptId,
                position: s.position,
              })));
            }}
          />
        </>
      )}

      {loadingDiagnoses && (
        <div style={{ margin: 25, textAlign: 'center' }}>
          <CircularProgress />
        </div>
      )}
      {(deletingDiagnoses || duplicatingDiagnoses) ? <OverlayLoader /> : null}
    </>
  );
};

export default provideDiagnosesContext(DiagnosesList);
