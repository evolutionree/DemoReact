import React from 'react';
import { Select, Button, Modal, Icon } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import DynamicTable from '../../components/DynamicTable/index';
import EntcommAddModal from './EntcommAddModal';
import EntcommCopyModal from './EntcommCopyModal';
import TransferModal from './TransferModal';
import MerageModal from './MerageModal';
import AdvanceSearchModal from './AdvanceSearchModal';
import AllocateModal from './AllocateModal';
import connectPermission from '../../models/connectPermission';
import DynamicModal from './DynamicModal';
import ExportModal from './ExportModal';
import DataTransferModal from './DataTransferModal';
import EntcommRepeatViewModal from '../../components/EntcommRepeatViewModal';


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
    sortFieldAndOrder,  //当前排序的字段及排序顺序
    ColumnFilter,
                       showModals
  }) {
  function selectItems(items) {
    dispatch({ type: 'entcommList/currItems', payload: items });
    dispatch({ type: 'entcommList/queryFuntionbutton__', payload: {} });
  }
  function search(payload) {
    dispatch({ type: 'entcommList/search', payload });
  }
  function searchKeyword(payload) {
    dispatch({ type: 'entcommList/searchKeyword', payload });
  }
  function onMenuChange(payload) {
    dispatch({ type: 'entcommList/selectMenu', payload });
  }
  function openAdd() {
    dispatch({
      type: 'entcommList/showModals',
      payload: 'add'
    });
  }

  function queryRepeat() {
    dispatch({
      type: 'entcommList/showModals',
      payload: 'repeatview'
    });
  }

  function modalCancel() {
    dispatch({ type: 'entcommList/showModals', payload: '' });
  }

  function importData() {
    dispatch({
      type: 'task/impModals',
      payload: { templateType: 1, templateKey: entityId }
    });
  }
  function exportData() {
    dispatch({
      type: 'entcommList/showModals',
      payload: 'export'
    });
  }
  function merageCustom() {
    dispatch({ type: 'entcommList/showModals', payload: 'merage' });
  }
  function advanceSearch() {
    dispatch({ type: 'entcommList/showModals', payload: 'advanceSearch' });
  }
  function del() {
    Modal.confirm({
      title: '确定删除选中数据吗？',
      onOk() {
        dispatch({ type: 'entcommList/del' });
      }
    });
  }
  function allocate() {
    dispatch({ type: 'entcommList/showModals', payload: 'allocate' });
  }
  function openTransfer() {
    dispatch({ type: 'entcommList/showModals', payload: 'transfer' });
  }

  function extraToolbarClickHandler(item) {
    if (item.buttoncode === 'CallService' || item.buttoncode === 'EntityDataOpenH5') {
      dispatch({
        type: 'entcommList/extraToolbarClick',
        payload: item
      });
    } else if (item.buttoncode === 'CallService_showModal') {
      dispatch({
        type: 'entcommList/putState',
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
    } else if (item.buttoncode === 'DataTransfer') {
      dispatch({ type: 'entcommList/showModals', payload: 'datatransfer' });
    }
  }

  function extraButtonClickHandler(item) {
    if (item.buttoncode === 'ShowModals') {
      dispatch({
        type: 'entcommList/putState',
        payload: {
          showModals: 'dynamicModal',
          dynamicModalData: item
        }
      });
    } else if (item.buttoncode === 'DataTransfer') {
      dispatch({ type: 'entcommList/showModals', payload: 'datatransfer' });
    }
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
  function shouldShowAllocate() {
    const isXiansuoEntity = entityId === 'db330ae1-b78c-4e39-bbb5-cc3c4a0c2e3b';
    const canAllocate = currItems.every(item => item.allocated === 1 || item.allocated === 4); // 分配状态为 新建/退回
    return isXiansuoEntity && canAllocate && checkFunc('BatchClueAllocate');
  }
  function handleTableChange(pagination, filters, sorter) {
    const searchOrder = sorter.field ? (sorter.field + (sorter.order === 'ascend' ? ' asc' : ' desc')) : '';
    search({
      pageIndex: pagination.current,
      pageSize: pagination.pageSize,
      searchOrder: searchOrder
    });
  }

  function filterChange(filterData) {
    dispatch({
      type: 'entcommList/putState',
      payload: { ColumnFilter: filterData }
    });
    dispatch({ type: 'entcommList/search', payload: { } });
  }

  let dynamicTableRef;
  function openSetHeader() {
    dynamicTableRef.getWrappedInstance().openSetCustomHeaders();
  }

  const { menuId, searchData, pageIndex, pageSize, isAdvanceQuery } = queries;
  const keyword = (!isAdvanceQuery && searchData && searchData[simpleSearchKey]) || '';

  let defaultToolbarActions = [
    { label: '删除', handler: del, show: checkFunc('EntityDataDelete') },
    { label: '分配线索', handler: allocate, show: shouldShowAllocate }//db330ae1-b78c-4e39-bbb5-cc3c4a0c2e3b 销售线索批量分配
  ];
  if (entityId === '1ce5e2d5-6cf7-440d-83f4-0d500c4a2cd9') {
    defaultToolbarActions.push({ label: '分配', handler: openTransfer, show: shouldShowTransfer });
  }
  //{ label: entityId === '1ce5e2d5-6cf7-440d-83f4-0d500c4a2cd9' ? '分配' : '转移', handler: openTransfer, show: shouldShowTransfer },

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
        {checkFunc('EntityDataMerge') && <Button onClick={merageCustom}>客户合并</Button>}
        {checkFunc('EntityDataSearch') && <Button onClick={queryRepeat}>查重</Button>}
        {shouldShowImport() && <Button onClick={importData}>导入</Button>}
        {shouldShowExport() && <Button onClick={exportData}>导出</Button>}
        {
          extraButtonData && extraButtonData instanceof Array && extraButtonData.map((item, index) => {
            return <Button onClick={extraButtonClickHandler.bind(this, item)} key={index}>{item.title}</Button>;
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
        entityId={entityId}
        protocol={protocol}
        rowKey="recid"
        dataSource={list}
        total={total}
        fixedHeader={true}
        otherHeight={186} //页面表格元素除外的元素的总高度
        pagination={{
          total,
          pageSize,
          current: pageIndex
          // onChange: val => search({ pageIndex: val }),  改用table提供的onChange事件
          // onShowSizeChange: (curr, size) => search({ pageSize: size })
        }}
        onChange={handleTableChange}
        ColumnFilter={ColumnFilter || {}}
        onFilter={filterChange}
        rowSelection={{
          selectedRowKeys: currItems.map(item => item.recid),
          onChange: (keys, items) => selectItems(items)
        }}
      />
      <EntcommAddModal />
      <EntcommCopyModal />
      <TransferModal />
      <MerageModal />
      <AdvanceSearchModal />
      <AllocateModal />
      <DynamicModal />
      <ExportModal currentUser={currentUser} />
      <DataTransferModal />
      <EntcommRepeatViewModal visible={/repeatview/.test(showModals)}
                              entityId={entityId}
                              simpleSearchKey={simpleSearchKey}
                              onCancel={modalCancel} />
    </Page>
  );
}

export default connect(
  state => {
    return { ...state.entcommList, currentUser: state.app.user.userid };
  }
)(connectPermission(props => props.entityId, EntcommList));
