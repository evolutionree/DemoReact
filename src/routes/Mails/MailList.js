import React, { PropTypes, Component } from 'react';
import { Table, Pagination, Select, Icon } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import ImgIcon from '../../components/ImgIcon';
import TinyPager from '../../components/TinyPager';
import { formatTime} from '../../utils';
import styles from './styles.less';

const Column = Table.Column;

class MailList extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { mailList, mailTotal, mailSelected, mailPageIndex, mailPageSize, mailDetailData } = this.props;
    return (
      <div className={styles.mailList}>
        <Table
          size="small"
          bordered={false}
          rowKey="mailid"
          dataSource={mailList}
          pagination={false}
          rowClassName={record => classnames({
            [styles.selectedrow]: !!(mailDetailData && mailDetailData.mailId === record.mailid),
            [styles.readrow]: !!record.isread
          })}
          rowSelection={{
            selectedRowKeys: mailSelected.map(item => item.mailid),
            onChange: (keys, items) => this.props.selectMails(items)
          }}
          onRowClick={this.props.toggleMailCurrent}
          onRowDoubleClick={this.props.showMailDetail}
        >
          <Column
            title={<ImgIcon marginLess name="mail" />}
            dataIndex="isread"
            render={val => <ImgIcon marginLess name={val ? 'mail-read' : 'mail-new'} />}
            width={34}
          />
          <Column
            title={<ImgIcon marginLess name="attachment" />}
            dataIndex="attachcount"
            render={val => (val ? <ImgIcon marginLess name="attachment" /> : null)}
            width={34}
          />
          {/*<Column*/}
            {/*title={<Icon type="paper-clip" style={{}} />}*/}
            {/*dataIndex="attachcount"*/}
            {/*render={val => (val ? <Icon type="paper-clip" style={{}} /> : null)}*/}
            {/*width={34}*/}
          {/*/>*/}
          <Column title="主题" dataIndex="title" render={(val, record) => (
            <div>
              {!!record.istag && <Icon type="star" style={{ color: '#ff9a2e', marginRight: '5px' }} />}
              <span>{val}</span>
            </div>
          )} />
          <Column title="发件人" dataIndex="sender.displayname" />
          <Column
            title="收件人"
            dataIndex="receivers"
            render={val => val.map(item => item.displayname || item.mailaddress).join(', ')}
          />
          <Column
            title="时间"
            dataIndex="senttime"
            render={(val, record) => formatTime(record.receivedtime) || formatTime(record.senttime)}
          />
        </Table>
        <TinyPager
          style={{ position: 'absolute', left: '0', right: '0', bottom: '0' }}
          current={mailPageIndex}
          pageSize={mailPageSize}
          total={mailTotal}
          onChange={page => this.props.search({ mailPageIndex: page })}
          onPageSizeChange={val => this.props.search({ mailPageIndex: 1, mailPageSize: val })}
        />
      </div>
    );
  }
}

export default connect(
  state => state.mails,
  dispatch => {
    return {
      search(obj) {
        dispatch({ type: 'mails/search', payload: obj });
      },
      selectMails(mails) {
        dispatch({ type: 'mails/putState', payload: { mailSelected: mails } });
      },
      toggleMailCurrent(mail) {
        dispatch({ type: 'mails/putState', payload: { mailCurrent: mail } });
        dispatch({ type: 'mails/mailPreview__', payload: mail });
      },
      showMailDetail(mail) {
        dispatch({ type: 'mails/showMailDetail', payload: mail });
      }
    };
  }
)(MailList);

