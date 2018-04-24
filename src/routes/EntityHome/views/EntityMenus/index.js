import React from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Button, Table, Icon, message, Modal } from 'antd';
import Toolbar from '../../../../components/Toolbar';
import MenuConfigModal from './MenuConfigModal';
import styles from './EntityMenus.less';

const Column = Table.Column;

function EntityMenus({
  list,
  add,
  edit,
  del,
  orderUp,
  orderDown
}) {
  function renderOperationCell(text, item, index) {
    const setVisible = bool => bool ? { visibility: 'visible' } : { visibility: 'hidden' };
    return (
      <div className={styles.opcell}>
        <Icon
          type="arrow-up"
          style={setVisible(index !== 0)}
          onClick={() => { orderUp(index); }}
        />
        <Icon
          type="arrow-down"
          style={setVisible(index !== (list.length - 1))}
          onClick={() => { orderDown(index); }}
        />
        <Icon
          type="edit"
          onClick={() => edit(item)}
        />
        <Icon
          type="delete"
          onClick={() => {
            Modal.confirm({
              title: '您确定删除选中记录吗？',
              onOk: () => { del(item); }
            });
          }}
        />
      </div>
    );
  }
  return (
    <div>
      <Toolbar>
        <Button onClick={add}>新增</Button>
      </Toolbar>
      <Table rowKey="menuid" dataSource={list} pagination={false}>
        <Column title="名称" dataIndex="menuname" key="menuname" />
        {/* <Column title="页签规则" dataIndex="menurule" key="menurule" /> */}
        <Column title="操作" key="operaiton" render={renderOperationCell} />
      </Table>
      <MenuConfigModal />
    </div>
  );
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    add: () => {
      dispatch({ type: 'entityMenus/showModals', payload: 'add' });
    },
    edit: (item) => {
      dispatch({ type: 'entityMenus/edit', payload: item });
    },
    del: (item) => {
      dispatch({ type: 'entityMenus/delMenu', payload: item.menuid });
    },
    orderUp: (index) => {
      dispatch({ type: 'entityMenus/orderMenu', payload: { index, dir: -1 } });
    },
    orderDown: (index) => {
      dispatch({ type: 'entityMenus/orderMenu', payload: { index, dir: 1 } });
    }
  };
}
export default connect(
  state => state.entityMenus,
  mapDispatchToProps
)(EntityMenus);
