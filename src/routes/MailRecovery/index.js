/**
 * Created by 0291 on 2017/12/13.
 */
import React from 'react';
import { Table, Select, Button, Form, Radio, Input, Checkbox } from 'antd';
import { connect } from 'dva';
import Page from '../../components/Page';
import Styles from './index.less';
import Search from "./Search";

const FormItem = Form.Item;
const Option = Select.Option;

const dataSource = [{
  key: '1',
  name: '胡彦斌',
  age: 32,
  address: '西湖区湖底公园1号'
}, {
  key: '2',
  name: '胡彦祖',
  age: 42,
  address: '西湖区湖底公园1号'
}];

const columns = [{
  title: '姓名',
  dataIndex: 'name',
  key: 'name',
}, {
  title: '年龄',
  dataIndex: 'age',
  key: 'age',
}, {
  title: '住址',
  dataIndex: 'address',
  key: 'address',
}];

class MailRecovery extends React.Component {
  static propTypes = {

  };
  static defaultProps = {

  };
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  fieldChangeHandler(formData) {
    console.log(formData)
  }

  render() {
    return (
      <Page title='邮件恢复'>
        <div>
          <Search onChange={this.fieldChangeHandler.bind(this)}/>
        </div>
        <div>
          <Table dataSource={dataSource} columns={columns} />
        </div>
      </Page>
    )
  }
}
const WrappedMailRecovery = Form.create()(MailRecovery);
export default connect(
  state => state.mailrecovery,
  dispatch => {
    return {

    };
  }
)(WrappedMailRecovery);
