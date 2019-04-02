/**
 * Created by 0291 on 2018/7/25.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, message, Spin, Checkbox } from 'antd';
import { connect } from 'dva';
import { queryFields } from '../../../../services/entity';
import { queryFunctionRule, saveFunctionRule } from '../../../../services/functions';
import FilterConfigBoard, { parseRuleDetail, ruleListToItems } from '../../../../components/FilterConfigBoard';

class FilterConfigModal extends Component {
  static propTypes = {

  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      ruleList: this.transformData(props.rule).ruleList,
      ruleSet: this.transformData(props.rule).ruleSet,
      entityFieldData: []
    };
  }

  componentDidMount() {
    this.fetchFields(this.props.relEntityId);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.relEntityId !== nextProps.relEntityId) {
      this.fetchFields(nextProps.relEntityId);
    }
    this.setState({
      ruleList: this.transformData(nextProps.rule).ruleList,
      ruleSet: this.transformData(nextProps.rule).ruleSet
    });
  }

  fetchFields(entityId) {
    queryFields(entityId).then(result => {
      const entityFieldData = result.data.entityfieldpros;
      this.setState({
        entityFieldData: entityFieldData.map(item => ({
          controlType: item.controltype,
          fieldId: item.fieldid,
          fieldLabel: item.fieldlabel,
          fieldConfig: item.fieldconfig,
          recStatus: item.recstatus,
          fieldName: item.fieldname,
          displayName: item.displayname
        }))
      });
    }).catch(e => {
      console.error(e.message);
    });
  }

  transformData = (rule) => {
    const { ruleList, ruleSet } = parseRuleDetail(rule || {});
    return {
      ruleList,
      ruleSet
    };
  }

  handleSubmit = () => {
    const { recid, relEntityId } = this.props;
    const { entityFieldData, ruleList, ruleSet } = this.state;
    const result = this.filterConfigBoard.validate();
    if (!result) return;
    this.props.ruleChange && this.props.ruleChange({
      entityid: relEntityId,
      pageid: recid,
      rule: {
        entityid: relEntityId,
        rulename: '',
        rulesql: '',
        ruleid: recid
      },
      ruleitems: ruleListToItems(ruleList, entityFieldData, relEntityId),
      ruleset: {
        ruleset: ruleSet,
        ruleformat: '',
        userid: 0
      }
    });
  };

  onRulesChange = (ruleList) => {
    this.setState({
      ruleList
    });
  };

  onRuleSetChange = (ruleSet) => {
    this.setState({
      ruleSet
    });
  }

  render() {
    const { relEntityId } = this.props;
    const { entityFieldData, ruleList, ruleSet } = this.state;
    return (
      <Modal
        visible={this.props.visible}
        title="设置统计过滤条件"
        onOk={this.handleSubmit}
        onCancel={this.props.close}
      >
        <FilterConfigBoard
          entityId={relEntityId}
          ref={filterConfigBoard => { this.filterConfigBoard = filterConfigBoard; }}
          allFields={entityFieldData}
          title1="第一步：定义数据规则"
          title2="第二步：定义集合规则"
          ruleList={ruleList}
          ruleSet={ruleSet}
          onRulesChange={this.onRulesChange}
          onRuleSetChange={this.onRuleSetChange} />
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { entityId } = state.entityTabs;
    return {
      entityId
    };
  },
  dispatch => {
    return {

    };
  }
)(FilterConfigModal);
