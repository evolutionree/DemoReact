import React, { Component } from 'react';
import _ from 'lodash';
import { AutoComplete, message, Modal, Spin, Button } from 'antd';
import { dynamicRequest } from '../../../../services/common';
import BusinessInfo from '../../../../routes/CommerceQueries/BusinessInfo';
import styles from './index.less';

const list = [
  { title: '统一社会信用代码', content: '', span: 14 },
  { title: '组织机构代码', content: '', span: 10 },
  { title: '注册号', content: '', span: 14 },
  { title: '经营状态', content: '', span: 10 },
  { title: '公司类型', content: '', span: 14 },
  { title: '成立日期', content: '', span: 10 },
  { title: '法定代表人', content: '', span: 14 },
  { title: '营业期限', content: '', span: 10 },
  { title: '注册资本', content: '', span: 14 },
  { title: '发照日期', content: '', span: 10 },
  { title: '挂牌日期', content: '', span: 14 },
  { title: '董秘电话', content: '', span: 10 },
  { title: '登记机关', content: '', span: 24 },
  { title: '注册地址', content: '', span: 24 },
  { title: '办公地址', content: '', span: 24 },
  { title: '经营范围', content: '', span: 24 }
];

export default class InputRecManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      visible: false,
      modalLoading: false,
      modalVisible: false
    };
    this.handleSearch = _.debounce(this.handleSearch, 500);
  }

  setValue = val => {
    this.props.onChange(val, true);
  };

  onSelect = (value) => {
    console.log('onSelect', value);
    this.props.onChange(value);
  }

  handleSearch = (value) => {
    console.log('handleSearch', value);
    this.props.onChange(value);
    this.fetchList(value);
  }

  fetchList = async (companyname) => {
    const { data: { items } } = await dynamicRequest('/api/dockingapi/getbusinesslist', { skipnum: 15, companyname }).catch(e => {
      console.error(e.message);
      message.error(e.message);
    });
    if (Array.isArray(items) && items.length) {
      this.setState({ dataSource: items.map(o => o) });
    }
  }

  render() {
    const { placeholder, value } = this.props;
    const { dataSource, modalVisible, modalLoading } = this.state;

    return (
      <div className={styles.wrap}>
        <AutoComplete
          value={value}
          className={styles.input}
          dataSource={dataSource}
          onSelect={this.onSelect}
          onSearch={this.handleSearch}
          placeholder={placeholder}
        />
        <div onClick={() => this.setState({ modalVisible: true })} className={styles.icon} />

        <Modal
          title="工商信息查询"
          width={'80%'}
          visible={modalVisible}
          footer={[
            <Button key="cancel" type="primary" size="large" onClick={() => this.setState({ modalVisible: false })}>关闭</Button>,
            <Button key="submit" type="primary" size="large" onClick={this.ok}>回填</Button>
          ]}
        >
          <Spin spinning={modalLoading}>
            <div className={styles.title}>
              <h3>达瑞生物技术股份有限公司</h3>
              <span>在营(开业)企业</span>
            </div>
            <BusinessInfo list={list} />
          </Spin>
        </Modal>
      </div>
    );
  }
}

