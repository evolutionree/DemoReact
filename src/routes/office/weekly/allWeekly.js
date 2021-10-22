/**
 * Created by 0291 on 2017/9/22.
 */
import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Button, DatePicker } from 'antd';
// import LinkTab from '../../../components/LinkTab';
import DynamicTable from '../../../components/DynamicTable/index';
import Toolbar from '../../../components/Toolbar';
import Search from '../../../components/Search';
import SelectDepartment from '../../../components/DynamicForm/controls/SelectDepartment';
import ExportModal from './component/ExportModal';
import { hashHistory } from 'react-router';

const { RangePicker } = DatePicker;

function AllWeekly({
  checkFunc, addWeekly, searchAllWeeklyList,
  tableProtocol, allWeeklyList, tableTotal,
  tableCurrentPage, tablePageSize, changePage,
  changePageSize, changeParams, allWeeklySearchData,
  exportData, currentUser,queryAllWeeklyDetail
}) {
  const onChange = (date, dateString) => {
    changeParams('date', allWeeklySearchData, dateString);
  };
  function getDate() {
    return [allWeeklySearchData.fromdate ? moment(allWeeklySearchData.fromdate, 'YYYY-MM-DD') : null, allWeeklySearchData.todate ? moment(allWeeklySearchData.todate, 'YYYY-MM-DD') : null];
  }
  function disabledDate(current) {
    // Can not select days before today and today
    return current && current > moment().endOf('day');
  }
  function shouldShowExport() {
    return checkFunc('EntityDataExport');
  }

  return (
    <div>
      <Toolbar>
        {
          checkFunc('EntityDataAdd') ? <Button type="primary" icon="edit" onClick={addWeekly} style={{ marginRight: '20px' }}>写周计划</Button> : null
        }
        {shouldShowExport() && <Button onClick={exportData}>导出</Button>}
        <Toolbar.Right>
          <div style={{ display: 'inline-block', width: 220 }}>
            <RangePicker onChange={onChange} value={getDate()} />
          </div>
          <div style={{ width: 200, display: 'inline-block', margin: '0 10px' }}>
            <SelectDepartment onChange={changeParams.bind(this, 'dept', allWeeklySearchData)} value={allWeeklySearchData.dept} />
          </div>
          <Search
            placeholder="请输入发送人"
            value={allWeeklySearchData.reccreator}
            onSearch={searchAllWeeklyList}
            onChange={changeParams.bind(this, 'creator', allWeeklySearchData)}
          >
            搜索
          </Search>
        </Toolbar.Right>
      </Toolbar>
      <DynamicTable
        entityId="0b81d536-3817-4cbc-b882-bc3e935db845"
        protocol={tableProtocol}
        rowKey="recid"
        allWeek="true"
        linkUrl={queryAllWeeklyDetail}              
        
        dataSource={allWeeklyList}
        total={tableTotal}
        pagination={{
          total: tableTotal,
          pageSize: tablePageSize,
          current: tableCurrentPage,
          onChange: changePage,
          onShowSizeChange: changePageSize
        }}
      />
      <ExportModal userId={currentUser} />
    </div>
  );
}

export default connect(
  state => {
    return ({
      ...state.weekly,
      currentUser: state.app.user.userid
    });
  },
  dispatch => {
    return {
      addWeekly() {
        dispatch({ type: 'weekly/showModals', payload: 'addWeekly' });
      },
      changeParams(type, allWeeklySearchData, param) {
        let newParams;
        if (type === 'date') {
          newParams = {
            ...allWeeklySearchData,
            fromdate: param[0],
            todate: param[1]
          };
        } else if (type === 'dept') {
          newParams = {
            ...allWeeklySearchData,
            dept: param
          };
        } else if (type === 'creator') {
          newParams = {
            ...allWeeklySearchData,
            reccreator: param
          };
        }
        dispatch({ type: 'weekly/putState', payload: { allWeeklySearchData: newParams } });
      },
      searchAllWeeklyList(value) {
        dispatch({ type: 'weekly/updataTable', payload: {} });
      },
      changePage(page) {
        dispatch({ type: 'weekly/putState', payload: { tableCurrentPage: page } });
        dispatch({ type: 'weekly/updataTable', payload: {} });
      },
      changePageSize(currentPage, size) {
        dispatch({ type: 'weekly/putState', payload: { tablePageSize: size, tableCurrentPage: 1 } });
        dispatch({ type: 'weekly/updataTable', payload: {} });
      },
      exportData() {
        dispatch({ type: 'weekly/showModals', payload: 'export' });
      },
      queryAllWeeklyDetail(recid,felds, weekLabel) {
        hashHistory.push(`/weekly/receiveweekly/${recid}?weeklabel=${encodeURI(weekLabel)}`);
        dispatch({ type: 'weekly/putState', payload: { route: `/weekly/receiveweekly/${recid}?weeklabel=${encodeURI(weekLabel)}` } });
      },
    };
  }
)(AllWeekly);
