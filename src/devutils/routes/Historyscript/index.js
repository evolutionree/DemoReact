import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, message, Spin } from 'antd';
import { dynamicRequest } from '../../../services/common';
import Page from '../../../components/Page';
import Toolbar from '../../../components/Toolbar';
import CodeMerge from '../../../components/CodeMerge';
import ConfigTable from '../../../components/ConfigTable';
import FilterModal from '../../../components/Modal/FilterModal';
import FormModal from './FormModal';
import formConfig from './formConfig';

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
    columns: [
      { title: '变更流水号', key: 'reccode', width: 130, filterType: 1, sorter: true, render: (text, record) => <a href="javascript:;" onClick={() => this.showDetail(record)}>{text || '(空)'}</a> },
      { title: '函数名称', key: 'funcname', width: 250, filterType: 1, sorter: true, render: text => (text.replace(/^public\./,'')) },
      { title: '函数参数', key: 'paramsname', width: 150, filterType: 1, sorter: true },
      { title: '类型', key: 'objtype', width: 98, filterType: 1, sorter: true },
      { title: '操作类型', key: 'changetype', width: 113, filterType: 1, sorter: true },
      { title: '用户', key: 'marker', width: 98, filterType: 1, sorter: true },
      { title: '变更日期', key: 'marktime', width: 150, filterType: 8, sorter: true },
      { title: '变更前后长度对比', key: 'oldsql', width: 170, filterType: 6, render: (text, record) => (`${text.length} : ${record.newsql.length}`) },
      { title: '变更备注', key: 'remark', width: 150, filterType: 1, sorter: true }
    ]
  }

  componentDidMount() {
    const { onInit, initParams } = this.props;
    onInit(initParams);
  }

  componentWillReceiveProps(nextProps) {
    const { selectedRows: oldRows } = this.props;
    const { selectedRows: newRows } = nextProps;

    if (Array.isArray(newRows) && (oldRows !== newRows)) this.setState({ selectedRows: newRows });
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
    const { selectedRows } = this.state;
    const { reportrelationid } = selectedRows[0];
    this.toggleModal('FormModal', 'edit');
    this.fecthFormData(reportrelationid);
  }

  del = () => {
    const { dispatch, spaceName } = this.props;
    const { selectedRows } = this.state;
    const params = selectedRows.map(item => item.reportrelationid);
    this.clearSelect();
    dispatch({ type: `${spaceName}/Del`, payload: params });
  };

  handleSelectRecords = () => {

  }

  onHandleSearchChange = val => {
    this.setState({ keyWord: val });
  }

  onSeach = (params) => {
    const { dispatch, spaceName } = this.props;
    dispatch({ type: `${spaceName}/Search`, payload: params });
  }

  onSelectRow = (selectedRows) => this.setState({ selectedRows });

  clearSelect = () => {
    const { onSelectRow } = this.props;
    if (onSelectRow) {
      onSelectRow([]);
      return;
    }
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

  showDetail = (record) => {
    const { fetchDataLoading } = this.state;

    this.setState({ detailData: [], fetchDataLoading: { ...fetchDataLoading, FormModal: true } });
    this.toggleModal('FormModal');
    dynamicRequest('api/entitypro/getpgcodedetail', { id: record.recid }).then(res => {
      const { data } = res;
      this.setState({
        detailData: Array.isArray(data) ? data : [],
        fetchDataLoading: { ...fetchDataLoading, FormModal: false }
      });
    }).catch(e => {
      console.error(e.message);
      message.error(e.message);
    });
  }

  render() {
    const { 
      width = 550, initParams, onSelectRow, spaceName,
      value = '', list, showModals, dispatch
    } = this.props;

    const { selectedRows, detailData, columns, confirmLoading, fetchDataLoading } = this.state;

    const len = selectedRows.length;
    const flag = [
      len === 2 && selectedRows[0].marker && selectedRows[0].marktime ? `${selectedRows[0].marker} 于 ${selectedRows[0].marktime} 修改为：` : '',
      len === 2 && selectedRows[1].marker && selectedRows[1].marktime ? `${selectedRows[1].marker} 于 ${selectedRows[1].marktime} 修改为：` : ''
    ];

    return (
      <Page title="脚本历史纪录">
        <Toolbar
          selectedCount={len}
          actions={[
            { label: '与当前对比', single: true, handler: () => this.toggleModal('CodeMerge'), show: () => value },
            { label: '对比', handler: () => this.toggleModal('CodeMerge'), show: () => (len === 2 && (selectedRows[0].newsql || selectedRows[1].newsql)) }
          ]}
        >
          {/* <Toolbar.Right>
            {<Button onClick={() => this.toggleModal('FilterModal')}>过滤</Button>}
          </Toolbar.Right> */}
        </Toolbar>
        <ConfigTable
          rowKey="recid"
          pwidth={width}
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
          api="api/entitypro/updategghistorylogremark"
          selectedRows={detailData}
          visible={showModals.FormModal}
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
          showModals.CodeMerge ? (
            <CodeMerge
              width="100%"
              len={len}
              options={{
                value: len === 2 ? selectedRows[0].newsql : value,
                origRight: len === 2 ? selectedRows[1].newsql : selectedRows[0].newsql,
                readOnly: 'nocursor',
                revertButtons: false
              }}
              flag={flag}
              visible={showModals.CodeMerge}
              cancel={() => this.toggleModal('CodeMerge', '')}
            />
          ) : null
        }
      </Page>
    );
  }
}

export default connect(
  state => ({ ...state[SPACENAME], spaceName: SPACENAME }),
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
    dispatch
  })
)(Historyscript);

