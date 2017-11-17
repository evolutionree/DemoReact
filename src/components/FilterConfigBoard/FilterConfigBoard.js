import React, { PropTypes } from 'react';
import _ from 'lodash';
import { message } from 'antd';
import RuleList from './RuleList';
import RuleSetInput from './RuleSetInput';
import { checkSupport, getValidator } from './ruleConfigs';
import styles from './styles.less';

class FilterConfigBoard extends React.Component {
  static propTypes = {
    entityId: PropTypes.string,
    title1: PropTypes.string,
    title2: PropTypes.string,
    allFields: PropTypes.arrayOf(PropTypes.shape({
      controlType: React.PropTypes.number.isRequired,
      fieldLabel: React.PropTypes.string.isRequired,
      fieldId: React.PropTypes.string.isRequired
    })).isRequired,
    isWorkflow: PropTypes.bool,
    flowEnities: PropTypes.array,
    ruleList: PropTypes.array.isRequired,
    ruleSet: PropTypes.string.isRequired,
    onRulesChange: PropTypes.func.isRequired,
    onRuleSetChange: PropTypes.func.isRequired
  };
  static defaultProps = {
    title1: '定义规则',
    title2: '定义集合规则',
    ruleList: [],
    isMultiEntities: false
  };
  static childContextTypes = {
    entityId: PropTypes.string
  };

  getChildContext() {
    return { entityId: this.props.entityId };
  }

  validate = () => {
    const errors = [];
    this.props.ruleList.forEach(rule => {
      const { fieldId, operator, ruleData } = rule;

      // 先校验规则值是否为空
      if (!(ruleData && ruleData.dataVal !== undefined)) {
        return errors.push('规则值不能为空');
      }

      const field = _.find(this.props.allFields, item => item.fieldId === fieldId);
      if (field && operator) {
        const validator = getValidator(field.controlType, operator);
        if (validator) {
          const errMsg = validator(ruleData, operator, field.controlType);
          if (errMsg) errors.push(errMsg);
        }
      }
    });
    if (errors.length) {
      message.error(errors[0]);
      return false;
    }
    return true;
  };

  render() {
    let supportedFields = this.props.allFields.filter(field => checkSupport(field.controlType));
    if (!this.props.entityId) { // 没有实体id，不显示实体类型控件
      supportedFields = supportedFields.filter(field => field.controlType !== 1009);
    }
    return (
      <div className={styles.wrap}>
        <div className={styles.title}>{this.props.title1}</div>
        <RuleList
          allFields={supportedFields}
          rules={this.props.ruleList}
          onChange={this.props.onRulesChange}
          isWorkflow={this.props.isWorkflow}
          flowEnities={this.props.flowEnities}
        />
        <div className={styles.title}>{this.props.title2}</div>
        <RuleSetInput value={this.props.ruleSet} onChange={this.props.onRuleSetChange} />
      </div>
    );
  }
}

export default FilterConfigBoard;
