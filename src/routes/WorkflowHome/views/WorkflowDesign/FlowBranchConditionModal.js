import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { message, Modal } from 'antd';
import * as _ from 'lodash';
import FilterConfigBoard, { parseRuleDetail, ruleListToItems } from '../../../../components/FilterConfigBoard';
import { queryFields, saveEntityQueryRule } from '../../../../services/entity';
import { queryBranchRule } from '../../../../services/workflow';

const workflowFields = [
  {
    isWorkflow: true,
    controlType: 2001,
    fieldId: '00000000-0000-0000-0000-000000000000',
    fieldLabel: '发起人',
    fieldConfig: {},
    recStatus: 1
  },
  {
    isWorkflow: true,
    controlType: 2002,
    fieldId: '00000000-0000-0000-0000-000000000001',
    fieldLabel: '发起人部门',
    fieldConfig: {},
    recStatus: 1
  },
  {
    isWorkflow: true,
    controlType: 2003,
    fieldId: '00000000-0000-0000-0000-000000000002',
    fieldLabel: '发起人上级部门',
    fieldConfig: {},
    recStatus: 1
  },
  {
    isWorkflow: true,
    controlType: 2004,
    fieldId: '00000000-0000-0000-0000-000000000003',
    fieldLabel: '发起人角色',
    fieldConfig: {},
    recStatus: 1
  },
  {
    isWorkflow: true,
    controlType: 2005,
    fieldId: '00000000-0000-0000-0000-000000000004',
    fieldLabel: '发起人是否是领导',
    fieldConfig: {},
    recStatus: 1
  }
];

class FlowBranchConditionModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      modalPending: false,
      allFields: [],
      ruleList: [],
      ruleSet: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { flowEntities } = nextProps;
      const allFields = _.flatMap(flowEntities, item => item.fields)
        .map(field => ({
          controlType: field.controltype,
          fieldId: field.fieldid,
          fieldLabel: field.fieldlabel,
          fieldConfig: field.fieldconfig,
          recStatus: field.recstatus,
          entityId: field.entityid
        }));
      this.setState({ allFields: [...allFields, ...workflowFields] });

      const ruleId = nextProps.editingPath.ruleid;
      if (ruleId && ruleId !== '00000000-0000-0000-0000-000000000000') {
        this.fetchRuleDetail(ruleId);
      }
    } else if (isClosing) {
      this.setState({
        loading: false,
        modalPending: false,
        allFields: [],
        ruleList: [],
        ruleSet: ''
      });
    }
  }

  fetchRuleDetail = ruleId => {
    this.setState({ loading: true });
    queryBranchRule(ruleId).then(result => {
      const { ruleList, ruleSet } = parseRuleDetail(result.data && result.data[0]);
      this.setState({
        loading: false,
        ruleList,
        ruleSet
      });
    }).catch(err => {
      this.setState({ loading: false });
    });
  };

  handleOk = () => {
    if (!this.filterConfigBoard.validate()) return;

    const { ruleList, ruleSet, allFields } = this.state;
    const { editingPath, flowEntities, ruleDetail, flowId } = this.props;
    const params = {
      typeid: 3,
      entityid: flowEntities[0].entityid,
      relentityid: flowEntities[1] && flowEntities[1].entityid,
      rulename: '',
      // ruleitems: ruleList.map(ruleToItem),
      ruleitems: ruleListToItems(ruleList, allFields, flowEntities[0].entityid),
      ruleset: {
        ruleset: ruleSet,
        userid: 0,
        ruleformat: ''
      },
      flowid: flowId
    };
    this.setState({ modalPending: true });
    saveEntityQueryRule(params).then(result => {
      this.setState({ modalPending: false });
      message.success('保存成功');
      this.props.save(result.data);
    }, err => {
      this.setState({ modalPending: false });
      message.error(err.message || '保存失败');
    });
  };

  render() {
    const flowEnities = this.props.flowEntities.map(item => ({ entityId: item.entityid, entityName: item.entityname }));
    let entityId;
    if (flowEnities.length === 1) {
      entityId = flowEnities[0].entityId;
    } else if (flowEnities.length > 1) {
      entityId = flowEnities[1].entityId;
    }
    return (
      <Modal
        title="设置分支条件"
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.props.cancel}
        confirmLoading={this.state.modalPending}
        width={750}
      >
        {!this.state.loading && this.state.allFields.length !== 0 && (
          <FilterConfigBoard
            isWorkflow
            entityId={entityId}
            flowEnities={flowEnities}
            ref={inst => { this.filterConfigBoard = inst; }}
            allFields={this.state.allFields}
            title1="第一步：定义规则"
            title2="第二步：定义集合规则"
            ruleList={this.state.ruleList}
            ruleSet={this.state.ruleSet}
            onRulesChange={val => this.setState({ ruleList: val })}
            onRuleSetChange={val => this.setState({ ruleSet: val })}
          />
        )}
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, editingPath, flowEntities, flowId } = state.workflowDesign;
    return {
      visible: /branch/.test(showModals),
      editingPath,
      flowEntities,
      flowId
    };
  },
  dispatch => {
    return {
      save(ruleId) {
        dispatch({ type: 'workflowDesign/saveBranchRule', payload: ruleId });
      },
      cancel() {
        dispatch({ type: 'workflowDesign/cancelBranchRule' });
      }
    };
  }
)(FlowBranchConditionModal);

