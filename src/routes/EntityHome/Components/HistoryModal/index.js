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
    }
  }

  componentDidMount() {
    this.fetchList();
  }

  componentWillReceiveProps(nextProps) {

  }

  fetchList = () => {
    const { keyname } = this.props;
    const params = {
      keyname
    };
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

  render() {
    const { onSeach, onSelectRow, showModals, dispatch, toggleModal } = this.props;

    const { selectedRows, list, initParams, confirmLoading } = this.state;

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
      <Modal
        title={`${title}历史纪录`}
        visible={!!showModals.HistoryModal}
        onOk={this.handleOk}
        onCancel={() => toggleModal(showModals, 'HistoryModal', '')}
      >
        <Toolbar
          selectedCount={selectedRows.length}
          actions={[
            { label: '编辑', single: true, handler: this.edit, show: () => true },
            { label: '删除', handler: this.del, show: () => true }
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
          rowKey="reportrelationid"
          rowSelect
          spacename={SPACENAME}
          onSeach={onSeach}
          initParams={initParams}
          dataSource={list}
          selectedRows={selectedRows}
          CBSelectRow={data => onSelectRow(data)}
          columns={columns}
        />

        <FilterModal
          spacename={SPACENAME}
          dispatch={dispatch}
          list={formConfig.map(item => ({ ...item, key: item.fieldname, title: item.label }))}
          initParams={initParams}
          visible={showModals.FilterModal}
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

