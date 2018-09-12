/**
 * jingren
 */
import React, { PureComponent } from 'react';
import { Button, Select } from 'antd';
import styles from './index.less';
import { Link } from 'dva/router';
import { queryNoticeList } from '../../../../services/approvalNotice';

const Option = Select.Option;
const optionList = [
  { key: '-1', name: '全部' },
  { key: '0', name: '审批中' },
  { key: '1', name: '通过' },
  { key: '2', name: '不通过' }
];

class ApprovalNotice extends PureComponent {

  state = {
    data: null,
    emptyText: '暂无新的审批通知 ',
    clear: '清空',
    total: '查看更多',
    title: '审批通知',
    params: {
      entityId: "00000000-0000-0000-0000-000000000001",
      isAdvanceQuery: 1,
      menuId: "cdc16143-1420-4efa-9420-c7141ee13744",
      pageIndex: 1,
      pageSize: 10,
      searchData: {},
      searchOrder: "",
      viewType: 0
    }
  }

  componentDidMount() {
    const { params } = this.state;

    this.fetchList(params);
  }

  onClear = () => {
    if (!!this.state.data && confirm('确定清空吗？清空无法恢复，请谨慎操作！')) {
      this.setState({ data: null, emptyText: '已清空审批通知' })
    }
  }

  onSelectChange = type => {
    const { params } = this.state;
    const auditstatus = (type === '-1') ? null : parseInt(type);
    const mergeParams = {
      ...params,
      searchData: {
        auditstatus
      }
    }

    this.fetchList(mergeParams);
  };

  fetchList = (params) => {
    this.setState({ params });

    queryNoticeList(params).then(res => {
      this.setState({ data: res.data })
    })
    .catch(err => console.log(err))
  }

  render() {
    const { height = 200 } = this.props;
    const { clear, emptyText, total, title, data } = this.state;

    const listDom = !!data && (
      <div className={styles.contents}>
        {
          data.pagedata.map((item, index) => {
            return (
              <div className={styles.list} key={index}>
                <Link to='/'>
                  <font></font>
                  <span>{`【${item.auditstatus_name}】`}</span>
                  <span className={styles.text}>
                    我发起的客户审批，<span className={styles.weight}>{`${item.auditstatus_name}`}！</span>
                  </span>
                </Link>
              </div>
            );
          })
        }
        {
          data.pagedata.length > 5 ?
            <div className={styles.footer}>
              {`共${data.pagecount[0].total}条审批通知，点击`}
              <Link to='/'><span>{total}</span></Link>
            </div>
            : null
        }
      </div>
    )

    const showList = !!data ? //data是否存在
      listDom
      :
      <div className={styles.notNewMsg}>{emptyText}</div>; //没有数据

    return (
      <div className={styles.contains} style={{ height: height }}>
        <div className={styles.header}>
          <div>
            <span className={styles.title}>{title}</span>
            <Button onClick={this.onClear}>{clear}</Button>
          </div>
          <Select
            style={{ minWidth: '110px' }}
            defaultValue='-1'
            onChange={this.onSelectChange}
          >
            {
              Array.isArray(optionList)
                ?
                optionList.map(item => <Option key={item.key}>{item.name}</Option>)
                :
                null
            }
          </Select>
        </div>
        <div className={styles.warp} style={{ height: `${height - 60}px` }}>{showList}</div>
      </div>
    );
  }
}

export default ApprovalNotice;
