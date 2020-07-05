import React from 'react';
import copy from '@/constants/copy/scripts';
import { setHeaderTitle } from '@/components/Layout';
import { setDocumentTitle } from '@/contexts/app';
import { provideScriptsContext, useScriptsContext } from '@/contexts/scripts';
import PageLoader from '@/components/PageLoader';
import DataTable from '@/components/DataTable';
import OverlayLoader from '@/components/OverlayLoader';

const ScriptsList = () => {
  setDocumentTitle(copy.PAGE_TITLE);
  setHeaderTitle(copy.PAGE_TITLE);

  const {
    state: {
      scripts,
      scriptsInitialised,
      loadingScripts,
      duplicatingScripts,
      deletingScripts,
    }
  } = useScriptsContext();

  return (
    <>
      {!scriptsInitialised ? null : (
        <>
          <DataTable
            selectable={false}
            title={copy.PAGE_TITLE}
            displayFields={[
              { key: 'title', label: 'Title', },
              { key: 'description', label: 'Description', }
            ]}
            data={scripts.map(s => ({ ...s, ...s.data }))}
            renderHeaderActions={require('./_renderHeaderActions').default}
            renderRowAction={require('./_renderRowAction').default}
          />
        </>
      )}

      {loadingScripts && <PageLoader />}
      {(deletingScripts || duplicatingScripts) ? <OverlayLoader /> : null}
    </>
  );
};

export default provideScriptsContext(ScriptsList);
