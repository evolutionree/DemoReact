import React, { Component } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import Page from '../../../components/Page';
import Toolbar from '../../../components/Toolbar';
import CodeMerge from '../../../components/CodeMerge';
import ConfigTable from '../../../components/ConfigTable';
import FilterModal from '../../../components/Modal/FilterModal';
import FormModal from '../../../components/Modal/HistoryModal/FormModal';
import formConfig from './formConfig';
import { dynamicRequest } from '../../../services/common';

const SPACENAME = 'historyscript';

class Historyscript extends Component {
  state = {
    OptionList: [],
    selectedRows: [],
    detailData: [],
    confirmLoading: {
      FilterModal: false
    },
    fetchDataLoading: {
      FormModal: false
    },
    visibleCodeMerge: false,
    columns: [
      { title: '变更流水号', key: 'reccode', width: 140, sorter: true, render: (text, record) => <a href="javascript:;" onClick={() => this.showDetail(record)}>{text || '(空)'}</a> },
      { title: '变更人', key: 'username', width: 120, sorter: true },
      { title: '变更日期', key: 'commitdate', width: 150, sorter: true },
      { title: '变更长度前后对比', key: 'lenoldcode', width: 170, sorter: true, render: (text, record) => (`${text} : ${record.lennewcode}`) },
      { title: '备注人', key: 'commitusername', width: 120, sorter: true },
      { title: '备注时间', key: 'commitremarkdate', width: 150, sorter: true },
      { title: '变更备注', key: 'commitremark', width: 150, sorter: true }
    ]
  }

  componentDidMount() {
    this.fetchList(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { selectedRows } = nextProps;
    if (selectedRows) this.setState({ selectedRows });
  }

  fetchList = (props) => {
    const { dispatch, spaceName, initParams } = props;

    const params = {
      ...initParams
    };

    dispatch({ type: `${spaceName}/Search`, payload: params });
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
    const { detailapi } = this.props;
    const { fetchDataLoading } = this.state;

    this.setState({ detailData: [], fetchDataLoading: { ...fetchDataLoading, FormModal: true } });
    this.toggleModal('FormModal');
    dynamicRequest(detailapi, { id: record.id }).then(res => {
      const { data } = res;
      this.setState({ 
        detailData: Array.isArray(data) ? data : [],
        fetchDataLoading: { ...fetchDataLoading, FormModal: false }
      });
    }).catch(e => console.error(e.message));
  }

  render() {
    const { 
      width = 550, initParams, onSelectRow, spaceName,
      title, value, orig, list,
      showModals, dispatch, rowKey = 'recid'
    } = this.props;

    const { detailData, selectedRows, columns, confirmLoading, fetchDataLoading, visibleCodeMerge } = this.state;

    const len = selectedRows.length;

    return (
      <Page title="脚本历史纪录">
        <Toolbar
          selectedCount={len}
          actions={[
            { label: '与当前对比', single: true, handler: this.diffCurrent, show: () => (value || orig) },
            { label: '对比', handler: this.diffCurrent, show: () => (len === 2 && (selectedRows[0].newcode || selectedRows[1].newcode)) }
          ]}
        >
          <Toolbar.Right>
            {<Button onClick={() => this.toggleModal('FilterModal')}>过滤</Button>}
          </Toolbar.Right>
        </Toolbar>

        <ConfigTable
          pwidth={width}
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
          title={`${title}详情`}
          mode="normal"
          width="85%"
          spacename={spaceName}
          dispatch={dispatch}
          list={formConfig}
          api="api/ReportRelation/addreportreldetail"
          selectedRows={detailData}
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
                value: len === 2 ? selectedRows[0].newcode : value,
                orig: len === 2 ? selectedRows[1].newcode : orig
              }}
              visible={visibleCodeMerge}
              cancel={this.diffCurrent}
              // onChange={onChange.bind(null, name)}
            />
          ) : null
        }
      </Page>
    );
  }
}

export default connect(
  state => state[SPACENAME],
  dispatch => ({
    onInit(params) {
      dispatch({ type: `${SPACENAME}/Init`, payload: params });
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
    onSelectRow(selectedRows) {
      dispatch({ type: `${SPACENAME}/putState`, payload: { selectedRows } });
    },
    onImport() {
      dispatch({
        type: 'task/impModals',
        payload: { templateType: 1, templateKey: '' }
      });
    },
    dispatch
  })
)(Historyscript);

