/**
 * Created by 0291 on 2018/8/1.
 */
import React from 'react';
import { connect } from 'dva';
import { Select, Button, Table } from 'antd';
import Toolbar from '../../../../components/Toolbar';
import Page from '../../../../components/Page';
import Search from '../../../../components/Search';
import FormModal from './FormModal';

const Option = Select.Option;

function ComponentList({
                       dispatch,
                       protocol,
                       queries,
                       list,
                       currItems
                     }) {
  function searchKeyword(val) {
    dispatch({ type: 'deskcomponentconfig/search', payload: { queries: { ...queries, comname: val } } });
  }

  function selectItems(items) {
    dispatch({ type: 'deskcomponentconfig/currItems', payload: items });
  }

  function changeStatus(status) {
    dispatch({ type: 'deskcomponentconfig/search', payload: { queries: { ...queries, status } } });
  }

  function add() {
    dispatch({ type: 'deskcomponentconfig/showModals', payload: 'add' });
  }

  function edit() {
    dispatch({ type: 'deskcomponentconfig/showModals', payload: 'edit' });
  }

  function enableComponent() {
    dispatch({ type: 'deskcomponentconfig/setComponentStatus', payload: { setStatus: 1 } });
  }

  function disableComponent() {
    dispatch({ type: 'deskcomponentconfig/setComponentStatus', payload: { setStatus: 0 } });
  }

  const { comname, status } = queries;

  return (
    <Page title="工作台组件">
      <Toolbar
        selectedCount={currItems.length}
        actions={[
          { label: '编辑', handler: edit, single: true },
          { label: '停用', handler: disableComponent, single: true,
            show: () => currItems[0].status === 1 },
          { label: '启用', handler: enableComponent, single: true,
            show: () => currItems[0].status === 0 }
        ]}
      >
        <Select value={status + ''} onChange={changeStatus}>
          <Option value="1">启用</Option>
          <Option value="0">停用</Option>
        </Select>
        <Button onClick={add}>新增</Button>
        <Toolbar.Right>
          <Search
            placeholder="请输入关键字"
            value={comname}
            onSearch={val => searchKeyword(val)}
          >
            搜索
          </Search>
        </Toolbar.Right>
      </Toolbar>
      <Table rowKey="dscomponetid"
             columns={protocol}
             dataSource={list}
             pagination={true}
             rowSelection={{
               selectedRowKeys: currItems.map(item => item.dscomponetid),
               onChange: (keys, items) => selectItems(items)
             }} />
      <FormModal />
    </Page>
  );
}

export default connect(
  state => state.deskcomponentconfig,
  dispatch => {
    return {
      dispatch
    };
  }
)(ComponentList);
