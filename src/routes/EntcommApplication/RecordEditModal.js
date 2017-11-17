import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import EntcommEditModal from '../../components/EntcommEditModal';

const RecordEditModal = connect(
  state => {
    const { showModals, entityName } = state.entcommApplication;
    const match = showModals && showModals.match(/recordEdit\?([^:]+):(.+)$/);
    return {
      visible: !!match,
      entityId: match && match[1],
      recordId: match && match[2],
      entityName
    };
  },
  dispatch => {
    const hideModal = () => {
      dispatch({ type: 'entcommApplication/showModals', payload: '' });
    };
    return {
      cancel() {
        hideModal();
      },
      done() {
        hideModal();
        dispatch({ type: 'entcommApplication/queryList' });
      }
    };
  }
)(EntcommEditModal);

export default RecordEditModal;
