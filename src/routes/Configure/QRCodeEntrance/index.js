/**
 * Created by 0291 on 2018/6/27.
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Button, Input, Checkbox, message, Select, Row, Col, Modal, Table } from 'antd';
import Page from '../../../components/Page';
import Toolbar from '../../../components/Toolbar';
import Search from '../../../components/Search';
import DragList from './DragList';
import FormModal from './FormModal';
import ParamsFormModal from './ParamsFormModal';
import styles from './index.less';
import classnames from 'classnames';

const Column = Table.Column;

function QRCodeEntrance({
                   dispatch,
                   list,
                   keyword,
                          add,
                          currItems
                 }) {
  function selectItems(items) {
    dispatch({ type: 'qrcodeentrance/currItems', payload: items });
  }

  function searchKeyword() {

  }

  function listSortEnd(list) {
    //dispatch({ type: 'qrcodeentrance/orderby', payload: list });
  }

  function handleAction(actionName) {
    switch (actionName) {
      case 'edit':
        dispatch({ type: 'qrcodeentrance/showModals', payload: 'edit' });
        break;
      case 'del':
        Modal.confirm({
          title: '确定删除该数据吗?',
          content: '',
          onOk: () => {
            dispatch({ type: 'qrcodeentrance/del' });
          },
          onCancel() {}
        });
        break;
      case 'editParams':
        dispatch({ type: 'qrcodeentrance/queryMatchParam' });
        break;
    }
  }
  //<DragList dataSource={list} column={column} onSortEnd={listSortEnd} />

  return (
    <Page title="二维码入口列表定义">
      <Toolbar
        onAction={handleAction}
        selectedCount={currItems.length}
        actions={[
          { name: 'edit', label: '编辑', single: true },
          { name: 'del', label: '删除', single: true },
          { name: 'editParams', label: '编辑匹配参数', single: true }
        ]}
      >
        <Button onClick={add}>新增</Button>
        <Toolbar.Right>
          <Search
            placeholder="请输入关键字"
            value={keyword}
            onSearch={val => searchKeyword(val)}
          >
            搜索
          </Search>
        </Toolbar.Right>
      </Toolbar>

      <Table
        rowKey="recid"
        dataSource={list}
        pagination={false}
        rowSelection={{
          selectedRowKeys: currItems.map(item => item.recid),
          onChange: (keys, items) => selectItems(items)
        }}
      >
        <Column title="序号" key="recorder" dataIndex="recorder" />
        <Column title="规则名称" key="recname" dataIndex="recname" />
        <Column title="匹配方法" key="ds" dataIndex="ds" />
        <Column title="匹配说明" key="pubstatus" dataIndex="pubstatus" />
        <Column title="匹配参数" key="remar43k" dataIndex="remar43k" />
        <Column title="结果计算方式" key="dealtype" dataIndex="dealtype" />
        <Column title="结果计算说明" key="dealparam" dataIndex="dealparam" />
        <Column title="结果计算概要" key="rema23rk" dataIndex="rema23rk" />
        <Column title="状态" key="recstatus" dataIndex="recstatus" render={text => ['停用', '启用'][text]} />
        <Column title="规则描述" key="remark" dataIndex="remark" />
      </Table>
      <FormModal />
      <ParamsFormModal />
    </Page>
  );
}

export default connect(
  state => state.qrcodeentrance,
  dispatch => {
    return {
      add: () => {
        dispatch({ type: 'qrcodeentrance/showModals', payload: 'add' });
      },
      dispatch
    };
  }
)(QRCodeEntrance);
