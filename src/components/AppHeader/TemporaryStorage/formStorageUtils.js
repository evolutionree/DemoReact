//TODO: 暂存功能  WEB端跟移动端  数据格式 不一致  移动端先做，只能以他们为标准  前端把数据转成移动端定制的标准  显示的时候 又转成WEB端的格式

const TYPE1 = [3, 4, 25, 1002, 1003, 1006]; //单选 多选 选人控件

function getFielConfig(field) {
  //TODO: 数据源三个端一致
  const designateDataSource = field.fieldconfig.designateDataSource;
  const designateDataSourceByName = field.fieldconfig.designateDataSourceByName;
  const designateFilterDataSource = field.fieldconfig.designateFilterDataSource;
  const designateFilterDataSourceByName = field.fieldconfig.designateFilterDataSourceByName;

  const designateNodes = field.fieldconfig.designateNodes;
  const designateFilterNodes = field.fieldconfig.designateFilterNodes;
  let fieldconfig = {
    ...field.fieldconfig,
    designateNode: designateNodes instanceof Array && designateNodes.map(designateNodeItem => {
      //TODO: WEB端是[{ path: '', includeSubNode: ''}]数据结构  移动端是[{ nodepath: '', includeSubNode: ''}]
      return {
        nodepath: designateNodeItem.path,
        includeSubNode: designateNodeItem.includeSubNode
      };
    }),
    designateFilterNodes: designateFilterNodes instanceof Array && designateFilterNodes.map(designateFilterNodeItem => {
      //TODO: WEB端是["广州分公司"]数据结构  移动端是[{ nodepath: '广州分公司' }]
      return {
        nodepath: designateFilterNodeItem
      };
    })
  };

  if (TYPE1.indexOf(field.controltype) > -1) {
    const designateDataSelect = designateDataSource && designateDataSource.split(',').map(designItem => {
      return { key: designItem, value: '' };
    })
    fieldconfig = {
      ...fieldconfig,
      designateDataSource: null,
      designateDataSelect: designateDataSelect,
      //TODO: 单选 多选 选人控件如果配置JS是通过designateDataSelectByName 设置可选范围， 移动端会转成designateDataSelect数组对象返回前端，前端再暂存  就转成
      // 了designateDataSource 那么 就不再传designateDataSelectByName
      designateDataSelectByName: designateDataSelect && designateDataSelect instanceof Array && designateDataSelect.length > 0 ? null : designateDataSourceByName,
      designateFilterDataSource: designateFilterDataSource && designateFilterDataSource.split(',').map(designItem => {
        return { key: designItem, value: '' };
      }),
      designateFilterDataSourceByName: designateFilterDataSourceByName
    };
  }

  return fieldconfig;
}

export function frontEndData_to_BackEndData(form) {
  let fieldjson = {};
  form.props.fields.map(item => {
    let fieldconfig = getFielConfig(item);
    const isVisible = fieldconfig.isVisible !== 1 ? 0 : fieldconfig.isVisibleJS === 0 ? 0 : 1;
    const isReadOnly = fieldconfig.isReadOnly === 1 ? 1 : fieldconfig.isReadOnlyJS ? 1 : 0;
    const isRequired = fieldconfig.isRequired === 1 ? 1 : fieldconfig.isRequiredJS ? 1 : 0;

    fieldjson[item.fieldid] = {
      ...fieldconfig,
      isHidden: isVisible === 0 ? 1 : 0,
      isReadOnly: isReadOnly,
      isRequired: isRequired
    };

    if (item.controltype === 24) {
      const tableFields = form.formRef.getTableFields(item.fieldname);
      const tableRowFields = form.formRef.getTableRowFields(item.fieldname);
      fieldjson[item.fieldid].sheetfieldglobal = {};
      tableFields.map(tableFieldItem => {
        let tableFieldConfig = getFielConfig(tableFieldItem);
        const tableFieldIsVisible = tableFieldConfig.isVisible !== 1 ? 0 : tableFieldConfig.isVisibleJS === 0 ? 0 : 1;
        const tableFieldIsReadOnly = tableFieldConfig.isReadOnly === 1 ? 1 : tableFieldConfig.isReadOnlyJS ? 1 : 0;
        const tableFieldIsRequired = tableFieldConfig.isRequired === 1 ? 1 : tableFieldConfig.isRequiredJS ? 1 : 0;
        fieldjson[item.fieldid].sheetfieldglobal[tableFieldItem.fieldid] = {
          ...tableFieldConfig,
          isHidden: tableFieldIsVisible === 0 ? 1 : 0,
          isReadOnly: tableFieldIsReadOnly,
          isRequired: tableFieldIsRequired
        };
      });

      fieldjson[item.fieldid].sheetfield = [];
      tableRowFields.map(tableRowFieldItem => { //TODO 表格每一行的协议
        let rowFieldConfig = {};
        tableRowFieldItem.map(tableFieldItem => {
          let tableFieldConfig = getFielConfig(tableFieldItem);
          const tableFieldIsVisible = tableFieldConfig.isVisible !== 1 ? 0 : tableFieldConfig.isVisibleJS === 0 ? 0 : 1;
          const tableFieldIsReadOnly = tableFieldConfig.isReadOnly === 1 ? 1 : tableFieldConfig.isReadOnlyJS ? 1 : 0;
          const tableFieldIsRequired = tableFieldConfig.isRequired === 1 ? 1 : tableFieldConfig.isRequiredJS ? 1 : 0;
          rowFieldConfig[tableFieldItem.fieldid] = {
            ...tableFieldConfig,
            isHidden: tableFieldIsVisible === 0 ? 1 : 0,
            isReadOnly: tableFieldIsReadOnly,
            isRequired: tableFieldIsRequired
          };
        });
        fieldjson[item.fieldid].sheetfield.push(rowFieldConfig);
      });
    }
  });

  return fieldjson;
}


export function BackEndData_to_frontEndData(fields, fieldjson) {
  let fields_ = fields;
  if (fieldjson) {
    fields_ = fields.map(item => {
      let newItem = item;
      if (fieldjson[item.fieldid]) {
        let fieldJson_config = getBackEndField_TO_FrontEnd(fieldjson[item.fieldid], item);
        newItem.fieldconfig = {
          ...item.fieldconfig,
          ...fieldJson_config,
          isRequiredJS: fieldJson_config.isRequired,
          isReadOnlyJS: fieldJson_config.isReadOnly,
          isVisibleJS: fieldJson_config.isHidden === 0 ? 1 : 0
        };
      }
      return newItem;
    });
  }

  return fields_;
}


export function getBackEndField_TO_FrontEnd(fieldJson_config, field) {
  const designateDataSelect = fieldJson_config.designateDataSelect;
  const designateDataSelectByName = fieldJson_config.designateDataSelectByName
  const designateFilterDataSource = fieldJson_config.designateFilterDataSource;
  const designateFilterDataSourceByName = fieldJson_config.designateFilterDataSourceByName;

  const designateNode = fieldJson_config.designateNode;
  const designateFilterNodes = fieldJson_config.designateFilterNodes;
  let fieldconfig = {
    ...fieldJson_config,
    designateNodes: designateNode instanceof Array && designateNode.map(designateNodeItem => {
      //TODO: WEB端是[{ path: '', includeSubNode: ''}]数据结构  移动端是[{ nodepath: '', includeSubNode: ''}]
      return {
        path: designateNodeItem.nodepath,
        includeSubNode: designateNodeItem.includeSubNode
      };
    }),
    designateFilterNodes: designateFilterNodes instanceof Array && designateFilterNodes.map(designateFilterNodeItem => {
      //TODO: WEB端是["广州分公司"]数据结构  移动端是[{ nodepath: '广州分公司' }]
      return designateFilterNodeItem.nodepath;
    })
  };

  if (TYPE1.indexOf(field.controltype) > -1) {
    fieldconfig = {
      ...fieldconfig,
      designateDataSource: designateDataSelect instanceof Array && designateDataSelect.map(designItem => {
        return designItem.key;
      }).join(','),
      designateDataSourceByName: designateDataSelectByName,
      designateFilterDataSource: designateFilterDataSource instanceof Array && designateFilterDataSource.map(designItem => {
        return designItem.key;
      }).join(','),
      designateFilterDataSourceByName: designateFilterDataSourceByName
    };
  };
  return fieldconfig;
}
