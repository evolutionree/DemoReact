import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Table, Modal, Tooltip, Switch } from 'antd';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import { getIntlText } from '../../components/UKComponent/Form/IntlText';
import StatisticsFormModal from './StatisticsFormModal';
import styles from './index.less';

function Statisticsfunc(props) {
  const {
    dispatch,
    location: { pathname },
    queries,
    list,
    currentRecords,
    total,
    showModals,
    savePending,
    checked,
    checkFunc
  } = props;

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
        dispatch({ type: 'statisticsfunc/del', payload: currentRecords });
      }
    });
  }
  function handleSwitch(isUse) {
    Modal.confirm({
      title: `确认要${isUse ? '停用' : '启用'}吗？`,
      onOk() {
        dispatch({ type: 'statisticsfunc/use', payload: { currentRecords, isUse } });
      }
    });
  }
  function handleAdd() {
    dispatch({ type: 'statisticsfunc/showModals', payload: 'add' });
  }

  function handleCancel(isEdit) {
    dispatch({ type: 'statisticsfunc/hideModal', payload: { currentRecords: isEdit ? currentRecords : [] } });
  }
  function handleSelectRecords(records) {
    dispatch({ type: 'statisticsfunc/currentRecords', payload: records });
  }
  function disable() {
    dispatch({ type: 'statisticsfunc/disable' });
  }

  const { pageIndex, pageSize } = queries;

  const tooltipElements = (text, width) => (
    <Tooltip title={text} overlayClassName={styles.tooltip}>
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
    { title: '统计项名称', key: 'anafuncname', width: 100, render: (text, record) => getIntlText('anafuncname', record) },
    { title: '统计函数', key: 'countfunc', width: 300 },
    { title: '是否进入列表', key: 'allowinto_name' },
    { title: '列表函数', key: 'morefunc', width: 300 },
    { title: '是否跳入实体', key: 'moreflag_name' },
    { title: '实体名称', key: 'entityname' },
    { title: '状态', key: 'recstatus', render: text => ['停用', '启用'][text] }
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

  const isUse = Array.isArray(currentRecords) && currentRecords.length && currentRecords[0].recstatus === 1;

  return (
    <Page title="统计函数定义">
      <Toolbar
        selectedCount={currentRecords.length}
        actions={[
          { label: '编辑', single: true, handler: handleEdit, show: checkFunc('Edit') },
          { label: `${isUse ? '停用' : '启用'}`, handler: () => handleSwitch(isUse), show: checkFunc('Disabled') },
          { label: '删除', handler: handleDel, show: checkFunc('Delete') }
        ]}
      >
        <div style={{ float: 'left', display: 'flex', alignItems: 'center' }} >
          {checkFunc('Add') && <Button onClick={handleAdd}>新增</Button>}
          <Switch
            style={{ marginLeft: 10 }}
            checked={checked}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            onChange={disable}
          />
        </div>
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
        dispatch={dispatch}
        spaceName="statisticsfunc"
        currentRecords={currentRecords}
        showModals={showModals}
        onChange={handleSelectRecords}
        onCancel={handleCancel}
        savePending={savePending}
      />
    </Page>
  );
}

export default connect(state => state.statisticsfunc)(Statisticsfunc);

