/**
 * Created by 0291 on 2017/6/29.
 */
import React from 'react';
import { connect } from 'dva';
import request from '../../../utils/request';
import { Modal, Button, Form, Input, Table, message, Spin } from 'antd';
import styles from './DataGrid.less';

class DataGrid extends  React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageSize: this.props.pageSize,
      total: this.props.total,
      current: this.props.current,
      dataSource: this.props.dataSource,
      dataSourceField: this.props.dataSourceField,
      params: this.props.params,
      slectRows: this.props.slectRows,
      columns:this.props.columns,//表頭
      loading: false,
      url: this.props.url
    }
  }
  componentWillReceiveProps(nextProps) {
   if (nextProps.url) { //  区分开 父组件传url则表示数据源通过url获取，否则通过更新父组件传过来的dataSource更新
     this.setState({
       params: nextProps.params,
       columns: nextProps.columns,
       url: nextProps.url,
       reload: nextProps.reload,
       current: nextProps.current,
       slectRows: nextProps.slectRows
     });
     if (this.state.url !== nextProps.url || JSON.stringify(nextProps.params) !== JSON.stringify(this.state.params)) {
       this.queryListData(nextProps.current, this.state.pageSize, nextProps.url, nextProps.params);
     }
   } else {
     this.setState({
       columns: nextProps.columns,
       dataSource: nextProps.dataSource,
       current: nextProps.current,
       slectRows: nextProps.slectRows
     });
   }
  }


  componentDidMount() {
    this.queryListData(this.state.current, this.state.pageSize, this.state.url, this.state.params);
  }

  reload() {
    this.queryListData(this.state.current, this.state.pageSize, this.state.url, this.state.params);
  }

  //获取真正的数据源
  getSource(data, source) {
    let sourceArr = new Array();
    let returnData = data;

    if (source.indexOf(".") > -1) {
      sourceArr = source.split(".");
    } else {
      sourceArr.push(source);
    }
    let i = 0;
    try {
      while (i < sourceArr.length) {
        returnData = returnData[sourceArr[i]];
        if (returnData == null) {
          return  null;//直接返回
        }
        i++;
      }
    } catch(e) {
      return null;
    }
    return  returnData;
  }

  queryListData(current, pageSize, url, params) {
    if (url == null) {
      return false;
    }

    this.setState({
      loading: true
    });
    request(url, {
      method: 'post', body: JSON.stringify({ ...params, pageSize: pageSize, pageIndex: current })
    }).then((result) => {
      let dataSource = result.data.datacursor;
      if (!this.props.rowKey) {
        dataSource = result.data.datacursor.map((item, index) => {
          item.key = index;
          return item;
        })
      }

      this.setState({
        dataSource: dataSource,
        total: result.data.pagecursor[0].total,
        loading: false
      })
    }).catch((e) => {
      message.error(e.message);
      this.setState({
        loading: false
      });
    })
  }

  pageChangeHandler(current, pageSize) {
    this.setState({
      current: current,
      pageSize: pageSize
    });
    this.queryListData(current, pageSize, this.state.url, this.state.params);
  }

  showSizeChangeHandler(current, size) {
    this.setState({
      pageSize: size,
      current: current
    });
    this.queryListData(current, size, this.state.url, this.state.params);
  }

  rowSelectHandler(selectedRowKeys, selectedRows) {
    this.setState({
      slectRows: selectedRows
    });
    this.props.selectRowHandler && this.props.selectRowHandler(selectedRows);
  }

  render() {
    const rowKey = this.props.rowKey ? this.props.rowKey : 'key';
    const rowSelection = this.props.rowSelection ? {
      selectedRowKeys: this.state.slectRows.map(item => item[rowKey]),
      onChange: this.rowSelectHandler.bind(this)
    } : null;

    const pagination = this.props.pagination ? {
      pageSize: this.state.pageSize,
      total: this.state.total,
      current: this.state.current,
      onChange: this.pageChangeHandler.bind(this),
      onShowSizeChange: this.showSizeChangeHandler.bind(this)
    } : false;
    return (
      <Table
        className={styles.dataGridRowClass}
        loading={this.state.loading}
        scroll={{ x: '100%' }}
        dataSource={this.state.dataSource}
        rowKey={rowKey}
        rowSelection={rowSelection}
        pagination={pagination}
        columns={this.state.columns}
      />
    )
  }
}

DataGrid.propTypes = {
  columns: React.PropTypes.array,
  current: React.PropTypes.number,
  total: React.PropTypes.number,
  pageSize: React.PropTypes.number,
  dataSource: React.PropTypes.array,
  url: React.PropTypes.string,
  params: React.PropTypes.object,
  slectRows: React.PropTypes.array,
  rowKey: React.PropTypes.string
}

DataGrid.defaultProps = {
  columns: [],
  current: 1,
  total: 0,
  pageSize: 10,
  dataSource: [],
  url: null,
  params: {},
  slectRows: [],
  pagination: true,//是否分页
  rowSelection: true//列表项是否可选择
}

export default DataGrid;
