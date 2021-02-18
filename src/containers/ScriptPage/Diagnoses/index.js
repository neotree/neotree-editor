/* global fetch, alert */
import React from 'react';
import { useParams } from 'react-router-dom';
import DataTable from '@/components/DataTable';
import CircularProgress from '@material-ui/core/CircularProgress';
import copy from '@/constants/copy/diagnoses';
import { useAppContext } from '@/AppContext';

const DiagnosesList = () => {
  const { state: { viewMode } } = useAppContext();
  const { scriptId } = useParams();

  const [diagnoses, setDiagnoses] = React.useState([]);
  const [diagnosesInitialised, setDiagnosesInitialised] = React.useState(false);
  const [loadingDiagnoses, setLoadingDiagnoses] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setLoadingDiagnoses(true);
      try {
        const res = await fetch(`/get-diagnoses?scriptId=${scriptId}`);
        const { diagnoses } = await res.json();
        setDiagnoses(diagnoses);
      } catch (e) { alert(e.message); }
      setDiagnosesInitialised(true);
      setLoadingDiagnoses(false);
    })();
  }, []);

  return (
    <>
      {!diagnosesInitialised ? null : (
        <>
          <DataTable
            selectable={viewMode !== 'view'}
            noDataMsg="No diagnoses"
            title={copy.PAGE_TITLE}
            data={diagnoses}
            renderHeaderActions={viewMode === 'view' ? null : require('./_renderHeaderActions').default}
            renderRowAction={require('./_renderRowAction').default}
            displayFields={[
              { key: 'position', label: 'Position', render: ({ row }) => row.position, },
              { key: 'name', label: 'Name', },
              { key: 'description', label: 'Description', }
            ]}
            onSortData={viewMode === 'view' ? undefined : diagnoses => {
              setDiagnoses(diagnoses);
              (async () => {
                try {
                  const res = await fetch('/update-diagnoses', {
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                    body: JSON.stringify({ diagnoses: diagnoses.map(s => ({ id: s.id, position: s.position })) }),
                  });
                  await res.json();
                } catch (e) { /* Do nothing */ }
              })();
            }}
          />
        </>
      )}

      {loadingDiagnoses && (
        <div style={{ margin: 25, textAlign: 'center' }}>
          <CircularProgress />
        </div>
      )}
    </>
  );
};

export default DiagnosesList;
