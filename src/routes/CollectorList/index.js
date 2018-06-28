import React from 'react';
import { Button, Select, Table } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import CollectorFormModal from './CollectorFormModal';

const Option = Select.Option;
const Column = Table.Column;

function CollectorList({
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
    <Page title="回收规则">
      <Toolbar
        selectedCount={currItems.length}
        actions={[
          { label: '编辑', handler: edit, single: true },
          { label: '立即执行', handler: activate, single: true }
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
          title="回收规则名称"
          key="remindername"
          dataIndex="remindername"
          render={(val, record) => {
            const remindername = encodeURI(record.remindername);
            return <Link to={`collector/${record.reminderid}/${remindername}`}>{val}</Link>;
          }}
        />
        <Column title="关联实体" key="entityname" dataIndex="entityname" />
        <Column title="是否启用" key="recstatus" dataIndex="recstatus" render={v => ['停用', '启用'][v]} />
        <Column title="备注信息" key="remark" dataIndex="remark" />
      </Table>
      <CollectorFormModal />
    </Page>
  );
}

export default connect(
  state => state.collectorList,
  dispatch => {
    return {
      search(payload) {
        dispatch({ type: 'collectorList/search', payload });
      },
      selectItems(items) {
        dispatch({ type: 'collectorList/putState', payload: { currItems: items } });
      },
      add() {
        dispatch({ type: 'collectorList/showModals', payload: 'add' });
      },
      edit() {
        dispatch({ type: 'collectorList/showModals', payload: 'edit' });
      },
      activate() {
        dispatch({ type: 'collectorList/activate' });
      }
    };
  }
)(CollectorList);
