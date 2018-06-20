import React from 'react';
import { Table, Checkbox } from 'antd';
// import styles from './RuleTable.less';

function RuleTable({
  list = [],
  onCheckboxChange,
  useType
}) {
  function checkboxRender(key, value, record, index) {
    // if (record.fieldlabel === '提示文本') {
    //   console.log(record);
    // }
    const isImportCheckbox = /import/.test(key);
    let disabled = false;
    // 头像，提示文本，分组，定位，图片，附件，表格不支持勾选导入
    if (isImportCheckbox && [15, 2, 20, 14, 22, 23, 24].indexOf(record.controlType) !== -1) {
      disabled = true;
    }
    return (
      <Checkbox
        checked={!!value}
        onChange={(e) => { onCheckboxChange(key, e.target.checked, index); }}
        disabled={(record.recstatus !== 1 && key !== 'recstatus') || disabled}
      />
    );
  }
  function checkboxRender1(key, value, record, index) {
    // if (record.fieldlabel === '提示文本') {
    //   console.log(record);
    // }
    const checked = /Visible/.test(key) ? !value : !!value;
    // 系统字段必须使用，且只可控制查看时是否隐藏，新增和编辑属性默认不勾选且不可修改
    let disabled = false;
    if (record.controlType >= 1000) {
      if (key === 'recstatus') {
        disabled = true;
      } else if (/add|edit/.test(key)) {
        disabled = true;
      }
    }
    return (
      <Checkbox
        checked={checked}
        onChange={(e) => {
          const checkedNew = e.target.checked;
          onCheckboxChange(key, /Visible/.test(key) ? !checkedNew : checkedNew, index);
        }}
        disabled={(record.recstatus !== 0 && key !== 'recstatus') || disabled}
      />
    );
  }
  const columns = useType === 0 ? [
    { title: '序号', key: 'order', dataIndex: 'order' },
    { title: '名称', key: 'displayname', dataIndex: 'displayname' },
    { title: '是否使用', key: 'recstatus', dataIndex: 'recstatus', render: checkboxRender.bind(null, 'recstatus') },
    {
      title: '新增',
      children: [
        { title: '显示', key: 'rule-add-isVisible', dataIndex: 'rule-add-isVisible', render: checkboxRender.bind(null, 'rule-add-isVisible') },
        { title: '必填', key: 'rule-add-isRequired', dataIndex: 'rule-add-isRequired', render: checkboxRender.bind(null, 'rule-add-isRequired') },
        { title: '只读', key: 'rule-add-isReadOnly', dataIndex: 'rule-add-isReadOnly', render: checkboxRender.bind(null, 'rule-add-isReadOnly') }
      ]
    },
    {
      title: '编辑',
      children: [
        { title: '显示', key: 'rule-edit-isVisible', dataIndex: 'rule-edit-isVisible', render: checkboxRender.bind(null, 'rule-edit-isVisible') },
        { title: '必填', key: 'rule-edit-isRequired', dataIndex: 'rule-edit-isRequired', render: checkboxRender.bind(null, 'rule-edit-isRequired') },
        { title: '只读', key: 'rule-edit-isReadOnly', dataIndex: 'rule-edit-isReadOnly', render: checkboxRender.bind(null, 'rule-edit-isReadOnly') }
      ]
    },
    {
      title: '查看',
      children: [
        { title: '显示', key: 'rule-detail-isVisible', dataIndex: 'rule-detail-isVisible', render: checkboxRender.bind(null, 'rule-detail-isVisible') }
      ]
    },
    {
      title: '导入',
      children: [
        { title: '显示', key: 'rule-import-isVisible', dataIndex: 'rule-import-isVisible', render: checkboxRender.bind(null, 'rule-import-isVisible') },
        { title: '必填', key: 'rule-import-isRequired', dataIndex: 'rule-import-isRequired', render: checkboxRender.bind(null, 'rule-import-isRequired') }
      ]
    },
    {
      title: '同步',
      children: [
        { title: '显示', key: 'rule-snyc-isVisible', dataIndex: 'rule-sync-isVisible', render: checkboxRender.bind(null, 'rule-sync-isVisible') }
      ]
    }
  ] : [
    { title: '序号', key: 'order', dataIndex: 'order' },
    { title: '名称', key: 'displayname', dataIndex: 'displayname' },
    { title: '是否禁用', key: 'recstatus', dataIndex: 'recstatus', render: checkboxRender1.bind(null, 'recstatus') },
    {
      title: '新增',
      children: [
        { title: '隐藏', key: 'rule-add-isVisible', dataIndex: 'rule-add-isVisible', render: checkboxRender1.bind(null, 'rule-add-isVisible') },
        { title: '只读', key: 'rule-add-isReadOnly', dataIndex: 'rule-add-isReadOnly', render: checkboxRender1.bind(null, 'rule-add-isReadOnly') }
      ]
    },
    {
      title: '编辑',
      children: [
        { title: '隐藏', key: 'rule-edit-isVisible', dataIndex: 'rule-edit-isVisible', render: checkboxRender1.bind(null, 'rule-edit-isVisible') },
        { title: '只读', key: 'rule-edit-isReadOnly', dataIndex: 'rule-edit-isReadOnly', render: checkboxRender1.bind(null, 'rule-edit-isReadOnly') }
      ]
    },
    {
      title: '查看',
      children: [
        { title: '隐藏', key: 'rule-detail-isVisible', dataIndex: 'rule-detail-isVisible', render: checkboxRender1.bind(null, 'rule-detail-isVisible') }
      ]
    },
    {
      title: '导入',
      children: [
        { title: '隐藏', key: 'rule-import-isVisible', dataIndex: 'rule-import-isVisible', render: checkboxRender1.bind(null, 'rule-import-isVisible') }
      ]
    },
    {
      title: '同步',
      children: [
        { title: '隐藏', key: 'rule-snyc-isVisible', dataIndex: 'rule-sync-isVisible', render: checkboxRender1.bind(null, 'rule-sync-isVisible') }
      ]
    }
  ];
  return (
    <Table
      bordered
      columns={columns}
      dataSource={list}
      pagination={false}
      rowKey={(record) => (record.fieldid + record.typeid)}
    />
  );
}

export default RuleTable;
