import React from 'react';
import { provideAppContext } from '@/contexts/app';
import Containers from './containers';

const App = () => {
  return (
    <>
      <Containers />
    </>
  );
};

App.propTypes = {};

export default provideAppContext(App);
