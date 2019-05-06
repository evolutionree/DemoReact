import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Button, Modal } from 'antd';
import Toolbar from '../../../components/Toolbar';
import Search from '../../../components/Search';
import ConfigTable from '../../../components/ConfigTable';
import FormModal from './FormModal';
import styles from '../index.less';

const SPACENAME = 'reportrelation';

class ReportRelationMain extends Component {
  state = {
    OptionList: []
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

  componentDidMount() {
    const { onInit } = this.props;
    if (onInit) onInit();
  }

  handleSelectRecords = () => {

  }

  handleSave = () => {
    
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


  render() {
    const {
      list,
      selectedRows,
      initParams,
      onSeach,
      onSelectRow,
      showModals,
      fetchDataLoading,
      confirmLoading
    } = this.props;

    return (
      <div>
        <Toolbar
          selectedCount={selectedRows.length}
          actions={[
            { label: '编辑', single: true, handler: () => { }, show: () => true },
            { label: '删除', handler: () => { } }
          ]}
        >
          <div style={{ float: 'left' }}>
            <Button onClick={this.add}>新增</Button>
          </div>
          <Toolbar.Right>
            <Search />
          </Toolbar.Right>
        </Toolbar>

        {/* <ConfigTable
          rowKey="recid"
          rowSelect
          spacename={SPACENAME}
          onSeach={onSeach}
          initParams={initParams}
          dataSource={list}
          CBSelectRow={data => onSelectRow(data)}
          columns={[
            { title: '汇报关系名称', key: 'name', render: (text, record) => <Link to={`/${SPACENAME}/detail/${record.recid}`}>{text}</Link> },
            { title: '描述', key: 'recid' }
          ]}
        /> */}

        <FormModal
          selectedRows={selectedRows}
          visible={showModals.FormModal}
          onChange={this.handleSelectRecords}
          onOk={this.handleSave}
          cancel={() => this.handleCancel('FormModal')}
          fetchDataLoading={fetchDataLoading.FormModal}
          confirmLoading={confirmLoading.FormModal}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
    ...state[SPACENAME],
    SPACENAME: SPACENAME
  }),
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

