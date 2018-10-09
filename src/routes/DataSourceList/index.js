import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';

import { Button, Select, Table, Modal } from 'antd';
import SelectNumber from '../../components/SelectNumber';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';

import IntlText from '../../components/UKComponent/Form/IntlText';

import DSourceFormModal from './DSourceFormModal';

const Option = Select.Option;
const Column = Table.Column;

function DSourceList(props) {
  function search(key, val) {
    const query = typeof key === 'object'
      ? { ...queries, pageIndex: 1, ...key }
      : { ...queries, pageIndex: 1, [key]: val };
    dispatch(routerRedux.push({ pathname, query }));
  }
  function handleEdit() {
    dispatch({ type: 'dSourceList/showModals', payload: 'edit' });
  }
  function handleDel() {
    Modal.confirm({
      title: '确定要删除选定的数据源吗？',
      onOk() {
        dispatch({ type: 'dSourceList/del', payload: currentRecords[0] });
      }
    });
  }
  function handleAdd() {
    dispatch({ type: 'dSourceList/showModals', payload: 'add' });
  }
  function handleSave(data) {
    dispatch({ type: 'dSourceList/save', payload: data });
  }
  function handleCancel() {
    dispatch({ type: 'dSourceList/hideModal' });
  }
  function handleSelectRecords(records) {
    dispatch({ type: 'dSourceList/currentRecords', payload: records })
  }

  const {
    dispatch,
    location: { pathname },
    queries,
    list,
    currentRecords,
    total,
    checkFunc
  } = props;

  const { pageIndex, pageSize, dataSourceName, recStatus } = queries;

  return (
    <Page title="数据源配置">
      <Toolbar
        selectedCount={currentRecords.length}
        actions={[
          { label: '编辑', single: true, handler: handleEdit, show: checkFunc('DataSourceEdit') },
          { label: '删除', single: true, handler: handleDel }
        ]}
      >
        <SelectNumber value={recStatus} onChange={search.bind(null, 'recStatus')}>
          <Option value="1">启用</Option>
          <Option value="0">停用</Option>
        </SelectNumber>
        {checkFunc('DataSourceAdd') && <Button onClick={handleAdd}>新增</Button>}
        <Toolbar.Right>
          <Search
            label="搜索"
            value={dataSourceName}
            placeholder="输入数据源名称搜索"
            onSearch={search.bind(null, 'dataSourceName')}
          />
        </Toolbar.Right>
      </Toolbar>

      <Table
        rowKey="datasourceid"
        dataSource={list}
        rowSelection={{
          selectedRowKeys: currentRecords.map(item => item.datasourceid),
          onChange: (keys, items) => { handleSelectRecords(items); }
        }}
        pagination={{
          pageSize,
          total,
          current: pageIndex,
          onChange: search.bind(null, 'pageIndex'),
          onShowSizeChange: (curr, size) => { search('pageSize', size); }
        }}
      >
        <Column
          key="datasourcename"
          dataIndex="datasourcename"
          title="数据源名称"
          render={(text, record) => {
            const intlText = <IntlText value={text} value_lang={record.datasourcename_lang} />;
            return checkFunc('DataSourceEdit')
              ? <Link to={`/dsource/${record.datasourceid}`}>{intlText}</Link>
              : <span>{intlText}</span>;
          }}
        />
        <Column key="entityname" dataIndex="entityname" title="关联实体" />
        <Column key="recstatus" dataIndex="recstatus" title="状态" render={v => ['停用', '启用'][v]} />
        <Column key="srcmark" dataIndex="srcmark" title="描述" />
      </Table>

      <DSourceFormModal {...props} onOk={handleSave} onCancel={handleCancel} />
    </Page>
  );
}

export default connect(state => state.dSourceList)(DSourceList);

