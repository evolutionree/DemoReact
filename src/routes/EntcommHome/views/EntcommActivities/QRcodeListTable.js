import React from 'react';
import { Modal, Table, message } from 'antd';
import qrcode from 'qrcode';
import request from '../../../../utils/request';

const columns = [{
  title: '问卷标题',
  dataIndex: 'name',
  key: 'name'
}, {
  title: '备注',
  dataIndex: 'answercount',
  key: 'answercount'
}];
  
class QRcodeListTable extends React.Component {

  state = { 
    loading: false,
    list: [],
    selectedRowKeys: []
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.data && !this.props.data) {
      this.setState({ loading: true });
      const { recordId, entityId, routepath } = nextProps.data;
      const params = { Recids: [recordId], EntityId: entityId };
      const res = await request(routepath, {
        method: 'post',
        body: JSON.stringify(params)
      }).catch(e => {
        message.error(e.message);
        this.setState({ loading: false });
      });
      if (res && res.data) {
        this.setState({ list: res.data, selectedRowKeys: [], loading: false });
      }
    }
  }

  handleOk = () => {
    const { list, selectedRowKeys } = this.state;
    if (!selectedRowKeys.length) {
      message.warn('请选择问卷');
      return;
    }
    const current = list.find(l => l.qid === selectedRowKeys[0]);
    Modal.success({
      okText: '关闭',
      title: current.name,
      content: (
        <canvas ref={canvas => this.canvas = canvas}>
            canvas
        </canvas>
      )
    });
    qrcode.toCanvas(this.canvas, current.qurl, {
      width: 290,
      margin: 0,
      color: {
        dark: '#000'
      }
    });
  }

  render() {
    const { data, onCancel } = this.props;
    const { list, loading, selectedRowKeys } = this.state;
    return (
      <div>
        <Modal
            title="请选择问卷"
            visible={!!data}
            okText="生成二维码"
            onOk={this.handleOk}
            onCancel={onCancel}
        >
          <Table 
            loading={loading}
            rowKey={'qid'}
            dataSource={list} 
            columns={columns} 
            pagination={false}
            rowSelection={{
              type: 'radio',
              selectedRowKeys,
              onChange: keys => this.setState({ selectedRowKeys: keys })
            }} 
        />
        </Modal>
      </div>
    );
  }
}

export default QRcodeListTable;
