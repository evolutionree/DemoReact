import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';

import { Button, Select, Table, Modal, message } from 'antd';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import RoleFormModal from './RoleFormModal';
import CopyRoleFormModal from './CopyRoleFormModal';

import IntlText, { getIntlText } from '../../components/UKComponent/Form/IntlText';

const Option = Select.Option;
const Column = Table.Column;

function RoleList(props) {
  function search(key, val) {
    const query = typeof key === 'object'
      ? { ...queries, pageIndex: 1, ...key }
      : { ...queries, pageIndex: 1, [key]: val };
    dispatch(routerRedux.push({ pathname, query }));
  }
  function handleEdit() {
    dispatch({ type: 'roleList/edit' });
  }
  function handleDel() {
    Modal.confirm({
      title: '确认删除吗？',
      onOk: () => {
        dispatch({ type: 'roleList/del', payload: currentRecords.map(item => item.roleid).join(',') });
      }
    });
  }
  function handleCopy(payload) {
    dispatch({ type: 'roleList/showModals', payload: 'copy' });
  }
  function handleAdd() {
    dispatch({ type: 'roleList/add' });
  }
  function handleSave(payload) {
    dispatch({ type: 'roleList/save', payload });
  }
  function handleSaveCopy(payload) {
    dispatch({ type: 'roleList/saveCopy', payload });
  }
  function handleCancel() {
    dispatch({ type: 'roleList/hideModal' });
  }
  function handleSelect(records) {
    dispatch({ type: 'roleList/currentRecords', payload: records });
  }

  const {
    dispatch,
    location: { pathname },
    roleGroups,
    queries,
    list,
    total,
    currentRecords,
    checkFunc
  } = props;

  const { pageIndex, pageSize, roleName, groupId } = queries;

  return (
    <Page title="角色管理">
      <Toolbar
        selectedCount={currentRecords.length}
        actions={[
          { label: '编辑', handler: handleEdit, single: true,
            show: () => checkFunc('RoleAuthEdit') && currentRecords.every(item => item.roletype === 1) },
          { label: '删除', handler: handleDel,
            show: () => checkFunc('RoleAuthDelete') && currentRecords.every(item => item.roletype === 1) },
          { label: '复制角色并创建', handler: handleCopy, single: true, show: checkFunc('RoleAuthCopy') }
        ]}
      >
        <Select value={groupId} onChange={search.bind(null, 'groupId')} style={{ width: '120px' }}>
          {roleGroups.map(item => (
            <Option key={item.rolegroupid} value={item.rolegroupid}>{item.rolegroupname}</Option>
          ))}
        </Select>
        {checkFunc('RoleAuthAdd') && <Button onClick={handleAdd}>新建角色</Button>}
        <Toolbar.Right>
          <Search
            label="搜索"
            maxLength={20}
            value={roleName}
            placeholder="请输入角色名称搜索"
            onSearch={search.bind(null, 'roleName')}
          />
        </Toolbar.Right>
      </Toolbar>

      <Table
        rowKey="roleid"
        dataSource={list}
        rowSelection={{
          selectedRowKeys: currentRecords.map(item => item.roleid),
          onChange: (keys, items) => { handleSelect(items); }
        }}
        pagination={{
          total,
          pageSize: +pageSize,
          current: +pageIndex,
          onChange: page => { search('pageIndex', page); },
          onShowSizeChange: (curr, size) => { search({ pageIndex: 1, pageSize: size }); }
        }}
      >
        <Column
          title="角色名称"
          key="rolename"
          dataIndex="rolename"
          render={(text, record) => {
            const intlText = getIntlText('rolename', record);
            return checkFunc('RoleAuthDetail')
              ? <Link to={`/role/${record.roleid}/${record.roletype}/${intlText}`}>{intlText}</Link>
              : <span>{intlText}</span>;
          }}
        />
        <Column title="角色分类" key="rolegroupname" dataIndex="rolegroupname" />
        <Column title="角色描述" key="roleremark" dataIndex="roleremark" />
      </Table>
      <RoleFormModal {...props} onOk={handleSave} onCancel={handleCancel} />
      <CopyRoleFormModal {...props} onOk={handleSaveCopy} onCancel={handleCancel} />
    </Page>
  );
}

export default connect(({ roleList }) => roleList)(RoleList);

