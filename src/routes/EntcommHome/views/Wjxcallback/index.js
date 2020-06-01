import React from 'react';
import { Table, Modal } from 'antd';
import styles from './index.less';
import request from '../../../../utils/request';

class WjxIframePage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      list: []
    };
    this.height = document.body.clientHeight - 230;
    this.columns = [
      {
        title: '问卷名称',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => <a onClick={() => this.openModal(record)}>{text}</a>
      },
      {
        title: '提交时间',
        dataIndex: 'submittime',
        key: 'submittime'
      }
    ];
  }

  async componentWillMount() {
    const { custcode } = this.props.params;
    const res = await request('/api/zj/WJX/getanswerlists', {
      method: 'post',
      body: JSON.stringify({ custcode })
    });
    if (res && res.data) {
      const list = res.data;
      this.setState({ list, loading: false });
    }
  }

  openModal = (currentItem) => {
    this.setState({ openModal: true, currentItem });
  }

  render() {
    const { list, openModal, currentItem, loading } = this.state;
    console.log(this.props, list);
    return (
      <div style={{ height: this.height }}>
        <Table columns={this.columns} dataSource={list} rowKey={'joinid'} loading={loading} />
        <Modal
            title={currentItem && currentItem.name}
            maskClosable={false}
            visible={openModal}
            width={'50vw'}
            footer={null}
            onCancel={() => this.setState({ openModal: false })}
            wrapClassName={styles.wrapModal}
        >
          <div className={styles.content}>
            <iframe src={currentItem && currentItem.url} frameBorder={0} />
          </div>
        </Modal>

      </div>
    );
  }
}

export default WjxIframePage;
