/**
 * Created by 0291 on 2018/8/1.
 */
import React from 'react';
import { connect } from 'dva';
import { Checkbox, Select, Button, Table } from 'antd';
import Toolbar from '../../../../components/Toolbar';
import Page from '../../../../components/Page';
import Search from '../../../../components/Search';
import FormModal from './FormModal';
import Styles from './index.less';
import _ from 'lodash';

const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;

function ComponentList({
                       dispatch,
                       protocol,
                       queries,
                       list,
                       total,
                       currItems
                     }) {
  function searchKeyword(val) {
    dispatch({ type: 'deskcomponent/search', payload: { searchName: val } });
  }

  function selectItems(items) {
    dispatch({ type: 'deskcomponent/currItems', payload: items });
  }

  function handleTableChange(pagination) {
    dispatch({ type: 'deskcomponent/search', payload: {
      pageIndex: pagination.current,
      pageSize: pagination.pageSize
    } });
  }

  function add() {
    dispatch({ type: 'deskcomponent/showModals', payload: 'add' });
  }

  function edit() {
    dispatch({ type: 'deskcomponent/showModals', payload: 'edit' });
  }

  function del() {

  }

  const { pageIndex, pageSize, searchName } = queries;

  return (
    <Page title="工作台组件">
      <Toolbar
        selectedCount={currItems.length}
        actions={[
          { label: '编辑', handler: edit, single: true },
          { label: '停用', handler: del, single: true,
            show: () => currItems[0].recstatus === 1 },
          { label: '启用', handler: del, single: true,
            show: () => currItems[0].recstatus === 0 }
        ]}
      >
        <Button onClick={add}>新增</Button>
        <Toolbar.Right>
          <Search
            placeholder="请输入关键字"
            value={searchName}
            onSearch={val => searchKeyword(val)}
          >
            搜索
          </Search>
        </Toolbar.Right>
      </Toolbar>
      <Table rowKey="recid"
             columns={protocol}
             dataSource={list}
             pagination={{
               total,
               pageSize: pageSize,
               current: pageIndex
             }}
             onChange={handleTableChange}
             rowSelection={{
               selectedRowKeys: currItems.map(item => item.recid),
               onChange: (keys, items) => selectItems(items)
             }} />
      <FormModal />
    </Page>
  );
}

export default connect(
  state => state.deskcomponent,
  dispatch => {
    return {
      dispatch
    };
  }
)(ComponentList);
