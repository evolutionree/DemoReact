/**
 * Created by 0291 on 2017/8/7.
 */
import React from 'react';
import { Modal, Col, Row, Icon, message, Form, Input, InputNumber } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import _ from 'lodash';
import styles from './salesTarget.less';
import DataGrid from './component/DataGrid.jsx';
import HeaderModel from './component/HeaderModel';

const FormItem = Form.Item;

function YearTarget({
                      visible,
                      onCancel,
                      departmentOfficer,
                      yearTargetValueChange,
                      yearTargetValueBlur,
                      submitData
                         }) {
  const columns = [
    new HeaderModel('团队/人员', 'name', (text, record, index) => {
      return <span className={styles.overEllipsis} title={text}>{text}</span>
    }, 170),
    new HeaderModel('分配年度目标', 'yearcount', (text, record, index) => {
    return <InputNumber value={text} max={999999999999999} min={0} onChange={yearTargetValueChange.bind(this, index)} onBlur={yearTargetValueBlur.bind(this, index)} style={{ width: '180px' }} />;
  })
  ];

  const handleOk = () => {
    submitData(departmentOfficer);
  };

  return (
    <Modal
      title="分配销售目标"
      width={500}
      wrapClassName={styles.yearTargetModal}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <DataGrid
        columns={columns}
        rowKey='id'
        dataSource={departmentOfficer}
        pagination={false}
        rowSelection={false}
      />
    </Modal>
  )
}

export default connect(
  state => {
    const { showModals, departmentOfficer } = state.salesTarget;
    return {
      visible: /yearTarget/.test(showModals),
      departmentOfficer: departmentOfficer
    };
  },
  dispatch => {
    return {
      onCancel() {
        dispatch({ type: 'salesTarget/showModal', payload: '' });
      },
      submitData(submitData) {
        dispatch({ type: 'salesTarget/saveYearTarget', payload: submitData });
      },
      yearTargetValueChange(index, value) {
        dispatch({ type: 'salesTarget/yearTargetValueChange', payload: { index, value } });
      },
      yearTargetValueBlur(index, value) {
        dispatch({ type: 'salesTarget/yearTargetValueBlur', payload: { index, value } });
      }
    }
  }
)(YearTarget);
