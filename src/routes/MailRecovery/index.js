/**
 * Created by 0291 on 2017/12/13.
 */
import React from 'react';
import { Table, Select, Button, Form, Radio, Input, Checkbox, message } from 'antd';
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
      serchValue: null
    };
  }

  componentWillMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  fieldChangeHandler(serchValue) {
    if (serchValue.KeyWord && serchValue.KeyWord.length > 20) {
      message.warning('关键字限制20个字符键入');
      serchValue.KeyWord = serchValue.KeyWord.substring(0, 20);
    }
    this.setState({
      serchValue: serchValue
    })
  }

  serchList() {
    this.searchRef.getWrappedInstance().validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      console.log(fieldsValue)
      this.props.dispatch({ type: 'mailrecovery/queryList', payload: fieldsValue });
    });
  }

  recoveryMail() {

  }

  reset() {
    this.searchRef.getWrappedInstance().resetFields();
  }

  render() {
    return (
      <Page title='邮件恢复'>
        <div>
          <Search onChange={this.fieldChangeHandler.bind(this)} value={this.state.serchValue} ref={(ref) => {this.searchRef = ref }}/>
          <div className={Styles.btnWrap}>
            <Button type="primary" onClick={this.serchList.bind(this)}>搜索</Button>
            <Button type="primary" onClick={this.recoveryMail.bind(this)}>恢复邮件</Button>
            <Button type="primary" onClick={this.reset.bind(this)}>清空查询条件</Button>
          </div>
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
      dispatch
    };
  }
)(WrappedMailRecovery);
