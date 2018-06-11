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

const columns = [{
  title: '转移方案名',
  dataIndex: 'transschemename'
}, {
  title: '目标转移对象',
  dataIndex: 'entityname'
}, {
  title: '状态',
  dataIndex: 'recstatus',
  render: (text, record) => {
    return text === 1 ? '启用' : '禁用';
  }
}, {
  title: '备注',
  dataIndex: 'remark'
}];

function TransferScheme({
                       dispatch,
                       queries,
                       list,
                       currItems
                     }) {
  function searchKeyword(val) {
    dispatch({ type: 'transferscheme/search', payload: { searchName: val } });
  }

  function onMenuChange(val) {
    dispatch({ type: 'transferscheme/search', payload: { RecStatus: val } });
  }

  function selectItems(items) {
    dispatch({ type: 'transferscheme/currItems', payload: items });
  }

  function addScheme() {
    dispatch({ type: 'transferscheme/showModals', payload: 'add' });
  }

  function setstatus(setStatusValue) {
    dispatch({ type: 'transferscheme/setstatus', payload: setStatusValue });
  }

  function edit() {
    dispatch({ type: 'transferscheme/targetEntitySelect__', payload: currItems[0].targettransferid });
    dispatch({ type: 'transferscheme/showModals', payload: 'edit' });
  }

  const { searchName, RecStatus } = queries;
  return (
    <Page title="设置业务对象转移方案" contentStyle={{ minHeight: '600px', position: 'relative' }}>
      <Toolbar
        selectedCount={currItems.length}
        actions={[
          { label: '编辑', handler: edit, single: true },
          { label: '停用', handler: setstatus.bind(this, 0), single: false,
            show: () => currItems[0] && currItems[0].recstatus === 1 },
          { label: '启用', handler: setstatus.bind(this, 1), single: false,
            show: () => currItems[0] && currItems[0].recstatus === 0 }
        ]}
      >
        <Select value={RecStatus + ''} onChange={onMenuChange}>
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
      <Table rowKey="transschemeid"
             columns={columns}
             dataSource={list}
             pagination={false}
             rowSelection={{
               selectedRowKeys: currItems.map(item => item.transschemeid),
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
