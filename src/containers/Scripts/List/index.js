import React from 'react';
import copy from '@/constants/copy/scripts';
import { setHeaderTitle } from '@/components/Layout';
import { setDocumentTitle } from '@/contexts/app';
import { provideScriptsContext, useScriptsContext } from '@/contexts/scripts';
import PageLoader from '@/components/PageLoader';
import DataTable from '@/components/DataTable';

const ScriptsList = () => {
  setDocumentTitle(copy.PAGE_TITLE);
  setHeaderTitle(copy.PAGE_TITLE);

  const { state: { scripts, scriptsInitialised, loadingScripts } } = useScriptsContext();

  return (
    <>
      {!scriptsInitialised ? null : (
        <>
          <DataTable
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
    </>
  );
};

export default provideScriptsContext(ScriptsList);
