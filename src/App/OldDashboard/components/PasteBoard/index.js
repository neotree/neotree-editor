import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Dialog, DialogContent, DialogActions, Button } from 'react-mdl';
import Spinner from 'ui/Spinner';
import reduxComponent from 'reduxComponent';

export class PasteBoard extends React.Component {
  state = { content: '' };

  onChange = e => {
    const content = e.target.value;
    this.setState({ error: null });

    if (content) {
      const { actions, host, destination } = this.props;
      const invalidDataErr = 'Ooops! Seems like you pasted invalid content.';

      try {
        const obj = JSON.parse(content);
        if (!(obj.neotree && obj.neotree.data && obj.neotree.host)) throw new Error(invalidDataErr);

        const { data, ...source } = obj.neotree;

        this.setState({ saving: true }, () => {
          actions.post('copy-data', {
            destination: { host, ...destination },
            source: { ...source, ...JSON.parse(data) },
            onResponse: () => this.setState({ saving: false }),
            onFailure: error => this.setState({ error }),
            onSuccess: ({ payload }) => console.log(payload)
          });
        });
      } catch (e) {
        this.setState({ error: { msg: invalidDataErr } });
      }
    }
  };

  onClose = () => {
    this.setState({ error: null });
    this.props.onClose();
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
                onChange={this.onChange}
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

PasteBoard.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  options: PropTypes.object,
  actions: PropTypes.func.isRequired,
  destination: PropTypes.func.isRequired,
  host: PropTypes.string.isRequired
};

export default reduxComponent(PasteBoard, state => ({
  host: state.$APP.host
}));
