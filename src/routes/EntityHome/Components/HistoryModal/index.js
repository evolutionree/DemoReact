import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Modal, Button } from 'antd';
import Toolbar from '../../../../components/Toolbar';
import ConfigTable from '../../../../components/ConfigTable';
// import FormModal from './FormModal';
import FilterModal from '../FilterModal';
import formConfig from './formConfig';

const SPACENAME = 'entityScripts';

class HistoryModal extends Component {
  state = {
    OptionList: [],
    list: [],
    selectedRows: [],
    initParams: {
      pageIndex: 1,
      pageSize: 10000,
      searchOrder: '',
      columnFilter: null //字段查询
    },
    confirmLoading: {
      FilterModal: false
    },
    columns: [
      { title: '变更流水号', key: '1', width: 140, sorter: true },
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
    const { dispatch } = this.props;
    const { OptionList } = this.state;
    const fields = {};
    OptionList.forEach(item => (fields[item.fieldname] = ''));
    new Promise((resolve) => {
      dispatch({ type: `${SPACENAME}/FecthAllFormData`, payload: { recid, fields, resolve } });
    }).then(res => {
      // callback behavior
    });
  }

  add = () => {
    const { showModals, toggleModal } = this.props;
    toggleModal(showModals, 'FormModal', 'add');
    this.fecthFormData();
  }

  edit = () => {
    const { showModals, toggleModal, selectedRows } = this.props;
    const { reportrelationid } = selectedRows[0];
    toggleModal(showModals, 'FormModal', 'edit');
    this.fecthFormData(reportrelationid);
  }

  del = () => {
    const { onDel, selectedRows } = this.props;
    const params = selectedRows.map(item => item.reportrelationid);
    this.clearSelect();
    onDel(params);
  };

  handleSelectRecords = () => {

  }

  onHandleSearchChange = val => {
    this.setState({ keyWord: val });
  }

  onHandleSearch = val => {
    const { onSeach, initParams } = this.props;
    const params = {
      ...initParams,
      columnFilter: {
        ...initParams.columnFilter,
        reportrelationname: val
      }
    };
    onSeach(params);
  }

  jump = (text, record) => {
    const { dispatch } = this.props;
    dispatch(routerRedux.push({ pathname: `/${SPACENAME}detail/${record.reportrelationid}` }));
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
    const { toggleModal, showModals } = this.props;
    if (toggleModal) toggleModal(showModals, 'HistoryModal', '');
    this.clearSelect();
  }

  render() {
    const { width = 550, onSeach, onSelectRow, showModals, dispatch, toggleModal, rowKey = 'recid' } = this.props;

    const { selectedRows, list, initParams, columns, confirmLoading } = this.state;

    const title = '汇报关系';

    return (
      <Modal
        title={`${title}历史纪录`}
        width={width}
        visible={!!(showModals && showModals.HistoryModal)}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Toolbar
          selectedCount={selectedRows.length}
          actions={[
            { label: '与当前对比', single: true, handler: this.diffCurrent, show: () => true },
            { label: '对比', handler: this.diff, show: () => selectedRows.length === 2 }
          ]}
        >
          <div style={{ float: 'left' }}>
            {<Button style={{ marginRight: 16 }} onClick={this.add}>新增</Button>}
          </div>
          <Toolbar.Right>
            {<Button onClick={() => toggleModal(showModals, 'FilterModal')}>过滤</Button>}
          </Toolbar.Right>
        </Toolbar>

        <ConfigTable
          rowKey={rowKey}
          rowSelect
          spacename={SPACENAME}
          onSeach={onSeach}
          initParams={initParams}
          dataSource={list}
          selectedRows={selectedRows}
          CBSelectRow={data => (onSelectRow ? onSelectRow(data) : this.onSelectRow(data))}
          columns={columns}
        />

        <FilterModal
          spacename={SPACENAME}
          dispatch={dispatch}
          list={columns}
          initParams={initParams}
          visible={showModals && showModals.FilterModal}
          cancel={() => toggleModal(showModals, 'FilterModal', '')}
          confirmLoading={confirmLoading.FilterModal}
        />
      </Modal>
    );
  }
}

export default connect(
  state => state[SPACENAME],
  dispatch => ({
    onInit() {
      dispatch({ type: `${SPACENAME}/Init` });
    },
    toggleModal(showModals, modal, action) {
      dispatch({ type: `${SPACENAME}/showModals`, payload: { ...showModals, [modal]: (action === undefined ? modal : action) } });
    },
    onDel(params) {
      dispatch({ type: `${SPACENAME}/Del`, payload: params });
    },
    onSeach(params) {
      dispatch({ type: `${SPACENAME}/Search`, payload: params });
    },
    dispatch
  })
)(HistoryModal);

