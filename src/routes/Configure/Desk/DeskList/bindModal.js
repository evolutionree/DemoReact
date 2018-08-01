/**
 * Created by 0291 on 2018/8/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, Radio, Checkbox, InputNumber, message, Table } from 'antd';

const { TextArea } = Input;

const FormItem = Form.Item;
const Option = Select.Option;

class FormModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
    editingRecord: PropTypes.object,
    modalPending: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      entities: [],
      currItems: [],
      dataSource: []
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      const { form, editingRecord } = nextProps;
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord
        });
      } else {
        form.resetFields();
      }
    }
  }


  onOk = () => {
    const { form, editingRecord } = this.props;
    form.validateFields((err, values) => {
      if (err) return;

      // this.props.confirm({
      //   resetflag: 1,
      //   ...values,
      //   expireflag: undefined,
      //   flowid: editingRecord ? editingRecord.flowid : undefined
      // });
    });
  };

  render() {
    const columns = [{
      title: '对象/角色名称',
      dataIndex: 'entityname'
    }, {
      title: '角色说明',
      dataIndex: 'datasources',
      width: 260
    }];
    return (
      <Modal
        title="绑定/解绑"
        visible={this.props.visible}
        onCancel={this.props.cancel}
        onOk={this.onOk}
      >
        <Table rowSelection={{
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({
              currItems: selectedRowKeys
            });
          },
          selectedRowKeys: this.state.currItems
        }} columns={columns} dataSource={this.state.dataSource} pagination={false} rowKey="entityid" />
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, currItems, modalPending } = state.desk;

    // const data = [{
    //   entityid: '72d518b4-12f1-4ed7-a4ee-e9be658aa567',
    //   jilian: true,
    //   same: true
    // }, {
    //   entityid: '1',
    //   jilian: true,
    //   same: true
    // }];
    return {
      visible: /bind/.test(showModals),
      editingRecord: /bind/.test(showModals) ? currItems[0] : undefined,
      modalPending
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'desk/showModals', payload: '' });
      },
      confirm(data) {
        dispatch({ type: 'desk/save', payload: data });
      }
    };
  }
)(Form.create()(FormModal));
