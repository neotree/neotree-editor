import React from 'react';
import copy from '@/constants/copy/scripts';
import { setHeaderTitle } from '@/components/Layout';
import { setDocumentTitle } from '@/contexts/app';
import { provideScriptsContext, useScriptsContext } from '@/contexts/scripts';
import PageLoader from '@/components/PageLoader';
import DataTable from '@/components/DataTable';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';

const Scripts = () => {
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
            renderHeaderActions={({ selected }) => {
              return (
                <>
                  {selected.length > 0 && (
                    <>
                      <Button>Copy</Button>

                      <IconButton>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}

                  <IconButton>
                    <AddIcon />
                  </IconButton>
                </>
              );
            }}
          />
        </>
      )}

      {loadingScripts && <PageLoader />}
    </>
  );
};

export default provideScriptsContext(Scripts);
