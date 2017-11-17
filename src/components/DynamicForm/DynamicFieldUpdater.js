import React, { PropTypes, Component } from 'react';
import { Row, Col, Select, Button, Icon, message } from 'antd';
import _ from 'lodash';
import DynamicField from './DynamicField';
import styles from './DynamicFieldUpdater.less';

const Option = Select.Option;

const FieldUpdaterSingle = ({ allFields, field, onChange, onRemove }) => {
  function onSelectChange(fieldid) {
    onChange({ fieldid, fieldvalue: '' });
  }
  function onFieldValueChange(fieldvalue) {
    const fieldvalue_ = (fieldvalue === undefined || fieldvalue === null) ? '' : fieldvalue;
    onChange({ ...field, fieldvalue: fieldvalue_ });
  }

  const match = _.find(allFields, ['fieldid', field.fieldid]);
  if (!match) return null;
  const { controltype, fieldconfig, displayname } = match;
  return (
    <Row gutter={10}>
      <Col span={6}>
        <Select value={field.fieldid} onChange={onSelectChange} style={{ width: '100%' }}>
          {allFields.map(f => (
            <Option key={f.fieldid}>{f.displayname}</Option>
          ))}
        </Select>
      </Col>
      <Col span={1}>=</Col>
      <Col span={16}>
        <DynamicField
          value={field.fieldvalue}
          controlType={controltype}
          config={fieldconfig}
          fieldLabel={displayname}
          onChange={onFieldValueChange}
        />
      </Col>
      <Col span={1}>
        <Icon type="delete" onClick={onRemove} style={{ cursor: 'pointer', fontSize: '16px', marginTop: '6px' }} />
      </Col>
    </Row>
  );
};

class DynamicFieldUpdater extends Component {
  static propTypes = {
    allFields: PropTypes.array,
    updateFields: PropTypes.array,
    onUpdateFieldsChange: PropTypes.func.isRequired
  };
  static defaultProps = {
    allFields: [],
    updateFields: []
  };

  constructor(props) {
    super(props);
    this.state = {
      fields: this.getSupportFields(props.allFields)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.allFields !== nextProps.allFields) {
      this.setState({
        fields: this.getSupportFields(nextProps.allFields)
      });
    }
  }

  getSupportFields = fields => {
    const notSupportTypes = [2, 14, 20, 24, 31,
      1001, 1002, 1003, 1004, 1005, 1007, 1008, 1009, 1010, 1011];
    return fields.filter(field => notSupportTypes.indexOf(field.controltype) === -1);
  };

  handleAdd = () => {
    const fields = this.state.fields;
    if (!fields.length) {
      message.error('找不到可用字段数据');
      return;
    }
    const newField = {
      fieldid: fields[0].fieldid,
      fieldvalue: ''
    };
    this.props.onUpdateFieldsChange([
      ...this.props.updateFields,
      newField
    ]);
  };

  handleFieldChange = (index, field) => {
    const newFields = [...this.props.updateFields];
    newFields[index] = field;
    this.props.onUpdateFieldsChange(newFields);
  };

  handleFieldRemove = index => {
    const newFields = [...this.props.updateFields];
    newFields.splice(index, 1);
    this.props.onUpdateFieldsChange(newFields);
  };

  render() {
    return (
      <div>
        <div className={styles.list}>
          {this.props.updateFields.map((field, index) => (
            <FieldUpdaterSingle
              key={index}
              allFields={this.state.fields}
              field={field}
              onChange={this.handleFieldChange.bind(this, index)}
              onRemove={this.handleFieldRemove.bind(this, index)}
            />
          ))}
        </div>
        <Button onClick={this.handleAdd}>添加修改项</Button>
      </div>
    );
  }
}

export default DynamicFieldUpdater;
