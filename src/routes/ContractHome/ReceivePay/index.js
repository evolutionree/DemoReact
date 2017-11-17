
/**
 * Created by 0291 on 2017/6/19.
 */
import React from 'react';
import { connect } from 'dva';
import { Modal, Button, Form, Input, Table, message } from 'antd';
import Toolbar from '../../../components/Toolbar';
import EntcommAddModal from '../../../components/EntcommAddModal';
import EntcommEditModal from '../../../components/EntcommEditModal';
import styles from './styles.less';
const Column = Table.Column;

function ContractReceivePay({
                              modalHandleCancel,
                              modalHandleSave,
                              add,
                              handleSelectRecords,
                              edit,
                              showModals,
                              del,
                              recordId,
                              returnData,
                              total,
                              queries,
                              currItems,
                              search
                            }) {
  const columns = [{
    title: '回款类型',
    dataIndex: 'rectype',
    render:(text, record, index) => record.rectype===1?<span>计划</span>:<span>回款</span>
  }, {
    title: '计划回款日期',
    dataIndex: 'paydate',
  },{
    title: '金额（元）',
    dataIndex: 'money',
  },{
    title: '汇款人/回款状态',
    render:(text, record, index) => record.rectype===1?<span>{record.paystatus}</span>:<span>汇款人：{record.payer}</span>
  },{
    title: '备注',
    dataIndex: 'remark',
  }];
  const { pageIndex, pageSize} = queries;
  return (
    <div>
      <div className={styles.receivePayInfo}>
        <span>总额(元)：<i>{returnData.totalmoney}</i></span>
        <span>未收款(元)：<i>{returnData.unpaymentmony}</i></span>
      </div>
      <Toolbar
        selectedCount={currItems.length}
        actions={[
          { label: '删除', handler: del.bind(this, currItems), single: true },
          { label: '编辑', handler: edit.bind(this, currItems), single: true }
        ]}
      >
        <Button onClick={add.bind(this,"plan")}>新增回款计划</Button>
        <Button onClick={add.bind(this,"record")}>新增回款记录</Button>
      </Toolbar>
      <Table
        scroll={{ x: '100%' }}
        rowKey="recid"
        dataSource={returnData.pagedata}
        showSizeChanger={true}
        rowSelection={{
          selectedRowKeys: currItems.map(item => item.recid),
          onChange: (keys, items) => { handleSelectRecords(items); }
        }}
        pagination={{
          pageSize,
          total,
          current: pageIndex,
          onChange: search.bind(this, recordId),
          onShowSizeChange: search.bind(this, recordId)
        }}
        columns={columns}
      />
      <EntcommAddModal
        modalTitle={showModals==="addPlan"?"新增回款计划":"新增回款记录"}
        visible={showModals&&(showModals==="addPlan"||showModals==="addRecord")?true:false}
        entityId={showModals==="addPlan"?'0dd07d54-7449-4973-a8b4-35862a500aad':'bbec9450-922b-4383-97e9-a5ddf136a7c7'}
        cancel={modalHandleCancel}
        done={modalHandleSave.bind(this, recordId)}
        extraData={returnData.refundtype === "1" ? {"orderid":recordId,"refundtype":1} : {"contractid":recordId,"refundtype":2}}
      />
      <EntcommEditModal
        modalTitle={showModals==="editPlan"?"编辑回款计划":"编辑回款记录"}
        visible={showModals&&(showModals==="editPlan"||showModals==="editRecord")?true:false}
        entityId={showModals==="editPlan"?'0dd07d54-7449-4973-a8b4-35862a500aad':'bbec9450-922b-4383-97e9-a5ddf136a7c7'}
        recordId={currItems.length===1?currItems[0].recid:null}
        cancel={modalHandleCancel}
        done={modalHandleSave.bind(this, recordId, pageIndex, pageSize)}
      />
    </div>
  );
}

export default connect(
  state => Object.assign({}, state.receivePay, state.entcommHome),
  dispatch => {
    return {
      add(type) {
        switch (type){
          case "plan":
            dispatch({ type: 'receivePay/addPlan' });
            break;
          case "record":
            dispatch({ type: 'receivePay/addRecord' });
            break;
          default:
            message.info("type值传入有误");
        }
      },
      edit(currItems) {
        if(currItems instanceof Array && currItems.length===1){
          switch (currItems[0].rectype){
            case 1://计划
              dispatch({ type: 'receivePay/editPlan' });
              break;
            case 2://回款
              dispatch({ type: 'receivePay/editRecord' });
              break;
            default:
              message.info("rectype值判断有误");
          }
        }
      },
      del(currItems) {
        Modal.confirm({
          title: '确定要删除选定的数据吗？',
          onOk() {
            if(currItems instanceof Array && currItems.length===1){
              switch (currItems[0].rectype){
                case 1://计划
                  dispatch({ type: 'receivePay/delPlan' });
                  break;
                case 2://回款
                  dispatch({ type: 'receivePay/delRecord' });
                  break;
                default:
                  message.info("rectype值判断有误");
              }
            }
          }
        });
      },
      handleSelectRecords(records) {
        dispatch({ type: 'receivePay/currentItems', payload: records });
      },
      modalHandleSave(parentId, pageIndex, pageSize) {
        dispatch({ type: 'receivePay/search', payload:{pageIndex, pageSize, parentId} });
        dispatch({ type: 'receivePay/hideModal' });
      },
      modalHandleCancel() {
        dispatch({ type: 'receivePay/hideModal' });
      },
      search(parentId, pageIndex, pageSize) {
        dispatch({ type: 'receivePay/search', payload:{ pageIndex, pageSize, parentId } });
      }
    };
  }
)(ContractReceivePay);

