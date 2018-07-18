import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';

import { Button, Select, Table, Modal, message } from 'antd';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import VocationFormModal from './VocationFormModal';
import CopyVocationFormModal from './CopyVocationFormModal';

import IntlText from '../../components/UKComponent/Form/IntlText';

const Option = Select.Option;
const Column = Table.Column;

function VocationList(props) {
  function search(key, val) {
    const query = typeof key === 'object'
      ? { ...queries, pageIndex: 1, ...key }
      : { ...queries, pageIndex: 1, [key]: val };
    dispatch(routerRedux.push({ pathname, query }));
  }
  function handleEdit() {
    dispatch({ type: 'vocationList/edit' });
  }
  function handleDel() {
    Modal.confirm({
      title: '确认删除吗？',
      onOk: () => {
        dispatch({ type: 'vocationList/del', payload: currentRecords.map(item => item.vocationid) });
      }
    });
  }
  function handleCopy(payload) {
    dispatch({ type: 'vocationList/showModals', payload: 'copy' });
  }
  function handleAdd() {
    dispatch({ type: 'vocationList/add' });
  }
  function handleSave(payload) {
    dispatch({ type: 'vocationList/save', payload });
  }
  function handleSaveCopy(payload) {
    dispatch({ type: 'vocationList/saveCopy', payload });
  }
  function handleCancel() {
    dispatch({ type: 'vocationList/hideModal' });
  }
  function handleSelect(records) {
    dispatch({ type: 'vocationList/currentRecords', payload: records });
  }

  const {
    dispatch,
    location: { pathname },
    queries,
    list,
    total,
    currentRecords,
    checkFunc
  } = props;

  const { pageIndex, pageSize, vocationName } = queries;

  return (
    <Page title="职能管理">
      <Toolbar
        selectedCount={currentRecords.length}
        actions={[
          { label: '编辑', handler: handleEdit, single: true, show: checkFunc('VocationAuthEdit') },
          { label: '删除', handler: handleDel, show: checkFunc('VocationAuthDelete') },
          { label: '复制职能并创建', handler: handleCopy, single: true, show: checkFunc('VocationAuthAdd') }
        ]}
      >

        {checkFunc('VocationAuthAdd') && <Button onClick={handleAdd}>新建职能</Button>}
        <Toolbar.Right>
          <Search
            label="搜索"
            maxLength={20}
            value={vocationName}
            placeholder="请输入职能名称搜索"
            onSearch={search.bind(null, 'vocationName')}
          />
        </Toolbar.Right>
      </Toolbar>

      <Table
        rowKey="vocationid"
        dataSource={list}
        rowSelection={{
          selectedRowKeys: currentRecords.map(item => item.vocationid),
          onChange: (keys, items) => { handleSelect(items); }
        }}
        pagination={{
          total,
          pageSize: +pageSize,
          current: +pageIndex,
          onChange: page => { search('pageIndex', page); },
          onShowSizeChange: (curr, size) => { search({ pageIndex: 1, pageSize: size }); }
        }}
      >
        <Column
          title="职能名称"
          key="vocationname"
          dataIndex="vocationname"
          render={(text, record) => {
            const intlText = <IntlText value={text} value_lang={record.rolename_lang} />;
            return checkFunc('VocationAuthDetail')
              ? <Link to={`/vocation/${record.vocationid}/${text}`}>{intlText}</Link>
              : <span>{intlText}</span>;
          }}
        />
        <Column title="职能描述" key="description" dataIndex="description" />
      </Table>
      <VocationFormModal {...props} onOk={handleSave} onCancel={handleCancel} />
      <CopyVocationFormModal {...props} onOk={handleSaveCopy} onCancel={handleCancel} />
    </Page>
  );
}

export default connect(({ vocationList }) => vocationList)(VocationList);

