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
    dataSource: [],
    dataSourceType: 1 
  }

  constructor(props) {
    super(props);
    this.state = {
      dataSource: this.props.dataSource &&  this.props.dataSource.datalist,
    };
  }

  componentWillMount() {
    if(this.props.dataSourceType === 2 ) {
      this.queryDataSource(this.props.dataSource.datasource);
    } else {
      this.setState({
        dataSource: this.props.dataSource.datalist
      });
    };
  }

  queryDataSource(params) {
    console.log('queryDataSource');
    const queryParams = {
      DataSourceId: params.datasourcedefineid ? params.datasourcedefineid : '',
      InstId: params.instid ? params.instid : '',
      Parameters: {}
    }
    request('api/ReportEngine/queryData', {
      method: 'post', body: JSON.stringify(queryParams)
    }).then((getData) => {
      console.log('getData');
      console.log(getData.data.data );
      this.setState({
        dataSource: getData.data.data 
      });
    });
  }

  componentWillReceiveProps(nextProps) {
      this.props = nextProps;
      if(this.props.dataSourceType === 2 ) {
        this.queryDataSource(this.props.dataSource.datasource);
      } else {
        this.setState({
          dataSource: nextProps.dataSource.datalist
        });
      };
  }

  selectHandler(value) {
    this.props.onChange && this.props.onChange(value);
  }

  render() {
    console.log(this.state.dataSource);
    return (
      <Select value={this.props.value} style={{ width: 120 }} onChange={this.selectHandler.bind(this)}>
        {
           this.state.dataSource != undefined && this.state.dataSource.map((item) => {
            return <Option key={item.dkey}>{item.dvalue}</Option>;
          })
        }
      </Select>
    );
  }
}

export default SelectComponent;
