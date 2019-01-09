/**
 * Created by 0291 on 2018/1/12.
 */
import React from 'react';
import { Button, Icon } from 'antd';
import { connect } from 'dva';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import DynamicTable from '../../components/DynamicTable/index';
import DynamicDetailModal from './DynamicDetailModal';
import connectPermission from '../../models/connectPermission';
import AdvanceSearchModal from './AdvanceSearchModal';
import DynamicLoadFilterModal from '../../components/DynamicLoadFilterModal';
import ExportModal from './ExportModal';

function entcommDynamic({
                       checkFunc,
                       dispatch,
                       entityName,
                       protocol,
                       queries,
                       list,
                       total,
                       entityId,
                       currentUser,
                       simpleSearchKey,
                       searchTips,
                       sortFieldAndOrder,
                       ColumnFilter
                     }) {
  function search(payload) {
    dispatch({ type: 'entcommDynamic/search', payload });
  }
  function searchKeyword(payload) {
    dispatch({ type: 'entcommDynamic/searchKeyword', payload });
  }

  function exportData() {
    dispatch({
      type: 'entcommDynamic/showModals',
      payload: 'export'
    });
  }
  function advanceSearch() {
    dispatch({ type: 'entcommDynamic/showModals', payload: 'advanceSearch' });
  }
  function cancelFilter() {
    dispatch({ type: 'entcommDynamic/showModals', payload: 'cancelFilter' });
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

  function filterChange(filterData) {
    dispatch({
      type: 'entcommDynamic/putState',
      payload: { ColumnFilter: filterData }
    });
    dispatch({ type: 'entcommDynamic/search', payload: { } });
  }

  let dynamicTableRef;
  function openSetHeader() {
    dynamicTableRef.getWrappedInstance().openSetCustomHeaders();
  }

  const { searchData, pageIndex, pageSize, isAdvanceQuery } = queries;
  const keyword = (!isAdvanceQuery && searchData && searchData[simpleSearchKey]) || '';

  function showDetail(record) {
    dispatch({ type: 'entcommDynamic/getDetail', payload: record.recid });
  }

  const titleStyle = {
    display: 'inline-block',
    maxWidth: '340px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };
  return (
    <Page title={entityName}>
      <Toolbar>
        <Button onClick={exportData}>导出</Button>
        <Toolbar.Right>
          <Search
            placeholder={`请输入${searchTips || '关键字'}`}
            value={keyword}
            onSearch={val => searchKeyword(val)}
          >
            搜索
          </Search>
          <Button onClick={cancelFilter} style={{ marginLeft: '10px', height: '31px' }}>筛选</Button>
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
        }}
        onChange={handleTableChange}
        ColumnFilter={ColumnFilter || {}}
        onFilter={filterChange}
        renderLinkField={(text, field, record, props) => (
          <a href="javascript:;" style={titleStyle} title={text} onClick={() => { showDetail(record); }}>{text}</a>
        )}
      />
      <AdvanceSearchModal />
      <DynamicLoadFilterModal
        keyName="entcommDynamic"
        title="筛选条件"
        protocol={protocol}
        ColumnFilter={ColumnFilter}
      />
      <DynamicDetailModal />
      <ExportModal currentUser={currentUser} />
    </Page>
  );
}

export default connect(
  state => {
    return { ...state.entcommDynamic, currentUser: state.app.user.userid };
  }
)(connectPermission(props => props.entityId, entcommDynamic));
