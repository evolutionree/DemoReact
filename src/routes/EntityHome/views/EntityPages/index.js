import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { Button, Form, Input, Radio, Select, message } from 'antd';
import EntityPageForm from './EntityPageForm';

const FormItem = Form.Item;

function EntityPages({
  savePage,
  formValue,
  onEditingDataChange
}){

  return (
    <EntityPageForm
      value={formValue}
      onChange={onEditingDataChange}
      onSubmit={savePage}
    />    
  );
}

export default connect(
  state => state.entityPages,
  dispatch => {
    return {
      onEditingDataChange(formValue) {
        dispatch({ type: 'entityPages/putState', payload: { formValue } });
      },
      savePage(formData) {
        dispatch({ type: 'entityPages/savePage', payload: formData });
      },
    };
  }
)(EntityPages);