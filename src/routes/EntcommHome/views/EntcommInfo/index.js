import React from 'react';
import classnames from 'classnames';
import { connect } from 'dva';
import { Button, message } from 'antd';
import { DynamicFormEdit, DynamicFormView } from '../../../../components/DynamicForm';
import { WorkflowCaseForAddModal } from '../../../../components/WorkflowCaseModal';
import styles from './styles.less';

function EntcommInfo(props) {
  const {
    checkFunc,
    editing,
    detailData,
    detailProtocol,
    editData,
    editProtocol,
    startEdit,
    cancelEdit,
    saveEdit,
    onEditDataChange,
    editFormRef,
    permission,
    entityId,
    onExcutingJSStatusChange,
    excutingJSLoading,
    toggleShowModal,
    showModal,
    dataModel,
    cacheId,
    entityTypes,
    selectedFlowObj,
    refEntity,
    editForm,
    refRecord,
    extradata,
    setDataModel,
    flowid,
    onDone
  } = props;

  const flow = selectedFlowObj || {};
  let fields = editProtocol;

  if (!permission) {
    return (
      <div className={styles.container}>
        您没有足够的权限查看当前数据
      </div>
    );
  }

  function onSubmitEdit() {
    saveEdit();
    // if (editForm) {
    //   if (flowid) {
    //     editForm.validateFields((err, values) => {
    //       if (err) return message.error('请检查表单');

    //       if (!entityTypes || entityTypes.length === 1) {
    //         const selectedEntityType = Array.isArray(entityTypes) ? entityTypes[0].categoryid : entityId;
    //         const newDataModel = {
    //           cacheid: cacheId,
    //           typeid: selectedEntityType,
    //           flowid: flow.flowid,
    //           relentityid: refEntity,
    //           relrecid: refRecord,
    //           fielddata: values,
    //           extradata: extradata
    //         };
    //         setDataModel(newDataModel);
    //         toggleShowModal('WorkflowCaseForAddModal');
    //       }
    //     });
    //   } else {
    //     saveEdit();
    //   }
    // }
  }

  function transferEditProtocol(editDatas, eProtocol) { //部分字段 禁用
    const protocol = eProtocol.map(item => {
      if ((',' + editDatas.commmon_fields.toString() + ',').indexOf(',' + item.fieldname + ',') > -1) {
        item.fieldconfig.isReadOnly = 1;
      }
      return item;
    });
    return protocol;
  }

  if (editing) {
    if (Object.prototype.hasOwnProperty.call(editData, 'commmon_fields') && editData.commmon_fields != null) {
      fields = transferEditProtocol(editData, fields);
    }
    return (
      <div className={styles.container}>
        <div className={styles.btnrow}>
          <Button onClick={onSubmitEdit} loading={excutingJSLoading} style={{ marginRight: '10px' }}>保存</Button>
          <Button type="default" onClick={cancelEdit}>取消</Button>
        </div>
        <div style={{ maxHeight: document.documentElement.clientHeight - 270 }} className={classnames(styles.formBody, 'entcomminfoBody')}>
          <DynamicFormEdit
            entityId={entityId}
            entityTypeId={editData && editData.rectype}
            fields={fields}
            value={editData}
            onChange={onEditDataChange}
            ref={editFormRef}
            excutingJSStatusChange={onExcutingJSStatusChange}
          />
          {/* <WorkflowCaseForAddModal
            visible={showModal} 
            editPage
            dataModel={dataModel}
            onCancel={() => toggleShowModal('')}
            onDone={onDone}
          /> */}
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.container}>
        <div className={styles.btnrow}>
          {checkFunc('EntityDataEdit') && <Button onClick={startEdit}>编辑</Button>}
        </div>
        <div style={{ maxHeight: document.documentElement.clientHeight - 270 }} className={styles.formBody}>
          <DynamicFormView
            entityId={entityId}
            entityTypeId={detailData && detailData.rectype}
            fields={detailProtocol}
            value={detailData}
          />
        </div>
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      ...state.entcommInfo,
      detailData: state.entcommHome.recordDetail,
      entityId: state.entcommHome.entityId
    };
  },
  dispatch => {
    return {
      startEdit() {
        dispatch({ type: 'entcommInfo/startEdit' });
      },
      cancelEdit() {
        dispatch({ type: 'entcommInfo/cancelEdit' });
      },
      saveEdit() {
        dispatch({ type: 'entcommInfo/saveEdit' });
      },
      toggleShowModal(action) {
        dispatch({ type: 'entcommInfo/putState', payload: { showModal: action } });
      },
      setDataModel(dataModel) {
        dispatch({ type: 'entcommInfo/putState', payload: { dataModel } });
      },
      onEditDataChange(editData) {
        dispatch({ type: 'entcommInfo/putState', payload: { editData } });
      },
      editFormRef(editForm) {
        dispatch({ type: 'entcommInfo/putState', payload: { editForm } });
      },
      onExcutingJSStatusChange(status) {
        dispatch({ type: 'entcommInfo/putState', payload: { excutingJSLoading: status } });
      },
      onDone(result) {
        dispatch({ type: 'entcommInfo/putState', payload: { showModal: '' } });
        if (result) {
          dispatch({ type: 'entcommInfo/cancelEdit' });
          dispatch({ type: 'entcommHome/fetchRecordDetail' });
        }
      }
    };
  }
)(EntcommInfo);
