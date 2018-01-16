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
    this.queryDataSource();
  }

  queryDataSource() {
    request('api/EntityPro/queryentityfield', {
      method: 'post', body: JSON.stringify({ entityId: this.props.entityId })
    }).then((getData) => {
      this.setState({
        dataSource: getData.data.entityfieldpros
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.entityId !== nextProps.entityId) {
      this.queryDataSource();
    }
  }

  selectHandler(value) {
    this.props.onChange && this.props.onChange(value);
  }

  render() {
    return (
      <Select value={this.props.value} style={{ width: 506 }} onChange={this.selectHandler.bind(this)}>
        {
          this.state.dataSource instanceof Array && this.state.dataSource.map((item) => {
            return <Option key={item.fieldid}>{item.displayname}</Option>;
          })
        }
      </Select>
    );
  }
}

export default SelectComponent;
