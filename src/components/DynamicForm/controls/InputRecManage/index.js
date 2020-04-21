import React, { Component } from 'react';
import _ from 'lodash';
import { AutoComplete, message, Modal, Icon, Button } from 'antd';
import { dynamicRequest } from '../../../../services/common';
import BusinessInfo from '../../../../routes/CommerceQueries/BusinessInfo';
import styles from './index.less';

const list = [
  { key: '', title: '统一社会信用代码', content: '', span: 14 },
  { key: '', title: '组织机构代码', content: '', span: 10 },
  { key: '', title: '注册号', content: '', span: 14 },
  { key: '', title: '经营状态', content: '', span: 10 },
  { key: '', title: '公司类型', content: '', span: 14 },
  { key: 'startdate', title: '成立日期', content: '', span: 10 },
  { key: 'opername', title: '法定代表人', content: '', span: 14 },
  { key: '', title: '营业期限', content: '', span: 10 },
  { key: 'registcapi', title: '注册资本', content: '', span: 14 },
  { key: '', title: '发照日期', content: '', span: 10 },
  { key: '', title: '挂牌日期', content: '', span: 14 },
  { key: 'telephone', title: '董秘电话', content: '', span: 10 },
  { key: '', title: '登记机关', content: '', span: 24 },
  { key: '', title: '注册地址', content: '', span: 24 },
  { key: 'address', title: '办公地址', content: '', span: 24 },
  { key: '', title: '经营范围', content: '', span: 24 }
];

export default class InputRecManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      selectInfo: null,
      visible: false,
      loading: false
    };
    this.handleSearch = _.debounce(this.handleSearch, 500);
  }

  setValue = val => {
    this.props.onChange(val, true);
  };

  handleChange = (value) => {
    const { dataSource } = this.state;

    this.props.onChange(value);
    const match = dataSource.find(o => o.recname === value);
    this.setState({ selectInfo: match });
  }

  handleSearch = (value) => {
    const { dataSource } = this.state;

    if (dataSource.some(o => o.recname === value)) return;
    // if (value && value.length > 1)
    this.fetchList(value);
  }

  fetchList = (value) => {
    this.setState({ loading: true }, () => {
      // dynamicRequest('/api/dockingapi/getbusinesslist', { skipnum: 0, companyname: value })
      dynamicRequest('/api/dynamicentity/searchrepeat', {
        EntityId: this.props.entityId, // 客户资料实体ID
        CheckName: value,
        Exact: 0,
        SearchData: {}
      })
        .then(res => {
          // const { data: { items } } = res;
          const items = res.data;
          if (Array.isArray(items) && items.length) {
            this.setState({ dataSource: items, selectInfo: items.find(o => o.recname === value), loading: false });
          } else {
            this.setState({ dataSource: [], selectInfo: null, loading: false });
          }
        })
        .catch(e => {
          console.error(e.message);
          message.error(e.message);
          this.setState({ loading: false });
        });
    });
  }

  showModal = () => {
    const { value } = this.props;
    const { dataSource } = this.state;

    if (!value) return message.error('客户全称不能为空');

    const match = dataSource.find(o => o.recname === value);
    if (!match) return message.error('请确定公司名称是否正确');

    this.setState({ visible: true, selectInfo: match });
  }

  handleCancel = () => {
    this.setState({ visible: false, selectInfo: null });
  }

  handelOk = () => {
    const { backfill, jsEngine } = this.props;
    const { selectInfo } = this.state;

    if (Array.isArray(backfill) && backfill.length) {
      backfill.forEach(str => {
        const arr = str.split(':');

        jsEngine.setValue(arr[1], selectInfo[arr[0]]);
      });
    } else {
      message.error('实体未配置映射规则');
    }
  }

  render() {
    const { placeholder, value } = this.props;
    const { dataSource, selectInfo, visible, loading } = this.state;
    console.log('selectInfo', selectInfo);

    const businessList = list.map(item => ({
      ...item,
      content: selectInfo[item.key]
    }));

    return (
      <div className={styles.wrap}>
        <AutoComplete
          value={value}
          className={styles.input}
          dataSource={dataSource.map(o => o.recname)}
          onSelect={this.onSelect}
          onChange={this.handleChange}
          onSearch={this.handleSearch}
          placeholder={placeholder}
        />

        {loading ? <Icon type="loading" style={{ marginLeft: 5 }} /> : <div onClick={this.showModal} className={styles.icon} />}

        <Modal
          title="工商信息查询"
          width={'80%'}
          visible={visible}
          footer={[
            <Button key="cancel" type="default" size="large" onClick={this.handleCancel}>关闭</Button>,
            <Button key="submit" type="primary" size="large" onClick={this.handelOk}>回填</Button>
          ]}
        >
          <div className={styles.title}>
            <h3>{selectInfo.name}</h3>
            <span>在营(开业)企业</span>
          </div>
          <BusinessInfo list={businessList} />
        </Modal>
      </div>
    );
  }
}

