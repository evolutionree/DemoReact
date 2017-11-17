import React from 'react';
import Page from '../../components/Page';
import FolderManage from './FolderManage';
import FileList from './FileList';
import styles from './Knowledge.less';

const contentStyle = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  padding: 0
};
function Knowledge({
  location,
  checkFunc
}) {
  return (
    <Page title="知识库" contentStyle={contentStyle}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.box}>
            <FolderManage location={location} checkFunc={checkFunc} />
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.box}>
            <FileList location={location} checkFunc={checkFunc} />
          </div>
        </div>
      </div>
    </Page>
  );
}

export default Knowledge;
