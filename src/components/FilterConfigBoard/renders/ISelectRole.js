import React, { PropTypes, Component } from 'react';
import { Select } from 'antd';
import * as _ from 'lodash';
import connectBasicData from '../../../models/connectBasicData';

class ISelectRole extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = val => {
    const valName = val.map(v => _.find(this.props.roles, ['roleid', v]).rolename);
    this.props.onChange({
      dataVal: val.join(','),
      dataVal_name: valName.join(',')
    });
  };

  render() {
    const { dataVal, dataVal_name } = this.props.value;
    const selectVal = dataVal && dataVal.split(',');
    return (
      <Select mode="multiple" value={selectVal} onChange={this.handleChange}>
        {this.props.roles.map(role => (
          <Select.Option key={role.roleid}>{role.rolename}</Select.Option>
        ))}
      </Select>
    );
  }
}

export default connectBasicData('roles', ISelectRole);
