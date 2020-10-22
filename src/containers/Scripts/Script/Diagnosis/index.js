import React from 'react';
import { provideDiagnosisContext, useDiagnosisContext } from '@/contexts/diagnosis';
import { useScriptContext } from '@/contexts/script';
import diagnosesCopy from '@/constants/copy/diagnoses';
import scritpsCopy from '@/constants/copy/scripts';
import { setHeaderTitle } from '@/components/Layout';
import { setDocumentTitle } from '@/contexts/app';
import OverlayLoader from '@/components/OverlayLoader';
import Form from './Form';

function Diagnosis() {
  const { state: { script } } = useScriptContext();
  const { isFormReady, state: { diagnosis, loadingDiagnosis, savingDiagnosis, } } = useDiagnosisContext();

  const titleChunks = !script ? [] : [
    scritpsCopy.PAGE_TITLE,
    script.title,
    diagnosesCopy.PAGE_TITLE,
    diagnosis ? diagnosis.title : loadingDiagnosis ? '' : 'New diagnosis',
  ].filter(c => c);

  setDocumentTitle(titleChunks.join(' > '));
  setHeaderTitle(titleChunks.join(' / '));

  if (!isFormReady()) return <OverlayLoader transparent />;

  return (
    <>
      <Form />
      {(loadingDiagnosis && savingDiagnosis) ? <OverlayLoader /> : null}
    </>
  );
}

export default provideDiagnosisContext(Diagnosis);
