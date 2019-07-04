import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Context from './Context';
import './index.scss';

export class FilePicker extends React.Component {
  state = {
    files: [],
    open: false
  };

  updateState = (s, cb) => this.setState(s, cb);

  render() {
    const { toggler, children } = this.props;
    const { open } = this.state;

    return (
      <Context.Provider value={this}>
        <div className={cx('ui__filePicker')}>
          <div onClick={() => this.updateState({ open: !open })}>
            {toggler || children}
          </div>

          <div
            className={cx('ui__filePickerDisplay', {
              open
            })}
          >
            <div
              className={cx('ui__filePickerDisplayInner ui__shadow')}
            >

            </div>
          </div>
        </div>
      </Context.Provider>
    );
  }
}

FilePicker.propTypes = {
  onUpload: PropTypes.func,
  toggler: PropTypes.node,
  children: PropTypes.node
};

export default FilePicker;
