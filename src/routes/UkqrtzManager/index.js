/* eslint-disable semi */
/**
 * Created by 0291 on 2017/12/7.
 */
import React from 'react';
import { Button, Select, Table } from 'antd';
import { connect } from 'dva';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import QrtzFormModal from './QrtzFormModal';
import QrtzInstancesFormModal from './QrtzInstancesFormModal';
const Column = Table.Column;


function UkqrtzManager({
                         queries,
                         search,
                         total,
                         triggerList,
                         currItems,
                         selectItems,
                         add,
                         edit,
                         showInstances,
                          stopTrigger,
                        startTrigger
                         }) {
  return (
    <Page title="调度事务定义"  >
      <Toolbar
        selectedCount={currItems.length}
        actions={[
          { label: '编辑', handler: edit, single: true },
          { label: '停用', handler: stopTrigger, single: true, show: currItems && currItems.length > 0 && currItems[0].recstatus === 1 },
          { label: '启用', handler: startTrigger, single: true, show: currItems && currItems.length > 0 && currItems[0].recstatus === 0 },
          { label: '查看实例', handler: showInstances, single: true }
        ]}
      >
        <Button onClick={add}>新增</Button>
      </Toolbar>
      <Table
        rowKey="recid"
        dataSource={triggerList}
        pagination={{
          total,
          pageSize: queries.pageSize,
          current: queries.pageIndex,
          onChange: pageIndex => search({ pageIndex }),
          onShowSizeChange: (curr, pageSize) => search({ pageSize })
        }}
        rowSelection={{
          selectedRowKeys: currItems.map(item => item.recid),
          onChange: (keys, items) => selectItems(items)
        }}
      >
        <Column title="调度事务名称" key="recname" dataIndex="recname" />
        <Column title="调度事件" key="triggertime" dataIndex="triggertime" />
        <Column title="动作类型" key="actiontype" dataIndex="actiontype" />
        <Column title="动作命令" key="actioncmd" dataIndex="actioncmd" />

        <Column title="执行参数" key="actionparameters" dataIndex="actionparameters"  render={v => JSON.stringify(v) }/>
        <Column title="当前状态" key="recstatus" dataIndex="recstatus"  render={v => ["停用",'启用','已删除'][v] }/>
        <Column title="是否运行中" key="inbusy" dataIndex="inbusy"  render={v => ['空闲中','运行中'][v] }/>
        <Column title="运行服务器" key="runningserver" dataIndex="runningserver" />
        <Column title="本次开始运行时间" key="startruntime" dataIndex="startruntime" />
        <Column title="本次运行结束时间" key="endruntime" dataIndex="endruntime" />

      </Table>
      <QrtzFormModal />
      <QrtzInstancesFormModal />
    </Page>
  );
}

export default connect(
  state => state.ukqrtzmanager,
  dispatch => {
    return {
      search(payload) {
        dispatch({ type: 'ukqrtzmanager/search', payload });
      },
      selectItems(items) {
        dispatch({ type: 'ukqrtzmanager/putState', payload: { currItems: items } });
      },
      add() {
        dispatch({ type: 'ukqrtzmanager/showInfoModals', payload: 'add' });
      },
      edit() {
        dispatch({ type: 'ukqrtzmanager/showInfoModals', payload: 'edit' });
      },
      stopTrigger() {
        dispatch({ type: 'ukqrtzmanager/stopTrigger' });
      },
      startTrigger() {
        dispatch({ type: 'ukqrtzmanager/startTrigger' });
      },
      showInstances() {
        dispatch({ type: 'ukqrtzmanager/showInstances', payload: 'instances' });
      }
    };
  }
)(UkqrtzManager);
