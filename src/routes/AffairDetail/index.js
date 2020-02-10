import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import { Radio, Input, Button, Collapse, message, Table, Modal } from 'antd';
import Page from '../../components/Page';
import { dynamicRequest } from '../../services/common';
import { DynamicFormEdit, DynamicFormAdd, DynamicFormView } from '../../components/DynamicForm';
import WorkflowCaseModal from '../../components/WorkflowCaseModal';
import ImgCardList from '../../components/ImgCardList';
import Attachment from '../../components/DynamicForm/controls/Attachment';
import WorkflowCaseForm from '../../components/WorkflowCaseModal/WorkflowCaseForm';
import PdfViewer from '../../components/PdfViewer';
import IsneedtorepeatapproveModal from '../EntcommHome/views/EntcommActivities/IsneedtorepeatapproveModal';
import FlowChartViewer from '../../components/FlowChartViewer';
import styles from './styles.less';

const { Panel } = Collapse;

// 已用 [-1 到 8]
const operates = [
  { label: '同意', key: 'allow', id: 1 },
  { label: '驳回', key: 'reback', id: 2 },
  { label: '中止', key: 'terminate', id: 3 },
  { label: '重新发起', key: 'lunch', id: 4 }, // 简单实体退回才后有 中止、重新发起状态
  { label: '废弃', key: 'reject', id: 0 }
];

const configSelect = [
  { label: '无意见', id: -1 },
  { label: '有意见', id: 7 },
  { label: '同意', id: 1 },
  { label: '驳回', id: 2 },
  { label: '中止', id: 3 },
  { label: '重新发起', id: 4 },
  { label: '废弃', id: 0 },
  { label: '转办', id: 5 },
  { label: '加签', id: 6 },
  { label: '沟通加签', id: 8 }
];

export const columns = [
  {
    title: '节点名称',
    dataIndex: 'nodename',
    render: (text, record) => {
      const obj = {
        children: text,
        props: { rowSpan: (record.rowSpan === 0 || record.rowSpan) ? record.rowSpan : 1 }
      };
      return obj;
    }
  },
  { title: '审批人', dataIndex: 'username' },
  { title: '处理状态', dataIndex: 'casestatus' },
  { title: '处理时间', dataIndex: 'recupdated' },
  {
    title: '意见', dataIndex: 'suggest',
    render: text => {
      if (!text) return '';
      text += '';
      text = text.split('\n').reduce((result, line) => {
        return [
          ...result,
          line,
          <br />
        ];
      }, []);
      text.pop();
      return <div>{text}</div>;
    }
  },
  {
    title: '附件',
    dataIndex: 'files',
    render: (text) => {
      const fileids = Array.isArray(text) ? text : [];
      return <Attachment.View value={JSON.stringify(fileids)} />;
    }
  }
];

// 先做的这块，懒得改了
export function comboTableRow(data) {
  if (!(Array.isArray(data) && data.length)) return [];
  const list = JSON.parse(JSON.stringify(data));
  const _list = [];

  for (const k in list) {
    const findIdx = _list.findIndex((arr => arr[0] === list[k].count));
    if (findIdx !== -1) {
      _list[findIdx][2] += 1;
      list[_list[findIdx][1]].rowSpan = _list[findIdx][2];
      list[k].rowSpan = 0;
    } else {
      _list.push([list[k].count, k, 1]);
    }
  }

  return list;
}

class AffairDetail extends Component {
  state = {
    operate: undefined,
    files: [],
    showViewer: false,
    currentFileId: '',
    currentFilename: '',
    // editData: {},
    isneedtorepeatapproveVisible: false,
    selectLunchModalVisible: false,
    selectLunchValue: 1,
    upLoading: false
  };
  columnConfigFormInstance = {};
  workflowCaseFormRef = null;
  editFormRef = null

  componentDidMount() {
    const { startEdit } = this.props;
    startEdit();
  }

  componentWillReceiveProps(nextProps) {
    const { flowOperates, startEdit } = nextProps;

    const edit = flowOperates.edit;
    if (this.props.selectedOperate !== 4 && nextProps.selectedOperate === 4) startEdit();
    if (this.props.selectedOperate !== 1 && nextProps.selectedOperate === 1 && edit === 1) startEdit();
  }

  validateColumnConfigForms = async () => {
    const validateNext = async () => { //并行执行
      const item = formArray[0];
      if (!item) return;

      const formInstance = this.columnConfigFormInstance[item.entityId];
      formArray.shift();
      async function syncValidate() {
        return await new Promise(resolve => {
          formInstance.validateFields((err, values) => {
            if (err) {
              result = false;
              resolve();
            } else {
              resolve();
              validateNext();
            }
          });
        });
      }
      await syncValidate();
    };

    const { columnConfigFormProtocols, selectedOperate } = this.props;
    if (![1, 4].includes(selectedOperate)) return true;
    const formArray = _.map(columnConfigFormProtocols, (val, key) => ({ entityId: key, protocols: val }));
    let result = true;
    await validateNext();
    return result;
  };

  validateWorkflowCaseForm = () => {
    let result = true;
    const node = this.props.selectedNextNode;
    if (!node) {
      result = false;
    } else if (this.shouldShowUserForm()) {
      this.workflowCaseFormRef.validateFields(err => err && (result = false));
    }
    return result;
  };

  getWorkflowCaseFormValue = () => {
    if (this.shouldShowUserForm()) {
      return {
        handleuser: [...new Set(this.workflowCaseFormRef.getFieldValue('handleuser'))].join(','),
        copyuser: [...new Set(this.workflowCaseFormRef.getFieldValue('copyuser'))].join(',')
      };
    }
    return {};
  };

  onSubmitPreAudit = () => {
    const { suggest, selectedOperate, submitPreAuditCase, flowOperates, flowDetail, putState } = this.props;
    const edit = flowOperates.edit;
    const isneedtorepeatapprove = flowDetail.isneedtorepeatapprove;

    // 0拒绝 1通过 2退回 3中止';
    const op = selectedOperate;

    if (op === undefined) return message.error('请选择操作');
    if (op === 7) {
      if (!suggest) return message.error('请填写意见');
      putState({ selectedOperate: 1 });
      return submitPreAuditCase();
    } else if (op === -1) {
      // putState({ suggest: '' })
      return submitPreAuditCase();
    }

    if ((op === 0 || op === 2) && !suggest) return message.error('请填写意见');

    if (op === 4 || (op === 1 && edit)) {
      this.editFormRef.validateFields((err, editData) => {
        if (!err) {
          submitPreAuditCase();
          // this.setState({ editData }, () => {
          //   if (op === 4 && isneedtorepeatapprove === 1) {
          //     this.setState({ isneedtorepeatapproveVisible: true })
          //   } else {
          //     submitPreAuditCase()
          //   }
          // })
        } else {
          message.error('请检查表单');
        }
      });
      return;
    }

    this.validateColumnConfigForms().then(result => {
      if (result) {
        submitPreAuditCase();
      } else {
        message.error('请检查表单');
      }
    });
  };

  getFormData = () => {
    const { flowDetail: { entityid }, editData } = this.props;

    const data = [{
      entityid,
      isallowupdate: 1,
      fields: editData
    }];

    return { data };
  }

  getCaseData = () => {
    const { columnConfigForms, columnConfigFormProtocols } = this.props;
    const formArray = _.map(columnConfigFormProtocols, (val, key) => ({ entityId: key, protocols: val }));
    const data = formArray.map(item => {
      const { entityId } = item;
      const submitFields = columnConfigFormProtocols[entityId].map(item => item.fieldname);
      const fieldsValue = _.pick(columnConfigForms[entityId], submitFields);

      const isallowupdate = (typeof fieldsValue === 'object' && fieldsValue && Object.keys(fieldsValue).length) ? 1 : 0;

      return {
        entityid: entityId,
        isallowupdate,
        fields: fieldsValue
      };
    });
    return { data };
  };

  shouldShowUserForm = () => {
    const { selectedNextNode: node, selectedOperate } = this.props;
    return node && node.nodeinfo.nodestate !== 2 && (selectedOperate === 1 || selectedOperate === 4)
      && !(node.nodeinfo.nodetype === 1 && node.nodeinfo.needsuccauditcount > 1);
  };

  excutingJSStatusChange = (status) => {
    this.setState({
      excutingJSLoading: status
    });
  }

  onWithDraw = () => {
    Modal.confirm({
      title: '确认撤回审批流程?',
      okText: '确认',
      cancelText: '取消',
      onOk: this.props.onWithDraw
    })
  }

  readed = (id, name) => {
    this.setState({
      currentFileId: id,
      currentFilename: name,
      showViewer: true
    });
  }

  // onEditDataChange = (editData) => this.setState({ editData })

  onDetailConfirm = (isneedtorepeatapprove) => {
    const { submitPreAuditCase } = this.props;

    if (isneedtorepeatapprove === 1) {
      this.setState({ isneedtorepeatapproveVisible: true });
    } else {
      submitPreAuditCase();
    }
  }

  onSelectLunch = (e) => this.setState({ selectLunchValue: e.target.value })

  hideLunchModal = () => this.setState({ selectLunchModalVisible: false })

  onSubmitLunchSelect = async () => {
    const { flowOperates: { rejectcaseitemid }, flowDetail: { caseid }, onCaseModalDone, suggest } = this.props;
    const { selectLunchValue, files } = this.state;

    if (selectLunchValue === 2) {
      const params = {
        caseitemid: rejectcaseitemid || '',
        caseid,
        casedata: this.getFormData(),
        remark: suggest || '',
        fileattachs: Array.isArray(files) ? (
          files.map(item => ({
            fileid: item.fileid,
            filename: item.filename,
            caseitemid: rejectcaseitemid || '',
            recid: '00000000-0000-0000-0000-000000000000'
          }))
        ) : []
      };
      const { data: bool, error_msg } = await dynamicRequest('api/workflow/jumptorejectnode', params).catch(e => {
        message.error(e.message);
      });
      if (bool) onCaseModalDone();
      if (error_msg) message[bool ? 'success' : 'error'](error_msg);
    } else {
      this.onSubmitPreAudit();
    }
    this.setState({ selectLunchModalVisible: false });
  }

  onConfirmModal = (selectedOperate) => {
    const { suggest } = this.props;

    if ([0, 2].includes(selectedOperate)) {
      if (!suggest) return message.error('请填写意见');
      let title;
      if (selectedOperate === 0) title = '审核不通过，中止审批流程';
      else if (selectedOperate === 2) title = '申请信息有误，将流程驳回到发起人';
      Modal.confirm({
        title,
        okText: '确认',
        cancelText: '取消',
        onOk: this.onSubmitPreAudit
      });
    } else if (selectedOperate === 4) {
      this.editFormRef.validateFields(async (err, editData) => {
        if (!err) this.setState({ selectLunchModalVisible: true });
        else message.error('请检查表单');
      });
    }
  }

  onSubmithasOperatetype = ({ originaluserid, nodeid }) => {
    const { suggest, flowOperates, caseId, flowDetail, selectedOperate } = this.props;
    const { files } = this.state;

    const params = {
      caseitemid: flowOperates.caseitemid,
      caseid: caseId,
      suggest,
      userid: originaluserid,
      files,
      issignortransfer: 1,
      nodenum: flowDetail.nodenum,
      choicestatus: selectedOperate === 1 ? 1 : 0,
      copyuser: '',
      nodeid
    };

    this.setState({ upLoading: true });

    dynamicRequest('api/workflow/transfer', params).then(res => {
      const { error_msg } = res;
      this.props.onCaseModalDone();
      this.setState({ modalVisible: false, upLoading: false });
      message.success(error_msg || '操作成功');
    }).catch(e => {
      message.error(e.message || '操作失败');
      console.error(e.message || '操作失败');
      this.setState({ upLoading: false });
    });
  }

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
      startEdit,
      cancelEdit,
      saveEdit,
      onCaseModalCancel,
      onCaseModalDone,
      showFlowCaseModal,
      columnConfigForms,
      columnConfigFormProtocols,
      putState,
      suggest,
      selectedOperate,
      nextNodesData,
      selectedNextNode,
      editData,
      onEditDataChange,
      jointUsers,
      showWithDrawBtn
    } = this.props;

    const { files, showViewer, currentFileId, currentFilename, isneedtorepeatapproveVisible, selectLunchModalVisible, selectLunchValue } = this.state;

    const dataSource = comboTableRow(flowItemList);

    const nodenum = flowDetail.nodenum;

    const nodetype = flowOperates.nodetype;
    const nodeid = flowOperates.nodeid || '';
    const operatetype = flowOperates.operatetype || 0;
    const originaluserid = flowOperates.originaluserid || '';
    const showNextSign = flowOperates.signcount === 0 && [6, 8].includes(selectedOperate)
    const signstatus = flowOperates.signstatus;

    const hasOperatetype = signstatus === 1; // 加签过来的数据

    const caseitemid = flowOperates.caseitemid;

    const flowId = flowDetail.flowid;

    // 判断当前流程是否为退回到发起人
    const isFlowBack = flowOperates.terminate === 1 && flowOperates.edit === 1;

    const columnConfigFormsArray = _.map(columnConfigFormProtocols, (val, key) => ({ entityId: key, protocols: val }));

    const { isallowtransfer, isallowsign, copyuser } = flowDetail;

    let handleCaseData = this.getCaseData();

    if (selectedOperate === 4 || (selectedOperate === 1 && flowOperates.edit === 1)) handleCaseData = this.getFormData();

    const caseData = /workflowCase$/.test(showModals) ? handleCaseData : undefined;

    const formGlobalJS = flowOperates.columnconfig ? flowOperates.columnconfig.globaljs : '';

    const isFirstUser = flowDetail.reccreator === currentUser.userid;

    const showTransfer = nodetype !== 2 && isallowtransfer === 1 && (!(isFirstUser && flowOperates.allow === 0));
    const showSign = nodetype !== 2 && isallowsign === 1 && (!(isFirstUser && flowOperates.allow === 0));

    const isFlowFinish = flowDetail.auditstatus === 1;
    const modeltype = flowDetail.modeltype;

    const dataModel = {
      relentityid: flowDetail.entityid,
      relrecid: flowDetail.recid,
      fielddata: editData
    };

    if (modeltype === 0) { // 独立实体
      dataModel.typeid = entityDetail ? entityDetail.rectype : '';
    } else if (modeltype === 2) { // 简单实体

    } else if (modeltype === 3) { // 动态实体

    }

    // const dataModel = {
    //   typeid: flowDetail.rectype,
    //   relentityid: flowDetail.entityid,
    //   relrecid: flowDetail.recid,
    //   fielddata: editData
    // }

    // 把废弃Radio放到最后
    const showSelectRadio = operates.some(op => !!flowOperates[op.key]);
    const showRadioList = [];
    let rejectRadio;

    if (showSelectRadio && nodetype !== 2) {
      operates.filter(op => {
        if (hasOperatetype) {
          if (flowOperates[op.key] && ['allow', 'reback'].includes(op.key)) return true;
        } else if (flowOperates[op.key] && !(op.key === 'lunch' && flowOperates.allow)) return true;
        return false;
      }).forEach(op => {
        const radioItem = <Radio key={op.key} value={op.id} style={{ display: 'block' }}>{op.label}</Radio>;
        if (op.key === 'reject') rejectRadio = radioItem;
        else showRadioList.push(radioItem);
      });
    } else if (nodetype === 2) {
      showRadioList.push(<Radio key={-1} value={-1} style={{ display: 'block' }}>无意见</Radio>);
      showRadioList.push(<Radio key={7} value={7} style={{ display: 'block' }}>有意见</Radio>);
    }

    if (showTransfer && !hasOperatetype) showRadioList.push(<Radio key={5} value={5} style={{ display: 'block' }}>转办</Radio>);
    if (showSign && !hasOperatetype) {
      showRadioList.push(<Radio key={6} value={6} style={{ display: 'block' }}>加签</Radio>);
      if (showNextSign) showRadioList.push(<Radio key={8} value={8} style={{ display: 'block' }}>沟通加签</Radio>);
    }
    if (rejectRadio && nodetype !== 2) showRadioList.push(rejectRadio);

    return (
      <Page title="审批详情" showGoBack goBackPath="/affair-list">
        <div className={styles.title}>
          <span>{`${flowDetail.flowname}【${flowDetail.reccode}】`}</span>
          {showWithDrawBtn && <Button style={{ float: 'right', margin: '10px 130px 0 0' }} onClick={this.onWithDraw}>撤回</Button>}

          <div className={styles.viewerBtn}>
            <FlowChartViewer
              key={flowId}
              flowId={flowId}
              caseId={caseId}
              versionnum={flowDetail.vernum}
            />
          </div>
        </div>
        <div className={styles.metas}>
          <span>申请人：</span>
          <span>{flowDetail.reccreator_name}</span>
          <span className={styles.lebal}>提交时间：</span>
          <span>{flowDetail.reccreated}</span>
          <span>{flowDetail.recname}</span>
        </div>

        {
          showSelectRadio && (
            <div>
              {
                <div className={styles.operats}>
                  <Radio.Group value={selectedOperate} onChange={e => {
                    this.setState({ files: [], selectLunchValue: 1 });
                    putState({ selectedOperate: e.target.value, suggest: configSelect[configSelect.findIndex(o => o.id === e.target.value)].label });
                  }}>
                    {showRadioList}
                  </Radio.Group>
                </div>
              }

              {/*columnconfig 审批可改字段*/
                selectedOperate === 1 && flowOperates.edit === 0 && nodetype !== 2 &&
                <div>
                  {columnConfigFormsArray.map(item => (
                    Array.isArray(item.protocols) && item.protocols.length ? (
                      <DynamicFormAdd
                        horizontal={false}
                        key={item.entityId}
                        entityId={item.entityId}
                        entityTypeId={item.entityId}
                        fields={item.protocols}
                        value={columnConfigForms[item.entityId] || {}}
                        onChange={value => putState({ columnConfigForms: { ...columnConfigForms, [item.entityId]: value } })}
                        ref={inst => this.columnConfigFormInstance[item.entityId] = inst}
                        formOrigin="affair"
                        mode="EDIT"
                        excutingJSStatusChange={this.excutingJSStatusChange}
                      />
                    ) : null
                  ))}
                </div>
              }

              {
                (
                  selectedOperate === 4 ||
                  (selectedOperate === 1 && flowOperates.edit === 1 && nodetype !== 2)
                ) &&
                Array.isArray(entityEditProtocol) && entityEditProtocol.length &&
                <DynamicFormEdit
                  entityId={flowDetail.entityid}
                  entityTypeId={(entityDetail && entityDetail.rectype) || flowDetail.entityid}
                  fields={entityEditProtocol}
                  value={editData}
                  onChange={onEditDataChange}
                  ref={node => this.editFormRef = node}
                  formGlobalJS={formGlobalJS}
                />
              }

              {this.shouldShowUserForm() && (
                <WorkflowCaseForm
                  ref={ref => this.workflowCaseFormRef = ref}
                  caseNodes={nextNodesData}
                  selectedNode={selectedNextNode}
                  onSelectedNodeChange={val => putState({ selectedNextNode: val })}
                  dataRange={1} // 获取全部人员
                />
              )}
              <div className={styles.comment}>
                <div className={styles.commentinput}>
                  <Input.TextArea
                    value={suggest}
                    onChange={e => putState({ suggest: e.target.value })}
                    placeholder="请输入审批意见"
                    autosize={{ minRows: 2, maxRows: 6 }}
                  />
                </div>
                <div className={styles.commentfooter}>
                  <div className={styles.upload}>
                    <Attachment
                      limit={6}
                      value={files}
                      onChange={fs => this.setState({ files: fs })}
                      beforeUpload={() => this.setState({ upLoading: true })}
                      afterUpload={() => this.setState({ upLoading: false })}
                    />
                  </div>

                  <div className={styles.submit}>
                    {selectedNextNode && selectedNextNode.nodeinfo.flowtype === 0 && (
                      <Button onClick={this.props.closeFlow}>关闭流程</Button>
                    )}
                    {
                      <Button
                        onClick={() => {
                          if (hasOperatetype) {
                            this.onSubmithasOperatetype({ originaluserid, nodeid });
                          } else if ([0, 2, 4].includes(selectedOperate)) {
                            this.onConfirmModal(selectedOperate);
                          } else {
                            this.onSubmitPreAudit();
                          }
                        }}
                        disabled={this.state.upLoading}
                        loading={this.props.submitBtnLoading || this.state.excutingJSLoading || this.state.upLoading}
                      >
                        提交
                      </Button>
                    }
                  </div>
                </div>
              </div>
            </div>
          )
        }

        <Collapse bordered={false} defaultActiveKey={['1', '2', '3', '4']}>
          {
            (flowDetail.entityid && (!((selectedOperate === 1 && flowOperates.edit === 1) || selectedOperate === 4))) ? (
              <Panel header="申请内容" key="1">
                <div className={styles.auditform}>
                  {
                    Array.isArray(entityDetailProtocol) && entityDetailProtocol.length ? (
                      <DynamicFormView
                        unNeedPower
                        entityId={flowDetail.entityid}
                        entityTypeId={(entityDetail && entityDetail.rectype) || flowDetail.entityid}
                        fields={entityDetailProtocol}
                        value={entityDetail}
                        isFlowFinish={isFlowFinish}
                      />
                    ) : null
                  }
                </div>
              </Panel>
            ) : null
          }
          {copyuser && copyuser.length > 0 ?
            <Panel header="抄送人" key="2">
              <div className={styles.section}>
                <div style={{ overflow: 'hidden' }}>
                  <ImgCardList.View dataSouce={copyuser} value={copyuser.map(i => i.userid).join(',')} />
                </div>
              </div>
            </Panel> : null
          }
          {Array.isArray(relentityDetailProtocol) && relentityDetailProtocol.length ?
            <Panel header="相关信息" key="3">
              <div className={styles.section}>
                <div className={styles.auditform}>
                  <DynamicFormView
                    entityId={relentityDetail && relentityDetail.rectype}
                    entityTypeId={relentityDetail && relentityDetail.rectype}
                    fields={relentityDetailProtocol}
                    value={relentityDetail}
                  />
                </div>
              </div>
            </Panel> : null
          }

          <Panel header="审批状态" key="4">
            <Table
              rowKey="entityid"
              dataSource={dataSource}
              columns={columns}
              pagination={false}
            />
          </Panel>
        </Collapse>

        <WorkflowCaseModal
          visible={/workflowCase$/.test(showModals)}
          caseitemid={caseitemid}
          caseId={caseId}
          nodetype={nodetype}
          jointUsers={jointUsers}
          isLunch={flowOperates.lunch === 1}
          currentUser={currentUser}
          suggest={suggest}
          files={files}
          showNextSign={showNextSign}
          checkedSign={selectedOperate === 8 ? 1 : 2}
          choiceStatus={selectedOperate === 8 ? 6 : selectedOperate}
          nodenum={nodenum}
          nodeid={nodeid}
          copyuser={copyuser}
          caseData={caseData}
          onCancel={onCaseModalCancel}
          onDone={onCaseModalDone}
        />
        <PdfViewer
          file={{ fileid: currentFileId, filename: currentFilename }}
          visible={showViewer}
          onCancel={() => this.setState({ showViewer: false })}
        />
        <IsneedtorepeatapproveModal
          entityId={flowDetail.entityid}
          flowId={flowId}
          dataModel={dataModel}
          visible={isneedtorepeatapproveVisible}
          onOk={this.onDetailConfirm}
          onCancel={() => this.setState({ isneedtorepeatapproveVisible: false })}
          cancelDetail={onCaseModalDone}
        />
        <Modal
          title="请选择类型"
          visible={selectLunchModalVisible}
          onOk={this.onSubmitLunchSelect}
          onCancel={this.hideLunchModal}
        >
          <Radio.Group onChange={this.onSelectLunch} value={selectLunchValue}>
            <Radio value={1}>重新发起</Radio>
            <Radio value={2}>跳回驳回人</Radio>
          </Radio.Group>
        </Modal>
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
      init(callback) {
        dispatch({ type: 'affairDetail/init', payload: { callback } });
      },
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
      submitAuditCase(data) {
        dispatch({ type: 'affairDetail/submitAuditCase', payload: data });
      },
      submitPreAuditCase() {
        dispatch({ type: 'affairDetail/submitPreAuditCase' });
      },
      closeFlow() {
        dispatch({ type: 'affairDetail/closeFlow' });
      },
      onCaseModalCancel() {
        dispatch({ type: 'affairDetail/onCaseModalCancel' });
      },
      onCaseModalDone() {
        dispatch({ type: 'affairDetail/onCaseModalDone' });
      },
      showFlowCaseModal() {
        dispatch({ type: 'affairDetail/showModals', payload: 'workflowCase' });
      },
      onWithDraw() {
        dispatch({ type: 'affairDetail/WithDraw' })
      }
    };
  }
)(AffairDetail);
