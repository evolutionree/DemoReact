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
      title: '确定要删除选定的数据源吗？',
      onOk() {
        dispatch({ type: 'statisticsfunc/del', payload: currentRecords[0] });
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

  const { pageIndex, pageSize, dataSourceName, recStatus } = queries;

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
    { title: '统计项名称', key: 'username', width: 80, render: text => getIntlText(text) },
    { title: '统计函数', key: 'accountname', width: 110 },
    { title: '是否进入列表', key: 'workcode', width: 90 },
    { title: '列表函数', key: 'deptname', width: 110 },
    { title: '是否跳入实体', key: 'pdeptname', width: 160 },
    { title: '实体名称', key: 'rolename', width: 110 },
    { title: '状态', key: 'vocationname' }
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

  return (
    <Page title="数据源配置">
      <Toolbar
        selectedCount={currentRecords.length}
        actions={[
          { label: '编辑', single: true, handler: handleEdit, show: () => true },
          { label: '删除', single: true, handler: handleDel }
        ]}
      >
        <div style={{ float: 'left' }}>
          <Button onClick={handleAdd}>新增</Button>
          <Switch
            style={{ marginLeft: 10 }}
            defaultChecked
            value={recStatus}
            onChange={search.bind(null, 'recStatus')}
            checkedChildren="启用"
            unCheckedChildren="禁用"
          />
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
        rowKey="datasourceid"
        scroll={{ x: `${tableWidth}px` }}
        columns={columns}
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
      />

      <StatisticsFormModal {...props} onOk={handleSave} onCancel={handleCancel} />
    </Page>
  );
}

export default connect(state => state.statisticsfunc)(Statisticsfunc);

