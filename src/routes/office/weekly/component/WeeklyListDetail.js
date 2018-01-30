/**
 * Created by 0291 on 2017/9/25.
 */
import React, { PropTypes, Component } from 'react';
import Styles from './weeklyListDetail.less';
import { connect } from 'dva';
import { Input, Button, message, Dropdown, Menu, Icon } from 'antd';
import Avatar from '../../../../components/Avatar';
import { DynamicTemplateView } from '../../../../components/DynamicForm';
import moment from 'moment';
import CommentItem from './CommentItem';

class WeeklyListDetail extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      inputValue: ''
    };
  }

  onComment = () => {
    if (!this.state.inputValue) return message.warning('请输入评论内容');
    this.props.onComment && this.props.onComment(this.state.inputValue);
    this.setState({ inputValue: '' });
  };

  onCommentParent = (...props) => {
    this.props.onCommentParent && this.props.onCommentParent(...props);
  };

  dropDownClick = (recid, weektype, { key }) => {
    switch (key) {
      case '详情':
        this.props.seeView && this.props.seeView(recid, weektype);
        break;
      case '编辑':
        this.props.edit && this.props.edit(recid, weektype);
        break;
      case '周总结':
        this.props.addSummary && this.props.addSummary(recid);
        break;
      default:

    }
  }

  getCommentTitle(commentItem) {
    if (commentItem.pcommentsid === '00000000-0000-0000-0000-000000000000') { //最外层 评论的是周报日报
      return <span className={Styles.User}>{commentItem.reccreator_name}</span>;
    } else { //评论某个用户
      const parentNameArray = this.props.commentList instanceof Array && this.props.commentList.filter((item) => {
        if (commentItem.pcommentsid === item.commentsid) {
          return item.reccreator_name;
        }
      });
      const parentName = parentNameArray instanceof Array && parentNameArray.length > 0 && parentNameArray[0].reccreator_name;
      return <span><span className={Styles.User}>{commentItem.reccreator_name}</span> 回复 <span className={Styles.User}>{parentName}</span></span>;
    }
  }

  render() {
    const data = this.props.data;

    let weektype_name = '';
    if (data.weektype === 0) {
      weektype_name = '周计划';
    } else if (data.weektype === 1) {
      weektype_name = '周总结';
    }

    const menu = (
      <Menu onClick={this.dropDownClick.bind(this, data.recid, data.weektype)}>
        {
          this.props.dropMenu && this.props.dropMenu instanceof Array && this.props.dropMenu.map((item) => {
            return (
              <Menu.Item key={item}>
                <a>{item}</a>
              </Menu.Item>
            );
          })
        }
      </Menu>
    );

    return (
      <div className={Styles.wrapContent}>
        <div className={Styles.header}>
          <span className={Styles.title}>{weektype_name}</span>
          <time className={Styles.time}>{data.reccreated}</time>
        </div>
        <div className={Styles.body}>
          <div className={Styles.userbar}>
            <Avatar
              style={{ width: '42px', height: '42px' }}
              image={`/api/fileservice/read?fileid=${data.usericon}&filetype=3`}
            />
            <span className={Styles.username}>{data.reccreator_name}</span>
            {
              this.props.dropMenu && this.props.dropMenu instanceof Array && this.props.dropMenu.length > 0 ?
                <Dropdown overlay={menu} placement="bottomRight">
                    <span style={{ float: 'right' }}>
                      <Icon type="bars" />
                      <Icon type="down" />
                    </span>
                </Dropdown> : null
            }
          </div>
          <div>
            <DynamicTemplateView fields={this.props.detailFields && this.props.detailFields.filter(field => field.fieldname !== 'viewusers' && field.fieldname !== 'copyusers' && field.fieldname !== 'reportdate')} value={this.props.detailValue} />
            <div className={Styles.users_name}>批阅人：{data.viewusers_name}</div>
            <div className={Styles.users_name}>抄送人：{data.copyusers_name}</div>
          </div>
        </div>
        <div className={Styles.footer}>
          <div>
            {
              this.props.commentList instanceof Array && this.props.commentList.map((item, index) => {
                return (
                  <CommentItem data={item} key={index} onCommentParent={this.onCommentParent} title={this.getCommentTitle(item)}></CommentItem>
                );
              })
            }
          </div>
          <Input
            className={Styles.input}
            type="textarea"
            placeholder="我也说一句"
            value={this.state.inputValue}
            onChange={evt => { this.setState({ inputValue: evt.target.value }); }}
          />
          <Button
            size="large"
            className={Styles.btn}
            onClick={this.onComment}>
            回复
          </Button>
        </div>
      </div>
    );
  }
}

export default connect(
  state => state.weekly,
  dispatch => {
    return {
      seeView(recid, weektype) {
        dispatch({ type: 'weekly/putState', payload: { myWeeklyOrSummaryRecid: recid } });
        if (weektype === 0) { //查看周计划
          dispatch({ type: 'weekly/showModals', payload: 'viewWeeklyDetail' });
        } else {
          dispatch({ type: 'weekly/showModals', payload: 'viewSummaryDetail' });
        }
      },
      addSummary(recid) {
        dispatch({ type: 'weekly/putState', payload: { myWeeklyOrSummaryRecid: recid } });
        dispatch({ type: 'weekly/showModals', payload: 'addSummary' });
      },
      edit(recid, weektype) {
        dispatch({ type: 'weekly/putState', payload: { myWeeklyOrSummaryRecid: recid } });
        if (weektype === 0) { //编辑周计划
          dispatch({ type: 'weekly/showModals', payload: 'editWeekly' });
        } else {
          dispatch({ type: 'weekly/showModals', payload: 'editSummary' });
        }
      }
    };
  }
)(WeeklyListDetail);
