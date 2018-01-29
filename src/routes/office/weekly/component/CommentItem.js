/**
 * Created by 0291 on 2017/10/10.
 */
import React, { PropTypes, Component } from 'react';
import Styles from './weeklyListDetail.less';
import classnames from 'classnames';
import moment from 'moment';
import { Input, Button, message } from 'antd';
import Avatar from '../../../../components/Avatar';

class CommentItem extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      isShowInput: false
    };
  }

  commentParent() {
    this.setState({
      isShowInput: !this.state.isShowInput
    });
  }

  onComment(pcommentsid) {
    if (!this.state.inputValue) return message.warning('请输入评论内容');
    this.props.onCommentParent && this.props.onCommentParent(this.state.inputValue, pcommentsid);
    this.setState({ inputValue: '', isShowInput: false });
  }

  render() {
    const item = this.props.data;
    return (
      <div style={{ marginBottom: '10px' }}>
        <Avatar
          style={{ width: '42px', height: '42px', float: 'left', margin: '0 10px 0 0' }}
          image={`/api/fileservice/read?fileid=${item.usericon}&filetype=3`}
        />
        <div className={Styles.commentWrap}>{this.props.title}:<span style={{ paddingLeft: '10px' }}>{item.comments}</span></div>
        <div style={{ paddingLeft: '52px' }}>{moment(item.reccreated).format('YYYY年MM月DD HH:MM:SS')}<a style={{ paddingLeft: '10px' }} onClick={this.commentParent.bind(this, item.reccreator_name)}>评论</a></div>
        {
          this.state.isShowInput ? <div style={{ paddingLeft: '50px' }}>
            <Input
              className={Styles.input}
              type="textarea"
              placeholder="请输入一句话评论"
              value={this.state.inputValue}
              onChange={evt => { this.setState({ inputValue: evt.target.value }); }}
            />
            <Button
              size="large"
              className={Styles.btn}
              onClick={this.onComment.bind(this, item.commentsid)}>
              提交评论
            </Button>
          </div> : null
        }
      </div>
    );
  }
}

export default CommentItem;
