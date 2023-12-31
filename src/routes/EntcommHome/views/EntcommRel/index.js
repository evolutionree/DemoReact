import React from 'react';
import { connect } from 'dva';
import { Button, Icon, Select, Modal } from 'antd';
import classnames from 'classnames';
import * as _ from 'lodash';
import styles from './styles.less';
import DetailModal from './DetailModal';
import RelEntityAddModal from './RelEntityAddModal';
import Toolbar from '../../../../components/Toolbar';
import Search from '../../../../components/Search';
import DynamicTable from '../../../../components/DynamicTable/index';
import TransferModal from './TransferModal';
import MerageModal from './MerageModal';
import AllocateModal from './AllocateModal';
import DynamicModal from './DynamicModal';
import ExportModal from './ExportModal';
import EntcommCopyModal from '../../../../components/EntcommCopyModal';
import connectPermission from '../../../../models/connectPermission';
import { getIntlText } from '../../../../components/UKComponent/Form/IntlText';
import EntcommAddModal from '../../../../components/EntcommAddModal';
import DeptTree from '../DeptTree';

const deptEntityId = 'd51aca76-a168-48c7-aa14-eb69ca407050';
function EntcommRel({
  list,
  relEntityId,
  showDetail,
  addRelEntity,
  tabInfo,
  checkFunc,
  call, //拨打客户联系人电话
  protocol,
  menus,
  queries,
  simpleSearchKey,
  searchTips,
  total,
  currItems,
  dispatch,
  extraToolbarData,
  extraButtonData,
  sortFieldAndOrder,
  currentUser,
  relCountData,
  showModals,
  onAddModalCanel,
  AddRelTable,
  relEntityProInfo,
  processProtocol,
  showCopyModal,
  copyData
}) {
  function onMenuChange(payload) {
    dispatch({ type: 'entcommRel/selectMenu', payload });
  }

  function merageCustom() {
    dispatch({ type: 'entcommRel/showModals', payload: 'merage' });
  }

  function importData() {
    dispatch({
      type: 'task/impModals',
      payload: { templateType: 1, templateKey: tabInfo.relentityid }
    });
  }

  function exportData() {
    dispatch({
      type: 'entcommRel/showModals',
      payload: 'export'
    });
  }

  function shouldShowExport() {
    return checkFunc('EntityDataExport');
  }

  function extraButtonClickHandler(item) {
    dispatch({
      type: 'entcommRel/putState',
      payload: {
        showModals: 'dynamicModal',
        dynamicModalData: item
      }
    });
  }

  function searchKeyword(payload) {
    dispatch({ type: 'entcommRel/searchKeyword', payload });
  }

  let dynamicTableRef;
  function openSetHeader() {
    dynamicTableRef.getWrappedInstance().openSetCustomHeaders();
  }

  function handleTableChange(pagination, filters, sorter) {
    const searchOrder = sorter.field ? (sorter.field + (sorter.order === 'ascend' ? ' asc' : ' desc')) : '';
    search({
      pageIndex: pagination.current,
      pageSize: pagination.pageSize,
      searchOrder: searchOrder
    });
  }

  function search(payload) {
    dispatch({ type: 'entcommRel/search', payload });
  }

  function selectItems(items) {
    dispatch({ type: 'entcommRel/currItems', payload: items });
    dispatch({ type: 'entcommRel/queryFuntionbutton__', payload: {} });
  }


  function del() {
    Modal.confirm({
      title: '确定删除选中数据吗？',
      onOk() {
        dispatch({ type: 'entcommRel/del' });
      }
    });
  }

  function openTransfer() {
    dispatch({ type: 'entcommRel/showModals', payload: 'transfer' });
  }

  function shouldShowTransfer() {
    if (!checkFunc('EntityDataTransfer')) return;
    const menu = _.find(menus, ['menuId', menuId]);
    return !!menu && /转移/.test(menu.menuName);
  }


  function allocate() {
    dispatch({ type: 'entcommRel/showModals', payload: 'allocate' });
  }

  function shouldShowAllocate() {
    const isXiansuoEntity = tabInfo.relentityid === 'db330ae1-b78c-4e39-bbb5-cc3c4a0c2e3b';
    const canAllocate = currItems.every(item => item.allocated === 1 || item.allocated === 4); // 分配状态为 新建/退回
    return isXiansuoEntity && canAllocate && checkFunc('BatchClueAllocate');
  }

  function extraToolbarClickHandler(item) {
    if (item.buttoncode === 'CallService' || item.buttoncode === 'EntityDataOpenH5') {
      dispatch({
        type: 'entcommRel/extraToolbarClick',
        payload: item
      });
    } else if (item.buttoncode === 'CallService_showModal') {
      dispatch({
        type: 'entcommRel/putState',
        payload: {
          showModals: 'dynamicModal',
          dynamicModalData: item
        }
      });
    } else if (item.buttoncode === 'PrintEntity') {
      dispatch({
        type: 'printEntity/initPrint',
        payload: {
          entityId: tabInfo.relentityid,
          recordId: currItems && currItems[0] && currItems[0].recid
        }
      });
    } else if (item.buttoncode === 'AddRelEntityData') {
      const recids = currItems.map(tmpitem => tmpitem.recid).join(',');
      dispatch({
        type: 'entcommRel/showRelTabAddModals',
        payload: {
          relid: item.extradata.relid,
          recids: recids,
          relentityid: item.extradata.relentityid,
          relfieldid: item.extradata.relfieldid,
          relfieldname: item.extradata.relfieldname,
          originDetail: currItems[0]
        }
      });
    } else if (item.buttoncode === 'EntityDataCopy') {
      dispatch({
        type: 'entcommRel/showRelCopyModals',
        payload: { entityId: relEntityId, recId: currItems[0].recid, needPower: 0 }
      });
    }
  }

  const callHandler = (mobilephone) => {
    call(mobilephone);
  };

  function onCancleCopy() {
    dispatch({ 
      type: 'entcommRel/putState', 
      payload: { showCopyModal: false, copyData: {} } 
    });
  }

  function onDoneCopy() {
    dispatch({ 
      type: 'entcommRel/onDoneCopy' 
    });
  }

  function shouldShowImport() {
    return checkFunc('EntityDataImport');
  }

  const { menuId, searchData, pageIndex, pageSize, isAdvanceQuery } = queries;
  const keyword = (!isAdvanceQuery && searchData && searchData[simpleSearchKey]) || '';

  const defaultToolbarActions = [
    { label: '删除', handler: del, show: checkFunc('EntityDataDelete') },
    { label: tabInfo.relentityid === '1ce5e2d5-6cf7-440d-83f4-0d500c4a2cd9' ? '分配' : '转移', handler: openTransfer, show: shouldShowTransfer },
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

  const titleStyle = {
    display: 'inline-block',
    maxWidth: '340px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  return (
    <div className={styles.pagecontainer}>
      <ul className={styles.reldatasourceWrap} style={{ display: tabInfo.confitems > 0 ? 'block' : 'none' }}>
        {
          relCountData && relCountData instanceof Array && relCountData.map((item, index) => {
            const percentWidth = 100 / relCountData.length;
            return (
              <li style={{ width: percentWidth + '%' }} key={index}>
                <ul>
                  <li title={item.title}>{`${item.title}`}</li>
                  <li>：</li>
                  <li title={item.value}>{item.value}</li>
                </ul>
              </li>
            );
          })
        }
      </ul>
      <Toolbar
        selectedCount={currItems.length}
        actions={[
          ...defaultToolbarActions,
          ...ajaxToolbarActions
        ]}
      >
        {
          relEntityId === deptEntityId ? null : <Select style={{ minWidth: '120px' }} value={menuId} onChange={onMenuChange}>
            {menus.map(menu => (
              <Option key={menu.menuId}>{menu.menuName}</Option>
            ))}
          </Select>
        }
        {checkFunc('EntityDataAdd') && <Button onClick={addRelEntity}>新增</Button>}
        {checkFunc('EntityDataMerge') && <Button onClick={merageCustom}>客户合并</Button>}
        {shouldShowImport() && <Button onClick={importData}>导入</Button>}
        {shouldShowExport() && <Button onClick={exportData}>导出</Button>}
        {
          extraButtonData && extraButtonData instanceof Array && extraButtonData.map((item, index) => {
            return <Button onClick={extraButtonClickHandler.bind(this, item)} key={index}>{getIntlText('title', item)}</Button>;
          })
        }
        {
          relEntityId === deptEntityId ? null : <Toolbar.Right>
            <Search
              placeholder={`请输入${searchTips || '关键字'}`}
              value={keyword}
              onSearch={val => searchKeyword(val)}
            >
              搜索
            </Search>
            <Icon type="setting" onClick={openSetHeader} style={{ fontSize: '20px', marginLeft: '10px', cursor: 'pointer', color: '#9ba1ad', position: 'relative', top: '2px' }} />
          </Toolbar.Right>
        }
      </Toolbar>
      {
        relEntityId === deptEntityId ? <DeptTree /> : <DynamicTable
          ref={(ref) => dynamicTableRef = ref}
          sorter
          sortFieldAndOrder={sortFieldAndOrder}
          entityId={tabInfo.relentityid}
          protocol={protocol}
          rowKey="recid"
          dataSource={list}
          total={total}
          fixedHeader
          otherHeight={tabInfo.confitems > 0 ? 190 + 66 + 94 : 190 + 66} //页面表格元素除外的元素的总高度
          pagination={{
            total,
            pageSize,
            current: pageIndex
          }}
          onChange={handleTableChange}
          rowSelection={{
            selectedRowKeys: currItems.map(item => item.recid),
            onChange: (keys, items) => selectItems(items)
          }}
          onCall={callHandler}
          renderLinkField={(text, field, record, props) => (
            <a href="javascript:;" style={titleStyle} title={text} onClick={() => { showDetail(record); }}>{text || '(查看详情)'}</a>
          )}
        />
      }
      <TransferModal />
      <MerageModal />
      <ExportModal userId={currentUser} />
      <AllocateModal />
      <DynamicModal />
      <DetailModal />
      <RelEntityAddModal />
      <EntcommAddModal
        visible={/AddRelEntityData/.test(showModals)}
        entityId={AddRelTable && AddRelTable.EntityId}
        entityName={AddRelTable && AddRelTable.EntityName}
        initFormData={AddRelTable && AddRelTable.initAddFormData}
        flow={AddRelTable && AddRelTable.FlowId ? { flowid: AddRelTable && AddRelTable.FlowId && AddRelTable.FlowId !== '' } : undefined}
        processProtocol={processProtocol}
        cancel={onAddModalCanel}
        done={onAddModalCanel}
        entityTypes={relEntityProInfo}
      />
      <EntcommCopyModal
        visible={showCopyModal}
        entityId={relEntityId}
        entityTypes={relEntityProInfo}
        copyData={copyData}
        currentUser={currentUser}
        onCancel={onCancleCopy}
        onDone={onDoneCopy}
      />
    </div>
  );
}

export default connect(
  state => {
    const { relTabs } = state.entcommHome;
    const { relId, relEntityId } = state.entcommRel;
    const currentUser = state.app.user;
    let tabInfo = {};
    if (relTabs.length && relId && relEntityId) {
      tabInfo = _.find(relTabs, item => {
        return item.relid === relId && item.relentityid === relEntityId;
      }) || tabInfo;
    }
    return {
      ...state.entcommRel,
      tabInfo,
      currentUser
    };
  },
  dispatch => {
    return {
      showDetail(item) {
        dispatch({ type: 'entcommRel/putState', payload: { currItem: item.recid } });
      },
      addRelEntity() {
        //dispatch({ type: 'entcommRel/putState', payload: { showModals: 'add' } });
        dispatch({ type: 'entcommRel/addRelEntity' });
      },
      call(mobilephone) {
        dispatch({ type: 'entcommRel/call', payload: mobilephone });
      },
      onAddModalCanel() {
        dispatch({ type: 'entcommRel/showModals', payload: '' });
      }
    };
  }
)(connectPermission(props => props.relEntityId, EntcommRel));
