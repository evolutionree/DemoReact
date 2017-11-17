import React from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import { Button, Modal } from 'antd';
import FolderTree from './FolderTree';
import FolderFormModal from './FolderFormModal';
import styles from './Knowledge.less';

function FolderManager({
  queries,
  folder,
  addFolder,
  editFolder,
  delFolder,
  selectFolder,
  checkFunc
}) {
  const currentFolder = _.find(folder, ['folderid', queries.folderId]);
  const disableDel = currentFolder && currentFolder.nodepath === 0; // 不允许删除顶级节点
  return (
    <div className={styles.leftContent}>
      <div className={styles.subtitle}>
        目录
      </div>
      <div>
        {checkFunc('FolderAdd') && <Button size="default" onClick={addFolder}>新增</Button>}
        {checkFunc('FolderEdit') && <Button size="default" onClick={editFolder}>编辑</Button>}
        {checkFunc('FolderDelete') && <Button type="danger" size="default" onClick={delFolder} disabled={disableDel}>删除</Button>}
      </div>
      <div>
        <FolderTree
          data={folder}
          value={queries.folderId}
          onChange={selectFolder}
        />
      </div>
      <FolderFormModal />
    </div>
  );
}


export default connect(
  state => state.knowledge,
  dispatch => {
    return {
      addFolder() {
        dispatch({ type: 'knowledge/showModals', payload: 'addFolder' });
      },
      editFolder() {
        dispatch({ type: 'knowledge/showModals', payload: 'editFolder' });
      },
      delFolder() {
        Modal.confirm({
          title: '确定删除选中的目录吗？',
          onOk() {
            dispatch({ type: 'knowledge/delFolder' });
          }
        });
      },
      selectFolder(id, node) {
        dispatch({ type: 'knowledge/search', payload: { folderId: id } });
      }
    };
  }
)(FolderManager);
