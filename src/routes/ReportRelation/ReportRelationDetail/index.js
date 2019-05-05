import React from 'react';
import { routerRedux } from 'dva/router';
import { Button, Table, Modal, Tooltip } from 'antd';
import Toolbar from '../../../components/Toolbar';
import Search from '../../../components/Search';
import { getIntlText } from '../../../components/UKComponent/Form/IntlText';
import StatisticsFormModal from '../StatisticsFormModal';
import styles from '../index.less';

function ReportRelationDetail(props) {
  function search(key, val) {
    const query = typeof key === 'object'
      ? { ...queries, pageIndex: 1, ...key }
      : { ...queries, pageIndex: 1, [key]: val };
    dispatch(routerRedux.push({ pathname, query }));
  }
  function handleEdit() {
    dispatch({ type: 'reportrelation/showModals', payload: 'edit' });
  }
  function handleDel() {
    Modal.confirm({
      title: '确定要删除吗？',
      onOk() {
        dispatch({ type: 'reportrelation/del', payload: currentRecords });
      }
    });
  }
  function handleSwitch(isUse) {
    Modal.confirm({
      title: `确认要${isUse ? '停用' : '启用'}吗？`,
      onOk() {
        dispatch({ type: 'reportrelation/use', payload: { currentRecords, isUse } });
      }
    });
  }
  function handleAdd() {
    dispatch({ type: 'reportrelation/showModals', payload: 'add' });
  }
  function handleSave(data) {
    dispatch({ type: 'reportrelation/save', payload: data });
  }
  function handleCancel() {
    dispatch({ type: 'reportrelation/hideModal' });
  }
  function handleSelectRecords(records) {
    dispatch({ type: 'reportrelation/currentRecords', payload: records });
  }

  const {
    dispatch,
    location: { pathname },
    queries,
    list,
    currentRecords,
    total,
    showModals,
    savePending
  } = props;

  const { pageIndex, pageSize } = queries;

  const tooltipElements = (text, width) => (
    <Tooltip title={text}>
      <div
        className={`${text}`.length > 5 ? styles.hide : ''}
        title={`${text}`}
        style={{ maxWidth: `${width - 21}px` }}
      >
        {text}
      </div>
    </Tooltip>
  );

  const LoopList = [
    { title: '统计项名称', key: 'anafuncname', width: 80, render: (text, record) => getIntlText('anafuncname', record) },
    { title: '统计函数', key: 'countfunc', width: 300 }
  ];

  const renderList = (colList) => (
    colList.map(item => {
      return {
        ...item,
        dataIndex: item.key,
        width: item.width || 100,
        fixed: item.fixed || false,
        render: item.render ? item.render : (text => tooltipElements(text, item.width || 100)),
        children: item.children ? renderList(item.children) : false
      };
    })
  );
  const columns = renderList(LoopList);
  const tableWidth = columns.reduce((sum, current) => sum + current.width, 0) + 62;

  const isUse = Array.isArray(currentRecords) && currentRecords.length === 1 && currentRecords[0].recstatus === 1;

  return (
    <div>
      <Toolbar
        selectedCount={currentRecords.length}
        actions={[
          { label: '编辑', single: true, handler: handleEdit, show: () => true },
          { label: `${isUse ? '停用' : '启用'}`, single: true, handler: () => handleSwitch(isUse) },
          { label: '删除', handler: handleDel }
        ]}
      >
        <div style={{ float: 'left' }}>
          <Button onClick={handleAdd}>新增</Button>
        </div>
        <Toolbar.Right>
          <Search />
        </Toolbar.Right>
      </Toolbar>

      <Table
        rowKey="anafuncid"
        scroll={{ x: `${tableWidth}px` }}
        columns={columns}
        dataSource={list}
        rowSelection={{
          selectedRowKeys: currentRecords.map(item => item.anafuncid),
          onChange: (keys, items) => { handleSelectRecords(items); }
        }}
        pagination={{
          pageSize,
          total,
          current: pageIndex,
          onChange: search.bind(null, 'pageIndex'),
          onShowSizeChange: (curr, size) => { search('pageSize', size); }
        }}
      />

      <StatisticsFormModal
        currentRecords={currentRecords}
        showModals={showModals}
        onChange={handleSelectRecords}
        onOk={handleSave}
        onCancel={handleCancel}
        savePending={savePending}
      />
    </div>
  );
}

export default ReportRelationDetail;

