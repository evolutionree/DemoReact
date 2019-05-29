import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { Modal, Button } from 'antd';
import * as _ from 'lodash';
import Toolbar from '../../Toolbar';
import ConfigTable from '../../ConfigTable';
import CodeMerge from '../../CodeMerge';
import FormModal from './FormModal';
import FilterModal from '../FilterModal';
import formConfig from './formConfig';

class HistoryModal extends Component {
  state = {
    OptionList: [],
    selectedRows: [],
    confirmLoading: {
      FilterModal: false
    },
    fetchDataLoading: {
      FormModal: false
    },
    visibleCodeMerge: false,
    columns: [
      { title: '变更流水号', key: '1', width: 140, sorter: true, render: (text, record) => <a href="javascript:;" onClick={() => this.showDetail(record)}>{text}</a> },
      { title: '变更日期', key: '2', width: 140, sorter: true },
      { title: '变更人', key: '3', width: 140, sorter: true },
      { title: '变更前长度', key: '4', width: 140, sorter: true },
      { title: '变更后长度', key: '5', width: 140, sorter: true },
      { title: '变更备注', key: '6', width: 140, sorter: true },
      { title: '备注时间', key: '7', width: 140, sorter: true },
      { title: '备注人', key: '8', width: 140, sorter: true }
    ]
  }

  componentDidMount() {
    this.fetchList();
  }

  componentWillReceiveProps(nextProps) {
    const { selectedRows } = nextProps;
    if (selectedRows) this.setState({ selectedRows });
  }

  fetchList = () => {
    const { keyname } = this.props;
    const params = {
      keyname
    };
    this.setState({ list: [
      {
        1: '5435',
        2: '5435',
        3: '5435',
        4: '5435',
        5: '5435',
        6: '5435',
        7: '5435',
        8: '5435'
      }
    ].map((item, i) => ({ ...item, recid: i })) });
  }

  fecthFormData = (recid) => {
    const { dispatch, spaceName } = this.props;
    const { OptionList } = this.state;
    const fields = {};
    OptionList.forEach(item => (fields[item.fieldname] = ''));
    new Promise((resolve) => {
      dispatch({ type: `${spaceName}/FecthAllFormData`, payload: { recid, fields, resolve } });
    }).then(res => {
      // callback behavior
    });
  }

  toggleModal = (modal, action) => {
    const { dispatch, spaceName, showModals } = this.props;
    dispatch({ type: `${spaceName}/showModals`, payload: { ...showModals, [modal]: (action === undefined ? modal : action) } });
  }

  add = () => {
    this.toggleModal('FormModal', 'add');
    this.fecthFormData();
  }

  edit = () => {
    const { selectedRows } = this.props;
    const { reportrelationid } = selectedRows[0];
    this.toggleModal('FormModal', 'edit');
    this.fecthFormData(reportrelationid);
  }

  del = () => {
    const { dispatch, spaceName, selectedRows } = this.props;
    const params = selectedRows.map(item => item.reportrelationid);
    this.clearSelect();
    dispatch({ type: `${spaceName}/Del`, payload: params });
  };

  handleSelectRecords = () => {

  }

  onHandleSearchChange = val => {
    this.setState({ keyWord: val });
  }

  onHandleSearch = val => {
    const { initParams } = this.props;
    const params = {
      ...initParams,
      columnFilter: {
        ...initParams.columnFilter,
        reportrelationname: val
      }
    };
    this.onSeach(params);
  }

  onSeach = (params) => {
    const { dispatch, spaceName } = this.props;
    dispatch({ type: `${spaceName}/Search`, payload: params });
  }

  jump = (text, record) => {
    const { dispatch, spaceName } = this.props;
    dispatch(routerRedux.push({ pathname: `/${spaceName}detail/${record.reportrelationid}` }));
    sessionStorage.setItem('reportrelationdetailtitle', text);
    sessionStorage.setItem('reportrelationid', record.reportrelationid);
  }

  onSelectRow = (selectedRows) => this.setState({ selectedRows });

  clearSelect = () => {
    const { onSelectRow } = this.props;
    if (onSelectRow) onSelectRow([]);
    this.setState({ selectedRows: [] });
  }

  handleOk = () => {
    if (true) {
      this.handleCancel();
    }
  }

  handleCancel = () => {
    this.toggleModal('HistoryModal', '');
    this.clearSelect();
  }
  
  diffCurrent = () => {
    const { visibleCodeMerge } = this.state;
    this.setState({ visibleCodeMerge: !visibleCodeMerge });
  }

  showDetail = (record) => {
    console.log(record);
    this.toggleModal('FormModal');
  }

  render() {
    const { 
      width = 550, initParams, onSelectRow, spaceName,
      title, value, orig, historyList,
      showModals, dispatch, rowKey = 'recid'
    } = this.props;

    const { selectedRows, list, columns, confirmLoading, fetchDataLoading, visibleCodeMerge } = this.state;

    const len = selectedRows.length;

    return (
      <Modal
        title={`${title}历史纪录`}
        width={width}
        visible={!!(showModals && showModals.HistoryModal)}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Toolbar
          selectedCount={len}
          actions={[
            { label: '与当前对比', single: true, handler: this.diffCurrent, show: () => (value || orig) },
            { label: '对比', handler: this.diff, show: () => len === 2 }
          ]}
        >
          <div style={{ float: 'left' }}>
            {/* {<Button style={{ marginRight: 16 }} onClick={this.add}>新增</Button>} */}
          </div>
          <Toolbar.Right>
            {<Button onClick={() => this.toggleModal('FilterModal')}>过滤</Button>}
          </Toolbar.Right>
        </Toolbar>

        <ConfigTable
          rowKey={rowKey}
          rowSelect
          spacename={spaceName}
          onSeach={this.onSeach}
          initParams={initParams}
          dataSource={list}
          selectedRows={selectedRows}
          CBSelectRow={data => (onSelectRow ? onSelectRow(data) : this.onSelectRow(data))}
          columns={columns}
        />
        <FormModal
          title="历史纪录详情"
          mode="normal"
          width="85%"
          spacename={spaceName}
          dispatch={dispatch}
          list={formConfig}
          api="api/ReportRelation/addreportreldetail"
          selectedRows={selectedRows}
          visible={showModals && showModals.FormModal}
          onChange={this.handleSelectRecords}
          cancel={() => this.toggleModal('FormModal', '')}
          fetchDataLoading={fetchDataLoading.FormModal}
          confirmLoading={confirmLoading.FormModal}
        />
        <FilterModal
          spacename={spaceName}
          dispatch={dispatch}
          list={columns}
          initParams={initParams}
          visible={showModals && showModals.FilterModal}
          cancel={() => this.toggleModal('FilterModal', '')}
          confirmLoading={confirmLoading.FilterModal}
        />
        {
          visibleCodeMerge ? (
            <CodeMerge
              len={len}
              options={{
                value: len === 2 ? selectedRows[0].script : value,
                orig: len === 2 ? selectedRows[1].script : orig
              }}
              visible={visibleCodeMerge}
              cancel={this.diffCurrent}
              // onChange={onChange.bind(null, name)}
            />
          ) : null
        }
      </Modal>
    );
  }
}

export default HistoryModal;
