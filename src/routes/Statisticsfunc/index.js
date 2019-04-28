import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Table, Modal, Switch } from 'antd';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import { getIntlText } from '../../components/UKComponent/Form/IntlText';
import StatisticsFormModal from './StatisticsFormModal';
import styles from './index.less';

function Statisticsfunc(props) {
  function search(key, val) {
    const query = typeof key === 'object'
      ? { ...queries, pageIndex: 1, ...key }
      : { ...queries, pageIndex: 1, [key]: val };
    dispatch(routerRedux.push({ pathname, query }));
  }
  function handleEdit() {
    dispatch({ type: 'statisticsfunc/showModals', payload: 'edit' });
  }
  function handleDel() {
    Modal.confirm({
      title: '确定要删除吗？',
      onOk() {
        dispatch({ type: 'statisticsfunc/del', payload: currentRecords[0] });
      }
    });
  }
  function handleSwitch(isUse) {
    Modal.confirm({
      title: `确认要${isUse ? '启用' : '停用'}吗？`,
      onOk() {
        dispatch({ type: 'statisticsfunc/use', payload: { currentRecords, isUse } });
      }
    });
  }
  function handleAdd() {
    dispatch({ type: 'statisticsfunc/showModals', payload: 'add' });
  }
  function handleSave(data) {
    dispatch({ type: 'statisticsfunc/save', payload: data });
  }
  function handleCancel() {
    dispatch({ type: 'statisticsfunc/hideModal' });
  }
  function handleSelectRecords(records) {
    dispatch({ type: 'statisticsfunc/currentRecords', payload: records })
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

  const { pageIndex, pageSize } = queries;

  const tooltipElements = (text, width) => (
    <div
      className={`${text}`.length > 5 ? styles.hide : ''}
      title={`${text}`}
      style={{ maxWidth: `${width - 21}px` }}
    >
      {text}
    </div>
  );

  const LoopList = [
    { title: '统计项名称', key: 'anafuncname', width: 80, render: (text, record) => getIntlText('anafuncname', record) },
    { title: '统计函数', key: 'countfunc', width: 160 },
    { title: '是否进入列表', key: 'allowinto_name' },
    { title: '列表函数', key: 'morefunc', width: 160 },
    { title: '是否跳入实体', key: 'moreflag_name' },
    { title: '实体名称', key: 'entityname' },
    { title: '状态', key: 'moreflag' }
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

  const isUse = Array.isArray(currentRecords) && currentRecords.length === 1 && currentRecords[0].recstatus;

  return (
    <Page title="统计函数定义">
      <Toolbar
        selectedCount={currentRecords.length}
        actions={[
          { label: '编辑', single: true, handler: handleEdit, show: () => true },
          { label: `${isUse ? '启用' : '停用'}`, single: true, handler: () => handleSwitch(isUse) },
          { label: '删除', handler: handleDel }
        ]}
      >
        <div style={{ float: 'left' }}>
          <Button onClick={handleAdd}>新增</Button>
        </div>
        <Toolbar.Right>
          {/* <Search
            label="搜索"
            value={dataSourceName}
            placeholder="输入数据源名称搜索"
            onSearch={search.bind(null, 'dataSourceName')}
          /> */}
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

      <StatisticsFormModal {...props} onOk={handleSave} onCancel={handleCancel} />
    </Page>
  );
}

export default connect(state => state.statisticsfunc)(Statisticsfunc);

