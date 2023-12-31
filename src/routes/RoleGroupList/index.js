import React from 'react';
import { connect } from 'dva';
import Page from '../../components/Page';
// import Toolbar from '../../components/Toolbar';
// import NewRoleGroupForm from './components/NewRoleGroupForm';
import ParamsBoard from '../../components/ParamsBoard/ParamsBoard';

function RoleGroups({
  dispatch,
  list,
  checkFunc
}) {
  function handleSave(data) {
    dispatch({ type: 'roleGroups/save', payload: { groupname_lang: data.rolegroupname_lang } });
  }
  function handleDel(item, index) {
    dispatch({ type: 'roleGroups/del', payload: item.rolegroupid });
  }
  function handleUpdate({ rolegroupid, rolegroupname_lang }) {
    dispatch({ type: 'roleGroups/update', payload: { rolegroupid, groupname_lang: rolegroupname_lang } });
  }

  const fields = [{
    key: 'rolegroupname',
    name: '角色分类名称',
    maxLength: 20,
    intl: true
  }];

  return (
    <Page title="角色分类">
      <ParamsBoard
        items={list}
        fields={fields}
        itemKey="groupId"
        onCreate={handleSave}
        onUpdate={handleUpdate}
        onDel={handleDel}
        showAdd={checkFunc('RoleTypeAdd')}
        showEdit={item => item.grouptype !== 0 && checkFunc('RoleTypeEdit')}
        showDel={item => item.grouptype !== 0 && checkFunc('RoleTypeDelete')}
        showSwitch={item => item.grouptype !== 0}
      />
    </Page>
  );
}

export default connect(state => state.roleGroups)(RoleGroups);
