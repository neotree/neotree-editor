/* global window */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal, { validateData } from './Modal';

class PasteBoard extends Component {
  state = {};

  componentDidMount() {
    window.addEventListener('paste', this.onPaste, true);
  }

  componentWillUnmount() {
    window.removeEventListener('paste', this.onPaste, true);
  }

  onPaste = e => {
    const data = e.clipboardData.getData('text/plain');
    validateData(data)
      .then(() => this.setState({
        togglePasteBoard: true,
        clipboardData: data
      }));
  };

  render() {
    const { children, modal, data, redirectTo, onSuccess } = this.props;

    return (
      <div>
        {children}
        <Modal
          {...modal}
          onSuccess={onSuccess}
          clipboardData={this.state.clipboardData}
          destination={data}
          redirectTo={redirectTo}
        />
      </div>
    );
  }
}

PasteBoard.propTypes = {
  children: PropTypes.node,
  modal: PropTypes.shape({
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool,
  }).isRequired,
  data: PropTypes.shape({
    dataId: PropTypes.string,
    dataType: PropTypes.string,
  }).isRequired,
  redirectTo: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default PasteBoard;
