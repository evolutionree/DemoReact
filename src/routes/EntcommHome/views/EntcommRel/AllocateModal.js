import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { message } from 'antd';
import WorkflowCaseModal from '../../../../components/WorkflowCaseModal';
import { addCaseMultiple } from '../../../../services/workflow';

class AllocateModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      showFlowCaseModal: false,
      caseIds: []
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { currItems } = nextProps;
      const params = {
        entityid: 'db330ae1-b78c-4e39-bbb5-cc3c4a0c2e3b',
        flowid: 'c6d7d439-a0d0-450f-af09-ce5417c41513',
        recid: currItems.map(item => item.recid)
      };
      addCaseMultiple(params).then(result => {
        this.setState({
          showFlowCaseModal: true,
          caseIds: result.data.caseids
        });
      }, err => {
        message.error(err.message || '提交数据失败');
        this.props.cancel();
      });
    } else if (isClosing) {
      this.setState({
        showFlowCaseModal: false,
        caseIds: []
      });
    }
  }

  render() {
    return (
      <WorkflowCaseModal
        visible={this.state.showFlowCaseModal}
        caseId={this.state.caseIds}
        onCancel={this.props.cancel}
        onDone={this.props.done}
      />
    );
  }
}

export default connect(
  state => {
    const { showModals, currItems } = state.entcommRel;
    return {
      visible: /allocate/.test(showModals),
      currItems
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'entcommRel/showModals', payload: '' });
      },
      done() {
        dispatch({ type: 'entcommRel/showModals', payload: '' });
      }
    };
  }
)(AllocateModal);
