import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { message, Modal } from 'antd';
import * as _ from 'lodash';
import FilterConfigBoard, { parseRuleDetail, ruleListToItems, getAllFields } from '../../../../components/FilterConfigBoard';
import { queryFields, saveEntityQueryRule } from '../../../../services/entity';
import { dynamicRequest } from '../../../../services/common';
import { queryBranchRule } from '../../../../services/workflow';

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
      const { flowEntities, isNotify, record } = nextProps;
      const allFields = getAllFields(flowEntities)
      this.setState({ allFields });

      const ruleId = nextProps.editingPath.ruleid;
      if (ruleId && ruleId !== '00000000-0000-0000-0000-000000000000') {
        this.fetchRuleDetail(ruleId);
      } else if (isNotify && record) {
        const { ruleList, ruleSet } = parseRuleDetail(record.rules && record.rules[0]);
        this.setState({ ruleList, ruleSet });
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

    const { flowEntities, ruleDetail, flowId, record, isNotify, save } = this.props;
    const { ruleList, ruleSet, allFields } = this.state;
    const rulename = isNotify ? record.rulename.value : ''

    const params = {
      typeid: 3,
      entityid: flowEntities[0].entityid,
      relentityid: flowEntities[1] && flowEntities[1].entityid,
      rulename,
      ruleitems: ruleListToItems(ruleList, allFields, flowEntities[0].entityid),
      ruleset: {
        ruleset: ruleSet,
        userid: 0,
        ruleformat: ''
      },
      flowid: flowId
    };

    if (isNotify && save) return save(params) // 知会人设置调用

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

  // handleNotifyOk = () => {
  //   if (!this.filterConfigBoard.validate()) return;

  //   const { flowEntities, ruleDetail, flowId, record } = this.props;
  //   const { ruleList, ruleSet, allFields } = this.state;

  //   const endnodeconfig = {}
  //   const rulename = record.rulename.value
  //   const type = record.type.value
  //   const mapList = new Map([
  //     [0, 'allpass'],
  //     [1, 'approve'],
  //     [2, 'failed'],
  //   ])

  //   for (const [key, value] of mapList) {
  //     endnodeconfig[value] = (key === record.informertype.value) ? {
  //       type,
  //       userids: type === 1 ? record.user.value.userids : '',
  //       spfuncname: type === 2 ? record.spfuncname.value : '',
  //       reportrelation: type === 3 ? record.reportrelation.value : '',
  //       entityid: type === 3 && record.reportrelation.value.type === 3 ? record.entityid.value : '',
  //       fieldname: type === 3 && record.reportrelation.value.type === 3 ? record.fieldname.value : ''
  //     } : null
  //   }

  //   const params = {
  //     informerrules: [
  //       {
  //         flowid: flowId,
  //         rule: {
  //           typeid: 3,
  //           entityid: flowEntities[0].entityid,
  //           relentityid: flowEntities[1] && flowEntities[1].entityid,
  //           rulename,
  //           ruleitems: ruleListToItems(ruleList, allFields, flowEntities[0].entityid),
  //           ruleset: {
  //             ruleset: ruleSet,
  //             userid: 0,
  //             ruleformat: ''
  //           },
  //           flowid: flowId
  //         },
  //         ruleconfig: JSON.stringify({ endnodeconfig })
  //       }
  //     ]
  //   };
  //   this.setState({ modalPending: true });
  //   dynamicRequest('/api/workflow/saveinformer', params).then(result => {
  //     this.setState({ modalPending: false });
  //     message.success(result.error_msg || '保存成功');
  //     this.props.save(result.data);
  //   }, err => {
  //     this.setState({ modalPending: false });
  //     message.error(err.message || '保存失败');
  //   });
  // };

  render() {
    const { title = '设置分支条件', isNotify } = this.props

    const flowEnities = Array.isArray(this.props.flowEntities) ? this.props.flowEntities.map(item => ({ entityId: item.entityid, entityName: item.entityname })) : [];
    let entityId;
    if (flowEnities.length === 1) {
      entityId = flowEnities[0].entityId;
    } else if (flowEnities.length > 1) {
      entityId = flowEnities[1].entityId;
    }

    return (
      <Modal
        title={title}
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

export default FlowBranchConditionModal;

