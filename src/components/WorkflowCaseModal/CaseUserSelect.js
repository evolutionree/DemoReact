import React, { PropTypes, Component } from 'react';
import _ from 'lodash';
import { Icon } from 'antd';
import Avatar from '../Avatar';
import UserSelectModal from './UserSelectModal';
import styles from './styles.less';

class CaseUserSelect extends React.Component {
  static propTypes = {
    value: PropTypes.arrayOf(PropTypes.number),
    onChange: PropTypes.func,
    users: PropTypes.array,
    limit: PropTypes.number,
    disabled: PropTypes.bool,
    isFreeUser: PropTypes.bool
  };
  static defaultProps = {
    disabled: false,
    isFreeUser: true
  };

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      showRemove: false
    };
  }

  handleOk = (userids) => {
    this.hideModal();
    this.props.onChange(userids);
  };

  showModal = () => {
    this.setState({ modalVisible: true });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  toggleRemove = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        showRemove: !prevState.showRemove
      };
    });
  };

  handleRemove = (item) => {
    this.props.onChange(this.props.value.filter(id => id !== item.userid));
  };

  render() {
    const { value, users, allUsers, limit, disabled } = this.props;
    let selectedUsers = [];
    if (value && value.length) {
      selectedUsers = value.map(userId => _.find(users, ['userid', userId])).filter(u => !!u);
    }
    return (
      <div className={styles.fieldwrap}>
        <ul className={styles.fieldusers}>
          {selectedUsers.map(user => (
            <li key={user.userid}>
              <Avatar
                image={`/api/fileservice/read?fileid=${user.usericon}&filetype=3`}
                style={{ width: '40px', height: '40px' }}
              />
              <span title={user.username}>{user.username}</span>
              {this.state.showRemove && (
                <Icon
                  type="close-circle"
                  className={styles.remove}
                  onClick={() => { this.handleRemove(user); }}
                />
              )}
            </li>
          ))}
          {(!limit || selectedUsers.length < limit) && !disabled && (
            <li onClick={this.showModal}>
              <img src="/img_icon_add.png" alt="" style={{ cursor: 'pointer' }} />
            </li>
          )}
          {!disabled && <li onClick={this.toggleRemove}>
            <img src="/img_icon_delete.png" alt="" style={{ cursor: 'pointer' }} />
          </li>}
        </ul>
        <UserSelectModal
          visible={this.state.modalVisible}
          selectedUsers={value}
          allUsers={allUsers}
          filterUsers={this.props.filterUsers}
          limit={limit}
          onOk={this.handleOk}
          onCancel={this.hideModal}
          isSearchLocal={!this.props.isFreeUser}
          zIndex={1002}
        />
      </div>
    );
  }
}

export default CaseUserSelect;
