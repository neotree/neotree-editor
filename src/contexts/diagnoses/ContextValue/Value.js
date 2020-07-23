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

  deleteDiagnoses = require('./_deleteDiagnoses').default.bind(this);

  duplicateDiagnoses = require('./_duplicateDiagnoses').default.bind(this);

  getDiagnoses = require('./_getDiagnoses').default.bind(this);

  updateDiagnoses = require('./_updateDiagnoses').default.bind(this);
}
