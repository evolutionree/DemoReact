import React, { PropTypes, Component } from 'react';
import { Button, Icon, Input, message } from 'antd';
import { DynamicTemplateView } from '../../components/DynamicForm';
import Avatar from '../Avatar';
import styles from './styles.less';

class ActivityBoard extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    user: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string
    }).isRequired,
    template: PropTypes.arrayOf(PropTypes.shape({
      fieldname: PropTypes.string,
      controltype: PropTypes.number
    })),
    templateData: PropTypes.object,
    children: PropTypes.node,
    likes: PropTypes.arrayOf(PropTypes.string).isRequired,
    comments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      user: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string.isRequired,
        icon: PropTypes.string
      }).isRequired,
      time: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired
    })).isRequired,
    onLike: PropTypes.func.isRequired,
    onComment: PropTypes.func.isRequired,
    onShowDetail: PropTypes.func
  };
  static defaultProps = {
    template: [],
    templateData: {},
    children: null
  };

  constructor(props) {
    super(props);
    this.state = {
      inputValue: ''
    };
  }

  onComment = () => {
    if (!this.state.inputValue) return message.error('请输入评论内容');
    this.props.onComment(this.state.inputValue);
    this.setState({ inputValue: '' });
  };

  onLike = () => {
    this.props.onLike();
  };

  renderTemplate = () => {
    const { template, templateData } = this.props;
    const fields = template.filter(field => !!field.fieldname);
    return (
      <DynamicTemplateView fields={fields} value={templateData} />
    );
    // return (
    //   <div className={styles.templatelist}>
    //     {fields.map(field => (
    //       <div className={styles.templateitem} key={field.fieldname}>
    //         <div className={styles.templatetitle}>{field.fieldname}</div>
    //         <div className={styles.templatecontent}>
    //           {this.renderField(templateData[field.fieldname], field.controltype)}
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // );
  };

  renderField = (value, controlType) => {
    return <span>{JSON.stringify(value)}</span>;
  };

  render() {
    const { title, time, user, likes, comments, onShowDetail, children } = this.props;
    return (
      <div className={styles.wrap}>
        <Button onClick={onShowDetail} className={styles.showdetailbtn} type="default">查看全部</Button>
        <div className={styles.titlebar}>
          <span className={styles.title}>{title}</span>
          <time className={styles.time}>{time}</time>
        </div>
        <div className={styles.main}>
          <div className={styles.userbar}>
            <Avatar
              style={{ width: '42px', height: '42px' }}
              image={`/api/fileservice/read?fileid=${user.icon}`}
            />
            <span className={styles.username}>{user.name}</span>
          </div>
          <div className={styles.content}>
            {children || this.renderTemplate()}
          </div>
          <div className={styles.likesbar}>
            <div>
              <Button size="small" onClick={this.onLike} ghost>
                <Icon type="like-o" />
                <span>赞{!!likes.length && `(${likes.length})`}</span>
              </Button>
              <Button size="small" ghost>
                <Icon type="message" />
                <span>评论{!!comments.length && `(${comments.length})`}</span>
              </Button>
            </div>
            {!!likes.length && (
              <p className={styles.likesusers}>{likes.join('、')}</p>
            )}
          </div>
          <ul className={styles.commentlist}>
            {comments.map(comment => (
              <li key={comment.id}>
                <Avatar
                  className={styles.commenticon}
                  style={{ width: '34px', height: '34px' }}
                  image={`/api/fileservice/read?fileid=${comment.user.icon}`}
                />
                <p className={styles.commenttitle}>
                  <span className={styles.commentuser}>{comment.user.name}</span>
                  <time className={styles.commenttime}>{comment.time}</time>
                </p>
                <p className={styles.commentcontent}>
                  {comment.content}
                </p>
              </li>
            ))}
          </ul>
          <div className={styles.inputbar}>
            <Input
              className={styles.input}
              type="textarea"
              placeholder="我也说一句"
              value={this.state.inputValue}
              onChange={evt => { this.setState({ inputValue: evt.target.value }); }}
            />
            <Button
              size="large"
              className={styles.btn}
              onClick={this.onComment}
            >
              评论
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ActivityBoard;
