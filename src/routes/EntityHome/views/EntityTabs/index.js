import React from 'react';
import { Button, Table, Icon, Modal } from 'antd';
import { connect } from 'dva';
import IntlText from '../../../../components/UKComponent/Form/IntlText';
import EntityTabFormModal from './EntityTabFormModal';
import SetCountRuleModal from './SetCountRuleModal';
import FunctionRuleModal from './FunctionRuleModal';
import styles from './EntityTabs.less';

const Column = Table.Column;

function EntityTabs({
  edit,
  add,
  rule,
  tablist,
  onUpCilck,
  onDownCilck,
  onDel,
  setCountRule
}) {
  const list = tablist.reltablist ? tablist.reltablist : [];
  const lastIndex = list.length - 1;
  return (
    <div>
      <div style={{ marginBottom: '10px' }}><Button onClick={add}>新增页签</Button></div>
      <div>
        <Table rowKey="relid" dataSource={list} pagination={false}>
          <Column title="序号" key="relid" width={100} render={(text, record, index) => (<span>{index + 1}</span>)} />
          <Column title="页签名称" dataIndex="relname" key="relname" width={200} render={(text, record, index) => (<IntlText value={text} value_lang={record.relname_lang} />)} />
          <Column title="关联实体" dataIndex="entityname" key="entityname" width={200} />
          <Column title="关联字段" dataIndex="fieldlabel" key="fieldlabel" width={250} />
          <Column
            title="操作"
            render={(text, record, index) => (
              <div className={styles.controls}>
                <Icon title="上移" type="arrow-up" onClick={onUpCilck.bind(null, index)} style={index === 0 ? { visibility: 'hidden' } : null} />
                <Icon title="下移" type="arrow-down" onClick={onDownCilck.bind(null, index)} style={index === lastIndex ? { visibility: 'hidden' } : null} />
                <Icon title="编辑" type="edit" onClick={edit.bind(null, record)} />
                <Icon title="修改可见规则" type="tool" onClick={rule.bind(null, record)} />
                {!record.entitytaburl && <Icon title="设置计数规则" type="setting" onClick={setCountRule.bind(null, record.relid)} />}
                {!record.entitytaburl && <Icon title="删除" type="delete" onClick={onDel.bind(null, record.relid)} />}
              </div>
            )}
          />
        </Table>
      </div>
      <EntityTabFormModal />
      <SetCountRuleModal />
      <FunctionRuleModal />
    </div>
  );
}


function mapDispatchToProps(dispatch) {
  return {
    add: () => {
      dispatch({ type: 'entityTabs/showModals', payload: 'add' });
    },
    edit: (item) => {
      dispatch({ type: 'entityTabs/edit', payload: item });
    },
    rule: (item) => {
      dispatch({ type: 'entityTabs/rule', payload: item });
    },
    onUpCilck: (index) => {
      dispatch({ type: 'entityTabs/up', payload: index });
    },
    onDownCilck: (index) => {
      dispatch({ type: 'entityTabs/down', payload: index });
    },
    onDel: (RelId) => {
      Modal.confirm({
        title: '确定删除该记录吗',
        onOk() {
          dispatch({ type: 'entityTabs/disabledreltab', payload: RelId });
        }
      });
    },
    setCountRule: (RelId) => {
      dispatch({ type: 'entityTabs/putState', payload: { RelId } });
      dispatch({ type: 'entityTabs/showModals', payload: 'setcountrule' });
    }
  };
}

export default connect(
  state => state.entityTabs,
  mapDispatchToProps
)(EntityTabs);
