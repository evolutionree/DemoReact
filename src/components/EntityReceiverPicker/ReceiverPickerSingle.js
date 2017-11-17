import React, { PropTypes, Component } from 'react';
import { Row, Col, Select } from 'antd';
import SelectUser from '../DynamicForm/controls/SelectUser';
import SelectDepartment from '../DynamicForm/controls/SelectDepartment';

const Option = Select.Option;

function isUserField(field) {
  const types = [25, 1002, 1003, 1006];
  return types.indexOf(field.controltype) !== -1;
}

class ReceiverPickerSingle extends Component {
  static propTypes = {
    types: PropTypes.array.isRequired, // 0 固定人，1表单中人，2 固定部门，3 表单中部门
    receivers: PropTypes.arrayOf(PropTypes.shape({
      itemtype: PropTypes.number
    })),
    receiverRange: PropTypes.number,
    onReceiversChange: PropTypes.func.isRequired,
    onReceiverRangeChange: PropTypes.func,
    fields: PropTypes.array,
    disabled: PropTypes.bool,
    style: PropTypes.object
  };
  static defaultProps = {
    receivers: [],
    fields: [],
    disabled: false
  };

  constructor(props) {
    super(props);
    this.state = {
      receiverType: this.getReceiverType(this.props.receivers) || this.props.types[0]
    };
  }

  componentWillReceiveProps(nextProps) {
    const recType = this.getReceiverType(nextProps.receivers);
    if (recType) {
      this.setState({
        receiverType: recType
      });
    }
  }

  getReceiverType = receivers => {
    let type;
    if (receivers.length) {
      type = receivers[0].itemtype;
    }
    return type;
  };

  getReceiversValue = () => {
    const key = ['userid', 'userfield', 'departmentid', 'departmentfield'][this.state.receiverType];
    if (key) {
      return this.props.receivers.map(rec => rec[key]).join(',');
    }
    return '';
  };

  onReceiverTypeChange = type => {
    this.setState({ receiverType: +type });
    this.props.onReceiversChange([]);
  };

  onReceiverValueChange = value => {
    const receiverType = this.state.receiverType;
    const key = ['userid', 'userfield', 'departmentid', 'departmentfield'][receiverType];
    const receivers = (value || '').split(',').map(val => {
      return {
        itemtype: receiverType,
        [key]: val
      };
    });
    this.props.onReceiversChange(receivers);
  };

  renderTypeSelect = () => {
    const text = ['固定人', '表单中人员', '固定部门', '表单中人员的部门'];
    return (
      <Select
        value={this.state.receiverType + ''}
        onChange={this.onReceiverTypeChange}
        disabled={this.props.disabled}
        style={{ width: '100%' }}
      >
        {this.props.types.map(type => (
          <Option key={type + ''}>{text[type]}</Option>
        ))}
      </Select>
    );
  };

  renderReceiverSelect = () => {
    const { disabled } = this.props;
    const value = this.getReceiversValue();
    switch (this.state.receiverType) {
      case 0:
        return (
          <SelectUser
            value={value}
            onChange={this.onReceiverValueChange}
            isReadOnly={disabled ? 1 : 0}
            multiple={1}
          />
        );
      case 2:
        return (
          <SelectDepartment
            width="100%"
            value={value}
            onChange={this.onReceiverValueChange}
            isReadOnly={disabled ? 1 : 0}
            multiple={1}
          />
        );
      case 1:
      case 3:
        return (
          <Select
            mode="multiple"
            value={value ? value.split(',') : []}
            style={{ width: '100%' }}
            onChange={arr => this.onReceiverValueChange(arr.join(','))}
            disabled={disabled}
          >
            {this.props.fields.filter(isUserField).map(field => (
              <Option key={field.fieldid}>{field.displayname}</Option>
            ))}
          </Select>
        );
      default:
        return null;
    }
  };

  render() {
    return (
      <Row gutter={10} style={this.props.style}>
        <Col span={6}>
          {this.renderTypeSelect()}
        </Col>
        <Col span={12}>
          {this.renderReceiverSelect()}
        </Col>
        {!!this.props.onReceiverRangeChange && (
          <Col span={6}>
            <Select
              disabled={this.props.disabled}
              value={this.props.receiverRange + ''}
              onChange={val => this.props.onReceiverRangeChange(+val)}
              style={{ width: '100%' }}
            >
              <Option value="0">部门领导</Option>
              <Option value="1">全部人</Option>
            </Select>
          </Col>
        )}
      </Row>
    );
  }
}

export default ReceiverPickerSingle;

