import React from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import { DynamicFormEdit, DynamicFormView } from '../../../../components/DynamicForm';
import styles from './styles.less';

function EntcommInfo({
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
    permission
  }) {
  if (!permission) {
    return (
      <div className={styles.container}>
        您没有足够的权限查看当前数据
      </div>
    );
  }
  function transferEditProtocol(editData, editProtocol) { //部分字段 禁用
    var protocol = editProtocol.map((item, index) => {
      if(("," + editData.commmon_fields.toString() + ",").indexOf("," + item.fieldname + ",") > -1){
        item.fieldconfig.isReadOnly = 1;
      }
      return item;
    });
    return protocol;
  }

  if (editing) {
    if(editData.hasOwnProperty("commmon_fields") && editData.commmon_fields != null) {
      editProtocol = transferEditProtocol(editData, editProtocol);
    }
    return (
      <div className={styles.container}>
        <div className={styles.btnrow}>
          <Button onClick={saveEdit} style={{ marginRight: '10px' }}>保存</Button>
          <Button type="default" onClick={cancelEdit}>取消</Button>
        </div>
        <DynamicFormEdit
          entityTypeId={editData && editData.rectype}
          fields={editProtocol}
          value={editData}
          onChange={onEditDataChange}
          ref={editFormRef}
        />
      </div>
    );
  } else {
    return (
      <div className={styles.container}>
        <div className={styles.btnrow}>
          {checkFunc('EntityDataEdit') && <Button onClick={startEdit}>编辑</Button>}
        </div>
        <DynamicFormView
          entityTypeId={detailData && detailData.rectype}
          fields={detailProtocol}
          value={detailData}
        />
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      ...state.entcommInfo,
      detailData: state.entcommHome.recordDetail
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
      onEditDataChange(editData) {
        dispatch({ type: 'entcommInfo/putState', payload: { editData } });
      },
      editFormRef(editForm) {
        dispatch({ type: 'entcommInfo/putState', payload: { editForm } });
      }
    };
  }
)(EntcommInfo);
