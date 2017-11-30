import React from 'react';
import { Select, Button, Modal } from 'antd';
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
    extraToolbarData
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

  function importData() {
    dispatch({
      type: 'task/impModals',
      payload: { templateType: 1, templateKey: entityId }
    });
  }
  function exportData() {
    const params = JSON.stringify({ ...queries, pageIndex: 1, pageSize: 65535 });
    window.open(`/api/excel/exportdata?TemplateType=1&DynamicQuery=${params}&UserId=${currentUser}`);
    // dispatch({
    //   type: 'entcommList/exportData',
    //   payload: 'import'
    // });
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
    if (item.buttoncode === 'CallService') {
      dispatch({
        type: 'entcommList/extraToolbarClick',
        payload: item
      });
    } else if (item.buttoncode === 'CallService_showModal') {
      dispatch({
        type: 'entcommList/showModals',
        payload: item.extradata && item.extradata.componentname
      });
    }
  }

  function extraButtonClickHandler(item) {
    dispatch({
      type: 'entcommList/showModals',
      payload: item.extradata && item.extradata.componentname
    });
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

  const { menuId, searchData, pageIndex, pageSize, isAdvanceQuery } = queries;
  const keyword = (!isAdvanceQuery && searchData && searchData[simpleSearchKey]) || '';

  const defaultToolbarActions = [
    { label: '删除', handler: del, show: checkFunc('EntityDataDelete') },
    { label: entityId === '1ce5e2d5-6cf7-440d-83f4-0d500c4a2cd9' ? '分配' : '转移', handler: openTransfer, show: shouldShowTransfer },
    { label: '分配线索', handler: allocate, show: shouldShowAllocate }//db330ae1-b78c-4e39-bbb5-cc3c4a0c2e3b 销售线索批量分配
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
        {checkFunc('EntityDataMerge') && <Button onClick={merageCustom}>客户合并</Button>}
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
        </Toolbar.Right>
      </Toolbar>
      <DynamicTable
        entityId={entityId}
        protocol={protocol}
        rowKey="recid"
        dataSource={list}
        total={total}
        pagination={{
          total,
          pageSize,
          current: pageIndex,
          onChange: val => search({ pageIndex: val }),
          onShowSizeChange: (curr, size) => search({ pageSize: size })
        }}
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
    </Page>
  );
}

export default connect(
  state => {
    return { ...state.entcommList, currentUser: state.app.user.userid };
  }
)(connectPermission(props => props.entityId, EntcommList));
