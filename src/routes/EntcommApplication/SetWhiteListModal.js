/**
 * Created by 0291 on 2017/11/2.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal } from 'antd';
import ComplexForm from '../../components/ComplexForm/index';

class SetWhiteListModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    cancel: PropTypes.func.isRequired
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
          title="添加发件白名单人员"
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
    const { showModals } = state.entcommApplication;
    return {
      visible: /setWhiteList/.test(showModals),
      currentUser: state.app.user
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'entcommApplication/showModals', payload: '' });
      },
      done() {
        dispatch({ type: 'entcommApplication/addDone' });
      }
    };
  }
)(SetWhiteListModal);
