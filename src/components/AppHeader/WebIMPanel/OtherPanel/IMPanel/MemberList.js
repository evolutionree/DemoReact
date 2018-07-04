/**
 * Created by 0291 on 2018/7/4.
 */
import React, { PropTypes, PureComponent } from 'react';
import { Dropdown, Menu, Input, Icon } from 'antd';
import classnames from 'classnames';
import { connect } from 'dva';
import Avatar from '../../../../Avatar';
import { getmembers } from '../../../../../services/structure';
import styles from './index.less';

class MemberList extends PureComponent {
  static propTypes = {
    groupId: PropTypes.string
  }

  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      list: []
    };
  }

  componentDidMount() {
    this.getGroupMembers(this.props.groupId);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.groupId !== this.props.groupId) {
      this.getGroupMembers(nextProps.groupId);
    }
  }

  getGroupMembers = (groupid) => {
    getmembers(groupid).then(result => {
      this.setState({
        list: result.data
      });
    }).catch(e => {
      console.error(e.message);
    });
  }

  render() {
    const { list } = this.state;
    return (
      <div className={styles.contactList}>
        <h3>
          群聊成员
        </h3>
        <ul>
          {
            list instanceof Array && list.map(item => {
              return (
                <li key={item.userid}>
                  <Avatar image={`/api/fileservice/read?fileid=${item.usericon}`} name={item.username} width={30} />
                  <span>{item.username}</span>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }
}

export default MemberList;
