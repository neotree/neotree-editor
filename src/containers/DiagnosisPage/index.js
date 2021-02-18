/* global fetch, alert */
import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import diagnosesCopy from '@/constants/copy/diagnoses';
import scritpsCopy from '@/constants/copy/scripts';
import OverlayLoader from '@/components/OverlayLoader';
import { setDocumentTitle } from '@/AppContext';
import Form from './Form';

function Diagnosis() {
  const { scriptId, diagnosisId } = useParams();
  const [diagnosis, setDiagnosis] = React.useState(null);
  const [script, setScript] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/get-script?scriptId=${scriptId}`);
        const { script } = await res.json();
        setScript(script);
      } catch (e) { /* DO NOTHING */ }

      if (diagnosisId !== 'new') {
        try {
          const res = await fetch(`/get-diagnosis?id=${diagnosisId}`);
          const { diagnosis } = await res.json();
          setDiagnosis(diagnosis);
        } catch (e) { alert(e.message); }
      }

      setLoading(false);
    })();
  }, []);

  const titleChunks = !script ? [] : [
    scritpsCopy.PAGE_TITLE,
    script.title,
    diagnosesCopy.PAGE_TITLE,
    diagnosis ? diagnosis.title : loading ? '' : 'New diagnosis',
  ].filter(c => c);
  setDocumentTitle(titleChunks.join(' > '));

  if (loading) return <OverlayLoader transparent />;

  return (
    <>
      <Form
        script={script}
        diagnosis={diagnosis}
      />
    </>
  );
}

Diagnosis.propTypes = {
  script: PropTypes.object,
};

export default Diagnosis;
