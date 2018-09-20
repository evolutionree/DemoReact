/**
 * 0920
 */
import React, { PropTypes, PureComponent } from 'react';
import { Select, Input, Card, Button, Spin, Pagination, Menu, Dropdown, Icon, BackTop, Alert } from 'antd';
import { queryDynamiclist, queryMainTypeList, queryRelatedEntityList } from '../../../../services/dynamiclist';
import { likeEntcommActivity, commentEntcommActivity } from '../../../../services/entcomm';
import ActivityBoard from '../../../../components/ActivityBoard';
import styles from './index.less';

const Item = Menu.Item;
const Option = Select.Option;

// 组织范围 DataRangeType
const selectDataList = [
  { key: '1', name: '我的动态' },
  { key: '2', name: '我的部门' },
  { key: '3', name: '下级部门' },
  { key: '4', name: '指定部门' },
  { key: '5', name: '指定员工' },

];

// 时间范围 TimeRangeType
const selectTimeList = [
  { key: '1', name: '当天' },
  { key: '2', name: '本周' },
  { key: '3', name: '本月' },
  { key: '4', name: '本季度' },
  { key: '5', name: '本年' },
  { key: '6', name: '昨天' },
  { key: '7', name: '上周' },
  { key: '8', name: '上月' },
  { key: '9', name: '上季度' },
  { key: '10', name: '去年' },
  { key: '11', name: '指定年' },
  { key: '12', name: '指定时间范围' },
]

class Filtrate extends PureComponent {
  static propTypes = {
    height: PropTypes.number.isRequired,
  }

  state = {
    tipSwitch: false,
    tipMessage: '',
    mainTypeList: null, // 主实体类型列表
    relatedEntityList: null, // 关联实体类型列表
    dataSource: null, // 过滤列表
    params: { // 初始化配置参数
      DataRangeType: '2',
      TimeRangeType: '4',
      MainEntityId: '00000000-0000-0000-0000-000000000000',
      SearchKey: '',
      RelatedEntityId: '00000000-0000-0000-0000-000000000000',
      PageSize: '10',
      PageIndex: '1'
    },
  }

  setStateAsync = state => new Promise(resolve => this.setState(state, resolve));

  componentDidMount() {

    this.getMainTypeList(); // 获取主实体列表
    this.initConfigs(); // 初始化过滤配置
    this.getDynamiclist(); // 初始化过滤数据

  }

  handleChange = value => {
    console.log(`selected ${value}`);
  }

  initConfigs = async () => {
    const { params } = this.state;
    const filtrateConfig = localStorage.getItem('filtrateConfig');

    if (filtrateConfig) {
      await this.setStateAsync({params: JSON.parse(filtrateConfig)});

      const { params } = this.state;
      queryRelatedEntityList({EntityId: params.MainEntityId})
      .then((res) => {
        this.setState({relatedEntityList: res.data});
      }).catch(err => console.log(err));

      return false;
    }

    localStorage.setItem('filtrateDefaultConfig', JSON.stringify(params));
  }

  getMainTypeList = () => {
    queryMainTypeList()
    .then((res) => {
      this.setState({mainTypeList: res.data});
    })
    .catch(err => console.log(err));
  }

  getDynamiclist = async () => {
    await this.setStateAsync({dataSource: null});

    const { params } = this.state;
    queryDynamiclist(params)
    .then((res) => {
      this.setState({dataSource: res.data});
    }).catch(err => console.log(err));
  }
  
  mergeParams = (obj) => {
    const { params } = this.state;
    
    const newObj = typeof obj === 'object' ? obj : {}
    const newParams = {...params, ...newObj}
    this.setState({params: newParams});
  }

  changeMainType = value => {
    this.mergeParams({MainEntityId: value});

    // 请求动态实体列表
    queryRelatedEntityList({EntityId: value})
    .then((res) => {
      this.setState({relatedEntityList: res.data});
    }).catch(err => console.log(err));
  }

  changeRelatedEntityType = value => {
    this.mergeParams({RelatedEntityId: value});
  }

  search = () => {
    this.getDynamiclist();
  }

  onSaveConfigs = async ({ key }) => {
    const { params } = this.state;
    switch(key) {
      case '1':
        localStorage.setItem('filtrateConfig', JSON.stringify(params));
        this.showTips('当前配置已保存！');
        break
      case '2':
        localStorage.removeItem('filtrateConfig');
        const filtrateDefaultConfig = localStorage.getItem('filtrateDefaultConfig');
        await this.setState({params: JSON.parse(filtrateDefaultConfig)});
        this.showTips('配置已重置成功！');
        break
    }
  }

  showTips(tipMessage) {
    this.setState({tipSwitch: true, tipMessage})
    setTimeout(() => this.setState({tipSwitch: false}), 1000)
  }

  renderHeaders() {
    return (
      <div className={styles.header}>
        <div className={styles.margins}>
          <Select
            style={{ width: '120px' }}
            defaultValue={selectDataList[1].key}
            onChange={this.handleChange}
            disabled
          >
            {selectDataList.map(item => {
              return <Option value={item.key} key={item.key}>{item.name}</Option>;
            })}
          </Select>
        </div>

        <div className={styles.margins}>
          <Select
            style={{ width: '120px' }}
            defaultValue={selectTimeList[3].key}
            onChange={this.handleChange}
            disabled
          >
            {selectTimeList.map(item => {
              return <Option value={item.key} key={item.key}>{item.name}</Option>;
            })}
          </Select>
        </div>

        <div className={styles.margins}>
          {this.renderMainTypeElms()}
        </div>

        <div className={styles.margins}>
          {this.renderRelatedElms()}
        </div>

        <div className={styles.margins}>
          <Button
            type='primary'
            icon="search"
            onClick={this.search}
          >
            查询
          </Button>
        </div>

        <div className={styles.margins}>
          
        </div>
      </div>
    )
  }

  renderMainTypeElms() {
    const { mainTypeList, params } = this.state;

    const renderMainTypeElms = !!mainTypeList ? (
      <Select
        style={{ width: '120px' }}
        defaultValue={params.MainEntityId}
        onChange={this.changeMainType}
        showSearch
      >
        {mainTypeList.map((item, idx) => <Option value={item.entityid} key={idx}>{item.entityname}</Option>)}
      </Select>
    ) : null

    return renderMainTypeElms;
  }
  
  renderRelatedElms() {
    const { relatedEntityList, params } = this.state;
    const renderrelatedElm = relatedEntityList && (
      <div className={styles.relatedEntity}>

        <div className={styles.mainInput}><Input /></div>

        <Select
          style={{ width: '120px' }}
          defaultValue={params.RelatedEntityId}
          onChange={this.changeRelatedEntityType}
        >
          {relatedEntityList.map((item, idx) => {
            return <Option value={item.entityid} key={idx}>{item.entityname}</Option>
          })}
        </Select>
      </div>
    )
    return renderrelatedElm;
  }

  renderExtra() {
    const menu = (
      <Menu onClick={this.onSaveConfigs}>
        <Item key="1">保存当前选项</Item>
        <Item key="2">重置默认选项</Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu}>
        <a className="ant-dropdown-link" href="javascript:;">
          配置 <Icon type="down" />
        </a>
      </Dropdown>
    )
  }

  renderList() {
    const { dataSource } = this.state;
    console.log(dataSource)
    const list = !!dataSource ? (
      dataSource.datalist.length === 0 ? <div className={styles.spins}>没有查询到相关数据，请重新过滤条件!</div> :
      dataSource.datalist.map((item, idx) => {
        const user = {
          id: item.reccreator,
          name: item.reccreator_name,
          icon: item.usericon
        };
        const comments = item.commentlist && item.commentlist.map(comm => ({
          id: comm.commentsid,
          user: {
            id: +comm.reccreator,
            name: comm.reccreator_name,
            icon: comm.reccreator_icon
          },
          time: comm.reccreated,
          content: comm.comments
        }));

        return (
          <ActivityBoard
            style={{ marginBottom: '24px' }}
            key={idx}
            title={item.entityname}
            time={item.reccreated}
            user={user}
            template={item.tempcontent}
            templateData={item.tempdata}
            likes={item.praiseusers}
            comments={comments || []}
            onLike={this.like.bind(this, item.dynamicid)}
            onComment={this.comment.bind(this, item.dynamicid)}
            // onShowDetail={showDynamicDetail.bind(null, item)}
          />
        )
      })
    ) : <div className={styles.spins}><Spin /></div>

    return list;
  }

  renderPagination() {
    const { dataSource, params } = this.state;

    if(dataSource) {
      const { pageinfo: { totalcount, pagesize } } = dataSource;
      let PageIndex = parseInt(params.PageIndex);

      return (
        <div className={styles.pagination}>
          <Pagination
            simple
            hideOnSinglePage
            current={PageIndex}
            total={totalcount}
            pageSize={pagesize}
            onChange={this.onChangePage}
          />
        </div>
      );
    }
  }

  like = (dynamicid) => {
    likeEntcommActivity(dynamicid)
    .then((res) => {
      console.log(res);
    })
    .catch(err => console.log(err))
  }

  comment = (dynamicid, content) => {
    const params = {
      dynamicid: dynamicid,
      comments: content
    };
    commentEntcommActivity(params)
    .then((res) => {
      console.log(res);
    })
    .catch(err => console.log(err))
  }

  onChangePage = (PageIndex) => {
    const { params: { pagecount } } = this.state;

    if(PageIndex >= pagecount) PageIndex = '1';

    this.mergeParams({PageIndex: PageIndex + ''});
    this.getDynamiclist();
  }

  render() {
    const { height = 660 } = this.props;
    const { tipSwitch, tipMessage } = this.state;
    return (
      <div className={styles.container}>
        <Card
          title={this.renderHeaders()}
          extra={this.renderExtra()}
        >
          <div id='filtrateScroll' className={styles.list} style={{ height: height - 128 }}>
            {this.renderList()}
            <BackTop className={styles.backtop} target={() => document.getElementById('filtrateScroll')}>
              <div className={styles.backTopInner}>UP</div>
            </BackTop>
          </div>
          {this.renderPagination()}
          {tipSwitch &&
            <div className={styles.alert}>
              <Alert showIcon message={tipMessage} type="success" />
            </div>
          }
        </Card>
      </div>
    );
  }
}

export default Filtrate;