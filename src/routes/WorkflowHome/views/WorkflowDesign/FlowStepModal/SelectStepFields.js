import React, { PropTypes, Component } from 'react';
import { Row, Col, Select, Checkbox, Icon, Button } from 'antd';
import * as _ from 'lodash';
import styles from './styles.less';

const Option = Select.Option;

const EntitySelect = ({ value, onChange, entities = [] }) => {
  return (
    <Select value={value} onChange={onChange}>
      {entities.map(item => (
        <Option key={item.entityid}>{item.entityname}</Option>
      ))}
    </Select>
  );
};

const FieldSelect = ({ value, onChange, fields = [] }) => {
  return (
    <Select value={value} onChange={onChange}>
      {fields.map(item => (
        <Option key={item.fieldid}>{item.displayname}</Option>
      ))}
    </Select>
  );
};

class SelectStepFields extends Component {
  static propTypes = {
    entities: PropTypes.array,
    value: PropTypes.array,
    onChange: PropTypes.func
  };
  static defaultProps = {
    entities: []
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleEntityChange = (index, entityId) => {
    const items = [...this.props.value];
    const item = items[index];
    items[index] = {
      ...item,
      entityId,
      fieldId: ''
    };
    this.props.onChange(items);
  };

  handleFieldChange = (index, fieldId) => {
    const items = [...this.props.value];
    const item = items[index];
    items[index] = {
      ...item,
      fieldId
    };
    this.props.onChange(items);
  };

  handleCheckboxChange = (index, event) => {
    const items = [...this.props.value];
    const item = items[index];
    items[index] = {
      ...item,
      isRequired: event.target.checked ? 1 : 0
    };
    this.props.onChange(items);
  };

  removeItem = item => {
    const newItems = this.props.value.filter(i => i !== item);
    this.props.onChange(newItems);
  };

  addItem = () => {
    const { entities, value } = this.props;
    const oldItems = value || [];
    const newItem = {
      entityId: entities.length ? entities[0].entityid : '',
      fieldId: '',
      isRequired: 0
    };
    this.props.onChange([...oldItems, newItem]);
  };

  render() {
    function getSupportedFields(fields) {
      return fields.filter(field => {
        const { controltype: type } = field;
        if (type > 1000 && type !== 1006 && type !== 1012) return false;
        if (type === 2 || type === 20 || type === 31 || type === 30) return false;
        return true;
      });
    }
    const { value, entities } = this.props;
    const items = value || [];
    return (
      <div>
        <div className={styles.selectlist}>
          {items.map((item, index) => {
            const selectedEntity = _.find(entities, ['entityid', item.entityId]);
            const fields = selectedEntity && getSupportedFields(selectedEntity.fields);
            return (
              <Row gutter={10} key={index} style={{ marginBottom: '5px' }}>
                <Col span={6}>
                  <EntitySelect value={item.entityId} onChange={this.handleEntityChange.bind(this, index)} entities={entities} />
                </Col>
                <Col span={6}>
                  <FieldSelect value={item.fieldId} onChange={this.handleFieldChange.bind(this, index)} fields={fields} />
                </Col>
                <Col span={3}>
                  <Checkbox checked={!!item.isRequired} onChange={this.handleCheckboxChange.bind(this, index)}>必填</Checkbox>
                </Col>
                <Col span={3}>
                  <Icon type="delete" onClick={this.removeItem.bind(this, item)} style={{ cursor: 'pointer' }} />
                </Col>
              </Row>
            );
          })}
        </div>
        <Button onClick={this.addItem}>添加可改字段</Button>
      </div>
    );
  }
}

export default SelectStepFields;

