import React from 'react';
import { useScreenContext } from '@/contexts/screen';

export default function wrapMetadataFormItem(Component) {
  return function MetadataFormItem(props) {
    const { setForm, state: { form }, } = useScreenContext();

    const setMetadata = v => setForm(f => ({
      metadata: {
        ...f.metadata,
        ...v
      }
    }));

    return (
      <>
        <Component {...props} form={form} setMetadata={setMetadata} />
      </>
    );
  };
}
