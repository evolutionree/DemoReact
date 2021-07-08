import React, { Component } from 'react';
import { Spin, message } from 'antd';
import { dynamicRequest } from '../../../../services/common';
import BusinessInfo from './BusinessInfo';

// 工商照面信息
export const keyArrs = [
  { key: 'name', title: '公司名称', content: '', span: 12 },
  { key: 'originalnamestr', title: '曾用名', content: '', span: 12 },
  { key: 'creditcode', title: '社会统一信用代码', content: '', span: 12 },
  { key: 'no', title: '工商注册号', content: '', span: 12 },
  { key: 'orgno', title: '组织机构代码', content: '', span: 12 },
  { key: 'econkind', title: '企业性质', content: '', span: 12 },
  { key: 'enttype', title: '企业类型', content: '', span: 12 },
  { key: 'status', title: '企业状态', content: '', span: 12 },
  { key: 'registcapi', title: '注册资本', content: '', span: 12 },
  { key: 'reccap', title: '实缴资本', content: '', span: 12 },
  { key: 'belongorg', title: '登记机关', content: '', span: 12 },
  { key: 'startdate', title: '成立日期', content: '', span: 12 },
  { key: 'opername', title: '法人名字', content: '', span: 12 },
  { key: 'isonstock', title: '是否IOP上市', content: '', span: 12 },
  { key: 'address', title: '地址', content: '', span: 24 },
  { key: 'scope', title: '经营范围', content: '', span: 24 },
];

class CommerceQueries extends Component {
  constructor(props) {
    super(props);
    this.state = {
      businessList: [],
      loading: true
    };
  }

  componentDidMount() {
    const { titleText, params: { country } } = this.props;
    dynamicRequest('/api/dockingapi/getbusinessdetail', { companyname: titleText, Country: country })
      .then((res) => {
        const businessList = keyArrs.map(item => ({
          ...item,
          content: res.data[item.key] || '-'
        }));
        this.setState({ businessList, loading: false });
      })
      .catch(e => {
        message.error(e.message);
        this.setState({ loading: false });
      });
  }

  render() {
    const { businessList, loading } = this.state;
    return (
      <Spin spinning={loading}>
        <div>
          <BusinessInfo list={businessList} />
        </div>
      </Spin>
    );
  }
}

export default CommerceQueries;
