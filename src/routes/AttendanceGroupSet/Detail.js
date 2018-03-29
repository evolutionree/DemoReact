/**
 * Created by 0291 on 2018/3/20.
 */
import React from 'react';
import { Select, Button, Modal, Table, Spin } from 'antd';
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

class AttendanceGroupSet extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {

    } else if (isClosing) {
      this.ComplexFormRef.resetFields();
    }
  }

  confirm = () => {
    this.ComplexFormRef.validateFields((err, values) => {
      if (err) return;
      const submitData = {
        DeptSelect: values.DeptSelect || [],
        UserSelect: values.UserSelect || [],
        ScheduleGroup: {
          id: GetArgsFromHref('groupid'),
          name: GetArgsFromHref('groupname')
        }
      }

      this.props.dispatch({ type: 'attendanceGroupSet/bindAttence', payload: submitData });
    });
  }

  setClassStaff = () => {
    this.props.dispatch({ type: 'attendanceGroupSet/showModals', payload: 'setClassStaff' });
  }

  cancel = () => {
    this.props.dispatch({ type: 'attendanceGroupSet/showModals', payload: '' });
  }

  search(key, value) {
    const { pathname } = this.props.location;
    const query = { ...this.props.detailQueries, pageIndex: 1, [key]: value };
    this.props.dispatch(routerRedux.push({ pathname, query }));
  }

  render() {
    const { pageIndex, pageSize, deptId, userName } = this.props.detailQueries;
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
    return (
      <Page title={'考勤组设置--' + decodeURIComponent(GetArgsFromHref('groupname')) + '考勤组'}
            fixedTop={(<div>{tabbar}</div>)}
            showGoBack
            goBackPath={'attendancegroupset'} >
        <Toolbar>
          <div style={{ width: 200, display: 'inline-block' }}>
            <SelectDepartment onChange={this.search.bind(this, 'deptId')} value={deptId} />
          </div>
          <Button onClick={this.setClassStaff}>绑定人员</Button>
          <Toolbar.Right>
            <Search
              placeholder="请输入姓名搜索"
              value={userName}
              onSearch={val => this.search('userName', val)}
            >
              搜索
            </Search>
          </Toolbar.Right>
        </Toolbar>
        <Table dataSource={this.props.detailList}
               columns={columns}
               rowKey="recid"
               pagination={{
                 pageSize,
                 total: this.props.detailPageTotal,
                 current: pageIndex,
                 onChange: this.search.bind(this, 'pageIndex'),
                 onShowSizeChange: (curr, size) => { this.search('pageSize', size); }
               }} />
        <Modal
          title="请选择考勤人员"
          visible={this.props.visible}
          onOk={this.confirm}
          onCancel={this.cancel}
        >
          <Spin tip="数据请求中..." spinning={this.props.bindAttenceLoading} >
            <ComplexForm ref={(ref) => this.ComplexFormRef = ref}
                         model={[{ label: '选择团队', name: 'DeptSelect', childrenType: 'DeptSelect' }, { label: '选择人员', name: 'UserSelect', childrenType: 'UserSelect' }]}
            />
          </Spin>
        </Modal>
      </Page>
    );
  }
}

export default connect(
  state => {
    const { showModals, detailList, detailQueries, detailPageTotal, bindAttenceLoading } = state.attendanceGroupSet;
    return {
      visible: /setClassStaff/.test(showModals),
      detailList,
      detailQueries,
      detailPageTotal,
      bindAttenceLoading
    };
  },
  dispatch => {
    return {

    };
  }
)(connectPermission(props => props.entityId, AttendanceGroupSet));
