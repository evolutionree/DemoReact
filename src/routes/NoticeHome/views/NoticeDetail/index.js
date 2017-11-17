import React, { PropTypes, Component } from 'react';
import { message, Spin } from 'antd';
import { queryNoticeInfo } from '../../../../services/notice';
import styles from './styles.less';

class index extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      noticeId: props.params.id,
      title: props.params.title,
      creator: '',
      updateTime: '',
      remark: '',
      cover: '',
      content: '',
      loading: true
    };
  }

  componentDidMount() {
    this.fetchDetail();
  }

  fetchDetail = () => {
    this.setState({ loading: true });
    queryNoticeInfo(this.state.noticeId).then(result => {
      this.setState({ loading: false });
      const { data } = result;
      this.setState({
        creator: data.creator,
        updateTime: data.onlivetime,
        content: data.msgcontent,
        headremark: data.headremark,
        headimg: data.headimg
      });
    }, err => {
      this.setState({ loading: false });
      message.error(err.message || '获取详情失败');
    });
  };

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <div>
          <div className={styles.title}>{this.state.title}</div>
          <div className={styles.metas}>
            <span>创建人：{this.state.creator}</span>
            <span>最后活动时间：{this.state.updateTime}</span>
          </div>
          {!!this.state.headimg && <div className={styles.headimg}>
            <img src={ "/api/fileservice/read?fileid=" + this.state.headimg} />
          </div>}
          <div className={styles.headremark}>{this.state.headremark}</div>
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: this.state.content }} />
        </div>
      </Spin>
    );
  }
}

export default index;

