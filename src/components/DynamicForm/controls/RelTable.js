import React, { Component, PropTypes } from 'react';
import { Button, Checkbox } from 'antd';
import classnames from 'classnames';
import { is } from 'immutable';
import * as _ from 'lodash';
import { getGeneralProtocolForGrid } from '../../../services/entcomm';
import RelTableRow from './RelTableRow';
import RelTableView from './RelTableView';
import styles from './RelTable.less';
import generateDefaultFormData from '../generateDefaultFormData';
import RelTableImportModal from '../RelTableImportModal';
import { getIntlText } from '../../UKComponent/Form/IntlText';
import RelTableBatchModal from '../RelTableBatchModal';
import { getBackEndField_TO_FrontEnd } from '../../AppHeader/TemporaryStorage/formStorageUtils';

const TableMaxHeight = 400;

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
    onFocus: PropTypes.func,
    sheetfieldglobal: PropTypes.object //暂存时  保存的全局字段协议
  };
  static defaultProps = {
    mode: 'ADD',
    value: [],
    onFocus: () => {}
  };

  arrFormInstance = [];
  arrFixedFormInstance = [];

  constructor(props) {
    super(props);
    this.state = {
      tableFields: [],
      selectedRows: [],
      allSelected: false,
      importVisible: false,
      showModals: '',
      tableRowFields: []
    };
  }

  componentDidMount() {
    this.props.entityId && this.queryFields(this.props.entityId, this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.entityId !== nextProps.entityId) {
      this.queryFields(nextProps.entityId, nextProps);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const thisProps = this.props || {};
    const thisState = this.state || {};

    if (Object.keys(thisProps).length !== Object.keys(nextProps).length || Object.keys(thisState).length !== Object.keys(nextState).length) {
      return true;
    }

    for (const key in nextProps) {
      if (!is(thisProps[key], nextProps[key])) {
        //console.log('RelTable_props:' + key);
        return true;
      }
    }

    for (const key in nextState) {
      if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
        //console.log('RelTable_state:' + key);
        return true;
      }
    }

    return false;
  }

  setInitFieldConfig = (tableFields, sheetfieldglobal) => {
    const _this = this;
    doWhileGet();
    function doWhileGet() {
      setTimeout(() => {
        if (!_this.state.loading) {
          let tableFields_ = tableFields;
          if (sheetfieldglobal) {
            tableFields_ = _this.mergeStorageAndLocal(tableFields, sheetfieldglobal);
          }
          _this.setState({ tableFields: tableFields_ });
        } else {
          doWhileGet();
        }
      }, 100);
    }
  };

  setInitRowFieldConfig = (tableRowFields, sheetfield) => { //TODO：从暂存数据打开表单 则表格每行的协议 需要跟暂存的每行表单协议 做 并集处理
    const _this = this;
    doWhileGet();
    function doWhileGet() {
      setTimeout(() => {
        if (!_this.state.loading) {
          let tableRowFields_ = tableRowFields instanceof Array && tableRowFields.map((tableRowFieldItem, index) => {
            let tableRowFieldItem_ = tableRowFieldItem;
            const currentRowSheetField = sheetfield[index];
            if (currentRowSheetField) {
              tableRowFieldItem_ = _this.mergeStorageAndLocal(tableRowFieldItem, currentRowSheetField, 'row');
            }
            return tableRowFieldItem_;
          })
          _this.setState({ tableRowFields: tableRowFields_ });
        } else {
          doWhileGet();
        }
      }, 100);
    }
  };

  mergeStorageAndLocal = (tableField, storageSheetField, type) => {
    return tableField.map(item => {
      let newItem = item;
      if (storageSheetField[item.fieldid]) {
        let fieldJson_config = getBackEndField_TO_FrontEnd(storageSheetField[item.fieldid], item);
        if (type === 'row') {
          newItem.fieldconfig = {
            ...item.fieldconfig,
            ...fieldJson_config,
            isRequiredJS: fieldJson_config.isRequired,
            isReadOnlyJS: fieldJson_config.isReadOnly || fieldJson_config.isHidden === 0 ? 0 : 1  //表格某行单元格不可见转成可读
          };
        } else {
          newItem.fieldconfig = {
            ...item.fieldconfig,
            ...fieldJson_config,
            isRequiredJS: fieldJson_config.isRequired,
            isReadOnlyJS: fieldJson_config.isReadOnly,
            isVisibleJS: fieldJson_config.isHidden === 0 ? 1 : 0
          };
        }
      }
      return newItem;
    });
  }

  parseValue = () => {
    let { value } = this.props;
    if (!value) return [];
    if (!Array.isArray(value)) return [];
    return value;
  };

  setValue = val => {
    if (val === '' || val === undefined || val === null) {
      this.props.onChange([], true);
      this.setState({
        tableRowFields: []
      });
      return;
    }
    if (Array.isArray(val)) {
      const entityId = this.props.entityId;
      const newValue = entityId ? val.map(item => ({ TypeId: entityId, FieldData: item })) : val;
      this.props.onChange(newValue, true);
      this.setState({
        tableRowFields: val.map(() => _.cloneDeep(this.state.tableFields))
      });
    }
  };

  queryFields = (entityId, props) => {
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
    this.setState({
      loading: true
    })
    getGeneralProtocolForGrid(params).then(result => {
      this.setState({
        tableFields: result.data,
        selectedRows: [],
        loading: false,
        tableRowFields: this.getInitTableRowFields(result.data)
      });
      if (props.sheetfieldglobal) { //暂存数据需要做处理
        this.setInitFieldConfig(result.data, props.sheetfieldglobal);
      }
      if (props.sheetfield) { //暂存数据需要做处理
        this.setInitRowFieldConfig(this.getInitTableRowFields(result.data), props.sheetfield);
      }
    }).catch(e => {
      console.error(e.message);
      this.setState({
        loading: false
      });
    });
  };

  getInitTableRowFields = (fields) => {
    const tableRowFields = this.parseValue().map(item => {
      return _.cloneDeep(fields);
    });
    return tableRowFields;
  }

  validate = (callback) => {
    //TODO: why do we need to repeat call function which named validateTableForm, 表格是有多个表格叠加出来的，所有多个表格需要做校验
    this.validateTableForm(this.arrFormInstance, callback);
    this.validateTableForm(this.arrFixedFormInstance, callback);
  };

  validateTableForm = (formInstance, callback) => {
    const restForms = [...formInstance];
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
  }

  addRow = () => {
    const { entityId, onChange } = this.props;
    const newRow = {
      TypeId: entityId,
      FieldData: generateDefaultFormData(this.state.tableFields)
    };
    onChange([...this.parseValue(), newRow]);
    this.setState({
      tableRowFields: [
        ..._.cloneDeep(this.state.tableRowFields),
        _.cloneDeep(this.state.tableFields)
      ]
    });
  };

  batchAdd = (data) => {
    const addFieldName = this.props.batchAddField;
    const { entityId, onChange } = this.props;
    const newAddData = data.map((item, index) => {
      return {
        TypeId: entityId,
        FieldData: generateDefaultFormData(this.state.tableFields, { [addFieldName]: item.value, [`${addFieldName}_name`]: item.value_name }),
        type: 'add' //TODO：渲染组件的时候 判断是否是通过批量新增，则需要走 配置JS
      };
    });
    this.setState({
      showModals: false
    });
    onChange([...this.parseValue(), ...newAddData]);

    const batchAddTableRowFields = data instanceof Array && data.map(item => {
      return _.cloneDeep(this.state.tableFields);
    });
    this.setState({
      tableRowFields: [
        ..._.cloneDeep(this.state.tableRowFields),
        ...batchAddTableRowFields
      ]
    });
  }

  addImportData = (data, operateType) => { //operateType== 1  追加导入 覆盖导入
    const { onChange } = this.props;
    this.setState({
      importVisible: false
    });
    operateType === 1 ? onChange([...this.parseValue(), ...data]) : onChange(data);

    const importTableRowFields = data instanceof Array && data.map(item => {
      return _.cloneDeep(this.state.tableFields);
    });
    if (operateType === 1) {
      this.setState({
        tableRowFields: [
          ..._.cloneDeep(this.state.tableRowFields),
          ...importTableRowFields
        ]
      });
    } else {
      this.setState({
        tableRowFields: importTableRowFields
      });
    }
  }

  importData = () => {
    this.setState({
      importVisible: true
    });
  }

  batchAddData = () => {
    this.setState({
      showModals: 'batchAdd'
    });
  }

  delRow = () => {
    const { onChange } = this.props;
    const newValue = this.parseValue().filter((item, index) => !_.includes(this.state.selectedRows, index));
    onChange(newValue);
    this.setState({
      tableRowFields: this.state.tableRowFields.filter((item, index) => !_.includes(this.state.selectedRows, index))
    });
    this.arrFormInstance = this.arrFormInstance.filter((item, index) => !_.includes(this.state.selectedRows, index));
    this.arrFixedFormInstance = this.arrFixedFormInstance.filter((item, index) => !_.includes(this.state.selectedRows, index));
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
    // return this.state.tableFields.filter(item => !!(item.fieldconfig && item.fieldconfig.isVisible && (item.fieldconfig.isVisibleJS !== 0)));
    return this.state.tableFields.filter(field => {
      if ((field.controltype > 1000 && field.controltype !== 1012 && field.controltype !== 1006)) { //(field.controltype === 31) ||
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
    this.setFieldConfig(fieldName, { isVisibleJS: isVisible ? 1 : 0 });
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
    }
  };

  setRowFieldReadOnly = (fieldName, isReadonly) => {
    this.setFieldConfig(fieldName, { isReadOnlyJS: isReadonly ? 1 : 0 });
  };

  setRowFieldRequired = (fieldName, isRequired) => {
    this.setFieldConfig(fieldName, { isRequiredJS: isRequired ? 1 : 0 });
  };

  getFieldConfig = fieldName => {
    const field = this.getFieldByName(fieldName);
    return field && field.fieldconfig;
  };

  setFieldConfig = (fieldName, config) => {
    const _this = this;
    doWhileGet();
    //因为全局js设置的时候,可能异步请求的表格协议还没获取到，设置会出问题，所以需要保证 表格协议已经获取到再设置 config
    function doWhileGet() {
      setTimeout(() => {
        if (!_this.state.loading) {
          const field = _this.getFieldByName(fieldName);
          if (field) {
            field.fieldconfig = {
              ...field.fieldconfig,
              ...config
            };
          }
          _this.updateTableRowFields([..._this.state.tableFields]);
          _this.setState({ tableFields: [..._this.state.tableFields] });
        } else {
          doWhileGet();
        }
      }, 100);
    }
  };

  updateTableRowFields = (tableFields) => {
    console.log(tableFields)
    const { tableRowFields } = this.state;
    //console.log(tableRowFields)
    const newTableRowFields = tableRowFields.map(rowFields => {
      return rowFields.map(item => {
        const newFieldItem = _.cloneDeep(item);
        const field = _.find(tableFields, ['fieldname', item.fieldname]);
        console.log(field)
        console.log(field.isVisibleJS)
        if (field) {
          newFieldItem.fieldconfig = {
            ...item.fieldconfig,
            isReadOnlyJS: field.fieldconfig.isReadOnlyJS || item.fieldconfig.isReadOnlyJS,
            isRequiredJS: field.fieldconfig.isRequiredJS || item.fieldconfig.isRequiredJS,
            isVisibleJS: field.fieldconfig.isVisibleJS === 0 ? 0 : undefined
          };
        }
        return newFieldItem;
      });
    });
    console.log(newTableRowFields)
    this.setState({
      tableRowFields: newTableRowFields
    });
  }

  getFieldByName = (fieldName) => {
    return _.find(this.state.tableFields, ['fieldname', fieldName]);
  };

  onRowFieldFocus = fieldName => {
    this.props.onFocus();
  };

  getFields = () => {
    return this.state.tableFields;
  }

  getRowFields = () => {
    return this.state.tableRowFields;
  }

  // 渲染表格列头
  renderTableHeader = (fixed) => {
    const value = this.parseValue();
    const isAllSelected = value.length && value.every((item, index) => _.includes(this.state.selectedRows, index));
    const tableFields = this.getShowFields();

    return (
      <div>
        <div className={styles.tr}>
          {this.props.mode !== 'DETAIL' && <div className={classnames([styles.th, styles.selectionCell])}>
            <span>
              <Checkbox checked={isAllSelected} onChange={this.onCheckAllChange} />
            </span>
          </div>}
          {tableFields.map((field, index) => {
            if (fixed && index > 0) return; //暂时只 固定第一列
            const fieldConfig = field.fieldconfig || {};
            const required = field.isrequire || fieldConfig.isRequiredJS;
            return (
              <div className={classnames([styles.th, {
                [styles.required]: !!required
              }])} key={field.fieldname}>
                <span>
                  {
                    getIntlText('displayname', field)
                  }
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染表格数据
  renderTableBody = (fixed) => {
    const tableFields = this.getShowFields();
    let fixedColumn;
    if (fixed && tableFields.length > 0) {
      fixedColumn = tableFields[0].fieldid;
    }
    return this.parseValue().map((item, index) => {
      const value = this.props.mode === 'ADD' ? generateDefaultFormData(this.state.tableFields, item && item.FieldData || item) : item && item.FieldData || item;
      const batchAddInfo = {
        type: item && item.type,
        field: _.find(this.state.tableFields, filedItem => filedItem.fieldname === this.props.batchAddField)
      };
      return (
        <RelTableRow
          key={index}
          rowIndex={index}
          fixedColumn={fixedColumn}
          origin="RelTableRow"
          mode={this.props.mode}
          selected={_.includes(this.state.selectedRows, index)}
          fields={this.state.tableRowFields[index] || []}
          entityId={this.props.entityId}
          value={value}
          onChange={this.onRowValueChange.bind(this, index)}
          onSelect={this.onRowSelect}
          ref={formInst => fixed ? this.arrFixedFormInstance[index] = formInst : this.arrFormInstance[index] = formInst}
          onFieldControlFocus={this.onRowFieldFocus}
          parentJsEngine={this.props.jsEngine}
          batchAddInfo_type={batchAddInfo.type}
          batchAddInfo_fieldname={batchAddInfo.field && batchAddInfo.field.fieldname}
          batchAddInfo_fieldid={batchAddInfo.field && batchAddInfo.field.fieldid}
        />
      );
    });
  };

  componentDidUpdate() {
    this.setAlignTableWidthAndHeight();
    setTimeout(() => {
      this.setAlignTableWidthAndHeight();
    }, 500);
  }

  componentWillUnmount() {

  }

  setAlignTableWidthAndHeight = () => {
    try {
      //列表的原始表头的列
      const realHeader = this.relTableRef.children[0].children[0].children;
      //列表的固定表头的列
      const fixedTopHeader = this.fixTopTableRef.children[0].children[0].children;

      this.fixTopTableRef.style.width = this.relTableRef.getBoundingClientRect().width + 'px';
      //顶部固定表格的列宽 需与真实表格保持一致
      for (let i = 0; i < realHeader.length; i++) {
        let realHeader_thWidth = realHeader[i].getBoundingClientRect().width;
        let fixedTopHeader_thWidth = fixedTopHeader[i].getBoundingClientRect().width;

        let realHeader_thHeight = realHeader[i].getBoundingClientRect().height;
        let fixedTopHeader_thHeight = fixedTopHeader[i].getBoundingClientRect().height;
        if (realHeader_thWidth !== fixedTopHeader_thWidth || realHeader_thHeight !== fixedTopHeader_thHeight) {
          fixedTopHeader[i].style.width = realHeader_thWidth + 'px';
          fixedTopHeader[i].style.height = realHeader_thHeight + 'px';
        }
      }

      //是否存在横 纵向滚动条
      const vertical = this.hasScrolled(this.relTableWrapRef);
      const horizontal = this.hasScrolled(this.relTableWrapRef, 'horizontal');

      let scrollWidth = 0;
      if (vertical) {
        scrollWidth = this.getScrollWidth();
      }
      this.fixTopWrapRef.style.width = `calc(100% - ${scrollWidth}px)`;
      this.fixTopWrapRef.style.height = this.relTableWrapRef.children[0].children[0].getBoundingClientRect().height + 1 + 'px';

      //列表的原始表头的行
      const realBody = this.relTableRef.children;
      //列表的左固定表的行
      const fixedLeftBody = this.fixLeftTableRef.children;
      for (let i = 0; i < realBody.length; i++) {
        let realBody_trHeight = realBody[i].getBoundingClientRect().height;
        let fixedLeftBody_trHeight = fixedLeftBody[i].getBoundingClientRect().height;

        if (realBody_trHeight !== fixedLeftBody_trHeight) {
          fixedLeftBody[i].children[0].style.height = realBody_trHeight + 'px';
        }
      }

      for(let i = 0; i < realHeader.length; i++) {
        //console.log(realHeader[i])
      }
      for (let i = 0; i < fixedLeftBody.length; i++) {
        const fixedLeftBody_Tds = fixedLeftBody[i].children[0].children;
        for (let j = 0; j < fixedLeftBody_Tds.length; j++) {
          fixedLeftBody_Tds[j].style.width = realHeader[j].getBoundingClientRect().width + 'px';
          fixedLeftBody_Tds[j].children[0].style.width = realHeader[j].getBoundingClientRect().width - 21 + 'px';
        }
      }

      //列表的左固定的表格
      let fixedWidth = 0
      for (let i = 0; i < realHeader.length; i++) {
        if (i < 2) {
          fixedWidth += realHeader[i].getBoundingClientRect().width;
        }
      }
      this.fixLeftWrapRef.style.width = fixedWidth + 'px';

      let scrollHeight = 0;
      if (horizontal) {
        scrollHeight = this.getScrollWidth();
      }
      this.fixLeftWrapRef.style.height = this.relTableWrapRef.getBoundingClientRect().height - scrollHeight + 'px';
      this.fixLeftWrapRef.style.maxHeight = TableMaxHeight - scrollHeight + 'px';
    } catch (e) {
      console.error(e);
    }
  }

  tableScroll = (e) => {
    if (e.target.scrollLeft === 0) {
      this.fixLeftWrapRef.style.boxShadow = 'none';
    } else {
      this.fixLeftWrapRef.style.boxShadow = '6px 0 6px -4px rgba(0, 0, 0, 0.15)';
    }

    this.fixLeftTableRef.style.top = -e.target.scrollTop + 'px';
    this.fixTopTableRef.style.left = -e.target.scrollLeft + 'px';
  }

  getScrollWidth() {
    let noScroll = document.createElement('DIV');
    let scroll = document.createElement('DIV');
    let oDiv = document.createElement('DIV');
    oDiv.style.cssText = 'position:absolute; top:-1000px; width:100px; height:100px; overflow:hidden;';
    noScroll = document.body.appendChild(oDiv).clientWidth;
    oDiv.style.overflowY = 'scroll';
    scroll = oDiv.clientWidth;
    document.body.removeChild(oDiv);
    return noScroll - scroll;
  }

  hasScrolled(el, direction = 'vertical') {
    if (el && el.scrollHeight && el.clientHeight) {
      if (direction === 'vertical') {
        return el.scrollHeight > el.clientHeight;
      } else if (direction === 'horizontal') {
        return el.scrollWidth > el.clientWidth;
      }
    }
  }

  render() {
    return (
      <div>
        <div className={styles.relTable}>
          {this.props.mode !== 'DETAIL' && <div style={{ marginBottom: '12px' }}>
            <Button onClick={this.addRow} style={{ marginRight: '15px' }}>新增</Button>
            {
              this.props.import ? <Button onClick={this.importData} style={{ marginRight: '15px' }}>导入</Button> : null
            }
            {
              this.props.batch ? <Button onClick={this.batchAddData} style={{ marginRight: '15px' }}>批量</Button> : null
            }
            <Button onClick={this.delRow} type="danger">删除</Button>
          </div>}
          <div className={styles.tableContent}>
            <div className={classnames(styles.fixTopWrap, { [styles.fixTopWrapHidden]: this.parseValue().length === 0 })} ref={ref => this.fixTopWrapRef = ref}>
              <div className={classnames([styles.table, styles.fixTopTable])} ref={ref => this.fixTopTableRef = ref}>
                {this.renderTableHeader()}
              </div>
            </div>
            <div className={styles.tableWrap} style={{ maxHeight: TableMaxHeight }} onScroll={this.tableScroll} ref={ref => this.relTableWrapRef = ref}>
              <div className={styles.table} ref={ref => this.relTableRef = ref}>
                {this.renderTableHeader()}
                {this.renderTableBody()}
              </div>
            </div>
            <div className={styles.fixLeftWrap} ref={ref => this.fixLeftWrapRef = ref}>
              <div className={classnames([styles.table, styles.fixLeftTopTable])}>
                {this.renderTableHeader('fixed')}
              </div>
              <div className={classnames([styles.table, styles.fixLeftTable])} ref={ref => this.fixLeftTableRef = ref}>
                {this.renderTableHeader('fixed')}
                {this.renderTableBody('fixed')}
              </div>
            </div>
          </div>
          {/*{this.props.value && <div>*/}
          {/*{JSON.stringify(this.props.value)}*/}
          {/*</div>}*/}
        </div>
        <RelTableImportModal visible={this.state.importVisible}
                             entityId={this.props.entityId}
                             entityTypeId={this.props.entityTypeId}
                             mainEntityId={this.props.mainEntityId}
                             cancel={() => { this.setState({ importVisible: false }); }}
                             onOk={this.addImportData}
        />
        <RelTableBatchModal visible={/batchAdd/.test(this.state.showModals)}
                            protocl={_.find(this.state.tableFields, item => item.fieldname === this.props.batchAddField)}
                            onCancel={() => { this.setState({ showModals: false }); }}
                            onConfirm={this.batchAdd} />
      </div>
    );
  }
}

RelTable.View = ({ value, entityId, entityTypeId }) => {
  return (
    <RelTableView mode="DETAIL" value={value} entityId={entityId} entityTypeId={entityTypeId} />
  );
};

export default RelTable;

