/**
 * Created by 0291 on 2018/5/14.
 */
import React from 'react';
import { Form } from 'antd';
import ExportModal from '../../components/ExportModal';
import { connect } from 'dva';


export default connect(
  state => {
    const { showModals, entityId, protocol, queries, currItems } = state.entcommApplication;
    return {
      visible: /export/.test(showModals),
      entityId,
      protocol,
      queries,
      Recids: currItems.map(item => item.recid)
    };
  },
  dispatch => {
    return {
      onCancel() {
        dispatch({ type: 'entcommApplication/showModals', payload: '' });
      }
    };
  }
)(Form.create()(ExportModal));
