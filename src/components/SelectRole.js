import React, { PropTypes, Component } from 'react';
import { Select } from 'antd';
import connectBasicData from '../models/connectBasicData';

class SelectRole extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = val => {
    this.props.onChange(val);
  };

  render() {
    const selectVal = this.props.value;
    return (
      <Select value={selectVal} onChange={this.handleChange} style={{ minWidth: '160px', ...(this.props.style || {}) }}>
        {this.props.roles.map(role => (
          <Select.Option key={role.roleid}>{role.rolename}</Select.Option>
        ))}
      </Select>
    );
  }
}

export default connectBasicData('roles', SelectRole);
