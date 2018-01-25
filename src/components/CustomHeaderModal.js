/**
 * Created by 0291 on 2018/1/25.
 * desc: 设置自定义表头 Table
 */
import React, { Component, PropTypes } from 'react';
import { Modal, Table, Button } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import { saveCustomHeaders } from '../services/entcomm';

class CustomHeaderModal extends Component {
  static propTypes = {

  }

  constructor(props) {
    super(props);
    this.state = {
      dataSource: this.props.dataSource
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataSource: nextProps.dataSource
    });
  }

  saveCustomHeaders() {

  }

  getColumns() {
    return [{
      title: '序号',
      dataIndex: 'columnConfig.seq'
    }, {
      title: '列名',
      dataIndex: 'displayname'
    }, {
      title: '列宽',
      dataIndex: 'columnConfig.width'
    }, {
      title: '显示',
      dataIndex: 'columnConfig.isdisplay'
    }];
  }

  render() {
    console.log(this.state.dataSource)
    return (
    <Modal
      wrapClassName="setHeaderModal"
      width={860}
      title="设置显示字段"
      visible={this.props.visible}
      onCancel={() => { this.props.onCancel && this.props.onCancel() }}
      footer={[
        <Button key="close" type="default" onClick={this.saveCustomHeaders.bind(this)}>保存</Button>
      ]}>
        <Table
          dataSource={this.state.dataSource}
          columns={this.getColumns()}
          pagination={false}
        />
    </Modal>
    );
  }
}

export default connect(
  state => state.app,
  null,
  undefined,
  { withRef: true }
)(CustomHeaderModal);
