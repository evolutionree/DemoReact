/**
 * Created by 0291 on 2017/12/13.
 */
import React from 'react';
import { Modal, Col, Row, Icon, message, Pagination } from 'antd';
import _ from 'lodash';
import { connect } from 'dva';
import Search from '../../components/Search';
import Toolbar from '../../components/Toolbar';
import { queryDataSourceData } from '../../services/datasource';
import styles from '../../components/DynamicForm/controls/SelectUser.less';

class UserSelectModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    selectedUsers: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      id: React.PropTypes.number
    })),
    onOk: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    title: React.PropTypes.string,
    modalPending: React.PropTypes.bool
  };
  static defaultProps = {
    visible: false,
    selectedUsers: [],
    multiple: true,
    title: '选择人员',
    modalPending: false
  };

  constructor(props) {
    super(props);
    this.state = {
      searchName: '',
      currentSelected: props.selectedUsers,
      userList: [],
      total: 0,
      page: 1,
      pageSize: 20
    };
  }

  componentWillMount() {
    this.setState({
      searchName: '',
      currentSelected: this.props.selectedUsers
    }, this.fetchUserList);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        searchName: '',
        currentSelected: nextProps.selectedUsers
      }, this.fetchUserList);
    }
  }

  fetchUserList = () => {
    const params = {
      keyword: '',
      pageSize: this.state.pageSize,
      pageIndex: this.state.page,
      sourceId: 'b301532c-f678-459b-b802-6ae45a97de86',
      queryData:[{
        username: this.state.searchName,
        islike: 1}]
    };
    queryDataSourceData(params).then(result => {
      this.setState({
        userList: result.data.page,
        total: result.data.pagecount[0].total
      })
    });
  };

  handleOk = () => {
    this.props.onOk(this.state.currentSelected);
    this.props.setMailAddress(this.state.currentSelected);
  };


  onSearch = (keyword) => {
    this.setState({
      searchName: keyword
    }, this.fetchUserList);
  };


  selectSingle = user => {
    this.setState({
      currentSelected: user
    });
  };

  pageChangeHandler(page) {
    this.setState({
      page: page
    }, this.fetchUserList)
  }

  render() {
    const { visible, onCancel, title, modalPending } = this.props;
    let { currentSelected, searchName, userList } = this.state;
    return (
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        wrapClassName={ ''}
        confirmLoading={modalPending}
      >
        <Toolbar>
          <Search
            width="200px"
            value={searchName}
            onSearch={this.onSearch}
            placeholder="请输入人员姓名"
          >
            搜索
          </Search>
        </Toolbar>
        <ul className={styles.userlist}>
          {userList.map(user => {
            const cls = currentSelected.userid === user.userid ? styles.highlight : '';
            return (
              <li key={user.userid} onClick={this.selectSingle.bind(this, user)} className={cls}>
                <span title={user.username}>{user.username}</span>
              </li>
            );
          })}
        </ul>
        <div style={{ textAlign: 'right', marginTop: '6px' }}>
          <Pagination size="small" showSizeChanger={false} current={this.state.page} pageSize={this.state.pageSize} total={this.state.total} onChange={this.pageChangeHandler.bind(this)} />
        </div>
      </Modal>
    );
  }
}

export default connect(
  state => state.mailrecovery,
  dispatch => {
    return {
      setMailAddress(item) {
        dispatch({ type: 'mailrecovery/putState', payload: { mailAddressList: item.mails.split(';')} });
      }
    };
  }
)(UserSelectModal);
