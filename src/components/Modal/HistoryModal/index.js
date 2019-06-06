import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { Modal, Button, Spin } from 'antd';
import * as _ from 'lodash';
import Toolbar from '../../Toolbar';
import ConfigTable from '../../ConfigTable';
import CodeMerge from '../../CodeMerge';
import FormModal from './FormModal';
import FilterModal from '../FilterModal';
import formConfig from './formConfig';
import { dynamicRequest } from '../../../services/common';

const _info = {
  EntityAddNew: 'EntityAddNew',
  EntityEdit: 'EntityEdit',
  EntityView: 'EntityView',
  EntityCopyNew: 'EntityCopyNew',
  EntityFieldChange: 'EntityFieldChange',
  EntityFieldFilter: 'EntityFieldFilter'
};

class HistoryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      OptionList: [],
      selectedRows: [],
      detailData: [],
      value: props.value,
      confirmLoading: {
        FilterModal: false
      },
      fetchDataLoading: {
        FormModal: false
      },
      visibleCodeMerge: false,
      columns: [
        {
          title: '变更流水号', key: 'reccode', width: 140, filterType: 1, sorter: true,
          render: (text, record) => <a href="javascript:;" onClick={() => this.showDetail(record)}>{text || '(空)'}</a> 
        },
        { title: '变更人', key: 'username', width: 120, filterType: 1, sorter: true },
        { title: '变更日期', key: 'commitdate', width: 150, filterType: 8, sorter: true },
        { title: '变更前后长度对比', key: 'lenoldcode', width: 170, filterType: 6, render: (text, record) => (`${text} : ${record.lennewcode}`) },
        { title: '备注人', key: 'commitusername', width: 120, filterType: 1, sorter: true },
        { title: '备注日期', key: 'commitremarkdate', width: 150, filterType: 8, sorter: true },
        { title: '变更备注', key: 'commitremark', width: 150, filterType: 1, sorter: true }
      ]
    };
  }
 

  componentDidMount() {
    this.fetchList(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { selectedRows: oldRows, keyname: oldname, value: oldValue } = this.props;
    const { selectedRows: newRows, keyname: newname, value: newValue } = nextProps;

    if (newname && (oldname !== newname)) this.fetchList(nextProps);
    if (oldRows !== newRows) this.setState({ selectedRows: newRows });
    if (oldValue !== newValue) this.setState({ value: newValue });
  }

  fetchList = (props) => {
    const { dispatch, spaceName, keyname, initParams, recid } = props;

    const params = {
      ...initParams,
      codetype: _info[keyname] || '',
      recid
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
    const { initParams } = this.props;
    this.toggleModal('HistoryModal', '');
    this.clearSelect();
    const params = { ...initParams, columnFilter: null, searchOrder: '' };
    this.onSeach(params);
  }
  
  diffCurrent = () => {
    const { visibleCodeMerge } = this.state;
    this.setState({ visibleCodeMerge: !visibleCodeMerge });
  }

  handleValue = (value, change) => {
    this.setState({ value: value });
  }

  changeCodeMergeValue = () => {
    const { onChange } = this.props;
    const { value } = this.state;

    if (onChange) onChange(value);
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
      title, historyList, listLoading, keyname,
      showModals, dispatch, rowKey = 'recid'
    } = this.props;

    const {
      detailData, selectedRows, columns, confirmLoading, fetchDataLoading, visibleCodeMerge, value
    } = this.state;

    const len = selectedRows.length;
    const flag = [
      len === 2 ? `${selectedRows[0].username} 于 ${selectedRows[0].commitdate} 修改为：` : '',
      len === 2 ? `${selectedRows[1].username} 于 ${selectedRows[1].commitdate} 修改为：` : ''
    ];
    const list = Array.isArray(historyList) ? historyList.filter(item => item.codetype === _info[keyname]) : [];

    return (
      <Modal
        title={`[${title}] 历史纪录`}
        width={width}
        visible={!!(showModals && showModals.HistoryModal)}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Toolbar
          selectedCount={len}
          actions={[
            { label: '与当前对比', single: true, handler: this.diffCurrent, show: () => value },
            { label: '对比', handler: this.diffCurrent, show: () => (len === 2 && (selectedRows[0].newcode || selectedRows[1].newcode)) }
          ]}
        >
          <div style={{ float: 'left' }}>
            {/* {<Button style={{ marginRight: 16 }} onClick={this.add}>新增</Button>} */}
          </div>
          {/* <Toolbar.Right>
            {<Button onClick={() => this.toggleModal('FilterModal')}>过滤</Button>}
          </Toolbar.Right> */}
        </Toolbar>
        <Spin spinning={listLoading}>
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
        </Spin>
        <FormModal
          title={`${title}详情`}
          mode="normal"
          width="95%"
          spacename={spaceName}
          dispatch={dispatch}
          list={formConfig}
          api="api/entitypro/updateglobaljshistoryremark"
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
              width="100%"
              len={len}
              options={{
                value: len === 2 ? selectedRows[0].newcode : value,
                origRight: len === 2 ? selectedRows[1].newcode : selectedRows[0].newcode
              }}
              flag={flag}
              visible={visibleCodeMerge}
              onOk={this.changeCodeMergeValue}
              cancel={this.diffCurrent}
              onChange={this.handleValue}
            />
          ) : null
        }
      </Modal>
    );
  }
}

export default HistoryModal;
