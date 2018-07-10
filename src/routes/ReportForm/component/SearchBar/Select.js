/**
 * Created by 0291 on 2017/8/21.
 */
import React, { Component } from 'react';
import { Select, message } from 'antd';
import request from '../../../../utils/request';
const Option = Select.Option;


class SelectComponent extends Component {
  static propTypes = {

  }

  static defaultProps = {
    dataSource: []
  }

  constructor(props) {
    super(props);
    this.state = {
      dataSource: this.props.dataSource
    };
  }

  componentWillMount() {
      if (this.props.url) {
        this.queryDataSource(this.props.params);
      }
  }

  queryDataSource(params) {
    const queryParams = {
      DataSourceId: params.datasourcedefineid ? params.datasourcedefineid : '',
      InstId: params.instid ? params.instid : '',
      Parameters: {}
    }
    request(this.props.url, {
      method: 'post', body: JSON.stringify(queryParams)
    }).then((getData) => {
      this.setState({
        dataSource: getData.data.data
      });
    });
  }

  componentWillReceiveProps(nextProps) {
      if(nextProps.url) {

      } else {
        this.setState({
          dataSource: nextProps.dataSource
        });
      };
  }

  selectHandler(value) {
    this.props.onChange && this.props.onChange(value);
  }

  render() {
    return (
      <Select value={this.props.value} style={{ width: 120 }} onChange={this.selectHandler.bind(this)}>
        {
          this.state.dataSource.map((item) => {
            return <Option key={item.dkey}>{item.dvalue}</Option>;
          })
        }
      </Select>
    );
  }
}

export default SelectComponent;
