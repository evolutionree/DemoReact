import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button } from 'antd';
import Page from '../../../components/Page';
import Toolbar from '../../../components/Toolbar';
import Search from '../../../components/Search';
import ConfigTable from '../../../components/ConfigTable';
import FormModal from './FormModal';

const SPACENAME = 'reportrelation';

class ReportRelationMain extends Component {
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

  componentDidMount() {
    const { onInit } = this.props;
    if (onInit) onInit();
  }

  handleSelectRecords = () => {

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

  render() {
    const {
      list, selectedRows, initParams, onSeach,
      onSelectRow, showModals, dispatch,
      fetchDataLoading, confirmLoading, checkFunc
    } = this.props;

    const { keyWord } = this.state;
    const title = '汇报关系';
    const columns = [
      {
        title: '汇报关系名称',
        key: 'reportrelationname',
        width: 200,
        render: (text, record) => <a href="javascript:;" onClick={this.jump.bind(this, text, record)}>{text}</a>,
        sorter: true
      },
      { title: '描述', key: 'reportremark', width: 300, sorter: true }
    ];

    return (
      <Page title={title}>
        <Toolbar
          selectedCount={selectedRows.length}
          actions={[
            { label: '编辑', single: true, handler: this.edit, show: checkFunc('Edit') },
            { label: '删除', handler: this.del, show: checkFunc('Disabled') }
          ]}
        >
          <div style={{ float: 'left' }}>
            {checkFunc('Add') && <Button onClick={this.add}>新增</Button>}
          </div>
          {/* <Toolbar.Right>
            <Search
              placeholder="请输入汇报关系名称"
              value={keyWord}
              onChange={this.onHandleSearchChange}
              onSearch={this.onHandleSearch}
            />
          </Toolbar.Right> */}
        </Toolbar>

        <ConfigTable
          rowKey="reportrelationid"
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
          fetch={{
            add: 'api/ReportRelation/addreportrelation',
            edit: 'api/ReportRelation/updatereportrelation'
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
    dispatch
  })
)(ReportRelationMain);

