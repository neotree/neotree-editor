import React from 'react';
import copy from '@/constants/copy/diagnoses';
import { setHeaderTitle } from '@/components/Layout';
import { setDocumentTitle } from '@/contexts/app';
import { provideDiagnosesContext, useDiagnosesContext } from '@/contexts/diagnoses';
import DataTable from '@/components/DataTable';
import OverlayLoader from '@/components/OverlayLoader';
import CircularProgress from '@material-ui/core/CircularProgress';

const DiagnosesList = () => {
  setDocumentTitle(copy.PAGE_TITLE);
  setHeaderTitle(copy.PAGE_TITLE);

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
            title={copy.PAGE_TITLE}
            data={diagnoses}
            renderHeaderActions={require('./_renderHeaderActions').default}
            renderRowAction={require('./_renderRowAction').default}
            displayFields={[
              { key: 'name', label: 'Name', },
              { key: 'description', label: 'Description', }
            ]}
            onSortData={diagnoses => {
              setState({ diagnoses });
              updateDiagnoses(diagnoses.map(s => ({
                id: s.id,
                position: s.position
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
