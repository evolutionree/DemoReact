import React, { PropTypes, Component } from 'react';
import FoldTable from '../../componnet/FoldTable';

class RelateCustomers extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const columns = [{
      title: '客户',
      dataIndex: 'name',
      key: 'name'
    }, {
      title: '销售阶段',
      dataIndex: 'age',
      key: 'age'
    }, {
      title: '最近活动时间',
      dataIndex: 'address',
      key: 'address'
    }, {
      title: '地址',
      dataIndex: 'action',
      key: 'action'
    }];

    const data = [{
      key: '1',
      name: '中国联通广东分公司',
      age: '阶段A',
      address: '2017-11-01',
      action: '广东省广州市天河区正佳广场'
    }, {
      key: '2',
      name: '中国联通广东分公司',
      age: '阶段A',
      address: '2017-11-01',
      action: '广东省广州市天河区正佳广场'
    }, {
      key: '3',
      name: '中国联通广东分公司',
      age: '阶段A',
      address: '2017-11-01',
      action: '广东省广州市天河区正佳广场'
    }];

    return (
      <div style={{ height: this.props.height + 'px', overflow: 'auto' }}>
        <FoldTable columns={columns} dataSource={data} title="待拜访的客户" />
        <FoldTable columns={columns} dataSource={data} title="待联系的客户" />
      </div>
    );
  }
}

export default RelateCustomers;
