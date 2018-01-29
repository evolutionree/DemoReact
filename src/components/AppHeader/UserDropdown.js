import React from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Modal } from 'antd';
import Avatar from '../Avatar';
import styles from './styles.less';

function UserDropdown({ isLogin, user, dispatch }) {
  function handleMenuClick(event) {
    switch (event.key) {
      case '1':
        dispatch({ type: 'app/showModals', payload: 'userFeedBack' });
        break;
      case '2':
        dispatch({ type: 'app/showModals', payload: 'avatar' });
        break;
      case '3':
        dispatch({ type: 'app/showModals', payload: 'password' });
        break;
      case '4':
        dispatch({ type: 'app/clearServerCache' });
        break;
      case '5':
        Modal.confirm({
          title: '确定退出当前帐号？',
          onOk() {
            dispatch({ type: 'app/logout' });
          }
        });
        break;
      default:
    }
  }

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1" className={styles.menuItem}>用户反馈</Menu.Item>
      <Menu.Item key="2" className={styles.menuItem}>修改头像</Menu.Item>
      <Menu.Item key="3" className={styles.menuItem}>修改密码</Menu.Item>
      <Menu.Item key="4" className={styles.menuItem}>清除缓存</Menu.Item>
      <Menu.Item key="5" className={styles.menuItem}>退出登录</Menu.Item>
    </Menu>
  );

  let image = '';
  let userName = '未登录';

  if (user && user.username) {
    image = `/api/fileservice/read?fileid=${user.usericon}&filetype=3`;
    userName = user.username;
  }

  return (
    <Dropdown overlay={menu}>
      <div className={styles.userDropdown}>
        <Avatar image={image} width={37} name={userName} />
        <span title={userName}>{userName}</span>
      </div>
    </Dropdown>
  );
}

export default connect(state => state.app)(UserDropdown);
