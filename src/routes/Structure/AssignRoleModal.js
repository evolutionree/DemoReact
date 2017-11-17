import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { message, Select, Icon, Modal, Checkbox, Row, Col } from 'antd';
import _ from 'lodash';
import { queryGroups, queryRoles } from '../../services/role';
import { queryVocations } from '../../services/functions';
import styles from './AssignRoleModal.less';

const Option = Select.Option;

class AssignRoleModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      roleGroups: [],
      selectedRoleGroup: '',
      roles: [],
      currRoles: [],
      curVocations: [],
      vocations: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      // 初始化已分配角色
      const { currentItems } = nextProps;
      if (currentItems.length > 1) {
        this.setState({ currRoles: [] });
      } else if (currentItems[0].roleid) {
        const roleIds = currentItems[0].roleid.split(',');
        const roleNames = currentItems[0].rolename.split(',');
        const roles = roleIds.map((id, index) => ({
          roleid: id,
          rolename: roleNames[index]
        }));
        const vocationIds = currentItems[0].vocationid ? currentItems[0].vocationid.split(',') : [];
        const vocationNames = currentItems[0].vocationname ? currentItems[0].vocationname.split(',') : [];
        const cocas = vocationIds.map((id, index) => ({
          vocationid: id,
          vocationname: vocationNames[index]
        }));
        console.log(cocas);
        this.setState({ currRoles: roles, curVocations: cocas });
      } else {
        this.setState({ currRoles: [], curVocations: [] });
      }

      // 查所有可选角色
      queryGroups().then(result => {
        const roleGroups = [{
          rolegroupid: '',
          rolegroupname: '全部角色'
        }].concat(result.data.rolegrouplist);
        this.setState({ roleGroups });
        this.selectRoleGroup('');
      });
      // 查询所有可选职能
      const vocationsParams = {
        pageindex: 1,
        pagesize: 1000
      }
      queryVocations(vocationsParams).then(result => {
        this.setState({
          vocations: result.data.datacursor
        });
      });
    }
  }

  selectRoleGroup = groupId => {
    this.setState({ selectedRoleGroup: groupId });
    const params = {
      pageIndex: 1,
      pageSize: 999,
      roleName: '',
      groupId
    };
    queryRoles(params).then(result => {
      const roles = result.data.page;
      this.setState({ roles });
    });
  };

  handleRoleCheck = (item, event) => {
    const checked = event.target.checked;
    if (checked) {
      const role = {
        rolename: item.rolename,
        roleid: item.roleid
      };
      this.setState({
        currRoles: [...this.state.currRoles, role]
      });
    } else {
      const id = item.roleid;
      const currRoles = this.state.currRoles.filter(role => role.roleid !== id);
      this.setState({ currRoles });
    }
  };

  /** *
   * 用户选中或者取消选中职能
   * @param item
   * @param event
   */
  handleVocationCheck = (item, event) => {
    const checked = event.target.checked;
    if (checked) {
      const funcitem = {
        vocationname: item.vocationname,
        vocationid: item.vocationid
      };
      this.setState({
        curVocations: [...this.state.curVocations, funcitem]
      });
    } else {
      const id = item.vocationid;
      const curVocations = this.state.curVocations.filter(role => role.vocationid !== id);
      this.setState({ curVocations });
    }
  };

  handleRoleRemove = role => {
    this.setState({
      currRoles: this.state.currRoles.filter(item => item !== role)
    });
  };

  handleVocationRemove = vocationitem => {
    this.setState({
      curVocations: this.state.curVocations.filter(item => item !== vocationitem)
    });
  }

  handleSubmit = () => {
    const userIds = this.props.currentItems.map(u => u.userid).join(',');
    const roleIds = _.map(this.state.currRoles, 'roleid').join(',');
    if (roleIds === '') {
      message.error('请至少选择一个角色');
      return;
    }
    const funcIds = _.map(this.state.curVocations, 'vocationid').join(',');
    if (funcIds === '') {
      message.error('请至少选择一个职能');
      return;
    }
    this.props.assignRole({ userIds, roleIds, funcIds });
  };

  render() {
    const { selectedRoleGroup, roleGroups, roles, currRoles, curVocations, vocations } = this.state;
    const { currentItems, visible, cancel } = this.props;
    return (
      <Modal
        title="分配角色和职能"
        visible={visible}
        onCancel={cancel}
        onOk={this.handleSubmit}
      >
        {visible ? (
          <div>
            <div className={styles.title}>选中人员（共{currentItems.length}人）</div>
            <div className={styles.well}>
              {currentItems.map(u => u.username).join('、')}
            </div>
            <div className={styles.title}>角色</div>
            <Select value={selectedRoleGroup} onChange={this.selectRoleGroup} style={{ width: '100%' }}>
              {roleGroups.map(item => (
                <Option key={item.rolegroupid} value={item.rolegroupid}>{item.rolegroupname}</Option>
              ))}
            </Select>
            <div className={styles.well}>
              {roles.map(item => {
                const currRoleIds = _.map(currRoles, 'roleid');
                const checked = _.includes(currRoleIds, item.roleid);
                return (
                  <Checkbox
                    className={styles.checkboxitem}
                    key={item.roleid}
                    checked={checked}
                    onChange={this.handleRoleCheck.bind(this, item)}
                  >
                    {item.rolename}
                  </Checkbox>
                );
              })}
            </div>
            <div className={styles.title}>职能</div>
            <div className={styles.well}>
              {vocations.map(item => {
                console.log(curVocations);
                const curVos = _.map(curVocations, 'vocationid');
                console.log(curVos);
                const vchecked = _.includes(curVos, item.vocationid);
                console.log(vchecked);
                return (
                  <Checkbox
                    className={styles.checkboxitem}
                    key={item.vocationid}
                    checked={vchecked}
                    onChange={this.handleVocationCheck.bind(this, item)}
                  >
                    {item.vocationname}
                  </Checkbox>
                );
              })}
            </div>
            <div className={styles.title}>已选择</div>
            <Row>
              <Col span={12}>
                <ul className={styles.selectedlist}>
                  <li className={styles.titleli}><span>角色</span></li>
                  {currRoles.map(item => (
                    <li key={item.roleid}>
                      <span>{item.rolename}</span>
                      <Icon type="close" onClick={this.handleRoleRemove.bind(this, item)} />
                    </li>
                  ))}
                </ul>
              </Col>
              <Col span={12}>
                <ul className={styles.selectedlist}>
                  <li className={styles.titleli}><span>职能</span></li>
                  {curVocations.map(item => (
                    <li key={item.vocationid}>
                      <span>{item.vocationname}</span>
                      <Icon type="close" onClick={this.handleVocationRemove.bind(this, item)} />
                    </li>
                  ))}
                </ul>
              </Col>
            </Row>
          </div>
        ) : ''}
      </Modal>
    );
  }
}

export default connect(
  ({ structure }) => {
    return {
      currentItems: structure.currentItems,
      visible: /assignRole/.test(structure.showModals)
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'structure/showModals', payload: '' });
      },
      assignRole(data) {
        dispatch({ type: 'structure/assignRole', payload: data });
      }
    };
  }
)(AssignRoleModal);
