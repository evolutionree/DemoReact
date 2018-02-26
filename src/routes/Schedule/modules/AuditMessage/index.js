import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { message } from 'antd';
import { getListData } from '../../../../services/entcomm';
import styles from './styles.less';
import Avatar from '../../../../components/Avatar';

class AuditMessage extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      list: [],
      pageIndex: 1,
      hasMore: true
    };
  }

  componentDidMount() {
    if (this.props.visible) {
      this.queryList(1);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.state.list.length && this.state.hasMore) {
      this.queryList(1);
    }
  }

  queryList(pageIndex) {
    const params = {
      entityid: '00000000-0000-0000-0000-000000000001',
      pageindex: pageIndex,
      pagesize: 10,
      menuid: '6d1dad42-9301-49cf-b9c8-79c108937a2e', // 收到的审批申请
      viewtype: 0,
      searchorder: '',
      searchdata: {
        auditstatus: 0 // 审批中
      },
      isadvancequery: 1
    };
    this.setState({ loading: true });
    getListData(params).then(result => {
      const list = pageIndex === 1
        ? result.data.pagedata
        : [...this.state.list, ...result.data.pagedata];
      this.setState({
        loading: false,
        list: list,
        hasMore: result.data.pagecount[0].total > list.length
      });
    }, err => {
      this.setState({ loading: false });
      message.error(err.message || '获取数据失败');
    });
  }

  render() {
    const { list } = this.state;
    return (
      <div style={{ height: this.props.height + 'px', overflow: 'auto' }}>
        <ul className={styles.list}>
          {list.map(item => (
            <li className={styles.listItem}>
              <div className={styles.itemAvatar}>
                <Avatar image={item.headicon} width={30} />
              </div>
              <div className={styles.itemContent}>{item.content}</div>
              <div className={styles.itemInfo}>
                <span>{item.flowType}</span>
                <Link to={`/affair/${item.id}`}>{item.flowName}</Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default connect(
  state => {
    const { activeModule } = state.schedule;
    return {
      visible: activeModule === 'audit'
    };
  }
)(AuditMessage);
