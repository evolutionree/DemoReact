import React from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import { Select, Button, Table } from 'antd';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import styles from './Structure.less';
import ChangeDeptModal from './ChangeDeptModal';
import SelectRole from "../../components/SelectRole";
import BindAttence from './BindAttence';

const Option = Select.Option;
const Column = Table.Column;

function UserList({
  checkFunc,
  departments,
  queries,
  total,
  list,
  currentItems,
  search,
  add,
  edit,
  assignRole,
  toggleUserStatus,
  changeDept,
  selectItems,
  revertPassword,
  toggleSetLeader,
  importData,
  currentUser,
   bindAttence
}) {
  function exportData() {
    const params = JSON.stringify(_.mapValues({ ...queries, pageIndex: 1, pageSize: 65535 }, val => val + ''));
    window.open(`/api/excel/exportdata?TemplateType=0&FuncName=account_userinfo_export&QueryParameters=${params}&UserId=${currentUser}`);
  }
  const currentDept = _.find(departments, ['deptid', queries.deptId]);
  const isDisabledDept = currentDept && currentDept.recstatus === 0;
  return (
    <div className={styles.rightContent}>
      <div className={styles.subtitle}>{currentDept && currentDept.deptname}</div>
      <Toolbar
        selectedCount={isDisabledDept ? 0 : currentItems.length}
        actions={[
          { label: '编辑', handler: edit, single: true, show: checkFunc('UserEdit') },
          { label: '分配角色职能', handler: assignRole, show: checkFunc('RoleAndVocation') },
          { label: '停用', handler: toggleUserStatus, single: true,
            show: () => checkFunc('UserEnable') && currentItems[0].recstatus === 1 },
          { label: '启用', handler: toggleUserStatus, single: true,
            show: () => checkFunc('UserEnable') && currentItems[0].recstatus === 0 },
          { label: '转换团队', handler: changeDept, single: true, show: checkFunc('DepartmentChange') },
          { label: '重置密码', handler: revertPassword, single: false, show: checkFunc('ReconvertPwd') },
          { label: '取消设为领导', handler: toggleSetLeader, single: true,
            show: () => checkFunc('SetLeader') && !!currentItems[0].isleader },
          { label: '设为领导', handler: toggleSetLeader, single: true,
            show: () => checkFunc('SetLeader') && !currentItems[0].isleader },
          { label: '绑定考勤组', handler: bindAttence, single: false,
            show: () => checkFunc('SetLeader') }
        ]}
      >
        {/*<SelectRole value={queries.roleId} onChange={search.bind(null, 'roleId')} style={{ width: '160px' }} />*/}
        <Select value={queries.recStatus} onChange={search.bind(null, 'recStatus')}>
          <Option value="1">启用</Option>
          <Option value="0">停用</Option>
        </Select>
        {!isDisabledDept && checkFunc('UserAdd') && <Button onClick={add}>新增</Button>}
        {checkFunc('UserImport') && <Button onClick={importData}>导入</Button>}
        {checkFunc('UserExport') && <Button onClick={exportData}>导出</Button>}
        <Toolbar.Right>
          <Search
            value={queries.userName}
            onSearch={val => search({ userName: val, userPhone: val })}
            placeholder="请输入姓名或手机号"
          />
        </Toolbar.Right>
      </Toolbar>

      <Table
        scroll={{ x: '100%' }}
        className={styles.table}
        rowKey="accountid"
        dataSource={list}
        rowSelection={{
          selectedRowKeys: currentItems.map(item => item.accountid),
          onChange: (keys, items) => { selectItems(items); }
        }}
        pagination={{
          total,
          current: +queries.pageIndex,
          pageSize: +queries.pageSize,
          onChange: search.bind(null, 'pageIndex'),
          onShowSizeChange: (page, size) => { search('pageSize', size); }
        }}
      >
        <Column title="姓名" dataIndex="username" key="username" render={text => <span>{text}</span>} />
        <Column title="手机号" dataIndex="userphone" key="userphone" render={text => <span>{text}</span>} />
        <Column title="账号" dataIndex="accountname" key="accountname" render={text => <span>{text}</span>} />
        <Column title="工号" dataIndex="workcode" key="workcode" render={text => <span>{text}</span>} />
        <Column title="团队组织" dataIndex="deptname" key="deptname" render={text => <span>{text}</span>} />
        <Column title="上级团队" dataIndex="pdeptname" key="pdeptname" render={text => <span>{text}</span>} />
        <Column title="角色" dataIndex="rolename" key="rolename" render={text => <span>{text}</span>} />
        <Column title="职能" dataIndex="vocationname" key="vocationname" render={text => <span>{text}</span>} />
        <Column title="是否领导" dataIndex="isleader" key="isleader" render={text => <span>{text ? '是' : '否'}</span>} />

        <Column
          title="状态"
          dataIndex="recstatus"
          key="recstatus"
          render={text => <span>{['停用', '启用'][text]}</span>}
        />
        <Column title="最后更新人" dataIndex="updator" key="updator" render={text => <span>{text}</span>} />
        <Column title="最后更新时间" dataIndex="recupdated" key="recupdated" render={text => <span>{text}</span>} />
      </Table>
      <ChangeDeptModal />
      <BindAttence />
    </div>
  );
}

export default connect(
  state => {
    return {
      ...state.structure,
      currentUser: state.app.user.userid
    };
  },
  dispatch => {
    return {
      search: (key, value) => {
        const objSearch = typeof key === 'object' ? key : { [key]: value };
        dispatch({ type: 'structure/search', payload: objSearch });
      },
      add: () => {
        dispatch({ type: 'structure/showModals', payload: 'addUser' });
      },
      edit: () => {
        dispatch({ type: 'structure/showModals', payload: 'editUser' });
      },
      assignRole: () => {
        dispatch({ type: 'structure/showModals', payload: 'assignRole' });
      },
      toggleUserStatus: () => {
        dispatch({ type: 'structure/toggleUserStatus' });
      },
      changeDept: () => {
        dispatch({ type: 'structure/showModals', payload: 'changeDept' });
      },
      importXsl: () => {
        dispatch({ type: 'structure/showModals', payload: 'importXsl' });
      },
      transfer: () => {
        dispatch({ type: 'structure/showModals', payload: 'transfer' });
      },
      selectItems: (items) => {
        dispatch({ type: 'structure/putState', payload: { currentItems: items } });
      },
      revertPassword: () => {
        dispatch({ type: 'structure/showModals', payload: 'resetPassword' });
      },
      toggleSetLeader: () => {
        dispatch({ type: 'structure/toggleSetLeader' });
      },
      bindAttence: () => {
        dispatch({ type: 'structure/showModals', payload: 'bindAttence' });
      },
      importData: () => {
        dispatch({
          type: 'task/impModals',
          payload: {
            templateType: 0,
            templateKey: 'account_userinfo_import',
            showOperatorType: false,
            explainInfo: [
              '模版中的表头名称不可更改，表头行不能删除',
              '导入文件大小请勿超过 2 MB',
              '红色列表头为必填字段',
              '其他选填字段，如填写了，数据也要正确，否则导入会失败',
              '日期格式为 YYYY/MM/DD,如 2015/8/8'
            ]
          }
        });
      }
    };
  }
)(UserList);
