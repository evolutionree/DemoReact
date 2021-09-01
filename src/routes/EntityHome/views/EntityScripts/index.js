import React from 'react';
import { connect } from 'dva';
import { Row, Col, Button, Menu, Input } from 'antd';
import * as _ from 'lodash';
import CodeEditor from '../../../../components/CodeEditor';
import DynamicLoadModal from '../../../../components/Modal/DynamicLoadModal';
import HistoryModal from '../../../../components/Modal/HistoryModal';
import styles from './EntityScripts.less';
import { syncRequest } from '../../../../components/DynamicForm/createJSEngineProxy';

/**
 * 能够运行字符串类型的JS代码并且可以接收返回值
 * @param {*} appData 注入jsCode当前执行环境的app数据源
 * @param {*} jsCode 需要执行的js代码
 */

export function runStringJsCodeWithReturn(appData, jsCode) {
  try {
    const fun = new Function(`
      return function(app) {
        try {
          ${jsCode}
        } catch (e) {
          console.error('--run EntityFilterTypeJs error inner--', e);
        }
      }
    `)();
    const returnData = fun(appData);
    // console.log('--returnData--', returnData);
    if (!returnData) throw new Error('无返回值; Tips: 实体类型过滤的JS必须要有返回值');
    else if (Object.prototype.toString.call(returnData) !== '[object Array]') {
      throw new Error('返回类型错误; Tips: 实体类型过滤的JS返回值必须是【数组】');
    } else if (returnData.length > 0 && returnData.some(r => Object.prototype.toString.call(r) !== '[object String]')) {
      throw new Error('返回数组结构错误; Tips: 返回数组的每一项必须都是字符串');
    }
    return returnData;
  } catch (e) {
    console.error('--run EntityFilterTypeJs error--', e);
  }
}

/**
 * 执行过滤JS的方法
 * @param {*} targetTypeIds  [[key]: object]
 * @param {*} originData  null || { entityid: string, recid: string, rectype: string, originDetail: object }
 * @param {*} filterTypeJsCode string
 * @returns array [categoryid: string] 
 */
export function getAfterFilterEntityTypes(defaultEntityTypes, originData, filterTypeJsCode, currentUser) {
  const entityTypes = defaultEntityTypes;
  let afterFilterEntityTypes = entityTypes;
  // 是否执行JS过滤实体类型
  if (filterTypeJsCode) {
    // entityTypes.length > 1 执行过滤
    if (entityTypes && entityTypes.length && entityTypes.length > 1) {
      const typeIds = entityTypes.map(t => t.categoryid);
      // 构建注入执行js代码环境的app数据
      const appData = { originData, targetTypeIds: typeIds, request: syncRequest, currentUser }; 
      const returnTypes = runStringJsCodeWithReturn(appData, filterTypeJsCode);
      // 返回数组有值并且长度与原来不相等的情况下才会执行过滤
      if (returnTypes && returnTypes.length && returnTypes.length !== entityTypes.length) {
        const showTypes = entityTypes.filter(t => returnTypes.includes(t.categoryid));
        if (showTypes.length) afterFilterEntityTypes = showTypes;
      }
    }
  }
  return afterFilterEntityTypes;
}

const TextArea = Input.TextArea;

const SPACENAME = 'entityScripts';

function EntityScripts({
  entityId,
  EntityAddNew,
  EntityEdit,
  EntityView,
  EntityCopyNew,
  EntityFilterType,
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
  const allScripts = [EntityAddNew, EntityEdit, EntityView, EntityCopyNew, EntityFilterType];
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
            {
              editing && <TextArea 
                style={{ marginTop: 8 }} 
                value={remark} 
                onChange={(e) => onChange(name, 'remark', e.target.value)} 
                placeholder="请填写修改备注"
              />
            }
            <div className={styles.scriptBtnRow} style={{ textAlign: 'right' }}>
              <Button onClick={onShow.bind(null, name)}>历史记录</Button>
              {!editing && <Button onClick={onEdit.bind(null, name)}>编辑</Button>}
              {editing && <Button onClick={onClear.bind(null, name)}>清空</Button>}
              {editing && <Button onClick={onCancel.bind(null, name)}>取消</Button>}
              <Button onClick={onSave.bind(null, name)}>保存所有</Button>
            </div>
          </div>
        </Col>
        {
          showModals && showModals.HistoryModal &&
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
        }
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

