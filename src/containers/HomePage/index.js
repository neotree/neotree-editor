import React from 'react';
import { Redirect } from 'react-router-dom';

const HomePage = () => {
  return (
    <>
      <Redirect to="/scripts" />
    </>
  );
};

export default HomePage;
