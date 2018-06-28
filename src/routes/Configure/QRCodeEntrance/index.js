/**
 * Created by 0291 on 2018/6/27.
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Button, Input, Checkbox, message, Select, Row, Col, Modal } from 'antd';
import Page from '../../../components/Page';
import Toolbar from '../../../components/Toolbar';
import Search from '../../../components/Search';
import DragList from './DragList';
import FormModal from './FormModal';
import ParamsFormModal from './ParamsFormModal';
import styles from './index.less';
import classnames from 'classnames';

function QRCodeEntrance({
                   dispatch,
                   list,
                   keyword,
                          add
                 }) {
  function searchKeyword() {

  }
  function del(rowData) {
    Modal.confirm({
      title: '确定删除该数据吗?',
      content: '',
      onOk: () => {
        dispatch({ type: 'qrcodeentrance/del', payload: rowData.recid });
      },
      onCancel() {}
    });
  }

  function edit(rowData) {
    dispatch({ type: 'qrcodeentrance/putState', payload: { currItem: rowData } });
    dispatch({ type: 'qrcodeentrance/showModals', payload: 'edit' });
  }

  function test() {
    dispatch({ type: 'qrcodeentrance/showModals', payload: 'test' });
  }


  function listSortEnd(list) {
    //dispatch({ type: 'qrcodeentrance/orderby', payload: list });
  }

  const column = [
    {
      key: 'recorder',
      name: '序号',
      span: 2
    },
    {
      key: 'recname',
      name: '规则名称',
      span: 2
    },
    {
      key: 'recorde4r',
      name: '匹配方法',
      span: 2
    },
    {
      key: 'recorder43',
      name: '匹配说明',
      span: 3
    },
    {
      key: 'recorder23',
      name: '匹配参数',
      span: 2
    },
    {
      key: 'dealtype',
      name: '结果计算方式',
      span: 2
    },
    {
      key: 'dealparam',
      name: '结果计算说明',
      span: 3
    },
    {
      key: 'dealparam12',
      name: '结果计算概要',
      span: 2
    },
    {
      key: 'recstatus',
      name: '状态',
      span: 2
    },
    {
      key: 'remark',
      name: '规则描述',
      span: 2
    },
    {
      key: 'operate',
      name: '操作',
      span: 2,
      render: (text, rowData, rowIndex) => {
        return (
          <div>
            <a style={{ marginRight: '10px' }} onClick={edit.bind(this, rowData)}>编辑</a>
            <a onClick={del.bind(this, rowData)}>删除</a>
            <a onClick={test.bind(this, rowData)}>删除</a>
          </div>
        );
      }
    }
  ];

  return (
    <Page title="字典参数" >
      <Toolbar>
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
      <DragList dataSource={list} column={column} onSortEnd={listSortEnd} />
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
