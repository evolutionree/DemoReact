/**
 * Created by 0291 on 2017/9/22.
 */
import React from 'react';
import { connect } from 'dva';
import { Select, Button, Modal, DatePicker } from 'antd';
const { RangePicker } = DatePicker;
import DynamicTable from '../../../components/DynamicTable/index';
import Toolbar from '../../../components/Toolbar';
import Search from '../../../components/Search';
import SelectDepartment from '../../../components/DynamicForm/controls/SelectDepartment';
import moment from 'moment';

function AllDaily({ checkFunc,
                    addDaily,
                    searchAllDailyList,
                    tableProtocol,
                    allDailyList,
                    tableTotal,
                    tableCurrentPage,
                    tablePageSize,
                    changePage,
                    changePageSize,
                    allDailySearchData, advanceSearch }) {
  return (
    <div>
      <Toolbar>
        {
          checkFunc('EntityDataAdd') ? <Button type="primary" icon="edit" onClick={addDaily} style={{ marginRight: '20px' }}>写日报</Button> : null
        }
        <Toolbar.Right>
          <Search
            placeholder="请输入发送人"
            value={allDailySearchData.reccreator}
            onSearch={searchAllDailyList}
          >
            搜索
          </Search>
          <Button onClick={advanceSearch} style={{ marginLeft: '10px', height: '31px' }}>高级搜索</Button>
        </Toolbar.Right>
      </Toolbar>
      <DynamicTable
        entityId="601cb738-a829-4a7b-a3d9-f8914a5d90f2"
        protocol={tableProtocol}
        rowKey="recid"
        linkUrl={(text, field, record) => {
          return `/alldaily/detail/${record.recid}`;
        }}
        dataSource={allDailyList}
        total={tableTotal}
        pagination={{
          total: tableTotal,
          pageSize: tablePageSize,
          current: tableCurrentPage,
          onChange: changePage,
          onShowSizeChange: changePageSize
        }}
      />
    </div>
  );
}

export default connect(
  state => state.daily,
  dispatch => {
    return {
      addDaily() {
        dispatch({ type: 'daily/showModals', payload: 'addDaily' });
      },
      searchAllDailyList(value) {
        dispatch({ type: 'daily/putState', payload: { reccreator: value, allDailySearchData: { reccreator: value } } });
        dispatch({ type: 'daily/updataTable', payload: value });
      },
      changePage(page) {
        dispatch({ type: 'daily/putState', payload: { tableCurrentPage: page } });
        dispatch({ type: 'daily/updataTable', payload: { } });
      },
      changePageSize(currentPage, size) {
        dispatch({ type: 'daily/putState', payload: { tablePageSize: size, tableCurrentPage: 1 } });
        dispatch({ type: 'daily/updataTable', payload: { } });
      },
      advanceSearch() {
        dispatch({ type: 'daily/showModals', payload: 'advanceSearch' });
      }
    };
  }
)(AllDaily);
