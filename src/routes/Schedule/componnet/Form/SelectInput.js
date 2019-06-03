/**
 * Created by 0291 on 2017/12/27.
 */
import React, { Component } from 'react';
import { Select, Input, Icon, Tooltip } from 'antd';
import SelectSingle from '../../../../components/DynamicForm/controls/SelectSingle';
import InputRecName from '../../../../components/DynamicForm/controls/InputRecName';
import Styles from './SelectInput.less';

const Option = Select.Option;


class SelectInput extends Component {
  static propTypes = {

  };
  static defaultProps = {
    placeholder: '请输入'
  };

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    this.setState({

    });
  }

  setValue(value, length, fieldname) {
    this[`SelectInput${fieldname}`].setValue(value, length);
  }

  onFieldControlRef = (fieldname, ref) => {
    this[`SelectInput${fieldname}`] = ref;
  };

  selectValueChange(fieldname, value, isFromApi = false) {
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      [fieldname]: value
    }, fieldname, isFromApi);
  }


  inputValueChange(fieldname, e, isFromApi = false) {
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      [fieldname]: e.target.value
    }, fieldname, isFromApi);
  }

  render() {
    const value = this.props.value;
    return (
      <div className={Styles.SelectInputWrap}>
        {
          this.props.fields && this.props.fields instanceof Array && this.props.fields.map((item, index) => {
            const itemValue = value && value[item.fieldname] || ((item.fieldconfig && item.fieldconfig.defaultValue) ? item.fieldconfig.defaultValue : item.fieldconfig.defaultValueNormal);
            switch (item.controltype) {
              case 3:
                return (
                  <div style={{ width: 120, marginRight: '4px', display: 'inline-block' }}>
                    <SelectSingle ref={this.onFieldControlRef.bind(this, item.fieldname)} onChange={this.selectValueChange.bind(this, item.fieldname)} value={itemValue} {...item.fieldconfig} />
                  </div>
                );
              case 1012:
                return (
                  <div style={{ width: this.props.toolTip ? 'calc(100% - 146px)' : 'calc(100% - 124px)', display: 'inline-block' }}>
                    <InputRecName ref={this.onFieldControlRef.bind(this, item.fieldname)} onChange={this.selectValueChange.bind(this, item.fieldname)} value={itemValue} {...item.fieldconfig} />
                  </div>
                );
              default:
                return null;
            }
          })
        }
        {
          this.props.toolTip ? <Tooltip placement="bottom" title={this.props.toolTip}>
            <Icon type="info-circle" style={{ color: '#b8c7ce', fontSize: '18px', marginLeft: '4px' }} />
          </Tooltip> : null
        }
      </div>
    );
  }
}


export default SelectInput;
