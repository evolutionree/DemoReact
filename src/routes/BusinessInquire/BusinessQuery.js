import React from 'react';
import { connect } from 'dva';
import { Button, Icon, Input, Form, Select, Radio } from 'antd';
import Page from '../../components/Page';
import styles from './BusinessQuery.less';

class BusinessQuery extends React.Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    return (
      <Page title="工商查询">
        <div className={styles.pageContent}>
          <div className={styles.inputWrap}>
            <input className="ant-input" placeholder="请输入企业名称、人名，产品名等，多关键词用空格隔开，如“小米 雷军”" />
            <div>查一下</div>
          </div>
          <ul className={styles.body}>
            <li>
              <div className={styles.logo}>
                <img src="https://cc1.intsig.net/cc/qiye/vip/camfs/qxb/11111_7e0f6007fcaa3ea0e0a053ff001570f4" />
              </div>
              <div className={styles.companyInfo}>
                <div className={styles.title}>广州市玄武无线科技股份有限公司</div>
                <ul>
                  <li>
                    法定代表人：陈永辉
                  </li>
                  <li>
                    成立年限：2010-11-02 注册资本：5086万人民币
                  </li>
                  <li>
                    电话：61302222邮箱：853740903@qq.com
                  </li>
                  <li>
                    地址：广州市天河区体育西路103号维多利广场B塔32层
                  </li>
                </ul>
              </div>
            </li>

            <li>
              <div className={styles.logo}>
                <img src="https://cc1.intsig.net/cc/qiye/vip/camfs/qxb/11111_7e0f6007fcaa3ea0e0a053ff001570f4" />
              </div>
              <div className={styles.companyInfo}>
                <div className={styles.title}>广州市玄武无线科技股份有限公司</div>
                <ul>
                  <li>
                    法定代表人：陈永辉
                  </li>
                  <li>
                    成立年限：2010-11-02 注册资本：5086万人民币
                  </li>
                  <li>
                    电话：61302222邮箱：853740903@qq.com
                  </li>
                  <li>
                    地址：广州市天河区体育西路103号维多利广场B塔32层
                  </li>
                </ul>
              </div>
            </li>


            <li>
              <div className={styles.logo}>
                <img src="https://cc1.intsig.net/cc/qiye/vip/camfs/qxb/11111_7e0f6007fcaa3ea0e0a053ff001570f4" />
              </div>
              <div className={styles.companyInfo}>
                <div className={styles.title}>广州市玄武无线科技股份有限公司</div>
                <ul>
                  <li>
                    法定代表人：陈永辉
                  </li>
                  <li>
                    成立年限：2010-11-02 注册资本：5086万人民币
                  </li>
                  <li>
                    电话：61302222邮箱：853740903@qq.com
                  </li>
                  <li>
                    地址：广州市天河区体育西路103号维多利广场B塔32层
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </Page>
    );
  }
}

export default BusinessQuery;
