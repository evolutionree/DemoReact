import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Modal, Table } from 'antd';
import _ from 'lodash';
import Toolbar from '../../../../components/Toolbar';
import Search from '../../../../components/Search';
import DepartmentSelect from '../../../../components/DepartmentSelect';

const Column = Table.Column;

function RoleUsers({
    dispatch,
    location: { pathname },
    list,
    total,
    queries,
    currentRecords
  }) {
  function search(key, val) {
    const query = {
      ...queries,
      pageIndex: 1,
      [key]: val
    };
    dispatch(routerRedux.push({ pathname, query }));
  }
  function handleDel() {
    Modal.confirm({
      title: '确定移除选中用户吗',
      onOk() {
        const ids = _.map(currentRecords, 'userid').join(',');
        dispatch({ type: 'roleUsers/del', payload: ids });
      }
    });
  }
  function handleSelect(items) {
    dispatch({ type: 'roleUsers/currentRecords', payload: items });
  }
  const { deptId, userName, pageIndex, pageSize } = queries;

  return (
    <div>
      <Toolbar
        selectedCount={currentRecords.length}
        actions={[
          { label: '删除', handler: handleDel }
        ]}
      >
        <DepartmentSelect value={deptId} onChange={search.bind(null, 'deptId')} width="240px" />
        <Toolbar.Right>
          <Search
            value={userName}
            onSearch={search.bind(null, 'userName')}
            placeholder="请输入姓名搜索"
          />
        </Toolbar.Right>
      </Toolbar>
      <Table
        rowKey="userid"
        dataSource={list}
        rowSelection={{
          selectedRowKeys: currentRecords.map(item => item.userid),
          onChange: (keys, items) => { handleSelect(items); }
        }}
        pagination={{
          total,
          pageSize: +pageSize,
          current: +pageIndex,
          onChange: page => { search('pageIndex', page); },
          onShowSizeChange: (curr, size) => { search('pageSize', size); }
        }}
      >
        <Column title="姓名" key="username" dataIndex="username" />
        <Column title="所属团队" key="deptname" dataIndex="deptname" />
        <Column title="拥有角色" key="rolename" dataIndex="rolename" />
      </Table>
    </div>
  );
}

export default connect(
  state => state.roleUsers
)(RoleUsers);
