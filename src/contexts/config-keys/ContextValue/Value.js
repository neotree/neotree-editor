import * as defaults from './_defaults';

export { defaults };

export default class ContextValue {
  constructor(params) {
    this.defaults = defaults;
    this.init(params);
  }

  setState = s => this._setState(prevState => ({
    ...prevState,
    ...(typeof s === 'function' ? s(prevState) : s)
  }));

  init = require('./_init').default.bind(this);

  deleteConfigKeys = require('./_deleteConfigKeys').default.bind(this);

  duplicateConfigKeys = require('./_duplicateConfigKeys').default.bind(this);

  getConfigKeys = require('./_getConfigKeys').default.bind(this);

  saveConfigKey = require('./_saveConfigKey').default.bind(this);

  updateConfigKeys = require('./_updateConfigKeys').default.bind(this);
}
