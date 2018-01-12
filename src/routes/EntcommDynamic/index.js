/**
 * Created by 0291 on 2018/1/12.
 */
import React from 'react';
import { Select, Button, Modal } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import DynamicTable from '../../components/DynamicTable/index';
import RecordDetailModal from './RecordDetailModal';
import connectPermission from '../../models/connectPermission';
import AdvanceSearchModal from './AdvanceSearchModal';

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
                       showModals
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
    // dispatch({
    //   type: 'entcommList/exportData',
    //   payload: 'import'
    // });
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

  const { menuId, searchData, pageIndex, pageSize } = queries;
  const keyword = (searchData && searchData[simpleSearchKey]) || '';

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
        {shouldShowExport() && <Button onClick={exportData}>导出</Button>}
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
        sorter={true}
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
          // onChange: val => search({ pageIndex: val }),
          // onShowSizeChange: (curr, size) => search({ pageSize: size })
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
