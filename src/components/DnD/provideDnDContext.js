import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import isMobileOrTablet from './isMobileOrTablet';

export default function provideDnDContext(Component) {
  return function DnD(props) {
    return (
      <DndProvider
        backend={isMobileOrTablet() ? TouchBackend : HTML5Backend}
      >
        <Component {...props} />
      </DndProvider>
    );
  };
}
