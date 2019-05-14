import React, { Component } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import Page from '../../../components/Page';
import Toolbar from '../../../components/Toolbar';
import Search from '../../../components/Search';
import ConfigTable from '../../../components/ConfigTable';
import FormModal from './FormModal';
import formConfig from './formConfig';

const SPACENAME = 'reportrelationdetail';

class ReportRelationDetail extends Component {
  state = {
    OptionList: [],
    keyWord: ''
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

  clearSelect = () => {
    const { onSelectRow } = this.props;
    this.setState({ selectedRowKeys: [], selectedRows: [] });
    if (onSelectRow) onSelectRow([]);
  }

  add = () => {
    const { showModals, toggleModal } = this.props;
    toggleModal(showModals, 'FormModal', 'add');
    this.fecthFormData();
  }

  edit = () => {
    const { showModals, toggleModal, selectedRows } = this.props;
    const { reportreldetailid } = selectedRows[0];
    toggleModal(showModals, 'FormModal', 'edit');
    this.fecthFormData(reportreldetailid);
  }

  del = () => {
    const { onDel, selectedRows } = this.props;
    const params = selectedRows.map(item => item.reportreldetailid);
    this.clearSelect();
    onDel(params);
  };

  componentDidMount() {
    const { onInit } = this.props;
    if (onInit) onInit();
  }

  handleSelectRecords = (selectedRows) => {
    const { onSelectRow } = this.props;
    if (onSelectRow) onSelectRow(selectedRows);
  }

  handleCancel = (model, e, params) => {
    const { showModals, toggleModal, selectedRows, onSelectRow } = this.props;

    if (selectedRows.length) {
      if (params) {
        const newSelectedRows = [{ ...selectedRows[0], ...params }];
        onSelectRow(newSelectedRows);
      }
    }

    toggleModal(showModals, model, '');
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
        reportuser: val
      }
    };
    onSeach(params);
  }

  import = () => {
    const { onImport } = this.props;
    onImport();
  }

  render() {
    const {
      list, selectedRows, initParams, onSeach,
      onSelectRow, showModals, dispatch,
      fetchDataLoading, confirmLoading, checkFunc
    } = this.props;

    const { keyWord } = this.state;

    const title = sessionStorage.getItem('reportrelationdetailtitle');
    const columns = [
      {
        title: '汇报人',
        key: 'reportuser',
        name: 'reportuser_name',
        width: 200,
        sorter: true
      },
      { title: '汇报上级', key: 'reportleader', name: 'reportleader_name', width: 300, sorter: true }
    ];

    return (
      <Page title={`汇报关系 - ${title}`}>
        <Toolbar
          selectedCount={selectedRows.length}
          actions={[
            { label: '编辑', single: true, handler: this.edit, show: checkFunc('EditDetail') },
            { label: '删除', handler: this.del, show: checkFunc('DisabledDetail') }
          ]}
        >
          <div style={{ float: 'left' }}>
            {checkFunc('AddDetail') && <Button onClick={this.add}>新增</Button>}
            {checkFunc('Import') && <Button onClick={this.import} style={{ marginLeft: 15 }}>导入</Button>}
          </div>
          {/* <Toolbar.Right>
            <Search
              placeholder="请输入汇报人"
              value={keyWord}
              onChange={this.onHandleSearchChange}
              onSearch={this.onHandleSearch}
            />
          </Toolbar.Right> */}
        </Toolbar>

        <ConfigTable
          rowKey="reportreldetailid"
          rowSelect
          spacename={SPACENAME}
          onSeach={onSeach}
          initParams={initParams}
          dataSource={list}
          CBSelectRow={data => onSelectRow(data)}
          columns={columns}
        />

        <FormModal
          title={title}
          spacename={SPACENAME}
          dispatch={dispatch}
          list={formConfig}
          fetch={{
            add: 'api/ReportRelation/addreportreldetail',
            edit: 'api/ReportRelation/updatereportreldetail'
          }}
          selectedRows={selectedRows}
          visible={showModals.FormModal}
          onChange={this.handleSelectRecords}
          cancel={() => this.handleCancel('FormModal')}
          fetchDataLoading={fetchDataLoading.FormModal}
          confirmLoading={confirmLoading.FormModal}
        />
      </Page>
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
)(ReportRelationDetail);

