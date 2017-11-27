import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import * as _ from 'lodash';
import { Radio, Input, Button, Icon, message, Checkbox, Table } from 'antd';
import Page from '../../components/Page';
import { DynamicFormEdit, DynamicFormAdd, DynamicFormView } from '../../components/DynamicForm';
import WorkflowCaseModal from '../../components/WorkflowCaseModal';
import styles from './styles.less';

const Column = Table.Column;

const operates = [
  { label: '同意', key: 'allow', id: 1 },
  { label: '拒绝', key: 'reject', id: 0 },
  { label: '退回', key: 'reback', id: 2 },
  { label: '中止', key: 'terminate', id: 3 }
];

class AffairDetail extends Component {
  state = {
    suggest: '',
    operate: undefined
  };
  columnConfigFormInstance = {};
  validateColumnConfigForms = () => {
    const { columnConfigFormProtocols } = this.props;
    const formArray = _.map(columnConfigFormProtocols, (val, key) => ({ entityId: key, protocols: val }));
    let result = true;
    validateNext();
    return result;

    function validateNext() {
      const item = formArray[0];
      if (!item) return;

      const formInstance = this.columnConfigFormInstance[item.entityId];
      formArray.shift();
      formInstance.validateFields((err, values) => {
        if (err) result = false;
        validateNext();
      });
    }
  };
  onNextClick = () => {
    // 0拒绝 1通过 2退回 3中止';
    if (this.props.selectedOperate === undefined) {
      return message.error('请选择操作');
    }
    if (!this.validateColumnConfigForms()) return message.error('请检查表单');
    this.props.submitAuditCase();
  };
  getCaseData = () => {
    const { columnConfigForms, columnConfigFormProtocols } = this.props;
    const formArray = _.map(columnConfigFormProtocols, (val, key) => ({ entityId: key, protocols: val }));
    const data = formArray.map(item => {
      const { entityId } = item;
      const submitFields = columnConfigFormProtocols[entityId].map(item => item.fieldname);
      const fieldsValue = _.pick(columnConfigForms[entityId], submitFields);
      return {
        entityid: entityId,
        fields: fieldsValue
      };
    });
    return { data };
  };
  render() {
    const {
      currentUser,
      entityId,
      caseId,
      showModals,
      flowDetail,
      flowItemList,
      flowOperates,
      entityDetail,
      entityDetailProtocol,
      entityEditProtocol,
      relentityDetail,
      relentityDetailProtocol,
      editing,
      editData,
      startEdit,
      cancelEdit,
      saveEdit,
      onEditDataChange,
      editFormRef,
      onCaseModalCancel,
      onCaseModalDone,
      showFlowCaseModal,
      columnConfigForms,
      columnConfigFormProtocols,
      putState,
      suggest,
      selectedOperate
    } = this.props;

    // 判断是不是用户没选择下一步审批人
    // const shouldSelectNextAuditUser = (flowDetail.nodenum !== undefined && (flowDetail.nodenum !== -1)
    //   && (flowDetail.recupdator === currentUser.userid) && !flowDetail.handleusers)
    //   || (flowDetail.nodenum === 0 && flowDetail.auditstatus === 3 && currentUser.userid === (+flowDetail.handleusers));

    // 判断当前流程是否为退回到发起人
    const isFlowBack = flowOperates.terminate === 1 && flowOperates.edit === 1;

    const columnConfigFormsArray = _.map(columnConfigFormProtocols, (val, key) => ({ entityId: key, protocols: val }));

    return (
      <Page title="审批详情" showGoBack goBackPath="/affair-list">
        <div className={styles.title}>
          <span>{`${flowDetail.flowname}【${flowDetail.reccode}】`}</span>
          {/*{shouldSelectNextAuditUser &&*/}
            {/*<a*/}
              {/*href="javascript:;"*/}
              {/*onClick={showFlowCaseModal}*/}
              {/*style={{*/}
                {/*color: 'red',*/}
                {/*fontWeight: 'normal',*/}
                {/*fontSize: '14px',*/}
                {/*textDecoration: 'underline'*/}
              {/*}}*/}
            {/*>未选择审批人</a>}*/}
        </div>
        <div className={styles.metas}>
          <span>申请人：</span>
          <span>{flowDetail.reccreator_name}</span>
          <span>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span>
          <span>提交时间：</span>
          <span>{flowDetail.reccreated}</span>
        </div>

        {operates.some(op => !!flowOperates[op.key]) && (
          <div>
            <div className={styles.operats}>
              <Radio.Group value={selectedOperate} onChange={e => putState({ selectedOperate: e.target.value })}>
                {isFlowBack && <Radio value={4}>重新发起</Radio>}
                {operates.map(op => (
                  !!flowOperates[op.key] && (
                    <Radio key={op.key} value={op.id} style={{ display: 'block' }}>{op.label}</Radio>
                  )
                ))}
              </Radio.Group>
            </div>

            {/*columnconfig 审批可改字段*/}
            <div style={{ width: '600px' }}>
              {columnConfigFormsArray.map(item => (
                <DynamicFormAdd
                  horizontal
                  key={item.entityId}
                  entityTypeId={item.entityId}
                  fields={item.protocols}
                  value={columnConfigForms[item.entityId] || {}}
                  onChange={value => putState({ columnConfigForms: { ...columnConfigForms, [item.entityId]: value } })}
                  ref={inst => this.columnConfigFormInstance[item.entityId] = inst}
                />
              ))}
            </div>

            <div className={styles.comment}>
              <div className={styles.commentinput}>
                <Input.TextArea
                  value={suggest}
                  onChange={e => putState({ suggest: e.target.value })}
                  placeholder="请输入审批意见"
                />
              </div>
              <div className={styles.commentfooter}>
                <Button onClick={this.onNextClick}>下一步</Button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.section}>
          <div className={styles.sectitle}>
            <span>申请内容</span>
            {(!!flowOperates.edit && !editing) && <a href="javascript:;" onClick={startEdit}>
              <Icon type="edit" /> 编辑
            </a>}
            {editing && <a href="javascript:;" onClick={cancelEdit}>
              <Icon type="close" /> 取消
            </a>}
            {editing && <a href="javascript:;" onClick={saveEdit}>
              <Icon type="check" /> 保存
            </a>}
          </div>
          <div className={styles.auditform}>
            <div>
              {editing ? (
                <DynamicFormEdit
                  entityTypeId={entityDetail.rectype || flowDetail.entityid}
                  fields={entityEditProtocol}
                  value={editData}
                  onChange={onEditDataChange}
                  ref={editFormRef}
                />
              ) : (
                <DynamicFormView
                  entityTypeId={entityDetail.rectype || flowDetail.entityid}
                  fields={entityDetailProtocol}
                  value={entityDetail}
                />
              )}
            </div>
          </div>
        </div>

        {!!relentityDetailProtocol.length && <div className={styles.section}>
          <div className={styles.sectitle}>
            <span>相关信息</span>
          </div>
          <div className={styles.auditform}>
            <DynamicFormView
              entityTypeId={relentityDetail && relentityDetail.rectype}
              fields={relentityDetailProtocol}
              value={relentityDetail}
            />
          </div>
        </div>}

        <div className={styles.section}>
          <div className={styles.sectitle}>
            <span>审批状态</span>
          </div>
          <Table
            rowKey="entityid"
            dataSource={flowItemList}
            pagination={false}
          >
            <Column title="审批人" key="username" dataIndex="username" />
            <Column title="节点名称" key="nodename" dataIndex="nodename" />
            <Column title="处理状态" key="casestatus" dataIndex="casestatus" />
            <Column title="处理时间" key="recupdated" dataIndex="recupdated" />
            <Column title="意见" key="suggest" dataIndex="suggest" />
          </Table>
        </div>
        <WorkflowCaseModal
          visible={/workflowCase/.test(showModals)}
          caseId={caseId}
          onCancel={onCaseModalCancel}
          onDone={onCaseModalDone}
          suggest={suggest}
          choiceStatus={selectedOperate}
          caseData={/workflowCase/.test(showModals) ? this.getCaseData() : {}}
        />
      </Page>
    );
  }
}

export default connect(
  state => {
    return {
      ...state.affairDetail,
      currentUser: state.app.user
    };
  },
  dispatch => {
    return {
      putState(payload) {
        dispatch({ type: 'affairDetail/putState', payload });
      },
      startEdit() {
        dispatch({ type: 'affairDetail/startEdit' });
      },
      cancelEdit() {
        dispatch({ type: 'affairDetail/cancelEdit' });
      },
      saveEdit() {
        dispatch({ type: 'affairDetail/saveEdit' });
      },
      onEditDataChange(editData) {
        dispatch({ type: 'affairDetail/putState', payload: { editData } });
      },
      editFormRef(editForm) {
        dispatch({ type: 'affairDetail/putState', payload: { editForm } });
      },
      submitAuditCase() {
        dispatch({ type: 'affairDetail/submitAuditCase' });
      },
      onCaseModalCancel() {
        dispatch({ type: 'affairDetail/onCaseModalCancel' });
      },
      onCaseModalDone() {
        dispatch({ type: 'affairDetail/onCaseModalDone' });
      },
      showFlowCaseModal() {
        dispatch({ type: 'affairDetail/showModals', payload: 'workflowCase' });
      }
    };
  }
)(AffairDetail);
