import React from 'react';
import { connect } from 'dva';
import { Row, Col, Button, Input, Menu } from 'antd';
import * as _ from 'lodash';
import CodeEditor from '../../../../components/CodeEditor';
import HistoryModal from '../../Components/HistoryModal';
import styles from './EntityScripts.less';

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
  addScript,
  editScript,
  viewScript,
  copyScript,
  showingScript,
  toggleShowing,
  onChange,
  onCancel,
  onShow,
  onEdit,
  onSave,
  onClear
}) {
  const allScripts = [addScript, editScript, viewScript, copyScript];
  const scriptItem = _.find(allScripts, ['name', showingScript]);
  const { title, name, content, editingContent, editing } = scriptItem;
  return (
    <div>
      <Row gutter={10}>
        <Col span={4}>
          <Menu selectedKeys={[showingScript]}
                style={{ overflowY: 'auto', overflowX: 'hidden' }}
                onSelect={event => toggleShowing(event.key)}>
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
        <HistoryModal keyname={showingScript} />
      </Row>
    </div>
  );
}

export default connect(
  state => state.entityScripts,
  dispatch => {
    return {
      onChange(scriptName, value) {
        dispatch({ type: 'entityScripts/contentChange', payload: { scriptName, value } });
      },
      onCancel(scriptName) {
        dispatch({ type: 'entityScripts/cancelEdit', payload: scriptName });
      },
      onShow(scriptName) {
        dispatch({ type: 'entityScripts/showHistoryModal', payload: scriptName });
      },
      onEdit(scriptName) {
        dispatch({ type: 'entityScripts/editScript', payload: scriptName });
      },
      onSave() {
        dispatch({ type: 'entityScripts/saveScript' });
      },
      onClear(scriptName) {
        dispatch({ type: 'entityScripts/contentChange', payload: { scriptName, value: '' } });
      },
      toggleShowing(scriptName) {
        dispatch({ type: 'entityScripts/toggleShowing', payload: scriptName });
      }
    };
  }
)(EntityScripts);

