import React from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import { Select, Button, Table } from 'antd';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import styles from './Structure.less';
import ChangeDeptModal from './ChangeDeptModal';
import LoginInfoModal from './LoginInfoModal';
// import SelectRole from "../../components/SelectRole";
import BindAttence from './BindAttence';
import TransferData from './TransferDataModal/TransferData';
import { downloadFile } from '../../utils/ukUtil';

const Option = Select.Option;

const screenHeight = document.body.offsetHeight && document.documentElement.clientHeight;
const modalHeight = screenHeight * 0.6;


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
  bindAttence,
  setPwdValid,
  setForceLogout,
  transferData,
  getLoginInfo
}) {
  function exportData() {
    const params = JSON.stringify(_.mapValues({ ...queries, pageIndex: 1, pageSize: 65535 }, val => val + ''));
    downloadFile(`/api/excel/exportdata?TemplateType=0&FuncName=account_userinfo_export&QueryParameters=${params}&UserId=${currentUser}`);
  }
  const currentDept = _.find(departments, ['deptid', queries.deptId]);
  const isDisabledDept = currentDept && currentDept.recstatus === 0;

  const tooltipElements = (text, width) => (
    <div
      className={`${text}`.length > 5 ? styles.hide : ''}
      title={`${text}`}
      style={{ maxWidth: `${width - 21}px` }}
    >
      {text}
    </div>
  );

  const LoopList = [
    { title: '姓名', key: 'username', width: 80, fixed: 'left' },
    { title: '手机号', key: 'userphone', width: 110, fixed: 'left' },
    { title: '账号', key: 'accountname', width: 110 },
    { title: '工号', key: 'workcode', width: 90 },
    { title: '团队组织', key: 'deptname', width: 110 },
    { title: '上级团队', key: 'pdeptname', width: 160 },
    { title: '角色', key: 'rolename', width: 110 },
    { title: '职能', key: 'vocationname' },
    { title: '是否领导', key: 'isleader', width: 80, render: text => tooltipElements(text ? '是' : '否', 80) },
    { title: '状态', key: 'recstatus', width: 50, render: text => tooltipElements(['停用', '启用'][text], 50) },
    { title: '最后更新人', key: 'updator' },
    { title: '最后更新时间', key: 'recupdated', width: 150 }
  ];

  const renderList = (colList) => (
    colList.map(item => {
      return {
        ...item,
        dataIndex: item.key,
        width: item.width || 100,
        fixed: item.fixed || false,
        render: item.render ? item.render : (text => tooltipElements(text, item.width || 100)),
        children: item.children ? renderList(item.children) : false
      };
    })
  );
  const columns = renderList(LoopList);
  const tableWidth = columns.reduce((sum, current) => sum + current.width, 0) + 62;

  return (
    <div className={styles.rightContent}>
      <div className={styles.subtitle}>{currentDept && currentDept.deptname}</div>
      <Toolbar 
        selectedCount={isDisabledDept ? 0 : currentItems.length}
        actions={[
          { label: '编辑', handler: edit, single: true, show: checkFunc('UserEdit') },
          { label: '分配角色职能', handler: assignRole, show: checkFunc('RoleAndVocation') },
          {
            label: '停用', handler: toggleUserStatus, single: true,
            show: () => checkFunc('UserEnable') && currentItems[0].recstatus === 1
          },
          {
            label: '启用', handler: toggleUserStatus, single: true,
            show: () => checkFunc('UserEnable') && currentItems[0].recstatus === 0
          },
          { label: '转换团队', handler: changeDept, single: true, show: checkFunc('DepartmentChange') },
          { label: '重置密码', handler: revertPassword, single: false, show: checkFunc('ReconvertPwd') },
          {
            label: '取消设为领导', handler: toggleSetLeader, single: true,
            show: () => checkFunc('SetLeader') && !!currentItems[0].isleader
          },
          {
            label: '设为领导', handler: toggleSetLeader, single: true,
            show: () => checkFunc('SetLeader') && !currentItems[0].isleader
          },
          // {
          //   label: '绑定考勤组', handler: bindAttence, single: false,
          //   show: () => checkFunc('SetLeader')
          // },
          // { label: '密码失效', handler: setPwdValid, single: false },
          // { label: '注销设备', handler: setForceLogout, single: false },
          // { label: '一键转移数据', handler: transferData, single: false },
          // { label: '登录信息', handler: getLoginInfo, single: true }
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
        scroll={{ x: `${tableWidth}px`, y: `${modalHeight}px` }}
        className={styles.table}
        rowKey="accountid"
        dataSource={list}
        columns={columns}
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
      />
      <ChangeDeptModal />
      <BindAttence />
      <TransferData />
      <LoginInfoModal />
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
      setPwdValid: () => {
        dispatch({ type: 'structure/setPwdValid', payload: null });
      },
      setForceLogout: () => {
        dispatch({ type: 'structure/setForceLogout', payload: null });
      },
      transferData: () => {
        dispatch({ type: 'structure/showModals', payload: 'transferData' });
      },
      getLoginInfo: () => {
        dispatch({ type: 'structure/showModals', payload: 'loginInfo' });
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
