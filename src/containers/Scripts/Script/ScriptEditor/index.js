import React from 'react';
import { useScriptContext } from '@/contexts/script';
import copy from '@/constants/copy/scripts';
import { setHeaderTitle } from '@/components/Layout';
import { setDocumentTitle } from '@/contexts/app';
import OverlayLoader from '@/components/OverlayLoader';
import Items from './Items';
import Form from './Form';

function ScriptEditor() {
  const { isFormReady, state: { script, loadingScript, savingScript } } = useScriptContext();

  setDocumentTitle(`${copy.PAGE_TITLE}${script ? `: ${script.data.title}` : ''}`);
  setHeaderTitle(`${copy.PAGE_TITLE}${script ? ` / ${script.data.title}` : ` / ${loadingScript ? '' : 'New script'}`}`);

  if (!isFormReady()) return <OverlayLoader />;

  return (
    <>
      <Form />
      <br />
      <Items />
      {(savingScript && loadingScript) ? <OverlayLoader /> : null}
    </>
  );
}

export default ScriptEditor;
