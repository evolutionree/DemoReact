import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';
import { is } from 'immutable';
import { encryptPasswordSync } from '../../services/authentication';

function equalUndefined(object, other) {
  const removeUndeinfedProp = obj => _.pickBy(obj, item => item !== undefined);
  return _.isEqual(removeUndeinfedProp(object), removeUndeinfedProp(other));
}

export default function createFormErrorsStore(WrappedFormComponent, isTable) {
  return class WithFieldsErrorStore extends Component {
    formInst = null;
    formRef = null;
    constructor(props) {
      super(props);
      this.state = {
        innerFormValue: this.getInnerFormValue({}, props.value || {})
      };
    }

    componentWillReceiveProps(nextProps) {
      const value = this.props.value;
      const nextValue = nextProps.value;
      const { innerFormValue: stateValue } = this.state;
      if (_.isEqual(value, nextValue)) return;

      const innerFormValue = this.getInnerFormValue(value, nextValue);
      let isChanged = false;

      for (const key in innerFormValue) {
        if (stateValue[key] && !is(stateValue[key].value, innerFormValue[key].value)) {
          isChanged = true;
          break;
        }
      }
      if (Object.keys(stateValue).length !== Object.keys(innerFormValue).length) isChanged = true;
      if (isChanged === false) return;
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
    }

    processRetValues = values => {
      const result = _.cloneDeep(values);
      const { fields } = this.props;
      fields.forEach(field => {
        const { controltype, fieldconfig, fieldname } = field;
        if (!result[fieldname]) return;
        if (controltype === 1 && fieldconfig && fieldconfig.encrypted) {
          result[fieldname] = encryptPasswordSync(result[fieldname]) || result[fieldname];
        }
      });
      return result;
    }

    validateFields = (...args) => {
      let opts = {};
      let callback;
      if (args.length === 2) {
        opts = args[0];
        callback = args[1];
      } else if (args.length === 1) {
        callback = args[0];
      }
      const formRef = this.formRef;
      // if (isTable) {
      //   this.formInst.validateFieldsAndScroll(opts, (err, values) => {
      //     // console.log('createFormErrorsStore validate callbacked err: ', err);
      //     const retValues = _.mapValues(values, val => {
      //       if (val === undefined || val === null) return '';
      //       return val;
      //     });
      //     callback(err, this.processRetValues(retValues));
      //   });
      // } else {
      this.formInst.validateFieldsAndScroll(opts, (err, values) => {
        // console.log('createFormErrorsStore validate callbacked err: ', err);
        const retValues = _.mapValues(values, val => {
          if (val === undefined || val === null) return '';
          return val;
        });
        if (err) {
          let flag = true;
          Object.keys(err).forEach(k => {
            const fieldErr = err[k];
            if (fieldErr.errors && fieldErr.errors.some(item => !/need\sto\srevalidate/.test(item.message))) {
              flag = false;
            }
          });
          if (flag) {
            // this.validateFields(opts, callback);
            callback(null, this.processRetValues(retValues));
          } else {
            callback(err, this.processRetValues(retValues));
          }
        } else {
          callback(err, this.processRetValues(retValues));
        }
        // if (!isTable) {
        //   debugger;
        // }
      });
      // }
    }

    handleFormValueChange = formValue => {
      const removeUndefinedProps = obj => {
        if (!obj) return obj;
        const _obj = _.cloneDeep(obj);
        Object.keys(_obj).forEach(k => {
          if (_obj[k] === undefined) delete _obj[k];
        });
        return _obj;
      };
      this.setState({
        innerFormValue: formValue
      }, () => {
        const values = _.mapValues(formValue, val => val.value);
        if (!_.isEqual(removeUndefinedProps(values), removeUndefinedProps(this.props.value))) {
          this.props.onChange(values);
        }
      });
    }

    render() {
      const { value, onChange, excutingJSStatusChange, ...restProps } = this.props;
      return (
        <WrappedFormComponent
          {...restProps}
          ref={formInst => this.formInst = formInst}
          wrappedComponentRef={(inst) => this.formRef = inst}
          value={this.state.innerFormValue}
          onChange={this.handleFormValueChange}
          excutingJSStatusChange={excutingJSStatusChange}
        />
      );
    }
  };
}
