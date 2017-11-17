import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';

function equalUndefined(object, other) {
  const removeUndeinfedProp = obj => _.pickBy(obj, item => item !== undefined);
  return _.isEqual(removeUndeinfedProp(object), removeUndeinfedProp(other));
}

export default function createFormErrorsStore(WrappedFormComponent) {
  return class WithFieldsErrorStore extends Component {
    formInst = null;
    constructor(props) {
      super(props);
      this.state = {
        innerFormValue: this.getInnerFormValue({}, props.value || {})
      };
    }
    componentWillReceiveProps(nextProps) {
      const value = this.props.value;
      const nextValue = nextProps.value;
      if (_.isEqual(value, nextValue)) return;

      const innerFormValue = this.getInnerFormValue(value, nextValue);
      this.setState({ innerFormValue });
    }
    getInnerFormValue = (value, nextValue) => {
      const innerFormValue = this.state ? { ...this.state.innerFormValue } : {};
      const keys = _.union(Object.keys(value), Object.keys(nextValue));
      keys.forEach(key => {
        if (value[key] !== nextValue[key]) {
          innerFormValue[key] = { value: nextValue[key] };
        }
      });
      return innerFormValue;
    };
    validateFields = (...args) => {
      let opts = {};
      let callback;
      if (args.length === 2) {
        opts = args[0];
        callback = args[1];
      } else if (args.length === 1) {
        callback = args[0];
      }
      this.formInst.validateFieldsAndScroll(opts, (err, values) => {
        // console.log('createFormErrorsStore validate callbacked err: ', err);
        const retValues = _.mapValues(values, val => {
          if (val === undefined || val === null) return '';
          return val;
        });
        callback(err, retValues);
      });
    };
    handleFormValueChange = formValue => {
      this.setState({
        innerFormValue: formValue
      }, () => {
        const values = _.mapValues(formValue, val => val.value);
        if (!_.isEqual(values, this.props.value)) {
          this.props.onChange(values);
        }
      });
    };
    render() {
      const { value, onChange, ...restProps } = this.props;
      return (
        <WrappedFormComponent
          {...restProps}
          ref={formInst => this.formInst = formInst}
          value={this.state.innerFormValue}
          onChange={this.handleFormValueChange}
        />
      );
    }
  };
}
