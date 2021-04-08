/**
 * Created by 0291 on 2018/6/22.
 */
import React, { Component } from 'react';
import { Modal, Table, Spin, message } from 'antd';
import { dynamicRequest } from '../../services/common';

class ProductStock extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      list: [],
      columns: [{
        title: '物料编码',
        width: 110,
        dataIndex: 'productcode'
      }, {
        title: '物料名称',
        dataIndex: 'productname'
      }, {
        title: '库存地点',
        dataIndex: 'stockaddressname'
      }, {
        title: '工厂名称',
        dataIndex: 'factoryname'
      }, {
        title: '计量单位',
        width: 80,
        dataIndex: 'unit'
      }, {
        title: '可用库存',
        dataIndex: 'enablesapstock'
      }]
    };
  }

  componentDidMount() {
    this.fetchList();
  }

  fetchList = async () => {
    const { productids, entityid } = this.props;

    const params = { productids, entityid };
    const res = await dynamicRequest('/api/gl/saphttpapi/getproductstocks', params).catch(e => {
      console.error(e.message);
      message.error(e.message);
      this.setState({ loading: false });
    });

    const list = Array.isArray(res && res.data) ? res.data.map((item, key) => {
      return ({ ...item, key });
    }) : [];

    this.setState({ list, loading: false });
  }

  render() {
    const { visible, onCancel } = this.props;
    const { columns, list, loading } = this.state;

    return (
      <Modal
                title={'产品库存信息'}
                visible={visible}
                onCancel={onCancel}
                footer={null}
                width={'70vw'}
            >
        <Spin spinning={loading}>
          <Table
                        rowKey="key"
                        dataSource={list}
                        columns={columns}
                        pagination={false}
                    />
        </Spin>
      </Modal>
    );
  }
}

export default ProductStock;

