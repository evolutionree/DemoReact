/**
 * Created by 0291 on 2018/5/21.
 */
import React from 'react';
import { connect } from 'dva';
import { Checkbox, Select, Button, InputNumber, message, Table } from 'antd';
import Toolbar from '../../../components/Toolbar';
import Page from '../../../components/Page';
import Search from '../../../components/Search';
import SchemeFormModal from './SchemeFormModal';
import Styles from './index.less';
import _ from 'lodash';

const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;

function TransferScheme({
                       dispatch,
                       protocol,
                       queries,
                       list,
                       total,
                       currItems
                     }) {
  function searchKeyword(val) {
    dispatch({ type: 'transferscheme/search', payload: { searchName: val } });
  }

  function onMenuChange(val) {
    dispatch({ type: 'transferscheme/search', payload: { flowStatus: val } });
  }

  function selectItems(items) {
    dispatch({ type: 'transferscheme/currItems', payload: items });
  }

  function handleTableChange(pagination) {
    dispatch({ type: 'transferscheme/search', payload: {
      pageIndex: pagination.current,
      pageSize: pagination.pageSize
    } });
  }

  function addScheme() {
    dispatch({ type: 'transferscheme/showModals', payload: 'add' });
  }

  function del() {

  }

  const { pageIndex, pageSize, searchName, flowStatus } = queries;

  return (
    <Page title="设置业务对象转移方案" contentStyle={{ minHeight: '600px', position: 'relative' }}>
      <Toolbar
        selectedCount={currItems.length}
        actions={[
          { label: '编辑', handler: del, single: true },
          { label: '停用', handler: del, single: true,
            show: () => currItems[0].recstatus === 1 },
          { label: '启用', handler: del, single: true,
            show: () => currItems[0].recstatus === 0 },
          { label: '删除', handler: del, single: true }
        ]}
      >
        <Select value={flowStatus + ''} onChange={onMenuChange}>
          <Option key="1">启用</Option>
          <Option key="0">停用</Option>
        </Select>
        <Button onClick={addScheme}>新增</Button>
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
               pageSize,
               current: pageIndex
             }}
             onChange={handleTableChange}
             rowSelection={{
               selectedRowKeys: currItems.map(item => item.recid),
               onChange: (keys, items) => selectItems(items)
             }} />
      <SchemeFormModal />
    </Page>
  );
}

export default connect(
  state => state.transferscheme,
  dispatch => {
    return {
      dispatch
    };
  }
)(TransferScheme);
