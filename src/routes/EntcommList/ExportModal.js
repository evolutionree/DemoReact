/**
 * Created by 0291 on 2018/5/14.
 */
import React from 'react';
import { Form } from 'antd';
import ExportModal from '../../components/ExportModal';
import { connect } from 'dva';


export default connect(
  state => {
    const { showModals, entityId, protocol, queries } = state.entcommList;
    return {
      visible: /export/.test(showModals),
      entityId,
      protocol,
      queries
    };
  },
  dispatch => {
    return {
      onCancel() {
        dispatch({ type: 'entcommList/showModals', payload: '' });
      }
    };
  }
)(Form.create()(ExportModal));
