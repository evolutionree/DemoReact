import React from 'react';
import { connect } from 'dva';
import { Row, Col, Button, Menu, Input } from 'antd';
import * as _ from 'lodash';
import CodeEditor from '../../../../components/CodeEditor';
import DynamicLoadModal from '../../../../components/Modal/DynamicLoadModal';
import HistoryModal from '../../../../components/Modal/HistoryModal';
import styles from './EntityScripts.less';

const TextArea = Input.TextArea;

const SPACENAME = 'entityScripts';

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
  const { title, name, content, editingContent, remark, editing } = scriptItem;

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
          <div className={styles.rightCol}>
            <CodeEditor
              value={(editing ? editingContent : content) || ''}
              onChange={onChange.bind(null, name, 'editingContent')}
              readOnly={!editing}
              style={{ border: '1px solid #ddd', height: '400px' }}
            />
            <TextArea style={{ marginTop: 8 }} value={remark} onChange={(e) => onChange(name, 'remark', e.target.value)} placeholder="请填写修改备注" />
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
          onChange={onChange.bind(null, name, 'editingContent')}
          initParams={initParams}
          historyList={historyList}
          WrapComponent={HistoryModal}
          listLoading={fetchDataLoading && fetchDataLoading.HistoryModal}
        />
      </Row>
    </div>
  );
}

export default connect(
  state => state[SPACENAME],
  dispatch => {
    return {
      onChange(scriptName, key, value) {
        dispatch({ type: `${SPACENAME}/contentChange`, payload: { scriptName, key, value } });
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

