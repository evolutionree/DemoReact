/**
 * Created by 0291 on 2018/6/6.
 */
import React from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, Radio, Checkbox, InputNumber, message, Row, Col, Table, Button } from 'antd';
import Toolbar from '../../components/Toolbar';
import Page from '../../components/Page';
import FormModal from './formModal';
import _ from 'lodash';

const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;

function DicType({
                          dispatch,
                          protocol,
                          queries,
                          list,
                          total,
                          currItems
                        }) {

  function selectItems(items) {
    dispatch({ type: 'transferscheme/currItems', payload: items });
  }

  function handleTableChange(pagination) {
    dispatch({ type: 'transferscheme/search', payload: {
      pageIndex: pagination.current,
      pageSize: pagination.pageSize
    } });
  }

  function add() {
    dispatch({ type: 'dictype/showModals', payload: 'add' });
  }

  function del() {

  }

  const columns = [{
    title: '字典类型ID',
    dataIndex: 'dictypeid',
    key: 'dictypeid'
  }, {
    title: '字典类型名称',
    dataIndex: 'dictypename',
    key: 'dictypename'
  }, {
    title: '关联字典名称',
    dataIndex: 'address',
    key: 'address'
  }, {
    title: '操作',
    dataIndex: 'operate',
    key: 'operate',
    render: () => {
      return <a onClick={del}>删除</a>;
    }
  }];

  return (
    <Page title="字典分类">
      <Toolbar>
        <Button onClick={add}>新增字典类型</Button>
        <Button>全局扩展字典配置</Button>
      </Toolbar>
      <Table dataSource={list} columns={columns} rowKey="dictypeid" />
      <FormModal />
    </Page>
  );
}

export default connect(
  state => state.dictype,
  dispatch => {
    return {
      dispatch
    };
  }
)(DicType);

