import React from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import { Button, Table, Dropdown, Menu, Icon, Popconfirm, Modal } from 'antd';
import Toolbar from '../../../../components/Toolbar';
import IntlText from '../../../../components/UKComponent/Form/IntlText';
import FieldFormModal from './FieldFormModal';
import { fieldModels } from '../../controlTypes';
import FieldSortModal from './FieldSortModal';
import MobileListConfigModal from './MobileListConfigModal2';
import WebListConfigModal from './WebListConfigModal';
import SetMainFieldModal from './SetMainFieldModal';
import SelListFilterModal from './SetListFilterModal';
import SetDynamicFieldsModal from './SetDynamicFieldsModal';
import SetCustomBasicConfigModal from './SetCustomBasicConfigModal';
import SetCustomMailConfigModal from './SetCustomMailConfigModal';
import SetCheckRepeatConfigModal from './SetCheckRepeatConfigModal';
import ExpandJSModal from './ExpandJSModal';
import styles from './EntityFields.less';

function getCtrlNameByType(type) {
  const specialTypes = {
    1001: '记录ID', // 记录ID
    1002: '选人控件',
    1003: '选人控件',
    1004: '日期时间',
    1005: '日期时间',
    1006: '选人控件',
    1007: '单选',
    1008: '单选',
    1009: '单选',
    1011: '日期时间',
    1012: '文本'
  };
  const model = fieldModels.filter(item => item.value === type)[0];
  return (model && model.name) || '系统格式';
}
/**
 * 根据entityType，控制按钮显示
 * @param entityType
 * @return {object}
 */
function showBtns(entityType) {
  const btnVisibleMap = {
    0: ['add', 'order', 'webvis', 'mobvis', 'topfield', 'setfilter', 'checkrepeat'],
    1: ['add', 'order', 'webvis', 'dynamic', 'checkrepeat'],
    2: ['add', 'order', 'webvis', 'mobvis', 'setfilter', 'dynamic', 'checkrepeat'],
    3: ['add', 'order', 'webvis', 'setfilter', 'dynamic', 'checkrepeat']
  };
  const allBtns = ['add', 'order', 'webvis', 'mobvis', 'topfield', 'setfilter', 'dynamic', 'checkrepeat'];
  const showButtons = btnVisibleMap[entityType];
  return allBtns.reduce((retObj, btnName) => {
    return { ...retObj, [btnName]: _.includes(showButtons, btnName) ? true : '' };
  }, {});
}

function EntityFields({
  dispatch,
  entityId,
  entityType,
  list,
  showModals,
  editingRecord,
  modalPending,
  formValues
}) {
  function handleMenuClick(record, event) {
    if (event.key === '1') {
      dispatch({ type: 'entityFields/edit', payload: record });
    } else if (event.key === '2') {
      dispatch({ type: 'entityFields/editExpandJS', payload: { record } });
    } else if (event.key === '3') {
      dispatch({ type: 'entityFields/editExpandJS', payload: { record, type: 'filter' } });
    } else if (event.key === '4') {
      Modal.confirm({
        title: '您确定删除该记录吗？',
        onOk() {
          dispatch({ type: 'entityFields/del', payload: record.fieldid });
        }
      });
    }
  }
  function handleAdd() {
    dispatch({ type: 'entityFields/add' });
  }
  function handleFormSubmit(data, callback) {
    dispatch({ type: 'entityFields/save', payload: { data, callback } });
  }
  function handleFormCancel() {
    dispatch({ type: 'entityFields/hideModal', payload: '' });
  }
  function handleOpenSort() {
    dispatch({ type: 'entityFields/showModals', payload: 'sort' });
  }
  function onSort(data) {
    const params = data.map((item, index) => {
      return {
        fieldid: item.id,
        recorder: index + 1
      };
    });
    dispatch({ type: 'entityFields/sort', payload: params });
  }
  function editMobList() {
    dispatch({ type: 'entityFields/showModals', payload: 'mListConfig' });
  }
  function editWebList() {
    dispatch({ type: 'entityFields/showModals', payload: 'wListConfig' });
  }
  function setMainField() {
    dispatch({ type: 'entityFields/showModals', payload: 'setMainField' });
  }
  function setListFilter() {
    dispatch({ type: 'entityFields/showModals', payload: 'listFilter' });
  }
  function setDynamicFields() {
    dispatch({ type: 'entityFields/showModals', payload: 'dynamicFields' });
  }

  function setCustomBasicConfig() {
    dispatch({ type: 'entityFields/showModals', payload: 'customBasicConfig' });
  }
  function setCustomMailConfig() {
    dispatch({ type: 'entityFields/showModals', payload: 'customMailConfig' });
  }

  function setCheckRepeatFields() {
    dispatch({ type: 'entityFields/showModals', payload: 'checkRepeatConfig' });
  }
  const columns = [
    { title: '序号',
      dataIndex: 'row_number',
      width: 60,
      key: 'row_number' },
    { title: '字段名称',
      dataIndex: 'fieldlabel',
      width: 160,
      key: 'fieldlabel',
      render: (text, record) => <IntlText value={text} value_lang={record.fieldlabel_lang} />
    },
    { title: '显示名称',
      dataIndex: 'displayname',
      width: 160,
      key: 'displayname',
      render: (text, record) => <IntlText value={text || record.fieldlabel} value_lang={record.displayname_lang || record.fieldlabel_lang} /> },
    { title: '格式',
      dataIndex: 'controltype',
      key: 'controltype',
      width: 100,
      render: val => getCtrlNameByType(val) },
    { title: '字段类型',
      dataIndex: 'fieldtype',
      width: 100,
      key: 'fieldtype',
      render: val => (['系统字段', '默认字段', '自定义字段'][val]) },
    { title: '字段列名',
      dataIndex: 'fieldname',
      key: 'fieldname' },
    { title: '状态',
      dataIndex: 'recstatus',
      width: 80,
      key: 'recstatus',
      render: val => (['禁用', '启用'][val]) },
    { title: '配置JS',
      dataIndex: 'expandjs',
      key: 'expandjs',
      width: 70,
      render: (val) => {
        return val ? <Icon type="check" /> : null;
      } },
    { title: '过滤JS',
      dataIndex: 'filterjs',
      key: 'filterjs',
      width: 70,
      render: (val) => {
        return val ? <Icon type="check" /> : null;
      } },
    { title: '操作',
      key: 'operation',
      width: 100,
      render: (val, record) => {
        const menu = (
          <Menu onClick={(e) => handleMenuClick(record, e)}>
            <Menu.Item key="1">编辑</Menu.Item>
            {record.controltype !== 20 && <Menu.Item key="2">配置脚本</Menu.Item>}
            {record.controltype !== 20 && <Menu.Item key="3">配置过滤脚本</Menu.Item>}
            {record.fieldtype === 2 && <Menu.Item key="4">删除</Menu.Item>}
          </Menu>
        );
        return (
          <Dropdown overlay={menu}>
            <Button size="default" type="default" style={{ border: 'none' }}>
              <Icon style={{ marginRight: 2 }} type="bars" />
              <Icon type="down" />
            </Button>
          </Dropdown>
        );
      } }
  ];

  const btns = showBtns(entityType);
  return (
    <div>
      <Toolbar>
        {btns.add && <Button onClick={handleAdd}>添加字段</Button>}
        {btns.order && <Button onClick={handleOpenSort}>排序</Button>}
        {btns.webvis && <Button onClick={editWebList}>设置web列表显示字段</Button>}
        {btns.mobvis && <Button onClick={editMobList}>设置手机端列表显示</Button>}
        {btns.topfield && <Button onClick={setMainField}>设置主页顶部显示字段</Button>}
        {btns.setfilter && <Button onClick={setListFilter}>设置筛选条件</Button>}
        {btns.dynamic && <Button onClick={setDynamicFields}>动态摘要配置</Button>}
        {btns.checkrepeat && <Button onClick={setCheckRepeatFields}>设置查重条件</Button>}
        {entityId === 'f9db9d79-e94b-4678-a5cc-aa6e281c1246' ? <Button onClick={setCustomBasicConfig}>设置客户基础资料字段</Button> : null}
        {entityId === 'f9db9d79-e94b-4678-a5cc-aa6e281c1246' ? <Button onClick={setCustomMailConfig}>设置邮件客户信息字段</Button> : null}
      </Toolbar>
      <Table
        columns={columns}
        rowKey="fieldid"
        pagination={false}
        dataSource={list}
        scroll={{ y: document.body.clientHeight - 290 }}
      />
      <FieldFormModal
        showModals={showModals}
        dispatch={dispatch}
        editingRecord={editingRecord}
        formValues={formValues}
        modalPending={modalPending}
        onOk={handleFormSubmit}
        onCancel={handleFormCancel}
        entityFields={list}
        entityId={entityId}
      />
      <FieldSortModal
        showModals={showModals}
        fields={list}
        modalPending={modalPending}
        onOk={onSort}
        onCancel={handleFormCancel}
      />
      <MobileListConfigModal />
      <WebListConfigModal />
      <SetMainFieldModal />
      <SelListFilterModal />
      <SetDynamicFieldsModal />
      <SetCustomBasicConfigModal />
      <SetCustomMailConfigModal />
      <SetCheckRepeatConfigModal />
      <ExpandJSModal />
    </div>
  );
}


export default connect(({ entityFields }) => entityFields)(EntityFields);
