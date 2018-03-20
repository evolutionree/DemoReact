/**
 * Created by 0291 on 2018/3/20.
 */
import React from 'react';
import { Select, Button, Modal, Icon } from 'antd';
import { connect } from 'dva';
import Page from '../../components/Page';
import connectPermission from '../../models/connectPermission';
import ComplexForm from '../../components/ComplexForm';
import LinkTab from '../../components/LinkTab';

const Option = Select.Option;

function AttendanceGroupSet({
                              checkFunc,
                              dispatch,
                              visible
                            }) {
  let ComplexFormRef;
  const confirm = ()=> {
    ComplexFormRef.validateFields((err, values) => {
      if (err) return;
      console.log(JSON.stringify(values));
    });
  }

  const setClassStaff = () => {
    dispatch({ type: 'attendanceGroupSet/showModals', payload: 'setClassStaff' });
  }

  const cancel = () => {
    dispatch({ type: 'attendanceGroupSet/showModals', payload: '' });
  }

  const tabbar = (
    <LinkTab.Group>
      <LinkTab>已分配人员</LinkTab>
    </LinkTab.Group>
  );

  return (
    <Page title={'考勤组设置--XX考勤组'}
          fixedTop={(<div>{tabbar}</div>)}
          showGoBack
          goBackPath={'attendancegroupset'} >
      <Button onClick={setClassStaff}>绑定人员</Button>
      <Modal
        title="请选择考勤人员"
        visible={visible}
        onOk={confirm}
        onCancel={cancel}
      >
        <ComplexForm ref={(ref) => ComplexFormRef = ref}
                     model={[{ label: '选择团队', name: 'DeptSelect', childrenType: 'DeptSelect' }, { label: '选择人员', name: 'UserSelect', childrenType: 'UserSelect' }]}
        />
      </Modal>
    </Page>
  );
}

export default connect(
  state => {
    const { showModals } = state.attendanceGroupSet;
    return {
      visible: /setClassStaff/.test(showModals)
    };
  },
  dispatch => {
    return {

    };
  }
)(connectPermission(props => props.entityId, AttendanceGroupSet));
