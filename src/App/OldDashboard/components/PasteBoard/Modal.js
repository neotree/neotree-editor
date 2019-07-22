import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { withRouter } from 'react-router';
import { Dialog, DialogContent, DialogActions, Button } from 'react-mdl';
import Spinner from 'ui/Spinner';
import reduxComponent from 'reduxComponent';

export const validateData = data => {
  return new Promise((resolve, reject) => {
    if (data) {
      const invalidDataErr = 'Ooops! Seems like you pasted invalid content.';

      try {
        const obj = JSON.parse(data);
        if (!(obj.neotree && obj.neotree.data && obj.neotree.host)) {
          reject(invalidDataErr);
        } else {
          resolve(obj.neotree);
        }
      } catch (e) {
        reject(invalidDataErr);
      }
    } else {
      reject('No data copied to clipboard');
    }
  });
};

export class Modal extends React.Component {
  state = { content: '' };

  componentWillUpdate(nextProps) {
    if (nextProps.clipboardData !== this.props.clipboardData) {
      this.validateAndSave(nextProps.clipboardData);
    }
  }

  onClose = () => {
    this.setState({ error: null });
    this.props.onClose();
  };

  validateAndSave = content => {
    this.setState({ error: null });

    if (content) {
      const { actions, host, destination, history, redirectTo, onSuccess } = this.props;

      validateData(content)
        .then(({ data, ...source }) => {
          this.setState({ saving: true }, () => {
            actions.post('copy-data', {
              destination: { host, ...destination },
              source: { ...source, ...JSON.parse(data) },
              onResponse: () => this.setState({ saving: false }),
              onFailure: error => this.setState({ error }),
              onSuccess: ({ payload }) => {
                history.push(redirectTo(payload));
                if (onSuccess) onSuccess(payload);
              }
            });
          });
        }).catch(error => this.setState({
          error: { msg: error.msg || error.message || JSON.stringify(error) }
        }));
    }
  };

  render() {
    const { open } = this.props;
    const { saving, content, error } = this.state;

    return (
      <Dialog open={open || false} style={{ width: '260px' }}>
        {saving ?
          <DialogContent>
            <div className={cx('ui__flex ui__alignItems_center ui__justifyContent_center')}>
              <Spinner />
            </div>
          </DialogContent>
          :
          <React.Fragment>
            <DialogContent
              className={cx('ui__flex ui__alignItems_center ui__justifyContent_center uiBg__faintGreyColor')}
              style={{ border: '1px dotted #ccc', position: 'relative' }}
            >
              <span>Paste here</span>
              <textarea
                autoFocus
                ref={el => (this.input = el)}
                onChange={e => this.validateAndSave(e.target.value)}
                value={content}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 10,
                  opacity: 0
                }}
              />
            </DialogContent>
            <DialogActions>
                {!error ? null : (
                  <span className="ui__dangerColor ui__smallFontSize" style={{ marginRight: 'auto' }}>
                    {error.msg || error.message || JSON.stringify(error)}
                  </span>
                )}
                <Button type='button' onClick={this.onClose}>Cancel</Button>
            </DialogActions>
          </React.Fragment>}
      </Dialog>
    );
  }
}

Modal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  options: PropTypes.object,
  actions: PropTypes.object.isRequired,
  destination: PropTypes.object.isRequired,
  host: PropTypes.string.isRequired,
  redirectTo: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default withRouter(reduxComponent(Modal, state => ({
  host: state.$APP.host
})));
