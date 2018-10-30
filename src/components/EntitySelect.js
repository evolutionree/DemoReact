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
    return (
      <Select
        value={value}
        onChange={onChange}
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) => {
          const _list = ['props', 'children', 'props', 'value'];
            const _get = (p, o) => p.reduce((xs, x) => typeof xs !== 'string' ? xs[x] : xs, o);
            const res = _get(_list, option);
            const values = typeof res !== 'string' ? res[option.props.children.props.name] : res;
            return values.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }}
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
