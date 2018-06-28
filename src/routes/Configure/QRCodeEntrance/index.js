/**
 * Created by 0291 on 2018/6/27.
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Modal, Table } from 'antd';
import Page from '../../../components/Page';
import Toolbar from '../../../components/Toolbar';
import Search from '../../../components/Search';
import DragList from '../../../components/UKComponent/Data/DragList';
import FormModal from './FormModal';
import ParamsFormModal from './ParamsFormModal';
import EntryFormModal from './EntryFormModal';
import _ from 'lodash';


const Column = Table.Column;

let dragListRef = null;
function QRCodeEntrance({
                   dispatch,
                   list,
                   keyword,
                          add,
                          currItems,
                          cancel,
                          showModals
                 }) {
  function selectItems(items) {
    dispatch({ type: 'qrcodeentrance/currItems', payload: items });
  }

  function searchKeyword(value) {
    dispatch({ type: 'qrcodeentrance/putState', payload: { keyword: value } });
  }

  function showOrderbyModal() {
    dispatch({ type: 'qrcodeentrance/showModals', payload: 'orderby' });
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
      case 'editEntry':
        dispatch({ type: 'qrcodeentrance/queryEntry' });
        break;
    }
  }

  function orderby() {
    dispatch({ type: 'qrcodeentrance/orderby', payload: dragListRef.getData() });
  }

  const orderByColumns = [
    {
      key: 'recorder',
      name: '序号',
      span: 12
    },
    {
      key: 'recname',
      name: '规则名称',
      span: 12
    }
  ]

  return (
    <Page title="二维码入口列表定义">
      <Toolbar
        onAction={handleAction}
        selectedCount={currItems.length}
        actions={[
          { name: 'edit', label: '编辑', single: true },
          { name: 'del', label: '删除', single: true },
          { name: 'editParams', label: '编辑匹配参数', single: true },
          { name: 'editEntry', label: '编辑智能入口', single: true }
        ]}
      >
        <Button onClick={add}>新增</Button>
        <Button onClick={showOrderbyModal}>排序</Button>
        <Toolbar.Right>
          <Search
            placeholder="请输入规则名称"
            value={keyword}
            onSearch={val => searchKeyword(val)}
          >
            搜索
          </Search>
        </Toolbar.Right>
      </Toolbar>

      <Table
        rowKey="recid"
        dataSource={list.filter(item => item.recname.indexOf(_.trim(keyword)) > -1)}
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
      <Modal
        visible={/orderby/.test(showModals)}
        title="列表排序"
        onCancel={cancel}
        onOk={orderby}
      >
        <DragList dataSource={list} column={orderByColumns} ref={ref => dragListRef = ref} />
      </Modal>
      <FormModal />
      <ParamsFormModal />
      <EntryFormModal />
    </Page>
  );
}

export default connect(
  state => state.qrcodeentrance,
  dispatch => {
    return {
      cancel: () => {
        dispatch({ type: 'qrcodeentrance/showModals', payload: '' });
      },
      add: () => {
        dispatch({ type: 'qrcodeentrance/showModals', payload: 'add' });
      },
      dispatch
    };
  }
)(QRCodeEntrance);
