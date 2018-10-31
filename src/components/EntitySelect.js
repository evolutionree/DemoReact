import React, { PropTypes, Component } from 'react';
import { message, Select } from 'antd';
import { query as queryEntityList } from '../services/entity';

class EntitySelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entityList: []
    };
    this.fetchEntityList();
  }
  fetchEntityList = () => {
    const params = {
      entityname: '',
      typeid: -1,
      pageindex: 1,
      pagesize: 9999,
      status: 1
    };
    queryEntityList(params).then(result => {
      this.setState({
        entityList: result.data.pagedata
      });
    }, err => {
      message.error('获取实体失败');
    });
  };
  render() {
    const { value, onChange, ...rest } = this.props;
    console.log(this.state.entityList)
    return (
      <Select
        value={value}
        onChange={onChange}
        showSearch
        {...rest}
      >
        {this.state.entityList.map(entity => (
          <Select.Option key={entity.entityid}>{entity.entityname}</Select.Option>
        ))}
      </Select>
    );
  }
}

export default EntitySelect;
