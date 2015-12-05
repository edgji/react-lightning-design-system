import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import moment from 'moment';
import FormElement from './FormElement';
import Input from './Input';
import Icon from './Icon';
import Datepicker from './Datepicker';

export default class DateInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { opened: (props.defaultOpened || false) };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.onValueChange && prevState.value !== this.state.value) {
      this.props.onValueChange(this.state.value, prevState.value);
    }
  }

  onDateIconClick() {
    setTimeout(() => {
      this.showDatepicker();
    }, 10);
  }

  onInputKeyDown(e) {
    if (e.keyCode === 13) { // return key
      e.preventDefault();
      e.stopPropagation();
      this.setValueFromInput(e.target.value);
      if (this.props.onComplete) {
        setTimeout(() => {
          this.props.onComplete();
        }, 10);
      }
    } else if (e.keyCode === 40) { // down key
      this.showDatepicker();
      e.preventDefault();
      e.stopPropagation();
    }
    if (this.props.onKeyDown) {
      this.props.onKeyDown(e);
    }
  }

  onInputChange(e) {
    const inputValue = e.target.value;
    this.setState({ inputValue });
    if (this.props.onChange) {
      this.props.onChange(e, inputValue);
    }
  }

  setValueFromInput(inputValue) {
    let value = this.state.value;
    if (!inputValue) {
      value = '';
    } else {
      value = moment(inputValue, this.props.dateFormat);
      if (value.isValid()) {
        value = value.format('YYYY-MM-DD');
      } else {
        value = '';
      }
    }
    this.setState({ value, inputValue: undefined });
  }

  onInputBlur(e) {
    this.setValueFromInput(e.target.value);
    setTimeout(() => {
      if (!this.isFocusedInComponent()) {
        if (this.props.onBlur) {
          this.props.onBlur();
        }
        if (this.props.onComplete) {
          this.props.onComplete();
        }
      }
    }, 10);
  }

  isFocusedInComponent() {
    const rootEl = ReactDOM.findDOMNode(this);
    let targetEl = document.activeElement;
    while (targetEl && targetEl !== rootEl) {
      targetEl = targetEl.parentNode;
    }
    return !!targetEl;
  }

  showDatepicker() {
    let value = this.state.value;
    if (typeof this.state.inputValue !== 'undefined') {
      value = moment(this.state.inputValue, this.props.dateFormat);
      if (value.isValid()) {
        value = value.format('YYYY-MM-DD');
      } else {
        value = this.state.value;
      }
    }
    this.setState({ opened: true, value });
  }

  onDatepickerSelect(value) {
    console.log('date value=', value);
    const oldValue = this.state.value;
    this.setState({ value, inputValue: undefined });
    setTimeout(() => {
      this.setState({ opened: false });
      const inputEl = React.findDOMNode(this.refs.input);
      if (inputEl) { inputEl.focus(); }
      if (this.props.onComplete) {
        this.props.onComplete();
      }
    }, 200);
  }

  onDatepickerBlur(e) {
    this.setState({ opened: false });
    if (this.props.onBlur) {
      setTimeout(() => {
        if (!this.isFocusedInComponent()) {
          this.props.onBlur(e);
        }
      }, 10);
    }
  }

  onDatepickerClose() {
    this.setState({ opened: false });
    React.findDOMNode(this.refs.input).focus();
  }

  render() {
    const { totalCols, cols, label, defaultValue, value, dateFormat, onChange, onKeyDown, onBlur, ...props } = this.props;
    const dateValue =
      typeof value !== 'undefined' ? value :
      typeof this.state.value !== 'undefined' ? this.state.value :
      defaultValue;
    const mvalue = moment(dateValue, 'YYYY-MM-DD');
    const inputValue =
      typeof this.state.inputValue !== 'undefined' ? this.state.inputValue :
      typeof dateValue !== 'undefined' && mvalue.isValid() ? mvalue.format(dateFormat) :
      null;
    const dropdown = this.renderDropdown(dateValue);
    const formElemProps = { id: props.id, totalCols, cols, label, dropdown };
    return (
      <FormElement { ...formElemProps }>
        { this.renderInput({ inputValue, ...props }) }
      </FormElement>
    );
  }

  renderInput({ inputValue, ...props }) {
    return (
      <div className='slds-input-has-icon slds-input-has-icon--right'>
        <Input ref='input' value={ inputValue } { ...props }
          onKeyDown={ this.onInputKeyDown.bind(this) }
          onChange={ this.onInputChange.bind(this) }
          onBlur={ this.onInputBlur.bind(this) }
        />
        <Icon icon='event' className='slds-input__icon' style={ { cursor: 'pointer' } }
          onClick={ this.onDateIconClick.bind(this) }
        />
      </div>
    );
  }

  renderDropdown(dateValue) {
    const datepickerClassNames = classnames(
      'slds-dropdown',
      'slds-dropdown--left'
    );
    return (
      this.state.opened ?
      <Datepicker className={ datepickerClassNames } selectedDate={ dateValue } autoFocus={ true }
        onSelect={ this.onDatepickerSelect.bind(this) }
        onBlur={ this.onDatepickerBlur.bind(this) }
        onClose={ this.onDatepickerClose.bind(this) }
      /> :
      <div />
    );
  }
}

DateInput.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  defaultOpened: PropTypes.bool,
  dateFormat: PropTypes.string,
  onChange: PropTypes.func,
  onValueChange: PropTypes.func,
  onComplete: PropTypes.func,
};

DateInput.defaultProps = {
  dateFormat: 'L'
};

DateInput.isFormElement = true;
