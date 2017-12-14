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

const titleStyle = {
  display: 'inline-block',
  maxWidth: '600px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const columns = [{
  title: '发件人',
  dataIndex: 'sender',
  key: 'sender',
  render: (obj) => {
    return <span>{obj.displayname}</span>;
  }
}, {
  title: '收件人',
  dataIndex: 'receivers',
  key: 'receivers',
  render: (receiversArray) => {
    const receivers = receiversArray && receiversArray instanceof Array && receiversArray.map(item => item.displayname);
    return <span style={titleStyle} title={receivers.join(',')}>{receivers.join(',')}</span>;
  }
}, {
  title: '主题',
  dataIndex: 'title',
  key: 'title'
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
    });
  }

  serchList() {
    this.searchRef.getWrappedInstance().validateFields((err, fieldsValue) => {
      if (err) {
        message.warning('用户不能为空');
        return;
      }
      this.props.dispatch({ type: 'mailrecovery/search', payload: fieldsValue });
    });
  }

  recoveryMail() {
    this.props.dispatch({ type: 'mailrecovery/reconvermail' });
  }

  reset() {
    this.searchRef.getWrappedInstance().resetFields();
    this.setState({
      serchValue: null
    });
  }

  selectRowHandler(keys, items) {
    console.log(items)
    this.props.dispatch({ type: 'mailrecovery/putState', payload: {
      currItems: items
    } });
  }

  pageIndexChange(page, pageSize) {
    this.props.dispatch({ type: 'mailrecovery/changePageIndex', payload: page });
  }

  pageSizeChangeHandler(current, size) {
    this.props.dispatch({ type: 'mailrecovery/changePageSize', payload: size });
  }

  render() {
    const { currItems, total, pageSize, pageIndex, dataSource } = this.props;
    return (
      <Page title='邮件恢复' contentStyle={{ padding: 0 }}>
        <div className={Styles.formWrap}>
          <Search onChange={this.fieldChangeHandler.bind(this)} value={this.state.serchValue} ref={(ref) => {this.searchRef = ref }}/>
          <div className={Styles.btnWrap}>
            <Button type="primary" onClick={this.serchList.bind(this)}>搜索</Button>
            <Button type="primary" onClick={this.recoveryMail.bind(this)}>恢复邮件</Button>
            <Button type="primary" onClick={this.reset.bind(this)}>清空查询条件</Button>
          </div>
        </div>
        <div className={Styles.gridWrap}>
          <Table
            scroll={{ x: '100%' }}
            rowKey="mailid"
            dataSource={dataSource}
            rowSelection={{
              selectedRowKeys: currItems.map(item => item.mailid),
              onChange: this.selectRowHandler.bind(this)
            }}
            pagination={{
              pageSize,
              total: total,
              current: pageIndex,
              onChange: this.pageIndexChange.bind(this),
              onShowSizeChange: this.pageSizeChangeHandler.bind(this)
            }}
            columns={columns}
          />
        </div>
      </Page>
    );
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
