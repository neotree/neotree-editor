import React from 'react';
import { provideAppContext } from '@/contexts/app';
import { LayoutRoot } from '@/components/Layout';
import renderDocumentTitle from '@/components/renderDocumentTitle';
import Containers from './containers';

const App = () => {
  return (
    <>
      {renderDocumentTitle()}
      <LayoutRoot>
        <Containers />
      </LayoutRoot>
    </>
  );
};

App.propTypes = {};

export default provideAppContext(App);
