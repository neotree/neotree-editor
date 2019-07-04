import React from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox } from 'react-mdl';
import Context from './Context';
import Spinner from 'ui/Spinner'; // eslint-disable-line

export class ExportSection extends React.Component {
  state = {
    fields: {
      scripts: {
        screens: true,
        diagnoses: true
      },
      config_keys: true
    }
  };

  updateExportFields = (field, subField) => {
    const fields = Object.assign({}, this.state.fields);
     if (subField) {
      fields[field][subField] = !fields[field][subField];
    } else if (typeof fields[field] === 'object') {
      Object.keys(fields[field]).forEach(key => {
        fields[field][key] = !fields[field][key];
      });
    } else {
      fields[field] = !fields[field];
    }
    this.setState({ fields });
  };

  render() {
    return (
      <Context.Consumer>
        {() => {
          const { error, exportingData } = this.state;

          const renderCheckboxes = (fields = this.state.fields, parent) => {
            return Object.keys(fields).map(f => {
              const isChecked = () => Object.keys(fields[f])
                .filter(subField => !fields[f][subField])
                .length ? false : true;
              const checked = typeof fields[f] === 'boolean' ?
                fields[f] : isChecked();
                return (
                  <div
                    key={f}
                    style={{ textAlign: 'left', textTransform: 'capitalize' }}
                  >
                    <div>
                      <Checkbox
                        name={f}
                        checked={checked}
                        label={f.replace(/[^0-9a-z]/gi, ' ')}
                        onChange={() => this.updateExportFields(parent || f, parent ? f : null)}
                      />
                    </div>
                    {typeof fields[f] === 'object' && (
                      <div style={{ padding: '0 5px' }}>
                        {renderCheckboxes(fields[f], f)}
                      </div>
                    )}
                  </div>
                );
            });
          };

          return (
            <div>
              {error ? (
                <div
                  className="ui__dangerColor"
                >{error.msg || error.message || JSON.stringify(error)}</div>
              ) : (
                <div>
                  {exportingData ?
                    <Spinner className="ui__flex ui__justifyContent_center" />
                    :
                    (
                      <div>
                        {renderCheckboxes()}
                        <br />
                        <Button raised accent ripple>Start exporting</Button>
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        }}
      </Context.Consumer>
    );
  }
}

ExportSection.propTypes = {
  actions: PropTypes.object.isRequired,
  host: PropTypes.string.isRequired
};

export default ExportSection;
