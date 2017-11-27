import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, message } from 'antd';
import ComplexForm from '../../../components/ComplexForm';

class DistributeMailsModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    cancel: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      key: new Date().getTime() // 每次打开弹窗时，都重新渲染
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  onFormModalCancel = () => {
    this.props.cancel && this.props.cancel();
    this.ComplexFormRef.resetFields();
  };

  onFormModalConfirm = () => {
    this.ComplexFormRef.validateFields((err, values) => {
      if (err) return;
      const { dept, users } = values;
      if (!dept.length && !users.length) {
        message.error('请选择分发对象');
        return;
      }
      const deptids = dept.map(i => i.id);
      const userids = users.map(i => i.id);
      this.props.confirm(deptids, userids);
      console.log(JSON.stringify(values));
    });
  };

  resetState = () => {
    this.setState({
      key: new Date().getTime()
    });
  };

  render() {
    const model = [
      { label: '选择团队', name: 'dept', initialValue: [], childrenType: 'DeptSelect' },
      { label: '选择人员', name: 'users', initialValue: [], childrenType: 'UserSelect' }
    ];
    return (
      <div key={this.state.key}>
        <Modal
          title="选择内部分发的接收人"
          visible={this.props.visible}
          onCancel={this.onFormModalCancel}
          onOk={this.onFormModalConfirm}
        >
          <ComplexForm ref={(ref) => this.ComplexFormRef = ref} model={model} />
        </Modal>
      </div>
    );
  }
}

export default connect(
  state => {
    const { showingModals, modalPending } = state.mails;
    return {
      visible: /distributeMails/.test(showingModals),
      modalPending
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'mails/showModals', payload: '' });
      },
      confirm(depts, users) {
        dispatch({ type: 'mails/distributeMails', payload: { depts, users } });
      }
    };
  }
)(DistributeMailsModal);
