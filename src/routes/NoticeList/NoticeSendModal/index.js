import React from 'react';
import { Modal, Form, message } from 'antd';
import _ from 'lodash';
import DeptSelect from './DeptSelect';
import UserSelect from './UserSelect';
import { sendNotice } from '../../../services/notice';

const FormItem = Form.Item;

class NoticeFormModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    currentRecords: React.PropTypes.array,
    form: React.PropTypes.object,
    onDone: React.PropTypes.func,
    onCancel: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      confirmLoading: false
    };
  }

  handleOk = () => {
    const { currentRecords, form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;

      const { departments, users } = values;

      if (!departments.depts.length && !users.length) {
        return message.error('请选择发送对象', 5);
      }

      const data = {
        noticeid: currentRecords.map(item => item.noticeid).join(','),
        ispopup: 0,
        // deptids: departments.map(item => { return { deptid: item.id, roleids: item.roles.map(i => i.id) }; }),
        deptids: departments.depts.map(item => ({ deptid: item.id, roleids: departments.roles.map(i => i.id) })),
        userids: users.map(item => item.id).join(',')
      };

      this.postSend(data);
    });
  };

  handleCancel = () => {
    this.props.form.resetFields();
    this.props.onCancel();
  };

  postSend = (data) => {
    this.setState({ confirmLoading: true });
    return sendNotice(data).then(result => {
      message.success('发送成功');
      this.setState({ confirmLoading: false });
      this.props.onDone();
    }).catch(e => {
      message.error(e.message || '发送失败');
      this.setState({ confirmLoading: false });
    });
  };

  render() {
    const { getFieldDecorator, resetFields } = this.props.form;

    return (
      <Modal
        maskClosable={false}
        title="选择通知接收人"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        visible={this.props.visible}
        confirmLoading={this.state.confirmLoading}
        afterClose={resetFields}
      >
        <Form>
          <FormItem label="选择团队">
            {getFieldDecorator('departments', {
              initialValue: { depts: [], roles: [] }
            })(
              <DeptSelect placeholder="选择接收团队" />
            )}
          </FormItem>
          <FormItem label="选择人员">
            {getFieldDecorator('users', {
              initialValue: []
            })(
              <UserSelect placeholder="选择接收人员" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(NoticeFormModal);
