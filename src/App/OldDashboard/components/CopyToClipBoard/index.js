/* global document */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { MdContentCopy } from 'react-icons/md';
import reduxComponent from 'reduxComponent';
import './index.scss';

class CopyToClipBoard extends React.Component {
  onCopy = () => {
    this.input.select();
    document.execCommand('copy');
  };

  render() {
    const {
      className,
      data,
      host,
      children,
      ...props
    } = this.props;

    return (
      <div
        {...props}
        className={cx(className, 'ui__copyToClipBoard')}
        style={Object.assign({}, props.style, { position: 'relative' })}
      >
        <input
          ref={el => (this.input = el)}
          value={JSON.stringify({ neotree: { data, host } })}
          // disabled
          style={{ position: 'absolute', zIndex: -1 }}
        />
        <div onClick={this.onCopy} className="ui__copyToClipBoardBtn">
          {children || <MdContentCopy />}
        </div>
      </div>
    );
  }
}

CopyToClipBoard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  data: PropTypes.string.isRequired,
  style: PropTypes.object,
  host: PropTypes.string.isRequired
};

export default reduxComponent(CopyToClipBoard, state => ({
  host: state.$APP.host
}));
