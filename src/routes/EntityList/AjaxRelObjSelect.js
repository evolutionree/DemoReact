/**
 * Created by 0291 on 2018/1/16.
 */
import React, { Component } from 'react';
import { Select, message } from 'antd';
import request from '../../utils/request';
const Option = Select.Option;


class SelectComponent extends Component {
  static propTypes = {

  }

  static defaultProps = {

  }

  constructor(props) {
    super(props);
    this.state = {
      dataSource: []
    };
  }

  componentWillMount() {
    this.queryDataSource(this.props.entityId);
  }

  queryDataSource(entityId) {
    request('api/EntityPro/queryentityfield', {
      method: 'post', body: JSON.stringify({ entityId })
    }).then((getData) => {
      this.setState({
        dataSource: getData.data.entityfieldpros
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.entityId !== nextProps.entityId) {
      this.queryDataSource(nextProps.entityId);
    }
  }

  selectHandler(value) {
    this.props.onChange && this.props.onChange(value);
  }

  render() {
    const hiddenControlType = [15, 22, 24, 31, 6, 7, 8, 9, 1004, 1005, 1011];
    const filterDataSource = this.state.dataSource instanceof Array && this.state.dataSource.filter((item) => {
        if (hiddenControlType.indexOf(item.controltype) === -1) {
          return item;
        }
    });
    return (
      <Select value={this.props.value} style={{ width: 506 }} onChange={this.selectHandler.bind(this)}>
        {
          filterDataSource instanceof Array && filterDataSource.map((item) => {
            return <Option key={item.fieldid}>{item.displayname}</Option>;
          })
        }
      </Select>
    );
  }
}

export default SelectComponent;
