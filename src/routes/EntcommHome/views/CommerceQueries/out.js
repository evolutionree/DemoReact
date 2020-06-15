import React, { Component } from 'react';
import { Spin, message } from 'antd';
import { dynamicRequest } from '../../../../services/common';
import BusinessInfo from './BusinessInfo';

// 工商照面信息
export const keyArrs = [
  { key: 'id3a', title: '3A编码', content: '', span: 12 },
  { key: 'companyName', title: '企业名称', content: '', span: 12 },
  { key: 'tradingName', title: '贸易名称', content: '', span: 12 },
  { key: 'aliasName', title: '别名', content: '', span: 12 },
  { key: 'countryCode', title: '国家代码', content: '', span: 12 },
  { key: 'country', title: '国家', content: '', span: 12 },
  { key: 'stateProvince', title: '省或州', content: '', span: 12 },
  { key: 'city', title: '城市', content: '', span: 12 },
  { key: 'region', title: '区域', content: '', span: 12 },
  { key: 'street', title: '街道', content: '', span: 12 },
  { key: 'postCode', title: '邮政编码', content: '', span: 12 },
  { key: 'website', title: '网站', content: '', span: 12 },
  { key: 'email', title: '邮箱', content: '', span: 12 },
  { key: 'telephone', title: '电话', content: '', span: 12 },
  { key: 'status', title: '状态', content: '', span: 12 },
  { key: 'listed', title: '是否上市', content: '', span: 12 },
  { key: 'typeOfEntity', title: '企业类型', content: '', span: 12 },
  { key: 'dateOfIncorporation', title: '公司成立日期', content: '', span: 12 },
  { key: 'salesLastYear', title: '销售年度', content: '', span: 12 },
  { key: 'lastYear', title: '最后一年', content: '', span: 12 }
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
    dynamicRequest('/api/dockingapi/getforebusinessdetail', { companyname: titleText, Country: country })
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
