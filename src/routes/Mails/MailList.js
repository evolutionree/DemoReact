import React, { PropTypes, Component } from 'react';
import { Table, Pagination, Select, Icon } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import ImgIcon from '../../components/ImgIcon';
import TinyPager from '../../components/TinyPager';
import { formatTime } from '../../utils';
import styles from './styles.less';

const Column = Table.Column;

class MailList extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  onDoubleClickRow = (mail) => {
    if (mail.ctype === 1005) {
      this.props.openEditMail('draft', [mail], mail.mailid);
      return;
    }
    this.props.showMailDetail(mail);
  };

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
          onRowDoubleClick={this.onDoubleClickRow}
        >
          <Column
            title={<ImgIcon marginLess name="mail" />}
            dataIndex="isread"
            render={val => <ImgIcon marginLess name={val ? 'mail-read' : 'mail-new'} />}
            width={34}
          />
          <Column
            className={styles.titleColumn}
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
          <Column
            title="主题"
            dataIndex="title"
            render={(val, record) => {
              const style = { maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
              return (
                <div style={style} title={val}>
                  {!!record.istag && <Icon type="star" style={{ color: '#ff9a2e', marginRight: '5px' }} />}
                  <span>{val ? val : '(没有主题)'}</span>
                </div>
              );
            }}
          />
          <Column
            title="发件人"
            dataIndex="sender"
            width={145}
            render={val => {
              const style = { width: '145px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
              return <div style={style}>{val.displayname || val.address}</div>;
            }}
          />
          <Column
            title="收件人"
            dataIndex="receivers"
            width={145}
            render={val => {
              if (!(val && val.length)) return '(没有收件人)';
              const title = val.map(item => item.displayname || item.address).join(', ');
              const ect = val.length > 1 ? `等${val.length}个人` : '';
              const style = { width: '145px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
              return <div title={title} style={style}>{val[0].displayname || val[0].address}{ect}</div>;
            }}
          />
          <Column
            title="时间"
            dataIndex="senttime"
            width={100}
            render={(val, record) => {
              const correctTime = time => ((!time || time === '0001-01-01 00:00:00') ? '' : time);
              const time = correctTime(record.receivedtime) || correctTime(record.senttime);
              return <span title={time}>{formatTime(time)}</span>;
            }}
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
      },
      openEditMail(showModalsName, mails, currentMailId) {
        dispatch({ type: 'mails/putState',
          payload: { showingPanel: showModalsName, currentMailId: currentMailId, modalMailsData: mails, editEmailPageFormModel: null, editEmailPageBtn: null, editEmailFormData: null } });
      }
    };
  }
)(MailList);

