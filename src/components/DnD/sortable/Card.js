import React from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';

const style = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  cursor: 'move',
};

const Card = ({
  id,
  type,
  card,
  moveCard,
  findCard,
  cardRenderer,
  listId,
  removeCard,
}) => {
  const originalIndex = findCard(id).index;

  const [{ isDragging }, drag] = useDrag({
    item: {
      type,
      id,
      listId,
      originalIndex,
      data: card,
    },

    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),

    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      const { id: droppedId, originalIndex } = monitor.getItem();

      if (monitor.didDrop()) {
        if (dropResult.listId !== item.listId) removeCard(originalIndex);
      } else {
        moveCard(droppedId, originalIndex);
      }
    },
  });

  const [, drop] = useDrop({
    accept: type,

    canDrop: () => false,

    hover({ id: draggedId, listId: draggedContainerId }) {
      if (draggedId === id) return;

      if ((draggedContainerId === listId)) {
        const { index: overIndex } = findCard(id);
        moveCard(draggedId, overIndex);
      }
    },
  });

  const opacity = isDragging ? 0 : 1;

  return (
    <>
      <div
        ref={node => drag(drop(node))}
        style={{ ...style, opacity }}
      >
        {cardRenderer(card, { isDragging })}
      </div>
    </>
  );
};

Card.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  card: PropTypes.object.isRequired,
  moveCard: PropTypes.func.isRequired,
  removeCard: PropTypes.func.isRequired,
  findCard: PropTypes.func.isRequired,
  cardRenderer: PropTypes.func.isRequired,
  listId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default Card;
