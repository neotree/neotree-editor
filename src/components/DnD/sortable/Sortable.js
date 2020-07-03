import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { useDrop } from 'react-dnd';
import Card from './Card';

const Sortable = ({
  list,
  name,
  renderListItem,
  listId
}) => {
  const [cards, setCards] = React.useState(list);

  React.useEffect(() => { setCards(list); }, [list]);

  const findCard = (id) => {
    const card = cards.filter((c) => `${c.id}` === id)[0];
    return {
      card,
      index: cards.indexOf(card),
    };
  };

  const moveCard = (id, atIndex) => {
    const { card, index } = findCard(id);
    setCards(
      update(cards, {
        $splice: [
          [index, 1],
          [atIndex, 0, card],
        ],
      }),
    );
  };

  const pushCard = card => setCards(update(cards, { $push: [card] }));

  const removeCard = index => setCards(cards => cards.filter((c, i) => i !== index));

  const [, drop] = useDrop({
    accept: name,

    drop: item => {
      if (item.listId !== listId) pushCard(item.data);
      return { listId };
    },
  });

  return (
    <>
      <div ref={drop}>
        {cards.map((card) => (
          <Card
            key={card.id}
            id={`${card.id}`}
            type={name}
            card={card}
            moveCard={moveCard}
            removeCard={removeCard}
            findCard={findCard}
            cardRenderer={renderListItem}
            listId={listId}
          />
        ))}
      </div>
    </>
  );
};

Sortable.propTypes = {
  name: PropTypes.string.isRequired,
  renderListItem: PropTypes.func.isRequired,
  listId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  list: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  })).isRequired
};

export default Sortable;
