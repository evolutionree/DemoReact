/**
 * Created by 0291 on 2018/3/20.
 */
import React from 'react';
import { Select, Button, Modal, Table } from 'antd';
import { connect } from 'dva';
import Page from '../../components/Page';
import connectPermission from '../../models/connectPermission';
import ComplexForm from '../../components/ComplexForm';
import LinkTab from '../../components/LinkTab';
import SelectDepartment from '../../components/DynamicForm/controls/SelectDepartment';
import { routerRedux } from 'dva/router';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import { GetArgsFromHref } from '../../utils/index';

const Option = Select.Option;

function AttendanceGroupSet({
                              dispatch,
                              visible,
                              detailList,
                              location: { pathname },
                              detailQueries,
                              detailPageTotal
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

  const columns = [{
    title: '姓名',
    dataIndex: 'username',
    key: 'username'
  }, {
    title: '所属团队',
    dataIndex: 'deptname',
    key: 'deptname'
  }, {
    title: '绑定考勤组',
    dataIndex: 'groupname',
    key: 'groupname'
  }];

  function search(key, value) {
    const query = { ...detailQueries, pageIndex: 1, [key]: value };
    dispatch(routerRedux.push({ pathname, query }));
  }

  const { pageIndex, pageSize, deptId, userName } = detailQueries;
  return (
    <Page title={'考勤组设置--' + decodeURIComponent(GetArgsFromHref('groupname')) + '考勤组'}
          fixedTop={(<div>{tabbar}</div>)}
          showGoBack
          goBackPath={'attendancegroupset'} >
      <Toolbar>
        <div style={{ width: 200, display: 'inline-block' }}>
          <SelectDepartment onChange={search.bind(this, 'deptId')} value={deptId} />
        </div>
        <Button onClick={setClassStaff}>绑定人员</Button>
        <Toolbar.Right>
          <Search
            placeholder="请输入姓名搜索"
            value={userName}
            onSearch={val => search('userName', val)}
          >
            搜索
          </Search>
        </Toolbar.Right>
      </Toolbar>
      <Table dataSource={detailList}
             columns={columns}
             pagination={{
               pageSize,
               detailPageTotal,
               current: pageIndex,
               onChange: search.bind(this, 'pageIndex'),
               onShowSizeChange: (curr, size) => { search('pageSize', size); }
             }} />
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
    const { showModals, detailList, detailQueries, detailPageTotal } = state.attendanceGroupSet;
    return {
      visible: /setClassStaff/.test(showModals),
      detailList,
      detailQueries,
      detailPageTotal
    };
  },
  dispatch => {
    return {

    };
  }
)(connectPermission(props => props.entityId, AttendanceGroupSet));
