import React from 'react';
import { connect } from 'dva';
import { Row, Col, Button, Menu } from 'antd';
import * as _ from 'lodash';
import CodeEditor from '../../../../components/CodeEditor';
import DynamicLoadModal from '../../../../components/Modal/DynamicLoadModal';
import HistoryModal from '../../../../components/Modal/HistoryModal';
import styles from './EntityScripts.less';

const SPACENAME = 'entityScripts';

// const ScriptItem = ({ title, content, editingContent, editing, onChange, onClear, onEdit, onCancel }) => {
//   return (
//     <div className={styles.scriptItem}>
//       <div className={styles.scriptTitle}>
//         {title}
//       </div>
//       <div className={styles.scriptContent}>
//         <CodeEditor
//           value={editing ? editingContent : content}
//         />
//       </div>
//     </div>
//   );
// };

function EntityScripts({
  entityId,
  EntityAddNew,
  EntityEdit,
  EntityView,
  EntityCopyNew,
  showingScript,
  toggleShowing,
  onChange,
  onCancel,
  onShow,
  onEdit,
  onSave,
  onClear,
  showModals,
  initParams,
  historyList,
  fetchDataLoading
}) {
  const allScripts = [EntityAddNew, EntityEdit, EntityView, EntityCopyNew];
  const scriptItem = _.find(allScripts, ['name', showingScript]);
  const { title, name, content, editingContent, editing } = scriptItem;

  function selectSideMenu(e) {
    toggleShowing(e.key);
  }
  
  return (
    <div>
      <Row gutter={10}>
        <Col span={4}>
          <Menu 
            selectedKeys={[showingScript]}
            style={{ overflowY: 'auto', overflowX: 'hidden' }}
            onSelect={selectSideMenu}
          >
            {allScripts.map(item => (
              <Menu.Item key={item.name}>
                {item.title}
                <small style={{ marginLeft: '3px' }}>{item.editing && '(编辑中)'}</small>
              </Menu.Item>
            ))}
          </Menu>
        </Col>
        <Col span={20}>
          {/*<div style={{ textAlign: 'right' }}>*/}
          {/*<Button onClick={onSave}>保存</Button>*/}
          {/*</div>*/}
          <div className={styles.rightCol}>
            <CodeEditor
              value={(editing ? editingContent : content) || ''}
              onChange={onChange.bind(null, name)}
              readOnly={!editing}
              style={{ border: '1px solid #ddd', height: '400px' }}
            />
            <div className={styles.scriptBtnRow} style={{ textAlign: 'right' }}>
              <Button onClick={onShow.bind(null, name)}>历史记录</Button>
              {!editing && <Button onClick={onEdit.bind(null, name)}>编辑</Button>}
              {editing && <Button onClick={onClear.bind(null, name)}>清空</Button>}
              {editing && <Button onClick={onCancel.bind(null, name)}>取消</Button>}
              <Button onClick={onSave.bind(null, name)}>保存所有</Button>
            </div>
          </div>
        </Col>
        <DynamicLoadModal
          width={1120}
          title={title}
          keyname={showingScript}
          rowKey="id"
          recid={entityId}
          value={editingContent}
          orig={content}
          spaceName={SPACENAME}
          name={showingScript}
          showModals={showModals}
          allScripts={allScripts}
          detailapi="api/entitypro/getucodedetail"
          initParams={initParams}
          historyList={historyList}
          WrapComponent={HistoryModal}
          listLoading={fetchDataLoading.HistoryModal}
        />
      </Row>
    </div>
  );
}

export default connect(
  state => state[SPACENAME],
  dispatch => {
    return {
      onChange(scriptName, value) {
        dispatch({ type: `${SPACENAME}/contentChange`, payload: { scriptName, value } });
      },
      onCancel(scriptName) {
        dispatch({ type: `${SPACENAME}/cancelEdit`, payload: scriptName });
      },
      onShow(scriptName) {
        dispatch({ type: `${SPACENAME}/showHistoryModal`, payload: scriptName });
      },
      onEdit(scriptName) {
        dispatch({ type: `${SPACENAME}/EntityEdit`, payload: scriptName });
      },
      onSave() {
        dispatch({ type: `${SPACENAME}/saveScript` });
      },
      onClear(scriptName) {
        dispatch({ type: `${SPACENAME}/contentChange`, payload: { scriptName, value: '' } });
      },
      toggleShowing(scriptName) {
        dispatch({ type: `${SPACENAME}/toggleShowing`, payload: scriptName });
      }
    };
  }
)(EntityScripts);

