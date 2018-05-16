import React from 'react';
import { Select, Button, Modal, Icon } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import DynamicTable from '../../components/DynamicTable/index';
import EntcommAddModal from './EntcommAddModal';
import RecordDetailModal from './RecordDetailModal';
import RecordEditModal from './RecordEditModal';
import TransferModal from './TransferModal';
import connectPermission from '../../models/connectPermission';
import AdvanceSearchModal from './AdvanceSearchModal';
import DynamicModal from './DynamicModal';
import ExportModal from './ExportModal';

const Option = Select.Option;

function EntcommList({
    checkFunc,
    dispatch,
    entityName,
    menus,
    protocol,
    queries,
    list,
    total,
    currItems,
    entityId,
    currentUser,
    simpleSearchKey,
    extraButtonData,
    extraToolbarData,
    showModals,
    sortFieldAndOrder,  //当前排序的字段及排序顺序
    ColumnFilter
  }) {
  function selectItems(items) {
    dispatch({ type: 'entcommApplication/currItems', payload: items });
    dispatch({ type: 'entcommApplication/queryFuntionbutton__', payload: {} });
  }
  function search(payload) {
    dispatch({ type: 'entcommApplication/search', payload });
  }
  function searchKeyword(payload) {
    dispatch({ type: 'entcommApplication/searchKeyword', payload });
  }
  function onMenuChange(payload) {
    dispatch({ type: 'entcommApplication/selectMenu', payload });
  }
  function openAdd() {
    dispatch({
      type: 'entcommApplication/showModals',
      payload: 'add'
    });
  }
  function extraToolbarClickHandler(item) {
    if (item.buttoncode === 'CallService') {
      dispatch({
        type: 'entcommApplication/extraToolbarClick',
        payload: item
      });
    } else if (item.buttoncode === 'CallService_showModal') {
      dispatch({
        type: 'entcommApplication/putState',
        payload: {
          showModals: 'dynamicModal',
          dynamicModalData: item
        }
      });
    } else if (item.buttoncode === 'PrintEntity') {
      dispatch({
        type: 'printEntity/initPrint',
        payload: {
          entityId: entityId,
          recordId: currItems && currItems[0] && currItems[0].recid
        }
      });
    }
  }

  function extraButtonClickHandler(item) {
    dispatch({
      type: 'entcommApplication/putState',
      payload: {
        showModals: 'dynamicModal',
        dynamicModalData: item
      }
    });
  }

  function showDetail(record) {
    dispatch({
      type: 'entcommApplication/showModals',
      payload: `recordDetail?${entityId}:${record.recid}`
    });
  }
  function showEdit() {
    dispatch({
      type: 'entcommApplication/showModals',
      payload: `recordEdit?${entityId}:${currItems[0].recid}`
    });
  }
  function importData() {
    dispatch({
      type: 'task/impModals',
      payload: { templateType: 1, templateKey: entityId }
    });
  }
  function exportData() {
    dispatch({
      type: 'entcommApplication/showModals',
      payload: 'export'
    });
  }
  function advanceSearch() {
    dispatch({ type: 'entcommApplication/showModals', payload: 'advanceSearch' });
  }
  function del() {
    Modal.confirm({
      title: '确定删除选中数据吗？',
      onOk() {
        dispatch({ type: 'entcommApplication/del' });
      }
    });
  }
  function openTransfer() {
    dispatch({ type: 'entcommApplication/showModals', payload: 'transfer' });
  }

  function shouldShowTransfer() {
    if (!checkFunc('EntityDataTransfer')) return;
    const menu = _.find(menus, ['menuId', menuId]);
    return !!menu && /转移/.test(menu.menuName);
  }
  function shouldShowImport() {
    return checkFunc('EntityDataImport');
  }
  function shouldShowExport() {
    return checkFunc('EntityDataExport');
  }
  function handleTableChange(pagination, filters, sorter) {
    const searchOrder = sorter.field ? (sorter.field + (sorter.order === 'ascend' ? ' asc' : ' desc')) : ''
    search({
      pageIndex: pagination.current,
      pageSize: pagination.pageSize,
      searchOrder: searchOrder
    });
  }

  function callHandler(mobilephone) {
    dispatch({ type: 'entcommApplication/call', payload: mobilephone });
  }

  function filterChange(filterData) {
    dispatch({
      type: 'entcommApplication/putState',
      payload: { ColumnFilter: filterData }
    });
    dispatch({ type: 'entcommApplication/search', payload: { } });
  }


  let dynamicTableRef;
  function openSetHeader() {
    dynamicTableRef.getWrappedInstance().openSetCustomHeaders();
  }

  const { menuId, searchData, pageIndex, pageSize } = queries;
  const keyword = (searchData && searchData[simpleSearchKey]) || '';

  const titleStyle = {
    display: 'inline-block',
    maxWidth: '340px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  const defaultToolbarActions = [
    { label: '删除', handler: del, show: checkFunc('EntityDataDelete') },
    { label: '编辑', handler: showEdit, single: true, show: checkFunc('EntityDataEdit') },
    { label: '转移', handler: openTransfer, show: shouldShowTransfer }
  ];

  let ajaxToolbarActions = extraToolbarData && extraToolbarData instanceof Array && extraToolbarData.map((item) => {
    let single = true;
    let multiple = false;
    if (item.selecttype === 0) {
      single = false;
      multiple = false;
    } else if (item.selecttype === 1) {
      single = true;
      multiple = false;
    } else if (item.selecttype === 2) {
      single = false;
      multiple = true;
    }
    return { label: item.title, handler: extraToolbarClickHandler.bind(this, item), single: single, multiple: multiple, show: true };
  });
  ajaxToolbarActions = ajaxToolbarActions || [];

  return (
    <Page title={entityName}>
      <Toolbar
        selectedCount={currItems.length}
        actions={[
          ...defaultToolbarActions,
          ...ajaxToolbarActions
        ]}
      >
        <Select style={{ minWidth: '120px' }} value={menuId} onChange={onMenuChange}>
          {menus.map(menu => (
            <Option key={menu.menuId}>{menu.menuName}</Option>
          ))}
        </Select>
        {checkFunc('EntityDataAdd') && <Button onClick={openAdd}>新增</Button>}
        {shouldShowImport() && <Button onClick={importData}>导入</Button>}
        {shouldShowExport() && <Button onClick={exportData}>导出</Button>}
        {
          extraButtonData && extraButtonData instanceof Array && extraButtonData.map((item, index) => {
            return <Button onClick={extraButtonClickHandler} key={index}>{item.title}</Button>;
          })
        }
        <Toolbar.Right>
          <Search
            placeholder="请输入关键字"
            value={keyword}
            onSearch={val => searchKeyword(val)}
          >
            搜索
          </Search>
          <Button onClick={advanceSearch} style={{ marginLeft: '10px', height: '31px' }}>高级搜索</Button>
          <Icon type="setting" onClick={openSetHeader} style={{ fontSize: '20px', marginLeft: '10px', cursor: 'pointer', color: '#9ba1ad', position: 'relative', top: '2px' }} />
        </Toolbar.Right>
      </Toolbar>
      <DynamicTable
        ref={(ref) => dynamicTableRef = ref }
        sorter={true}
        sortFieldAndOrder={sortFieldAndOrder}
        protocol={protocol}
        rowKey="recid"
        entityId={entityId}
        dataSource={list}
        total={total}
        fixedHeader={true}
        otherHeight={186} //页面表格元素除外的元素的总高度
        pagination={{
          total,
          pageSize,
          current: pageIndex
          // onChange: val => search({ pageIndex: val }),
          // onShowSizeChange: (curr, size) => search({ pageSize: size })
        }}
        onChange={handleTableChange}
        ColumnFilter={ColumnFilter || {}}
        onFilter={filterChange}
        onCall={callHandler}
        rowSelection={{
          selectedRowKeys: currItems.map(item => item.recid),
          onChange: (keys, items) => selectItems(items)
        }}
        renderLinkField={(text, field, record, props) => (
          <a href="javascript:;" style={titleStyle} title={text} onClick={() => { showDetail(record); }}>{text}</a>
        )}
      />
      <EntcommAddModal />
      <TransferModal />
      <RecordDetailModal />
      <RecordEditModal />
      <AdvanceSearchModal />
      <DynamicModal />
      <ExportModal currentUser={currentUser} />
    </Page>
  );
}

export default connect(
  state => {
    return { ...state.entcommApplication, currentUser: state.app.user.userid };
  }
)(connectPermission(props => props.entityId, EntcommList));
