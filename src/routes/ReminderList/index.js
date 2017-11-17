import React from 'react';
import { Button, Select, Table } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import ReminderFormModal from './ReminderFormModal';

const Option = Select.Option;
const Column = Table.Column;

function ReminderList({
  list,
  total,
  queries,
  currItems,
  search,
  selectItems,
  add,
  edit,
  activate
}) {
  return (
    <Page title="提醒设置">
      <Toolbar
        selectedCount={currItems.length}
        actions={[
          { label: '编辑', handler: edit, single: true },
          { label: '立即提醒', handler: activate, single: true }
        ]}
      >
        <Select value={queries.recStatus + ''} onChange={recStatus => search({ recStatus })}>
          <Option value="1">启用</Option>
          <Option value="0">停用</Option>
        </Select>
        <Button onClick={add}>新增</Button>
        <Toolbar.Right>
          <Search
            placeholder="请输入关键字"
            value={queries.keyword}
            onSearch={keyword => search({ keyword })}
          >
            搜索
          </Search>
        </Toolbar.Right>
      </Toolbar>
      <Table
        rowKey="reminderid"
        dataSource={list}
        pagination={{
          total,
          pageSize: queries.pageSize,
          current: queries.pageIndex,
          onChange: pageIndex => search({ pageIndex }),
          onShowSizeChange: (curr, pageSize) => search({ pageSize })
        }}
        rowSelection={{
          selectedRowKeys: currItems.map(item => item.reminderid),
          onChange: (keys, items) => selectItems(items)
        }}
      >
        <Column
          title="提醒名称"
          key="remindername"
          dataIndex="remindername"
          render={(val, record) => {
            return <Link to={`reminder/${record.reminderid}/${record.remindername}`}>{val}</Link>;
          }}
        />
        <Column title="关联实体" key="entityname" dataIndex="entityname" />
        <Column title="循环提醒" key="isrepeat" dataIndex="isrepeat" render={bool => (bool ? '是' : '否')} />
        <Column title="是否启用" key="recstatus" dataIndex="recstatus" render={v => ['停用', '启用'][v]} />
        <Column title="备注信息" key="remark" dataIndex="remark" />
      </Table>
      <ReminderFormModal />
    </Page>
  );
}

export default connect(
  state => state.reminderList,
  dispatch => {
    return {
      search(payload) {
        dispatch({ type: 'reminderList/search', payload });
      },
      selectItems(items) {
        dispatch({ type: 'reminderList/putState', payload: { currItems: items } });
      },
      add() {
        dispatch({ type: 'reminderList/showModals', payload: 'add' });
      },
      edit() {
        dispatch({ type: 'reminderList/showModals', payload: 'edit' });
      },
      activate() {
        dispatch({ type: 'reminderList/activate' });
      }
    };
  }
)(ReminderList);
