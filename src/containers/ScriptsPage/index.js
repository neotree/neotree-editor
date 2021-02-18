/* global fetch, alert */
import React from 'react';
import { setDocumentTitle, setNavSection, useAppContext } from '@/AppContext';
import PageLoader from '@/components/PageLoader';
import DataTable from '@/components/DataTable';
import copy from '@/constants/copy/scripts';

const Scripts = () => {
  const { state: { viewMode } } = useAppContext();
  setNavSection('scripts');
  setDocumentTitle(copy.PAGE_TITLE);

  const [scripts, setScripts] = React.useState([]);
  const [scriptsInitialised, setScriptsInitialised] = React.useState(false);
  const [loadingScripts, setLoadingScripts] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setLoadingScripts(true);
      try {
        const res = await fetch('/get-scripts');
        const { scripts } = await res.json();
        setScripts(scripts);
      } catch (e) { alert(e.message); }
      setScriptsInitialised(true);
      setLoadingScripts(false);
    })();
  }, []);

  return (
    <>
      {!scriptsInitialised ? null : (
        <>
          <DataTable
            noDataMsg="No scripts"
            selectable={false}
            title={copy.PAGE_TITLE}
            data={scripts}
            renderHeaderActions={viewMode === 'view' ? null : require('./_renderHeaderActions').default}
            renderRowAction={require('./_renderRowAction').default}
            displayFields={[
              { key: 'position', label: 'Position', render: ({ rowIndex }) => rowIndex + 1, },
              { key: 'title', label: 'Title', },
              { key: 'description', label: 'Description', }
            ]}
            onSortData={viewMode === 'view' ? undefined : scripts => {
              setScripts(scripts);
              (async () => {
                try {
                  const res = await fetch('/update-scripts', {
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                    body: JSON.stringify({ scripts: scripts.map(s => ({ id: s.id, position: s.position })) }),
                  });
                  await res.json();
                } catch (e) { /* Do nothing */ }
              })();
            }}
          />
        </>
      )}

      {loadingScripts && <PageLoader />}
    </>
  );
};

export default Scripts;
