import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { findDOMNode } from 'react-dom';
import { isElInChildren } from './util';

export const PopoverHeader = (props) => (
  <div className='slds-popover__header'>
    {props.children}
  </div>
);

PopoverHeader.propTypes = {
  children: PropTypes.node,
};

export const PopoverBody = (props) => (
  <div className='slds-popover__body' {...props}>
    {props.children}
  </div>
);

PopoverBody.propTypes = {
  children: PropTypes.node,
};

export default class Popover extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hidden: props.hidden,
    };

    this.documentClick = this.documentClick.bind(this);

    this.isMouseEntered = false;
  }
  componentDidMount() {
    if (this.props.trigger) {
      document.addEventListener('click', this.documentClick);
    }
  }
  componentWillUnmount() {
    if (this.props.trigger) {
      document.removeEventListener('click', this.documentClick);
    }
  }

  onMouseEnter() {
    this.isMouseEntered = true;
  }
  onMouseLeave() {
    if (!this.props.hover) return;
    this.isMouseEntered = false;
    this.toggle(false);
  }
  documentClick(e) {
    let triggerEl;
    const { trigger } = this.props;
    if (trigger) {
      const triggerElement = trigger();
      if (triggerElement && triggerElement.isReactComponent) {
        triggerEl = findDOMNode(triggerElement);
      } else {
        triggerEl = triggerElement;
      }
    }
    if (this.state.hidden || (triggerEl && isElInChildren(triggerEl, e.target))) return;
    const rootEl = findDOMNode(this);
    if (!isElInChildren(rootEl, e.target)) {
      this.setState({
        hidden: true,
      });
    }
  }

  toggle(value) {
    this.setState({
      hidden: typeof value !== 'undefined' ? !value : !this.state.hidden,
    });
  }
  mouseEntered() {
    return this.isMouseEntered;
  }
  hidden() {
    return this.state.hidden;
  }
  render() {
    const { children, position, theme, tooltip, bodyStyle, ...pprops } = this.props;
    const popoverClassNames = classnames(
      'slds-popover',
      {
        'slds-hide': this.state.hidden,
        'slds-popover--tooltip': tooltip,
        [`slds-nubbin--${position}`]: position,
        [`slds-theme--${theme}`]: theme,
      }
    );
    return (
      <div
        onMouseEnter={this.onMouseEnter.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        className={popoverClassNames}
        role='dialog'
        {...pprops}
      >
        <PopoverBody style={bodyStyle}>{children}</PopoverBody>
      </div>
    );
  }
}

const POPOVER_POSITIONS = [
  'top', 'top-left', 'top-right',
  'bottom', 'bottom-left', 'bottom-right',
  'left', 'left-top', 'left-bottom',
  'right', 'right-top', 'right-bottom',
];

const POPOVER_THEMES = ['info', 'success', 'warning', 'error'];

Popover.propTypes = {
  position: PropTypes.oneOf(POPOVER_POSITIONS),
  hidden: PropTypes.bool,
  theme: PropTypes.oneOf(POPOVER_THEMES),
  tooltip: PropTypes.bool,
  children: PropTypes.node,
  hover: PropTypes.bool,
  trigger: PropTypes.func,
  bodyStyle: PropTypes.object,
};

Popover.defaultProps = {
  hidden: true,
};
