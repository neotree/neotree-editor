/* global localStorage */
import Api from 'AppUtils/Api';
import createSharedState from '../createSharedState';

const actions = (() => {
  const UPDATE = 'UPDATE';
  const updateState = partialState => ({ type: UPDATE, partialState });

  const getClipboardData = () => {
    try {
      return JSON.parse(localStorage.getItem('neotree__clipboard'));
    } catch (e) {
      return null;
    }
  };

  return {
    UPDATE,

    updateState,

    getClipboardData,

    copyToClipboard: data => {
      try {
        data = JSON.parse(data);
      } catch (e) {
        // do nothing
      }
      localStorage.setItem('neotree__clipboard', JSON.stringify(data));
    },

    pasteClipboardData: (destination, cb) => new Promise((resolve, reject) => {
      const clipboard = getClipboardData();

      if (clipboard) {
        const { data, ...source } = clipboard;

        Api.post('/copy-data', {
          destination: destination,
          source: { ...data, ...source },
        }).then(response => {
          localStorage.removeItem('neotree__clipboard');
          return cb ? cb(null, response) : resolve(response);
        })
          .catch(cb || reject);
      } else {
        const err = { error: 'No data to paste' };
        return cb ? cb(err) : reject(err);
      }
    })
  };
})();

const initialState = {};

const reducer = (state = initialState, action) => {
  if (action.type === actions.UPDATE) {
    const newState = { ...state };
    return {
      ...state,
      ...(typeof action.partialState === 'function' ?
        action.partialState(newState) : action.partialState)
    };
  }
  return state;
};

export default createSharedState(reducer, initialState, actions);
