import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Title from '../Title';
import LayoutHeaderSection from './HeaderSection';
import Context from '../Context';
import './index.scss';

export class LayoutHeader extends React.Component {
  render() {
    const {
      className,
      children,
      title,
      ...props
    } = this.props;

    return (
      <Context.Consumer>
        {({ withLayoutSidebar }) => (
          <div
            {...props}
            className={cx(className, 'ui__layoutHeader ui__shadow', {
              'ui__flex ui__alignItems_center': true
            })}
          >
            <Title
              title={title}
              withLayoutSidebar={withLayoutSidebar}
              className="ui__layoutHeaderItem"
            />

            {React.Children.map(children, child => {
              if (child && (`${child.type}` === `${LayoutHeaderSection}`)) {
                return React.cloneElement(child, {
                  className: cx(child.props.className, 'ui__layoutHeaderItem')
                });
              }
            })}
          </div>
        )}
      </Context.Consumer>
    );
  }
}

LayoutHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  title: PropTypes.node
};

export { LayoutHeaderSection };
export default LayoutHeader;
