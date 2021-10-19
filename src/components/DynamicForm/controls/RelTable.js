import React, { Component, PropTypes } from 'react';
import { Button, Checkbox, message , Pagination, Select} from 'antd';
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
import { randomStr } from '../../../utils';
import { queryEntityDetail } from '../../../services/entity';
import RelTablePickerModal from './RelTablePickerModal';
import ProductStockModal from '../../../routes/ProductManager/ProductStockModal';

const TableMaxHeight = 500;
const basePageSizeOptions = [
  { label: '5 条/页', value: '5' },
  { label: '10 条/页', value: '10' },
  { label: '20 条/页', value: '20' },
  { label: '50 条/页', value: '50' },
  { label: '100 条/页', value: '100' }
];

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
    onFocus: () => { }
  };

  arrFormInstance = [];
  arrFixedFormInstance = [];
  scrollbarwidth = -1;

  constructor(props) {
    super(props);
    this.state = {
      tableFields: [],
      selectedRows: [],
      allSelected: false,
      importVisible: false,
      showModals: '',
      tableRowFields: [],
      globalJS: {},
      tableRowConfigs: [], // 表格行有业务逻辑的相关配置可以存在这里
      ProductStockVisible: false,
      productids: [],
      showPage: 1,
      showCount: 10
    };
  }

  componentDidMount() {
    this.props.entityId && this.queryFields(this.props.entityId, this.props);

    this.setAlignTableWidthAndHeight();
    let timer = null;
    if (this.tabWrapRef) { //监听节点变化  动态计算编辑器的高度
      const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
      if (MutationObserver) {
        const observer = new MutationObserver((mutations) => {
          if (timer) { clearTimeout(timer); }
          timer = setTimeout(() => {
            this.setAlignTableWidthAndHeight();
          }, 150);

          mutations.forEach(function (mutation) {
            //console.log(mutation);
          });
        });
        //主要监听节点变化
        observer.observe(this.tabWrapRef, {
          attributes: true,
          childList: true,
          subtree: true,
          characterData: false,
          attributeOldValue: true,
          attributeFilter: ['width']
        });
      }
    }
  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps) {
    const thisProps = this.props;

    if (thisProps.entityId !== nextProps.entityId) this.queryFields(nextProps.entityId, nextProps);
    if (nextProps.isEmitFlag && thisProps.value !== nextProps.value) { // 用于通过js带值时，初始化协议配置
      const newValue = this.parseValue(nextProps);
      const tableFields = _.cloneDeep(this.state.tableFields);
      const tableRowFields = newValue.map(() => tableFields);
      const tableRowConfigs = newValue.map(() => ({ isNotCopyJs: true }));
      this.setState({ tableRowFields, tableRowConfigs });
    }

    setTimeout(() => this.setAlignTableWidthAndHeight(), 0);
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

  fetchGlobalJS = (entityId) => {
    if (entityId) {
      queryEntityDetail(entityId).then(result => {
        this.setState({
          globalJS: result.data.entityproinfo[0]
        });
      });
    }
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
          const tableRowFields_ = tableRowFields instanceof Array && tableRowFields.map((tableRowFieldItem, index) => {
            let tableRowFieldItem_ = tableRowFieldItem;
            const currentRowSheetField = sheetfield[index];
            if (currentRowSheetField) {
              tableRowFieldItem_ = _this.mergeStorageAndLocal(tableRowFieldItem, currentRowSheetField, 'row');
            }
            return tableRowFieldItem_;
          });
          _this.setState({ tableRowFields: tableRowFields_ });
        } else {
          doWhileGet();
        }
      }, 100);
    }
  };

  mergeStorageAndLocal = (tableField, storageSheetField, type) => {
    return tableField.map(item => {
      const newItem = item;
      if (storageSheetField[item.fieldid]) {
        const fieldJson_config = getBackEndField_TO_FrontEnd(storageSheetField[item.fieldid], item);
        if (type === 'row') {
          newItem.fieldconfig = {
            ...item.fieldconfig,
            ...fieldJson_config
          };
        } else {
          newItem.fieldconfig = {
            ...item.fieldconfig,
            ...fieldJson_config
          };
        }
      }
      return newItem;
    });
  }

  parseValue = (props) => {
    const { value } = props || this.props;
    if (!value) return [];
    if (!Array.isArray(value)) return [];
    return value;
  };

  setValue = val => {
    if (val === '' || val === undefined || val === null) {
      this.props.onChange([], true);
      this.setState({
        tableRowFields: [],
        showPage: 1,
        showCount: 10
      });
      return;
    }
    if (Array.isArray(val)) {
      const entityId = this.props.entityId;
      const newValue = entityId ? val.map(item => ({ TypeId: entityId, FieldData: item })) : val;
      this.props.onChange(newValue, true);
      this.setState({
        showPage: 1,
        showCount: 10,
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
    this.setState({ loading: true });
    getGeneralProtocolForGrid(params).then(result => {
      this.setState({
        tableFields: result.data,
        selectedRows: [],
        loading: false,
        tableRowFields: this.getInitTableRowFields(result.data),
        tableRowConfigs: this.getInitTableRowConfigs()
      });
      if (props.sheetfieldglobal) { //暂存数据需要做处理
        this.setInitFieldConfig(result.data, props.sheetfieldglobal);
      }
      if (props.sheetfield) { //暂存数据需要做处理
        this.setInitRowFieldConfig(this.getInitTableRowFields(result.data), props.sheetfield);
      }
      this.fetchGlobalJS(props.entityId);
    }).catch(e => {
      console.error(e.message);
      this.setState({
        loading: false
      });
    });
  };

  getInitTableRowConfigs = () => { // 初始化表格行业务逻辑的相关配置
    return this.parseValue().map(item => ({ isNotCopyJs: true }));
  }

  getInitTableRowFields = (fields) => {
    const tableRowFields = this.parseValue().map(item => _.cloneDeep(fields));
    return tableRowFields;
  }

  validate = (callback, value) => {
    const { showCount } = this.state;
    if (!value || value.length <= showCount) {
      this.baseValidate(callback);
    } else { // 由于做了分页处理，所以验证的时候要跳到特定的页
      const requireKeys = this.processFields(this.state.tableFields).map(v => v.fieldname);
      let emptyIndex;
      for (let i = 0; i < value.length; i++) {
        const current = value[i].FieldData;
        const hasEmpty = requireKeys.some(r => !current[r] && String(current[r]) !== '0');
        if (hasEmpty) {
          emptyIndex = i + 1;
          break;
        }
      }
      if (emptyIndex) {
        const showPage = Math.ceil(emptyIndex / showCount);
        // 跳转到特定页面再验证
        this.onPagerChange(showPage, showCount, () => {
          this.baseValidate(callback);
        });
      } else callback();
    }
  };

  baseValidate = (callback) => {
    //TODO: why do we need to repeat call function which named validateTableForm, 表格是有多个表格叠加出来的，所有多个表格需要做校验
    this.validateTableForm(this.arrFormInstance, callback);
    this.validateTableForm(this.arrFixedFormInstance, callback);
  }

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
      FieldData: { ...generateDefaultFormData(this.state.tableFields) }
    };
    const commitRows = [...this.parseValue(), newRow];
    const { showCount } = this.state;
    const showPage = Math.ceil(commitRows.length / showCount) || 1;
    onChange([...this.parseValue(), newRow]);

    const tableRowFields = [
      ...this.state.tableRowFields,
      _.cloneDeep(this.state.tableFields)
    ];

    const tableRowConfig = {
      isNotCopyJs: true
    };

    const tableRowConfigs = [
      ...this.state.tableRowConfigs,
      tableRowConfig
    ];

    this.setState({ tableRowFields, tableRowConfigs, showPage });
  };

  batchAdd = (data) => {
    const addFieldName = this.props.batchAddField;
    const { entityId, onChange } = this.props;
    const { showCount } = this.state;
    const newAddData = data.map((item, index) => {
      return {
        TypeId: entityId,
        FieldData: generateDefaultFormData(this.state.tableFields, { [addFieldName]: item.value, [`${addFieldName}_name`]: item.value_name }),
        type: 'add' //TODO：渲染组件的时候 判断是否是通过批量新增，则需要走 配置JS
      };
    });
    onChange([...this.parseValue(), ...newAddData]);

    const batchAddTableRowFields = data instanceof Array && data.map(item => {
      return _.cloneDeep(this.state.tableFields);
    });

    const tableRowFields = [
      ...this.state.tableRowFields,
      ...batchAddTableRowFields
    ];

    const tableRowConfigs = [
      ...this.state.tableRowConfigs,
      ...newAddData.map(item => ({ isNotCopyJs: true }))
    ];

    this.setState({ tableRowFields, tableRowConfigs, showModals: false, showPage: Math.ceil(this.parseValue().length / showCount) || 1 });
  }

  addImportData = (data, operateType) => { //operateType== 1  追加导入 覆盖导入
    const isCoverForImport = operateType === 2;
    const { onChange } = this.props;
    const { showPage } = this.state;
    const values = this.parseValue();
    const importTableRowFields = data instanceof Array && data.map(item => {
      return _.cloneDeep(this.state.tableFields);
    });
    const setData = { importVisible: false };
    if (isCoverForImport) {
      onChange(data);
      if (showPage === 1) {
        // 重置渲染key值，强制渲染
        this.renderRelTableKey = randomStr(10);
      } else {
        // 恢复默认分页
        setData.showPage = 1;
        setData.showCount = 10;
      }
      setData.tableRowFields = importTableRowFields;
    } else {
      onChange([...values, ...data]);
      setData.tableRowFields = [
        ...this.state.tableRowFields,
        ...importTableRowFields
      ];
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
    const { showCount, selectedRows } = this.state;
    const deleteRows = selectedRows.concat();
    const newValue = this.parseValue().filter((item, index) => !_.includes(deleteRows, index));
    onChange(newValue);
    // 检查是否是删除最后的
    let showPage = this.state.showPage;
    const values = newValue.slice((showPage - 1) * showCount, showPage * showCount);
    if (!values.length) showPage -= 1;
    this.setState({
      showPage: showPage || 1,
      selectedRows: [],
      tableRowFields: this.state.tableRowFields.filter((item, index) => !_.includes(deleteRows, index)),
      tableRowConfigs: this.state.tableRowConfigs.filter((item, index) => !_.includes(deleteRows, index))
    }, () => {
      // 删除对应实例，由于做了分页功能，保存实例的数组会是稀疏数组，中间会有空项，使用原来filter的遍历会跳过空项，导致长度差很多
      // 注意稀疏数组 [...arr]和arr.concat() 的区别
      const arrFormInstance = this.arrFormInstance.concat();
      const arrFixedFormInstance = this.arrFixedFormInstance.concat();
      deleteRows.forEach(idx => {
        arrFormInstance.splice(idx, 1);
        arrFixedFormInstance.splice(idx, 1);
      });
      this.arrFormInstance = arrFormInstance;
      this.arrFixedFormInstance = arrFixedFormInstance;
    });
  };

  onCheckAllChange = (event, showOptions) => {
    const selectedRows = [];
    const [values, showPage, showCount] = showOptions;

    if (event.target.checked) {
      values.forEach((...arr) => selectedRows.push((showPage - 1) * showCount + arr[1]));
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
    const { tableRowFields } = this.state;
    //console.log(tableRowFields)
    const newTableRowFields = tableRowFields.map(rowFields => {
      return rowFields.map(item => {
        const newFieldItem = _.cloneDeep(item);
        const field = _.find(tableFields, ['fieldname', item.fieldname]);
        if (field) {
          newFieldItem.fieldconfig = {
            ...item.fieldconfig,
            isReadOnlyJS: field.fieldconfig.isReadOnlyJS,
            isRequiredJS: field.fieldconfig.isRequiredJS,
            isVisibleJS: field.fieldconfig.isVisibleJS === 0 ? 0 : undefined
          };
        }
        return newFieldItem;
      });
    });
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

  reloadTableRow = (rowIndex, uuid) => {
    const { tableRowFields, tableUpdateUuid } = this.state;
    if (uuid === tableUpdateUuid) {
      return;
    }
    const newTableRowFields = tableRowFields.map((item, index) => {
      if (rowIndex === index) {
        return _.cloneDeep(item);
      } else {
        return item;
      }
    });
    this.setState({
      tableRowFields: newTableRowFields,
      tableUpdateUuid: uuid
    });
  }

  // 渲染表格列头
  renderTableHeader = (fixed, showOptions) => {
    const [values] = showOptions;
    const isAllSelected = values.length && values.every((item, index) => _.includes(this.state.selectedRows, index));
    const tableFields = this.getShowFields();

    return (
      <div>
        <div className={styles.tr}>
          {this.props.mode !== 'DETAIL' && <div className={classnames([styles.th, styles.selectionCell])}>
            <span>
              <Checkbox checked={isAllSelected} onChange={e => this.onCheckAllChange(e, showOptions)} />
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
  renderTableBody = (fixed, showOptions) => {
    const [values, showPage, showCount] = showOptions;
    const tableFields = this.getShowFields();
    let fixedColumn;
    if (fixed && tableFields.length > 0) {
      fixedColumn = tableFields[0].fieldid;
    }
    return values.map((item, index) => {
      const value = this.props.mode === 'ADD' ? generateDefaultFormData(this.state.tableFields, item && item.FieldData || item) : item && { ...item.FieldData } || item;
      const batchAddInfo = {
        type: item && item.type,
        field: _.find(this.state.tableFields, filedItem => filedItem.fieldname === this.props.batchAddField)
      };
      const rowIndex = (showPage - 1) * showCount + index;
      return (
        <RelTableRow
        key={`${this.renderRelTableKey}-${rowIndex}`}
        rowIndex={rowIndex}
        fixedColumn={fixedColumn}
        origin="RelTableRow"
        cacheId={this.props.cacheId}
        globalJS={this.state.globalJS}
        mode={this.props.mode}
        selected={_.includes(this.state.selectedRows, rowIndex)}
        fields={this.state.tableRowFields[rowIndex] || []}
        entityId={this.props.entityId}
        value={value}
        onChange={this.onRowValueChange.bind(this, rowIndex)}
        onSelect={this.onRowSelect}
        ref={formInst => fixed ? this.arrFixedFormInstance[rowIndex] = formInst : this.arrFormInstance[index] = formInst}
        onFieldControlFocus={this.onRowFieldFocus}
        fieldName={this.props.fieldName}
        parentJsEngine={this.props.jsEngine}
        batchAddInfo_type={batchAddInfo.type}
        batchAddInfo_fieldname={batchAddInfo.field && batchAddInfo.field.fieldname}
        batchAddInfo_fieldid={batchAddInfo.field && batchAddInfo.field.fieldid}
        reloadTable={this.reloadTableRow}
        OriginCopyAddForm={!(this.state.tableRowConfigs[rowIndex] && this.state.tableRowConfigs[rowIndex].isNotCopyJs)}
        />
      );
    });
  };

  componentDidUpdate() {
    // this.setAlignTableWidthAndHeight();
    // setTimeout(() => {
    //   this.setAlignTableWidthAndHeight();
    // }, 500);
  }

  setAlignTableWidthAndHeight = () => {
    try {
      if (!(this.relTableRef || this.relTableRef.children)) return;
      //列表的原始表头的列
      const realHeader = this.relTableRef.children[0].children[0].children;
      //列表的固定表头的列
      const fixedTopHeader = this.fixTopTableRef.children[0].children[0].children;

      //列表的原始表头的行
      const realBody = this.relTableRef.children;
      //列表的左固定表的行
      const fixedLeftBody = this.fixLeftTableRef.children;
      for (let i = 0; i < realBody.length; i++) {
        const realBody_trHeight = realBody[i].getBoundingClientRect().height;
        const fixedLeftBody_trHeight = fixedLeftBody[i].getBoundingClientRect().height;

        if (realBody_trHeight !== fixedLeftBody_trHeight) {
          fixedLeftBody[i].children[0].style.height = realBody_trHeight + 'px';
        }
      }

      for (let i = 0; i < fixedLeftBody.length; i++) {
        const fixedLeftBody_Tds = fixedLeftBody[i].children[0].children;
        for (let j = 0; j < fixedLeftBody_Tds.length; j++) {
          fixedLeftBody_Tds[j].style.width = realHeader[j].getBoundingClientRect().width + 'px';
          fixedLeftBody_Tds[j].children[0].style.width = realHeader[j].getBoundingClientRect().width - 6 + 'px';
        }
      }

      //列表的左固定的表格
      let fixedWidth = 0;
      for (let i = 0; i < realHeader.length; i++) {
        if (i < 2) fixedWidth += realHeader[i].getBoundingClientRect().width;
      }
      this.fixLeftWrapRef.style.width = fixedWidth + 'px';

      //是否存在横 纵向滚动条
      const vertical = this.hasScrolled(this.relTableWrapRef);
      const horizontal = this.hasScrolled(this.relTableWrapRef, 'horizontal');

      let scrollWidth = 0;
      if (vertical) scrollWidth = this.getScrollWidth();

      let scrollHeight = 0;
      if (horizontal) scrollHeight = this.getScrollWidth();

      this.fixLeftWrapRef.style.height = this.relTableWrapRef.getBoundingClientRect().height - scrollHeight + 'px';
      this.fixLeftWrapRef.style.maxHeight = TableMaxHeight - scrollHeight + 'px';

      this.fixTopWrapRef.style.width = scrollWidth ? `calc(100% - ${scrollWidth}px)` : undefined;
      this.fixTopWrapRef.style.height = this.relTableWrapRef.children[0].children[0].getBoundingClientRect().height + 1 + 'px';
      this.fixTopTableRef.style.width = this.relTableRef.getBoundingClientRect().width + 'px';


      //顶部固定表格的列宽 需与真实表格保持一致
      for (let i = 0; i < realHeader.length; i++) {
        const realHeader_thWidth = realHeader[i].getBoundingClientRect().width;
        const fixedTopHeader_thWidth = fixedTopHeader[i].getBoundingClientRect().width;
        const realHeader_thHeight = realHeader[i].getBoundingClientRect().height;
        const fixedTopHeader_thHeight = fixedTopHeader[i].getBoundingClientRect().height;
        if (realHeader_thWidth !== fixedTopHeader_thWidth || realHeader_thHeight !== fixedTopHeader_thHeight) {
          fixedTopHeader[i].style.maxWidth = realHeader_thWidth + 'px';
          fixedTopHeader[i].style.width = realHeader_thWidth + 'px';
          fixedTopHeader[i].style.height = realHeader_thHeight + 'px';
        }
      }

      // 根据有无滚动条设置padding高度
      if (this.showPager) {
        const paddingBottom = horizontal ? 50:40  ;
        this.relTableWrapRef.style.paddingBottom = `${paddingBottom}px`;
      } else {
        this.relTableWrapRef.style.paddingBottom = '0px';
      }
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
    if (this.scrollbarwidth > 0) return this.scrollbarwidth;
    let noScroll = document.createElement('DIV');
    let scroll = document.createElement('DIV');
    const oDiv = document.createElement('DIV');
    oDiv.style.cssText = 'position:absolute; top:-1000px; width:100px; height:100px; overflow:hidden;';
    noScroll = document.body.appendChild(oDiv).clientWidth;
    oDiv.style.overflowY = 'scroll';
    scroll = oDiv.clientWidth;
    document.body.removeChild(oDiv);
    this.scrollbarwidth = noScroll - scroll;
    return this.scrollbarwidth;
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

  onPagerChange = (showPage, showCount, callback) => {
    setTimeout(() => {
      this.setState({ showPage, showCount, selectedRows: [] }, callback);
    });
  }

  onPickClick = (item) => {
    const { jsEngine } = this.props;
    const target = jsEngine.getValue(item.sourcefieldname);
    if (!target || !target.id) {
      message.warn(`请先选择${item.sourcedisplayname}`);
      return;
    }
    const targetIds = target.id.split(',');
    const targetNames = target.name.split(',');
    const targets = targetIds.map((t, i) => ({ id: t, name: targetNames[i] }));
    this.setState({ pickerSource: { ...item, targets } });
  }

  inventoryChecked = () => {
    const { tableFields, selectedRows } = this.state;
    if (Array.isArray(tableFields)) {
      const productObj = tableFields.find(item => !!item.fieldconfig.ifstock);
      if (productObj) {
        const fieldname = productObj.fieldname;
        const fieldlabel = productObj.fieldlabel;
        const productids = this.parseValue().filter((o, i) => selectedRows.includes(i) && !!o.FieldData[fieldname]).map(item => {
          const iv = item.FieldData[fieldname];
          return iv[0] === '{' ? JSON.parse(iv).id : iv;
        });
        if (productids.length) {
          this.setState({ productids: [...new Set(productids)], ProductStockVisible: true });
        } else {
          message.info(`请先选择${fieldlabel}`);
        }
      }
    }
  }

  onCancelProductStockModal = () => this.setState({ ProductStockVisible: false });

  render() {
    const { nested, jsEngine } = this.props;
    const { pickerSource, selectedRows, ProductStockVisible, productids = [], tableFields, showCount, showPage } = this.state;
    const values = this.parseValue();
    const rowLength = values.length;
    // 判断选单按钮显示
    let showPickerBtn = [];
    if (nested && nested.length) {
      showPickerBtn = nested.filter(n => !!jsEngine.getFieldVisible(n.sourcefieldname) && (!n.visible || (n.visible && n.visible.visible)));
    }
    const showInventoryCheckedBtn = tableFields && tableFields.length && tableFields.some(f => !!f.fieldconfig.ifstock) && !!selectedRows.length; //查询可用库存

    const showPager = rowLength > 10;
    this.showPager = showPager; // 用于设置padding高度

    let pageSizeOptions = [];
    if (showPager) {
      pageSizeOptions = basePageSizeOptions.filter(p => p.value <= rowLength);
      const poLast = pageSizeOptions.pop();
      if (rowLength - poLast.value === 0) {
        pageSizeOptions.push({ label: '显示全部', value: String(500) });
      } else if (rowLength > poLast.value) {
        pageSizeOptions.push(poLast);
        pageSizeOptions.push({ label: '显示全部', value: String(500) });
      }
    }
    const showValues = values.slice((showPage - 1) * showCount, showPage * showCount);
    const showOptions = [showValues, showPage, showCount];
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
            <Button onClick={this.delRow} type="danger" className={styles.btnGap}>删除</Button>
            {
              showInventoryCheckedBtn ? <Button onClick={this.inventoryChecked} className={styles.btnGap}>查询可用库存</Button> : null
            }
            {
              showPickerBtn.length ? showPickerBtn.map((n, ni) => (
                <Button
                  key={ni}
                  onClick={() => this.onPickClick(n)}
                  className={styles.btnGap}
                >{n.btn}</Button>
              )) : null
            }

          </div>}
          <div className={styles.tableContent} ref={ref => this.tabWrapRef = ref}>
            <div className={classnames(styles.fixTopWrap, { [styles.fixTopWrapHidden]: values.length === 0 })} ref={ref => this.fixTopWrapRef = ref}>
              <div className={classnames([styles.table, styles.fixTopTable])} ref={ref => this.fixTopTableRef = ref}>
                {this.renderTableHeader(false, showOptions)}
              </div>
            </div>
            <div className={styles.tableWrap} style={{ maxHeight: TableMaxHeight }} onScroll={this.tableScroll} ref={ref => this.relTableWrapRef = ref}>
              <div className={styles.table} ref={ref => this.relTableRef = ref}>
                {this.renderTableHeader(false, showOptions)}
                {this.renderTableBody(false, showOptions)}
              </div>
            </div>
            <div className={styles.fixLeftWrap} ref={ref => this.fixLeftWrapRef = ref}>
              <div className={classnames([styles.table, styles.fixLeftTopTable])}>
                {this.renderTableHeader('fixed', showOptions)}
              </div>
              <div className={classnames([styles.table, styles.fixLeftTable])} ref={ref => this.fixLeftTableRef = ref}>
                {this.renderTableHeader('fixed', showOptions)}
                {this.renderTableBody('fixed', showOptions)}
              </div>
            </div>
          </div>
          {/*{this.props.value && <div>*/}
          {/*{JSON.stringify(this.props.value)}*/}
          {/*</div>}*/}
          {
              showPager ? (
                <div className={styles.wrapPage}>
                  <Pagination
                    current={showPage}
                    pageSize={showCount}
                    total={rowLength}
                    showQuickJumper={false}
                    showSizeChanger={false}
                    onChange={page => this.onPagerChange(page, showCount)}
                  />
                  <Select
                    value={String(showCount)}
                    className={styles.allSel}
                    onChange={sc => this.onPagerChange(1, Number(sc))}
                  >
                    {pageSizeOptions.map(p => <Option key={p.value} value={p.value}>{p.label}</Option>)}
                  </Select>
                </div>
              ) : null
            }
        </div>
        <RelTableImportModal visible={this.state.importVisible}
          entityId={this.props.entityId}
          entityTypeId={this.props.entityTypeId}
          mainEntityId={this.props.mainEntityId}
          cancel={() => { this.setState({ importVisible: false }); }}
          onOk={this.addImportData}
        />
        <RelTableBatchModal
          // form={this.props.form}
          visible={/^batchAdd$/.test(this.state.showModals)}
          protocl={_.find(this.state.tableFields, item => item.fieldname === this.props.batchAddField)}
          onCancel={() => { this.setState({ showModals: false }); }}
          onConfirm={this.batchAdd}
        />
        {
          pickerSource && (
            <RelTablePickerModal
              visible={!!pickerSource}
              originValues={values}
              originVcbomConfig={{}}
              pickerSource={pickerSource}
              fieldId={this.props.fieldId}
              entityId={this.props.entityId}
              entityTypeId={this.props.entityTypeId}
              mainEntityId={this.props.mainEntityId}
              jsEngine={this.props.jsEngine}
              onCancel={() => this.setState({ pickerSource: undefined })}
            />
          )
        }
        {
          ProductStockVisible ? (
            <ProductStockModal
              visible={ProductStockVisible}
              entityid={this.props.mainEntityId}
              productids={productids}
              onCancel={this.onCancelProductStockModal}
            />
          ) : null
        }
      </div>
    );
  }
}

RelTable.View = ({ value, entityId, entityTypeId, mainEntityId, fieldname, hiddenRowField }) => {
  return (
    <RelTableView
      mode="DETAIL"
      value={value}
      entityId={entityId}
      entityTypeId={entityTypeId}
      mainEntityId={mainEntityId}
      fieldname={fieldname}
      hiddenRowField={hiddenRowField}
    />
  );
};

export default RelTable;

