import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';
import { Menu, Button, Dropdown, message } from 'antd';
import RuleItem from './RuleItem';
import styles from './styles.less';
import { getDefaultOperator, getDefaultRuleData, ruleTypes } from './ruleConfigs';
import { getRandomLetters } from '../../utils';

class RuleList extends Component {
  static propTypes = {
    allFields: PropTypes.arrayOf(PropTypes.shape({
      controlType: React.PropTypes.number,
      fieldLabel: React.PropTypes.string,
      fieldId: React.PropTypes.string
    })).isRequired,
    isWorkflow: PropTypes.bool,
    flowEnities: PropTypes.array,
    rules: PropTypes.array,
    onChange: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  onRuleChange = (index, changeKey, changeValue) => {
    const { rules, allFields } = this.props;
    const rule = rules[index];
    let {
      entityId,
      fieldId,
      operator,
      ruleData,
      ruleType
    } = rule;
    if (changeKey === 'entityId') {
      entityId = changeValue;
      const matchField = _.find(allFields, item => item.entityId === entityId);
      fieldId = matchField.fieldId;
      operator = getDefaultOperator(matchField.controlType);
      ruleData = getDefaultRuleData(matchField.controlType, operator);
      ruleType = this.props.flowEnities[0].entityId === changeValue ? ruleTypes.关联实体字段 : ruleTypes.关联独立实体字段;
    }
    if (changeKey === 'fieldId') {
      fieldId = changeValue;
      const ctrlType = _.find(allFields, item => item.fieldId === fieldId).controlType;
      operator = getDefaultOperator(ctrlType);
      ruleData = getDefaultRuleData(ctrlType, operator);
    }
    if (changeKey === 'operator') {
      const ctrlType = _.find(allFields, item => item.fieldId === fieldId).controlType;
      operator = changeValue;
      ruleData = getDefaultRuleData(ctrlType, changeValue);
    }
    if (changeKey === 'ruleData') {
      ruleData = changeValue;
    }
    this.onChange(index, {
      entityId,
      fieldId,
      operator,
      ruleData,
      ruleType
    });
  };

  onChange = (index, keyValues) => {
    const rules = [...this.props.rules];
    rules[index] = {
      ...rules[index],
      ...keyValues
    };
    this.props.onChange(rules);
  };

  onRuleRemove = (index) => {
    const rules = this.props.rules.filter((rule, idx) => idx !== index);
    this.props.onChange(rules);
  };

  onAddWorkflow = event => {
    const isWorkflowField = event.key === '20';
    const field = _.find(this.props.allFields, item => {
      if (isWorkflowField) {
        return !!item.isWorkflow && item.recStatus === 1;
      } else {
        return !item.isWorkflow < 1000 && item.recStatus === 1;
      }
    });
    if (!field) {
      message.error('没有可供筛选的字段');
      return;
    }
    const { fieldId, controlType } = field;
    const operator = getDefaultOperator(controlType);
    this.addNewRule({
      entityId: isWorkflowField ? undefined : field.entityId,
      fieldId,
      operator,
      ruleType: isWorkflowField ? ruleTypes.流程字段 : ruleTypes.关联实体字段,
      ruleData: getDefaultRuleData(controlType, operator)
    });
  };

  onAdd = (event) => {
    if (event.key === '10' || event.key === '20') {
      this.onAddWorkflow(event);
      return;
    }

    if (event.key === '2') {
      const newRule = {
        ruleType: ruleTypes.SQL,
        ruleData: {}
      };
      this.addNewRule(newRule);
      return;
    }
    const field = _.find(this.props.allFields, item => {
      if (event.key === '0') {
        return item.controlType >= 1000 && item.recStatus === 1;
      } else {
        return item.controlType < 1000 && item.recStatus === 1;
      }
    });
    if (!field) {
      message.error('没有可供筛选的字段');
      return;
    }
    const { fieldId, controlType } = field;
    const operator = getDefaultOperator(controlType);
    this.addNewRule({
      fieldId,
      operator,
      ruleType: event.key === '0' ? ruleTypes.系统字段 : ruleTypes.其他字段,
      ruleData: getDefaultRuleData(controlType, operator)
    });
  };

  addNewRule = newRule => {
    const newRuleList = [...this.props.rules, { ...newRule, ts: new Date().getTime() + getRandomLetters(6) }];
    this.props.onChange(newRuleList);
  };

  renderAddButton = () => {
    let menus = (
      <Menu onClick={this.onAdd.bind(this)}>
        <Menu.Item key="0">系统字段筛选</Menu.Item>
        <Menu.Item key="1">其他字段筛选</Menu.Item>
        <Menu.Item key="2">SQL设置</Menu.Item>
      </Menu>
    );
    if (this.props.isWorkflow) {
      menus = (
        <Menu onClick={this.onAdd.bind(this)}>
          <Menu.Item key="10">实体变量</Menu.Item>
          <Menu.Item key="20">流程变量</Menu.Item>
        </Menu>
      );
    }
    return (
      <Dropdown overlay={menus}>
        <Button>添加规则</Button>
      </Dropdown>
    );
  };

  render() {
    return (
      <div className={styles.rulelistwrap}>
        <div className={styles.rulelist}>
          {this.props.rules.map((rule, index) => {
            if (!rule.ts) rule.ts = new Date().getTime() + getRandomLetters(6);
            return (
              <RuleItem
                key={rule.ts}
                ruleIndex={index + 1}
                rule={rule}
                onChange={this.onRuleChange.bind(this, index)}
                onRemove={this.onRuleRemove.bind(this, index)}
                allFields={this.props.allFields}
                entities={this.props.flowEnities}
              />
            )
          })}
        </div>
        {this.renderAddButton()}
      </div>
    );
  }
}

export default RuleList;
