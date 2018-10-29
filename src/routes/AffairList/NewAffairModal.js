import React, { PropTypes, Component } from 'react';
import { Modal, Form, Select, message, Button } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import EntcommAddModal from '../../components/EntcommAddModal';
import WorkflowCaseModal from '../../components/WorkflowCaseModal';
import { queryList as queryWorkflow, queryNextNodeData } from '../../services/workflow';
import { queryTypes as queryEntityTypes } from '../../services/entity';

const FormItem = Form.Item;
const Option = Select.Option;

class NewAffairModal extends Component {
  static propTypes = {
    cancel: PropTypes.func,
    done: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      currModals: '',
      allFlow: [],
      selectedFlow: '',
      entityTypes: [],
      caseId: undefined
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      this.setState({ currModals: 'step1' });
      this.fetchAllFlow();
    } else if (isClosing) {
      this.resetState();
    }
  }

  resetState = () => {
    this.setState({
      currModals: '',
      allFlow: [],
      selectedFlow: '',
      entityTypes: [],
      caseId: undefined
    });
  };

  fetchAllFlow = () => {
    const params = {
      pageIndex: 1,
      pageSize: 999,
      flowStatus: 1
    };
    queryWorkflow(params).then(result => {
      // 先检查是否简单实体，再检查是否关联其他实体
      const allFlow = result.data.data.filter(flow => {
        return flow.entitymodeltype === 2 && flow.relentitymodeltype === null;
      });

      this.setState({
        allFlow
      });
    }, err => {
      message.error(err.message || '获取审批流程失败');
    });
  };

  fetchEntityTypes = (entityId) => {
    return queryEntityTypes({ entityId }).then(result => result.data.entitytypepros);
  };

  onStep1Confirm = () => {
    const { allFlow, selectedFlow } = this.state;
    if (!selectedFlow) {
      message.error('请选择流程');
      return;
    }
    const flow = _.find(allFlow, ['flowid', selectedFlow]);
    const { entityid } = flow;
    this.fetchEntityTypes(entityid).then(entityTypes => {
      this.setState({
        currModals: 'step2',
        entityTypes
      });
    });
  };

  onStep2Cancel = () => {
    this.setState({
      currModals: 'step1',
      entityTypes: []
    });
  };

  onStep2Done = (result) => {
    this.props.done();
    // const caseId = result.data;
    // this.setState({
    //   caseId,
    //   currModals: 'step3'
    // });
  };

  onStep3Cancel = () => {
    this.setState({
      currModals: 'step1',
      entityTypes: [],
      caseId: undefined
    });
  };

  onStep3Done = () => {
    this.props.done();
  };

  render() {
    const { currModals, allFlow, selectedFlow, entityTypes, caseId } = this.state;
    const selectedFlowObj = _.find(allFlow, ['flowid', selectedFlow]);
    return (
      <div>
        <Modal
          title="新增申请"
          visible={/step1/.test(currModals)}
          onCancel={this.props.cancel}
          footer={[
            <Button key="cancel" type="default" onClick={this.props.cancel}>关闭</Button>,
            <Button key="ok" onClick={this.onStep1Confirm}>下一步</Button>
          ]}
        >
          <Form>
            <FormItem label="选择流程">
              <Select value={selectedFlow} onChange={val => this.setState({ selectedFlow: val })}>
                {allFlow.map(flow => (
                  <Option key={flow.flowid}>{flow.flowname}</Option>
                ))}
              </Select>
            </FormItem>
          </Form>
        </Modal>
        <EntcommAddModal
          visible={/step2/.test(currModals)}
          entityId={selectedFlowObj ? selectedFlowObj.entityid : ''}
          entityName={selectedFlowObj ? selectedFlowObj.flowname : ''}
          entityTypes={entityTypes}
          flow={selectedFlowObj}
          cancel={this.onStep2Cancel}
          done={this.onStep2Done}
        />
        {/*<WorkflowCaseModal*/}
          {/*visible={/step3/.test(currModals)}*/}
          {/*caseId={caseId}*/}
          {/*onCancel={this.onStep3Cancel}*/}
          {/*onDone={this.onStep3Done}*/}
        {/*/>*/}
      </div>
    );
  }
}

export default connect(
  state => {
    const { showModals } = state.affairList;
    return {
      visible: /add/.test(showModals)
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'affairList/showModals', payload: '' });
      },
      done() {
        // message.success('提交审批数据成功', true);
        dispatch({ type: 'affairList/showModals', payload: '' });
        dispatch({ type: 'affairList/search' });
      }
    };
  }
)(NewAffairModal);
