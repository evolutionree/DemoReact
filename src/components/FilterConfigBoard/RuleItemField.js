import React, { PropTypes, Component } from 'react';
import { Select, Row, Col, message } from 'antd';
import _ from 'lodash';
import styles from './styles.less';
import { getOperators, getRuleDataRenderer } from './ruleConfigs';

const Option = Select.Option;

class RuleItemField extends Component {
  static propTypes = {
    fields: PropTypes.arrayOf(PropTypes.shape({
      controlType: React.PropTypes.number,
      fieldLabel: React.PropTypes.string,
      fieldId: React.PropTypes.string
    })).isRequired,
    entities: PropTypes.array,
    fieldId: PropTypes.string.isRequired,
    operator: PropTypes.string.isRequired,
    ruleData: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  onEntityChange = val => {
    this.props.onChange('entityId', val);
  };

  onFieldChange = val => {
    this.props.onChange('fieldId', val);
  };

  onOperatorChange = val => {
    this.props.onChange('operator', val);
  };

  onRuleDataChange = val => {
    this.props.onChange('ruleData', val);
  };

  render() {
    const { entities, fields, entityId, fieldId, operator, ruleData } = this.props;

    if (fields.length === 0) {
      return false;
    }

    const field = _.find(fields, item => item.fieldId === fieldId);
    if (!field) {
      message.error('解析规则出错');
      console.error(`解析规则出错，找不到字段 fieldid : ${fieldId}`);
      console.error(fields);
      return null;
    }
    const { controlType, fieldConfig } = field;
    const operators = getOperators(controlType);
    const ruleDataRender = getRuleDataRenderer(controlType, operator).render;

    let fieldCol = 7,
      opCol = 5,
      dataCol = 12,
      entityCol = 0;
    if (entities) {
      entityCol = 5;
      fieldCol = 5;
      opCol = 3;
      dataCol = 11;
    }

    return (
      <Row gutter={10}>
        {entities !== undefined && (
          <Col span={entityCol} className={styles.rulecol}>
            <Select value={entityId} onChange={this.onEntityChange}>
              {entities.map(entity => (
                <Option key={entity.entityId}>
                  {entity.entityName}
                </Option>
              ))}
            </Select>
          </Col>
        )}
        <Col span={fieldCol} className={styles.rulecol}>
          <Select value={fieldId} onChange={this.onFieldChange}>
            {fields.filter(item => {
              return entities ? item.entityId === entityId : true;
            }).map(item => (
              <Option key={item.fieldId} disabled={item.recStatus !== 1}>
                {item.fieldLabel}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={opCol} className={styles.rulecol}>
          <Select value={operator} onChange={this.onOperatorChange}>
            {operators.map(item => (
              <Option key={item.value}>{item.name}</Option>
            ))}
          </Select>
        </Col>
        <Col span={dataCol} className={styles.rulecol}>
          {ruleDataRender(ruleData, this.onRuleDataChange, fieldConfig)}
        </Col>
      </Row>
    );
  }
}

export default RuleItemField;
