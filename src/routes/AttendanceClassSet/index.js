/**
 * Created by 0291 on 2018/3/5.
 */
import React from 'react';
import { Button, Modal, Icon } from 'antd';
import { connect } from 'dva';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import DynamicTable from '../../components/DynamicTable/index';
import connectPermission from '../../models/connectPermission';
import AddClassModal from './AddClassModal';

function AttendanceClassSet({
                              checkFunc,
                              dispatch,
                              entityName,
                              protocol,
                              queries,
                              list,
                              total,
                              currItems,
                              entityId,
                              simpleSearchKey,
                              sortFieldAndOrder  //当前排序的字段及排序顺序
                            }) {
  function selectItems(items) {
    dispatch({ type: 'attendanceClassSet/putState', payload: { currItems: items } });
  }
  function search(payload) {
    dispatch({ type: 'attendanceClassSet/search', payload });
  }
  function searchKeyword(payload) {
    dispatch({ type: 'attendanceClassSet/searchKeyword', payload });
  }

  function openAdd() {
    dispatch({
      type: 'attendanceClassSet/showModals',
      payload: 'add'
    });
    dispatch({ type: 'attendanceClassSet/putState', payload: { formData: null } });
  }

  function showEdit() {
    dispatch({
      type: 'attendanceClassSet/queryDetail',
      payload: ''
    })
    dispatch({
      type: 'attendanceClassSet/showModals',
      payload: 'edit'
    });
  }

  function del() {
    Modal.confirm({
      title: '确定删除选中数据吗？',
      onOk() {
        dispatch({ type: 'attendanceClassSet/del' });
      }
    });
  }

  function handleTableChange(pagination, filters, sorter) {
    const searchOrder = sorter.field ? (sorter.field + (sorter.order === 'ascend' ? ' asc' : ' desc')) : ''
    search({
      pageIndex: pagination.current,
      pageSize: pagination.pageSize,
      searchOrder: searchOrder
    });
  }

  let dynamicTableRef;
  function openSetHeader() {
    dynamicTableRef.getWrappedInstance().openSetCustomHeaders();
  }

  const { searchData, pageIndex, pageSize } = queries;
  const keyword = (searchData && searchData[simpleSearchKey]) || '';

  const titleStyle = {
    display: 'inline-block',
    maxWidth: '340px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  const defaultToolbarActions = [
    { label: '删除', handler: del },
    { label: '编辑', handler: showEdit, single: true }
  ];


  return (
    <Page title={entityName}>
      <Toolbar
        selectedCount={currItems.length}
        actions={defaultToolbarActions}
      >
        <Button onClick={openAdd}>新增</Button>
        <Toolbar.Right>
          <Search
            placeholder="请输入关键字"
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
        protocol={protocol}
        rowKey="recid"
        entityId={entityId}
        dataSource={list}
        total={total}
        fixedHeader={true}
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
        renderLinkField={(text, field, record, props) => (
          <span href="javascript:;" style={titleStyle} title={text}>{text}</span>
        )}
      />
      <AddClassModal />
    </Page>
  );
}

export default connect(
  state => {
    return { ...state.attendanceClassSet };
  }
)(connectPermission(props => props.entityId, AttendanceClassSet));
