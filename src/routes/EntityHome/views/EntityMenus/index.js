import React from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Button, Table, Icon, message, Modal } from 'antd';
import Toolbar from '../../../../components/Toolbar';
import MenuConfigModal from './MenuConfigModal';
import styles from './EntityMenus.less';

const Column = Table.Column;

function EntityMenus({
  dispatch,
  list,
  errMsg,
  add,
  edit,
  del
}) {
  function renderOperationCell(text, item) {
    const menu = (
      <Menu onClick={onMenuClick}>
        <Menu.Item key="1">编辑</Menu.Item>
        {/*<Menu.Item key="2">手机列表定义</Menu.Item>*/}
        <Menu.Item key="3">删除</Menu.Item>
      </Menu>
    );
    return (
      <Dropdown overlay={menu}>
        <Button type="default" style={{ border: 'none' }}>
          <Icon style={{ marginRight: 2 }} type="bars" />
          <Icon type="down" />
        </Button>
      </Dropdown>
    );

    function onMenuClick(event) {
      switch (event.key) {
        case '1':
          edit(item);
          break;
        case '2':
          break;
        case '3':
          Modal.confirm({
            title: '您确定删除选中记录吗？',
            onOk: () => { del(item); }
          });
          break;
        default:
      }
    }
  }
  return (
    <div>
      <Toolbar>
        <Button onClick={add}>新增</Button>
      </Toolbar>
      <Table rowKey="menuid" dataSource={list} pagination={false}>
        <Column title="页签名称" dataIndex="menuname" key="menuname" />
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
    }
  };
}
export default connect(
  state => state.entityMenus,
  mapDispatchToProps
)(EntityMenus);
