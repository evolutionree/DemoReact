import React from 'react';
import { Link } from 'dva/router';
import { Select, Button, Table } from 'antd';
import { connect } from 'dva';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import WorkflowFormModal from './WorkflowFormModal';
import WorkflowEventModal from "./WorkflowEventModal";

const Option = Select.Option;
const Column = Table.Column;

function WorkflowList({
    queries,
    list,
    total,
    currentItems,
    search,
    add,
    edit,
    toggleStatus,
    unDeleteWorkFlow,
    selectItems,
    openFlowEvent
  }) {
  const { flowStatus, pageIndex, pageSize, searchName } = queries;
  return (
    <Page title="审批设置">
      <Toolbar
        selectedCount={currentItems.length}
        actions={[
          { label: '编辑', handler: edit, single: true },
          // { label: '启用', handler: toggleStatus, single: true,
          //   show: () => currentItems[0].recstatus === 0 },
          { label: '停用', handler: toggleStatus, single: true,
            show: () => currentItems[0].recstatus === 1 },
          { label: '启用', handler: unDeleteWorkFlow, single: true,
            show: () => currentItems[0].recstatus === 0 },
          { label: '设置流程函数', handler: openFlowEvent, single: true,
            show: () => currentItems[0].flowtype === 0 }
        ]}
      >
        <Select value={flowStatus + ''} onChange={val => search({ flowStatus: val })}>
          <Option key="1">启用</Option>
          <Option key="0">停用</Option>
        </Select>
        <Button onClick={add}>新增</Button>
        <Toolbar.Right>
          <Search
            value={searchName}
            onSearch={val => search({ searchName: val })}
            placeholder="请输入流程名称"
          >
            搜索
          </Search>
        </Toolbar.Right>
      </Toolbar>
      <Table
        rowKey="flowid"
        dataSource={list}
        pagination={{
          total,
          pageSize: +pageSize,
          current: +pageIndex,
          onChange: val => search({ pageIndex: val }),
          onShowSizeChange: (curr, size) => search({ pageSize: size })
        }}
        rowSelection={{
          selectedRowKeys: currentItems.map(item => item.flowid),
          onChange: (keys, items) => selectItems(items)
        }}
      >
        <Column
          title="审批流程"
          key="flowname"
          dataIndex="flowname"
          render={(text, record) => (
            record.flowtype === 0 ?
              <span>{text}</span> :
              <Link to={`/workflow/${record.flowid}`}>{text}</Link>
          )}
        />
        <Column title="关联实体" key="entityname" dataIndex="entityname" />
        <Column title="流程类型" key="flowtype" dataIndex="flowtype" render={v => ['自由流程', '固定流程'][v]} />
        <Column title="状态" key="recstatus" dataIndex="recstatus" render={v => ['停用', '启用'][v]} />
        <Column title="发布状态" key="vernum" dataIndex="vernum" render={v => v > 0 ? '已发布' : '未发布'} />
        <Column title="流程说明" key="remark" dataIndex="remark" />
      </Table>
      <WorkflowFormModal />
      <WorkflowEventModal />
    </Page>
  );
}

export default connect(
  state => state.workflowList,
  dispatch => {
    return {
      search(keyvalue) {
        dispatch({ type: 'workflowList/search', payload: keyvalue });
      },
      add() {
        dispatch({ type: 'workflowList/showModals', payload: 'add' });
      },
      edit() {
        dispatch({ type: 'workflowList/showModals', payload: 'edit' });
      },
      toggleStatus() {
        dispatch({ type: 'workflowList/toggleStatus' });
      },
      unDeleteWorkFlow() {
        dispatch({ type: 'workflowList/unDeleteWorkFlow' });
      },
      openFlowEvent() {
        dispatch({ type: 'workflowList/showModals', payload: 'flowEvent' });
      },
      selectItems(items) {
        dispatch({ type: 'workflowList/putState', payload: { currentItems: items } })
      }
    };
  }
)(WorkflowList);
