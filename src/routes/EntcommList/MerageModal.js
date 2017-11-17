/**
 * Created by 0291 on 2017/7/7.
 */
import React from 'react';
import { Modal, Col, Row, Icon, message } from 'antd';
import { connect } from 'dva';
import Search from '../../components/Search';
import Toolbar from '../../components/Toolbar';
import classnames from 'classnames';
import DepartmentSelect from '../../components/DepartmentSelect';
import { queryNeedMergelist, customerMerge} from '../../services/customer.js';
import styles from './MerageModal.less';
import _ from 'lodash';
import { Pagination } from 'antd';

class MerageModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    selectedUsers: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      id: React.PropTypes.number,
      custname: React.PropTypes.string
    })),
    onOk: React.PropTypes.func,
    onCancel: React.PropTypes.func
  };
  static defaultProps = {
    visible: false,
    selectedUsers: [],
    userList: []
  }

  constructor(props) {
    super(props);
    this.state = {
      searchName: '',
      currentSelected: props.selectedUsers,
      userList: this.props.userList,  //待合并的客户数据
      confirmMerageVisible: false, //确认合并窗口是否打开
      confirmMerageData: [],  //确认合并客户的数据
      currentPage: 1,
      userListTotal: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        searchName: '',
        currentSelected: nextProps.selectedUsers,
        userList: nextProps.userList
      }, this.fetchUserList);
    }
  }

  componentDidMount() {
    //this.fetchUserList();
  }


  changePageHandler(page, pageSize) {
    this.setState({
      currentPage: page
    }, this.fetchUserList(page));
  }


  fetchUserList (page = this.state.currentPage) {//查询待合并的客户
    const params = {
      menuId: '',
      searchKey: this.state.searchName,
      pageSize: 10,
      pageIndex: page
    };
    queryNeedMergelist(params).then(result => {
      const userList = result.data.datalist;
      this.setState({
        userList,
        userListTotal: result.data.pageinfo.totalcount
      });
    });
  }

  handleOk = () => {
    if (!(this.state.currentSelected.length > 1)) {
      return message.error('请至少选择两个客户！');
    } else if (!(this.state.currentSelected.length <= 20)) {
      return message.error('客户批量合并最多选择20个客户！');
    }
    this.setState({
      confirmMerageVisible: true,
      confirmMerageData: this.state.currentSelected
    });
  };
  confirmMergeHandleOk= () => {
    const confirmMerageData = this.state.confirmMerageData;
    let isExistMain = false; //确保选了 客户作为主记录
    for (let i = 0; i < confirmMerageData.length; i++) {
      if (confirmMerageData[i].active) {
        isExistMain = true;
        break;
      }
    }

    if (isExistMain) {
      const _this = this;
      Modal.confirm({
        title: '确定合并所选客户吗?',
        onOk() {
          let submitData = {};
          submitData.custIds = [];
          for (let i = 0; i < confirmMerageData.length; i++) {
            if (confirmMerageData[i].active) {
              submitData.mainCustId = confirmMerageData[i].custid;
            } else {
              submitData.custIds.push(confirmMerageData[i].custid);
            }
          }

          customerMerge(submitData).then( result => {
            message.success('合并成功');
            _this.props.confirmMergeHandleOk();
            _this.setState({
              confirmMerageVisible: false
            })
          }).catch((e) => {
            message.error(e.message || '合并失败');
            return false;
          })
        },
        onCancel() {

        }
      });


    } else {
      message.error('请选择一个客户作为主记录');
      return false;
    }
  }

  confirmMergeHandleCancel() {
    this.setState({
      confirmMerageVisible: false
    });
  }


  onSearch = (keyword) => {
    this.setState({
      searchName: keyword
    }, this.fetchUserList);
  };

  selectAll = () => {
    this.setState({
      currentSelected: _.uniqBy([
        ...this.state.currentSelected,
        ...this.state.userList
      ], 'custid')
    });
  };

  select (user){
    const currSelected = this.state.currentSelected;
    const hasSelected = currSelected.some(item => item.custid === user.custid);
    if (!hasSelected) {
      this.setState({
        currentSelected: [
          ...currSelected,
          user
        ]
      });
    } else {
      message.info(user.custname + '已被选择,不能重复添加');
    }
  }


  remove = user => {
    this.setState({
      currentSelected: this.state.currentSelected.filter(item => item !== user)
    });
  };

  removeAll = () => {
    this.setState({ currentSelected: [] });
  };

  radioSelectHandler = (index) => {
    let cloneDeepData = _.cloneDeep(this.state.confirmMerageData)
    cloneDeepData = cloneDeepData.map((item, i) => {
      index == i ? item.active = true : item.active = false;
      return item;
    })
    this.setState({
      confirmMerageData : cloneDeepData
    });
  }
  render() {
    const { visible, onCancel, multiple } = this.props;
    const { currentSelected } = this.state;
    return (
      <div>
        <Modal
          title="选择客户"
          width={810}
          visible={visible}
          onOk={this.handleOk}
          onCancel={onCancel}
          wrapClassName={multiple ? 'ant-modal-custom-large' : ''}
        >
          <Toolbar>
            <Search
              width="300px"
              value={this.state.searchName}
              onSearch={this.onSearch}
              placeholder="请输入客户名称、负责人"
            >
              搜索
            </Search>
          </Toolbar>
          <Row gutter={20}>
            <Col span={11}>
              <ul>
                <li className={styles.colHeader}>
                  <span>客户名称</span>
                  <span>负责人</span>
                </li>
              </ul>
              <ul className={styles.userlist}>
                {this.state.userList && this.state.userList instanceof Array && this.state.userList.map((user, index) => (
                  <li key={user.custid + 'userList' + index} onClick={this.select.bind(this, user)}>
                    <span title={user.custname}>{user.custname}</span>
                    <span title={user.managername}>{user.managername}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.PaginationWrap}>
                <Pagination simple defaultPageSize={10} current={this.state.currentPage} total={this.state.userListTotal} onChange={this.changePageHandler.bind(this)} />
              </div>
            </Col>
            <Col span={2}>
              <div style={{ height: '400px' }} className={styles.midcontrol}>
                <Icon type="right" onClick={this.selectAll} />
                <Icon type="left" onClick={this.removeAll} />
              </div>
            </Col>
            <Col span={11}>
              <ul>
                <li className={styles.colHeader}>
                  <span>客户名称</span>
                  <span>负责人</span>
                </li>
              </ul>
              <ul className={styles.userlist}>
                {currentSelected.map((item, index) => (
                  <li key={item.custid + 'currentSelected' + index}>
                    <span title={item.custname}>{item.custname}</span>
                    <span title={item.managername}>{item.managername}</span>
                    <Icon type="close" onClick={this.remove.bind(this, item)} />
                  </li>
                ))}
              </ul>
            </Col>
          </Row>
        </Modal>
        <Modal
          title="客户合并"
          width={710}
          visible={this.state.confirmMerageVisible}
          onOk={this.confirmMergeHandleOk}
          onCancel={this.confirmMergeHandleCancel.bind(this)}>
          <div className={styles.mergeExplainInfo}>
            <i>注意</i>
            <p>执行客户合并操作后，原客户下的基础信息会进行合并，系统中若存在其他与原客户关联的数据，其对应的所属客户也会变更为合并后的客户名称。</p>
            <span>请选择主记录</span>
          </div>
          {
            this.state.confirmMerageData.map((item, index) => {
              const cls = classnames([styles.radio, {
                [styles.radioActive]: item.active ? true : false
              }]);
              return (
                <div className={styles.customList} key={'list' + index}>
                  <div className={styles.radioContent} onClick={this.radioSelectHandler.bind(this, index)}><span className={cls}></span></div>
                  <ul className={styles.merageCustomListWrap}>
                    <li>客户名称:<span title={item.custname}>{item.custname}</span></li>
                    <li>客户负责人:<span title={item.managername}>{item.managername}</span></li>
                    <li>客户状态:<span title={item.custstatus_name}>{item.custstatus_name}</span></li>
                  </ul>
                </div>
              )
            })
          }
        </Modal>
      </div>
    );
  }
}

export default connect(
  state => {
    const { showModals } = state.entcommList;
    return {
      visible: /merage/.test(showModals)
    };
  },
  dispatch => {
    return {
      confirmMergeHandleOk(userId) {
        dispatch({ type: 'entcommList/addDone', payload: userId });
      },
      onCancel() {
        dispatch({ type: 'entcommList/showModals', payload: '' });
      }
    }
  }
)(MerageModal);
