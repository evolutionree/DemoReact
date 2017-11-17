import React, { PropTypes, Component } from 'react';
import { Icon } from 'antd';
import { ruleTypes } from './ruleConfigs';
import RuleItemSql from './RuleItemSql';
import RuleItemField from './RuleItemField';
import styles from './styles.less';

class RuleItem extends Component {
  static propTypes = {
    ruleIndex: PropTypes.number.isRequired,
    rule: PropTypes.shape({
      ruleType: PropTypes.number.isRequired,
      fieldId: PropTypes.string,
      operator: PropTypes.string,
      ruleData: PropTypes.object
    }).isRequired,
    entities: PropTypes.array,
    allFields: PropTypes.arrayOf(PropTypes.shape({
      controlType: React.PropTypes.number,
      fieldLabel: React.PropTypes.string,
      fieldId: React.PropTypes.string
    })).isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { ruleIndex, rule, allFields, onChange } = this.props;
    const { ruleType, fieldId, operator, ruleData, entityId } = rule;

    let fields = [];
    let entities = undefined;
    if (ruleType === ruleTypes.系统字段) {
      fields = allFields.filter(field => field.controlType > 1000);
    } else if (ruleType === ruleTypes.其他字段) {
      fields = allFields.filter(field => field.controlType < 1000);
    } else if (ruleType === ruleTypes.全部实体字段) {
      fields = allFields.filter(field => !field.isWorkflow);
      entities = this.props.entities;
    } else if (ruleType === ruleTypes.流程字段) {
      fields = allFields.filter(field => !!field.isWorkflow);
    }
    return (
      <div className={styles.ruleitem}>
        <div className={styles.ruleindex}>{`$${ruleIndex}`}</div>
        <div className={styles.rulecontent}>
          {ruleType === ruleTypes.SQL ? (
            <RuleItemSql
              value={ruleData}
              onChange={sql => { onChange('ruleData', sql); }}
            />
          ) : (
            <RuleItemField
              entities={entities}
              entityId={entityId}
              fields={fields}
              fieldId={fieldId}
              operator={operator}
              ruleData={ruleData}
              onChange={onChange}
            />
          )}
        </div>
        <div className={styles.ruleremove}>
          <Icon type="delete" onClick={this.props.onRemove} />
        </div>
      </div>
    );
  }
}

export default RuleItem;

