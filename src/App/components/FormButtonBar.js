import React, { Component } from 'react';

export default class FormButtonBar extends Component {
  render() {
    const { children, ...otherProps } = this.props;
    const styles = {
      bar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: '16px',
        marginBottom: '8px'
      }
    };
    return (
      <div style={styles.bar} {...otherProps}>{children}</div>
    );
  }
}
