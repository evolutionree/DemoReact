import React, { Component } from 'react';
import _ from 'lodash';
import { AutoComplete, message, Modal, Icon, Button, Spin } from 'antd';
import { dynamicRequest } from '../../../../services/common';
import { __list } from '../../../../routes/EntcommHome/views/CommerceQueries/common';
import BusinessInfo from '../../../../routes/EntcommHome/views/CommerceQueries/BusinessInfo';
import styles from './index.less';
import gong from './gong.png';

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
    const match = dataSource.find(o => o.name === value);
    this.setState({ selectInfo: match });
  }

  handleSearch = (value) => {
    const { dataSource } = this.state;

    if (dataSource.some(o => o.name === value)) return;
    if (value && value.length > 1) {
      this.fetchList(value);
    }
  }

  fetchList = (value) => {
    this.setState({ loading: true }, () => { // 业务上不考虑同名公司情况，新增数据要对名称查重
      dynamicRequest('/api/dockingapi/getbusinesslist', { skipnum: 0, companyname: value })
        .then(res => {
          const { data: { items } } = res;
          if (Array.isArray(items) && items.length) {
            this.setState({ dataSource: items, selectInfo: items.find(o => o.name === value), loading: false });
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

    const match = dataSource.find(o => o.name === value);
    if (!match) return message.error('请确定公司名称是否正确');

    this.setState({ visible: true, modalLoading: true }, async () => {
      const res = await dynamicRequest('/api/dockingapi/getbusinessdetail', { companyname: value }).catch(e => {
        console.error(e.message);
        message.error(e.message);
        this.setState({ modalLoading: false });
      });
      this.setState({ modalLoading: false });
      const selectInfo = res.data;
      if (selectInfo) this.setState({ selectInfo });
    });
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
        console.log(arr[1], selectInfo, arr[0], selectInfo[arr[0]]);
        jsEngine.setValue(arr[1], selectInfo[arr[0]]);
      });
      jsEngine.excuteJS('var aaa = 1;');
      this.setState({ visible: false });
    } else {
      message.error('实体未配置映射规则');
    }
  }

  render() {
    const { placeholder, value } = this.props;
    const { dataSource, selectInfo, visible, loading, modalLoading } = this.state;

    const businessList = __list.map(item => ({
      ...item,
      content: selectInfo ? selectInfo[item.key] : '(空)'
    }));

    return (
      <div className={styles.wrap}>
        <AutoComplete
          value={value}
          className={styles.input}
          dataSource={dataSource.map(o => o.name)}
          onSelect={this.onSelect}
          onChange={this.handleChange}
          onSearch={this.handleSearch}
          placeholder={placeholder}
        />

        {loading ? <Icon type="loading" style={{ marginLeft: 5 }} /> : <img src={gong} alt="gong" onClick={this.showModal} className={styles.icon} />}

        <Modal
          title="工商信息查询"
          width={'80%'}
          visible={visible}
          onCancel={this.handleCancel}
          footer={[
            <Button key="cancel" type="default" size="large" onClick={this.handleCancel}>关闭</Button>,
            <Button key="submit" type="primary" size="large" onClick={this.handelOk}>回填</Button>
          ]}
        >
          <Spin spinning={modalLoading}>
            <div className={styles.title}>
              <h3>{selectInfo && selectInfo.name}</h3>
              <span>在营(开业)企业</span>
            </div>
            <BusinessInfo list={businessList} />
          </Spin>
        </Modal>
      </div>
    );
  }
}

