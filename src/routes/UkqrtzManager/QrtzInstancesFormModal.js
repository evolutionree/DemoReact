import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Radio, message } from 'antd';
import _ from 'lodash';
import { Button, Select, Table } from 'antd';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import InputTextarea from "../../components/DynamicForm/controls/InputTextarea";
const Column = Table.Column;

class QrtzInstancesFormModal extends Component {
  static propTypes = {};
  static defaultProps = {};


  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {

  }


  render() {
    const { visible, cancel, instqueries, search, instanceList, instancetotal  } = this.props;
    return (
      <Modal
        visible={visible}
        title='事务实例列表'
        width='1000'
        onCancel={cancel}
        onOk={this.handleSubmit}
      >
        <div>
          <Table
            rowKey="recid"
            dataSource={instanceList}
            pagination={{
              total: instancetotal,
              pageSize: instqueries.pageSize,
              current: instqueries.pageIndex,
              onChange: pageIndex => search({ pageIndex }),
              onShowSizeChange: (curr, pageSize) => search({ pageSize })
            }}
          >
            <Column title="运行服务器" key="runserver" dataIndex="runserver" />
            <Column title="开始时间" key="begintime" dataIndex="begintime" />
            <Column title="结束时间" key="endtime" dataIndex="endtime" />
            <Column title="运行状态" key="status" dataIndex="status" render={v => [ '失败', ' ', '准备', '运行中', '成功'][v + 2]} />
            <Column title="错误信息" key="errormsg" dataIndex="errormsg" />

          </Table>
        </div>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showInfoModals, currItems, instanceList, instancetotal, instqueries} = state.ukqrtzmanager;
    return {
      visible: /instances/.test(showInfoModals),
      instqueries: { ...instqueries, IsLoadArchived: 1 },
      instancetotal: instancetotal,
      instanceList: instanceList
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'ukqrtzmanager/showInfoModals', payload: '' });
      },
      search(payload) {
        dispatch({ type: 'ukqrtzmanager/searchinstances', payload });
      },
    };
  }
)(Form.create({
  mapPropsToFields({ value }) {
    return _.mapValues(value, val => ({ value: val }));
  }
})(QrtzInstancesFormModal));
