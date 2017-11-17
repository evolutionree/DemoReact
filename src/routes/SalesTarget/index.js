/**
 * Created by 0291 on 2017/8/2.
 */
import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';

import { Button, Select, Table, Modal, message, Spin } from 'antd';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import DataGrid from './component/DataGrid.jsx';
import HeaderModel from './component/HeaderModel';
import Breadcrumb from './Breadcrumb.js';
import YearTargetModal from './yearTargetModal.js';
import TargetModal from './targetModal.js';
import styles from './salesTarget.less';

const Option = Select.Option;

function SalesTarget({
                       checkFunc,
                       currSelectItems,
                       selectRowHandler,
                       params,
                       changeDeptIdParams,
                       breadcrumbData,
                       breadcrumbClickHandler,
                       openModal,
                       pageIndex,
                       datacursor,
                       changeParams
                     }) {

  let dataGridRef;
  const columns = [
    new HeaderModel('名称', 'recname', (text, record, index) => {
      return record.isgroup === 1 ? <a title={text} className={styles.overEllipsis} onClick={changeDeptIdParams.bind(this, record)}>{text}</a> : <span title={text} className={styles.overEllipsis}>{text}</span>;
    }),
    new HeaderModel('年度目标', 'yeartarget'),
    new HeaderModel('分配目标合计', 'yearsum'),
    new HeaderModel('状态', 'recstatus'),
    new HeaderModel('一月', 'jancount'),
    new HeaderModel('二月', 'febcount'),
    new HeaderModel('三月', 'marcount'),
    new HeaderModel('四月', 'aprcount'),
    new HeaderModel('五月', 'maycount'),
    new HeaderModel('六月', 'juncount'),
    new HeaderModel('七月', 'julcount'),
    new HeaderModel('八月', 'augcount'),
    new HeaderModel('九月', 'sepcount'),
    new HeaderModel('十月', 'octcount'),
    new HeaderModel('十一月', 'novcount'),
    new HeaderModel('十二月', 'deccount')
  ];

  const searchHandler = (value) => {
    changeParams('searchName', value);
  };


  let btnDisabled = true;
  let isgroup = 0;
  if (currSelectItems.length === 1) {
    btnDisabled = false;
    isgroup = currSelectItems[0].isgroup;
  }


  return (
    <Page title="销售目标">
      <Toolbar>
        <Select style={{ width: '120px' }} value={(params.year).toString()} onChange={changeParams.bind(this, 'year')}>
          <Option value={(new Date().getFullYear() - 1).toString()}>{new Date().getFullYear() - 1}年</Option>
          <Option value={(new Date().getFullYear()).toString()}>{new Date().getFullYear()}年</Option>
          <Option value={(new Date().getFullYear() + 1).toString()}>{new Date().getFullYear() + 1}年</Option>
        </Select>
        <Select style={{ width: '120px' }}  value={params.normtypeid} onChange={changeParams.bind(this, 'normtypeid')}>
          {
            datacursor.map((item) => {
              return <Option key={item.normtypeid} value={item.normtypeid}>{item.normtypename}</Option>;
            })
          }
        </Select>
        <Button onClick={openModal.bind(this, 'yearTarget', currSelectItems)} disabled={checkFunc('EntityDataAdd') ? (isgroup === 0 ? true : btnDisabled) : true}>分配销售目标</Button>
        <Button onClick={openModal.bind(this, 'target', currSelectItems)} disabled={checkFunc('EntityDataEdit') ? btnDisabled : true}>编辑销售目标</Button>
        <Button onClick={openModal.bind(this, 'importData')} disabled={!checkFunc('EntityDataImport')}>导入</Button>
        <Toolbar.Right>
          <Search
            label="搜索"
            maxLength={20}
            placeholder="请输入团队或人员名称"
            value={params.searchName}
            onSearch={searchHandler}
          />
        </Toolbar.Right>
      </Toolbar>
      <div>
        <Breadcrumb data={breadcrumbData} onClick={ breadcrumbClickHandler } />
      </div>
      <DataGrid
        ref={(dataGrid) => { dataGridRef = dataGrid }}
        url={params.normtypeid ? 'api/salestarget/gettargets' : null}
        columns={columns}
        params={params}
        rowKey='id'
        current={pageIndex}
        slectRows={currSelectItems}
        selectRowHandler={selectRowHandler} />
      <YearTargetModal />
      <TargetModal isgroup={isgroup} />
    </Page>
  )
};

export default connect(
  state => state.salesTarget,
  dispatch => {
    return {
      selectRowHandler(selectItems) {
        dispatch({ type: 'salesTarget/putState', payload: { currSelectItems: selectItems } });
      },
      changeDeptIdParams(item) {
        dispatch({ type: 'salesTarget/putState', payload: { currSelectItems: [] } });
        dispatch({ type: 'salesTarget/addBreadcrumbData', payload: { title: item.recname, departmentid: item.id } });
        dispatch({ type: 'salesTarget/changeParams', payload: { departmentid: item.id } });
      },
      changeParams(type, value) {
        dispatch({ type: 'salesTarget/changeParams', payload: { [type]: value } });
      },
      breadcrumbClickHandler(departmentid) {
        dispatch({ type: 'salesTarget/putState', payload: { currSelectItems: [] } });
        dispatch({ type: 'salesTarget/changeParams', payload: { departmentid: departmentid } });
        dispatch({ type: 'salesTarget/reducerBreadcrumbData', payload: departmentid });
        dispatch({ type: 'salesTarget/putState', payload: { pageIndex: 1 } });
      },
      openModal(type, currSelectItems) {
        if (type === 'yearTarget') {
          dispatch({ type: 'salesTarget/getyeartarget' });
        } else if (type === 'target') {
          if (currSelectItems[0].recstatus === '离职') {
            message.warning('离职员工的销售目标不可编辑');
            return false;
          }
          dispatch({ type: 'salesTarget/gettargetdetail' });
        }else if (type === 'importData') {
          dispatch({
            type: 'salesTarget/importModal',
            payload: 'import'
          });
        }
        dispatch({ type: 'salesTarget/showModal', payload: type });
      }
    };
  }
)(SalesTarget);
