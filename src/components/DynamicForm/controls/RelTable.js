import React, { Component, PropTypes } from 'react';
import { Button, Checkbox } from 'antd';
import classnames from 'classnames';
import * as _ from 'lodash';
import { getGeneralProtocolForGrid } from '../../../services/entcomm';
import RelTableRow from './RelTableRow';
import styles from './RelTable.less';
import generateDefaultFormData from '../generateDefaultFormData';


class RelTable extends Component {
  static propTypes = {
    entityTypeId: PropTypes.string.isRequired,
    mode: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.shape({
      TypeId: PropTypes.string,
      FieldData: PropTypes.object
    })),
    entityId: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func
  };
  static defaultProps = {
    mode: 'ADD',
    value: [],
    onFocus: () => {}
  };

  arrFormInstance = [];

  constructor(props) {
    super(props);
    this.state = {
      fields: [],
      selectedRows: [],
      allSelected: false
    };
  }

  componentDidMount() {
    this.props.entityId && this.queryFields(this.props.entityId);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.entityId !== nextProps.entityId) {
      this.queryFields(nextProps.entityId);
    }
  }

  parseValue = () => {
    let { value } = this.props;
    if (!value) return [];
    if (!Array.isArray(value)) return [];
    return value;
  };

  queryFields = entityId => {
    const modeMap = {
      ADD: 0,
      EDIT: 1,
      DETAIL: 2
    };
    const OperateType = modeMap[this.props.mode];
    const params = {
      entityId,
      OperateType,  // 0新增 1编辑 2查看
      typeId: this.props.entityTypeId // 主表单typeid
    };
    getGeneralProtocolForGrid(params).then(result => {
      this.setState({
        fields: result.data,
        selectedRows: []
      });
    });
  };

  validate = (callback) => {
    const restForms = [...this.arrFormInstance];
    loopValidateForm();

    function loopValidateForm() {
      if (restForms.length) {
        const form = restForms[0];
        restForms.shift();
        if (!form) {
          loopValidateForm();
          return;
        }
        form.validateFields({ force: true }, (err, values) => {
          if (err) return callback(err);
          loopValidateForm();
        });
      } else {
        callback();
      }
    }
  };

  addRow = () => {
    const { entityId, onChange } = this.props;
    const newRow = {
      TypeId: entityId,
      FieldData: generateDefaultFormData(this.state.fields)
    };
    onChange([...this.parseValue(), newRow]);
  };

  delRow = () => {
    const { onChange } = this.props;
    const newValue = this.parseValue().filter((item, index) => !_.includes(this.state.selectedRows, index));
    onChange(newValue);
    this.arrFormInstance = this.arrFormInstance.slice(0, newValue.length);
    this.setState({ selectedRows: [] });
  };

  onCheckAllChange = event => {
    const selectedRows = [];

    if (event.target.checked) {
      this.parseValue().forEach((item, index) => selectedRows.push(index));
    }

    this.setState({ selectedRows });
  };

  onRowSelect = (index, selected) => {
    let { selectedRows } = this.state;
    if (selected) {
      selectedRows = [...selectedRows, index];
    } else {
      selectedRows = selectedRows.filter(item => item !== index);
    }
    this.setState({ selectedRows });
  };

  onRowValueChange = (rowIndex, values) => {
    const { entityId, onChange } = this.props;
    const value = this.parseValue();
    const oldRowValues = value[rowIndex] ? value[rowIndex].FieldData : {};
    value[rowIndex] = {
      TypeId: entityId,
      FieldData: {
        ...oldRowValues,
        ...values
      }
    };
    onChange([...value]);
  };

  getShowFields = () => {
    // return this.state.fields.filter(item => !!(item.fieldconfig && item.fieldconfig.isVisible && (item.fieldconfig.isVisibleJS !== 0)));
    return this.state.fields.filter(field => {
      if ((field.controltype === 31) || (field.controltype > 1000 && field.controltype !== 1012 && field.controltype !== 1006)) {
        return false;
      }
      if (field.fieldconfig.isVisible !== 1) {
        return false;
      } else if (field.fieldconfig.isVisibleJS === 0) {
        return false;
      }
      return true;
    });
  };

  getTableHeader = () => {
    return this.getShowFields().map(item => item.fieldname);
  };

  setRowValue = (rowIndex, rowValue) => {
    if (this.props.mode === 'DETAIL') return;
    const { entityId, onChange } = this.props;
    const value = this.parseValue();
    if (!value[rowIndex]) return;
    const newVal = [...value];
    newVal[rowIndex] = {
      TypeId: entityId,
      FieldData: rowValue
    };
    onChange(newVal, true);
  };

  setRowFieldVisible = (fieldName, isVisible) => {
    const newFields = [...this.state.fields];
    const fieldIndex = _.findIndex(newFields, ['fieldname', fieldName]);
    if (fieldIndex !== -1) {
      const field = this.state.fields[fieldIndex];
      // const newField = {
      //   ...field,
      //   fieldconfig: {
      //     ...field.fieldconfig,
      //     isVisibleJS: isVisible ? 1 : 0
      //   }
      // };
      field.fieldconfig = {
        ...field.fieldconfig,
        isVisibleJS: isVisible ? 1 : 0
      };

      if (!isVisible) {
        const value = this.parseValue();
        if (value.length) {
          const newVal = value.map(item => {
            return {
              TypeId: this.props.entityId,
              FieldData: {
                ...(item.FieldData || {}),
                [fieldName]: ''
              }
            };
          });
          this.props.onChange(newVal);
        }
        // this.arrFormInstance.forEach(form => {
        //   if (!form) return;
        //   form.formInst && form.formInst.setFieldsValue({ [fieldName]: '' });
        // });
      }

      // newFields[fieldIndex] = newField;
      this.setState({ fields: newFields });
    }
  };

  setRowFieldReadOnly = (fieldName, isReadonly) => {
    const newFields = [...this.state.fields];
    const fieldIndex = _.findIndex(newFields, ['fieldname', fieldName]);
    if (fieldIndex !== -1) {
      const field = this.state.fields[fieldIndex];
      field.fieldconfig = {
        ...field.fieldconfig,
        isReadOnlyJS: isReadonly ? 1 : 0
      };
      this.setState({ fields: newFields });
    }
  };

  setRowFieldRequired = (fieldName, isRequired) => {
    const newFields = [...this.state.fields];
    const fieldIndex = _.findIndex(newFields, ['fieldname', fieldName]);
    if (fieldIndex !== -1) {
      const field = this.state.fields[fieldIndex];
      field.fieldconfig = {
        ...field.fieldconfig,
        isRequiredJS: isRequired ? 1 : 0
      };
      this.setState({ fields: newFields });
    }
  };

  getFieldConfig = fieldName => {
    const field = this.getFieldByName(fieldName);
    return field && field.fieldconfig;
  };

  setFieldConfig = (fieldName, config) => {
    const field = this.getFieldByName(fieldName);
    if (field) {
      field.fieldconfig = {
        ...field.fieldconfig,
        ...config
      };
    }
    this.setState({ fields: [...this.state.fields] });
  };

  getFieldByName = (fieldName) => {
    return _.find(this.state.fields, ['fieldname', fieldName]);
  };

  onRowFieldFocus = fieldName => {
    this.props.onFocus();
  };

  // 渲染表格列头
  renderTableHeader = () => {
    const value = this.parseValue();
    const isAllSelected = value.length && value.every((item, index) => _.includes(this.state.selectedRows, index));
    const fields = this.getShowFields();
    return (
      <div>
        <div className={styles.tr}>
          {this.props.mode !== 'DETAIL' && <div className={classnames([styles.th, styles.selectionCell])}>
            <span>
              <Checkbox checked={isAllSelected} onChange={this.onCheckAllChange} />
            </span>
          </div>}
          {fields.map(field => (
            <div className={styles.th} key={field.fieldname}>
              <span>{field.displayname}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染表格数据
  renderTableBody = () => {
    return this.parseValue().map((item, index) => {
      return (
        <RelTableRow
          key={index}
          mode={this.props.mode}
          selected={_.includes(this.state.selectedRows, index)}
          fields={this.state.fields}
          value={item.FieldData || item}
          onChange={this.onRowValueChange.bind(this, index)}
          onSelect={this.onRowSelect.bind(this, index)}
          ref={formInst => this.arrFormInstance[index] = formInst}
          onFieldControlFocus={this.onRowFieldFocus}
        />
      );
    });
  };

  render() {
    return (
      <div className={styles.relTable}>
        {this.props.mode !== 'DETAIL' && <div style={{ marginBottom: '12px' }}>
          <Button onClick={this.addRow} style={{ marginRight: '15px' }}>新增</Button>
          <Button onClick={this.delRow} type="danger">删除</Button>
        </div>}
        <div className={styles.tableWrap}>
          <div className={styles.table}>
            {this.renderTableHeader()}
            {this.renderTableBody()}
          </div>
        </div>
        {/*{this.props.value && <div>*/}
          {/*{JSON.stringify(this.props.value)}*/}
        {/*</div>}*/}
      </div>
    );
  }
}

RelTable.View = ({ value, entityId, entityTypeId }) => {
  return (
    <RelTable mode="DETAIL" value={value} entityId={entityId} entityTypeId={entityTypeId} />
  );
};

export default RelTable;

