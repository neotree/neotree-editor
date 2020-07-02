import React from 'react';
import { useLayoutContext } from './Context';

export default function setHeaderTitle(t) {
  const { setState } = useLayoutContext();

  React.useEffect(() => {
    setState({ HEADER_TITLE: t });
    return () => setState({ HEADER_TITLE: null });
  }, [t]);
}
