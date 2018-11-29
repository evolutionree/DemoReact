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
import connectPermission from "../../../../models/connectPermission";
import { downloadFile } from '../../../../utils/ukUtil';

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
  relCountData
}) {
  function onMenuChange(payload) {
    dispatch({ type: 'entcommRel/selectMenu', payload });
  }

  function merageCustom() {
    dispatch({ type: 'entcommRel/showModals', payload: 'merage' });
  }

  function exportData() {
    const params = JSON.stringify({ ...queries, pageIndex: 1, pageSize: 65535 });
    downloadFile(`/api/excel/exportdata?TemplateType=1&DynamicQuery=${params}&UserId=${currentUser}`);
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
    }
  }

  const callHandler = (mobilephone) => {
    call(mobilephone);
  };


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
        <Select style={{ minWidth: '120px' }} value={menuId} onChange={onMenuChange}>
          {menus.map(menu => (
            <Option key={menu.menuId}>{menu.menuName}</Option>
          ))}
        </Select>
        {checkFunc('EntityDataAdd') && <Button onClick={addRelEntity}>{`新增${tabInfo.entityname || ''}`}</Button>}
        {checkFunc('EntityDataMerge') && <Button onClick={merageCustom}>客户合并</Button>}
        {/*{shouldShowImport() && <Button onClick={importData}>导入</Button>}*/}
        {shouldShowExport() && <Button onClick={exportData}>导出</Button>}
        {
          extraButtonData && extraButtonData instanceof Array && extraButtonData.map((item, index) => {
            return <Button onClick={extraButtonClickHandler.bind(this, item)} key={index}>{item.title}</Button>;
          })
        }
        <Toolbar.Right>
          <Search
            placeholder={`请输入${searchTips || '关键字'}`}
            value={keyword}
            onSearch={val => searchKeyword(val)}
          >
            搜索
          </Search>
          <Icon type="setting" onClick={openSetHeader} style={{ fontSize: '20px', marginLeft: '10px', cursor: 'pointer', color: '#9ba1ad', position: 'relative', top: '2px' }} />
        </Toolbar.Right>
      </Toolbar>
      <DynamicTable
        ref={(ref) => dynamicTableRef = ref }
        sorter={true}
        sortFieldAndOrder={sortFieldAndOrder}
        entityId={tabInfo.relentityid}
        protocol={protocol}
        rowKey="recid"
        dataSource={list}
        total={total}
        fixedHeader={true}
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
          <a href="javascript:;" style={titleStyle} title={text} onClick={() => { showDetail(record) }}>{text}</a>
        )}
      />
      <TransferModal />
      <MerageModal />
      <AllocateModal />
      <DynamicModal />
      <DetailModal />
      <RelEntityAddModal />
    </div>
  );
}

export default connect(
  state => {
    const { relTabs } = state.entcommHome;
    const { relId, relEntityId } = state.entcommRel;
    let tabInfo = {};
    if (relTabs.length && relId && relEntityId) {
      tabInfo = _.find(relTabs, item => {
        return item.relid === relId && item.relentityid === relEntityId;
      }) || tabInfo;
    }
    return {
      ...state.entcommRel,
      tabInfo,
      currentUser: state.app.user.userid
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
      }
    };
  }
)(connectPermission(props => props.relEntityId, EntcommRel));
