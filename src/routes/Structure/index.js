import React from 'react';
import Page from '../../components/Page';
import DepartmentManager from './DepartmentManager';
import UserList from './UserList';
import UserFormModal from './UserFormModal';
import AssignRoleModal from './AssignRoleModal';
import ResetPasswordModal from './ResetPasswordModal';
import styles from './Structure.less';

const contentStyle = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  padding: 0
};
function Structure({
    checkFunc
  }) {
  return (
    <Page title="团队组织" contentStyle={contentStyle}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.box}>
            <DepartmentManager checkFunc={checkFunc} />
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.box}>
            <UserList checkFunc={checkFunc} />
          </div>
        </div>
      </div>
      <UserFormModal />
      <AssignRoleModal />
      <ResetPasswordModal />
    </Page>
  );
}

export default Structure;
