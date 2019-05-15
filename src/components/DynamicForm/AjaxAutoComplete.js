import React, { Component } from 'react';
import { AutoComplete } from 'antd';
import _ from 'lodash';
import request from '../../utils/request';

class AjaxAutoComplete extends Component {
  static propTypes = {}

  static defaultProps = {}

  constructor(props) {
    super(props);
    this.state = {
      dataSource: props.dataSource.map(o => o.name) || []
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ dataSource: nextProps.dataSource.map(o => o.name) });
  }

  queryDataSource = (value) => {
    const { api, dataSource } = this.props;
    if (value) {
      const result = dataSource.filter(item => item.name.includes(value)).map(o => o.name);
      if (dataSource) {
        this.setState({ dataSource: result });
        return;
      }

      request(api || '/', { // 暂用其他数据的接口
        method: 'post', body: JSON.stringify({ searchkey: value, pageIndex: 1, pageSize: 20 })
      }).then(res => {
        this.setState({ dataSource: ['df', 'fdgf'] });
      }).catch(e => e.message || '请求失败');
    } else {
      this.setState({ dataSource: [] });
    }
  }

  onSelect = (value) => {
    console.log('onSelect', value);
  }

  onChange = (value) => {
    if (this.props.onChange) this.props.onChange(value);
  }

  render() {
    const { placeholder, disabled, value, ...rest } = this.props;
    const { dataSource } = this.state;

    return (
      <AutoComplete
        {...rest}
        value={value}
        disabled={disabled}
        dataSource={dataSource}
        onSelect={this.onSelect}
        onChange={this.onChange}
        onSearch={_.debounce(this.queryDataSource, 300)}
        placeholder={placeholder}
      />
    );
  }
}

export default AjaxAutoComplete;
