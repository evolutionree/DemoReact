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
import RecordDetailModal from './RecordDetailModal';
import connectPermission from '../../models/connectPermission';
import AdvanceSearchModal from './AdvanceSearchModal';


function EntcommList({
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
                       sortFieldAndOrder
                     }) {
  function search(payload) {
    dispatch({ type: 'entcommDynamic/search', payload });
  }
  function searchKeyword(payload) {
    dispatch({ type: 'entcommDynamic/searchKeyword', payload });
  }

  function exportData() {
    const params = JSON.stringify({ ...queries, pageIndex: 1, pageSize: 65535 });
    window.open(`/api/excel/exportdata?TemplateType=1&DynamicQuery=${params}&UserId=${currentUser}`);
  }
  function advanceSearch() {
    dispatch({ type: 'entcommDynamic/showModals', payload: 'advanceSearch' });
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

  let dynamicTableRef;
  function openSetHeader() {
    dynamicTableRef.getWrappedInstance().openSetCustomHeaders();
  }

  const { searchData, pageIndex, pageSize, isAdvanceQuery } = queries;
  const keyword = (!isAdvanceQuery && searchData && searchData[simpleSearchKey]) || '';

  function showDetail(record) {
    dispatch({
      type: 'entcommDynamic/showModals',
      payload: `recordDetail?${entityId}:${record.recid}`
    });
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
        pagination={{
          total,
          pageSize,
          current: pageIndex
        }}
        onChange={handleTableChange}
        renderLinkField={(text, field, record, props) => (
          <a href="javascript:;" style={titleStyle} title={text} onClick={() => { showDetail(record); }}>{text}</a>
        )}
      />
      <AdvanceSearchModal />
      <RecordDetailModal />
    </Page>
  );
}

export default connect(
  state => {
    return { ...state.entcommDynamic, currentUser: state.app.user.userid };
  }
)(connectPermission(props => props.entityId, EntcommList));
