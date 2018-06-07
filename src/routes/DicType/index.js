/**
 * Created by 0291 on 2018/6/6.
 */
import React from 'react';
import { connect } from 'dva';
import { Modal, Table, Button } from 'antd';
import Toolbar from '../../components/Toolbar';
import Page from '../../components/Page';
import FormModal from './formModal';
import SetGlobalConfig from './setGlobalConfig';
import Search from '../../components/Search';

function DicType({
                          dispatch,
                          list,
                   searchName
                        }) {
  function add() {
    dispatch({ type: 'dictype/showModals', payload: 'add' });
  }

  function edit(data) {
    dispatch({ type: 'dictype/getdictypedetail', payload: data.dictypeid });
  }

  function del(data) {
    Modal.confirm({
      title: '确定删除该数据吗?',
      content: '',
      onOk: () => {
        dispatch({ type: 'dictype/del', payload: data.dictypeid });
      },
      onCancel() {}
    });
  }

  function setGlobalConfig() {
    dispatch({ type: 'dictype/setGlobalConfig' });
  }

  function searchKeyword(val) {
    dispatch({ type: 'dictype/search', payload: { searchName: val } });
  }
  const columns = [{
    title: '字典类型ID',
    dataIndex: 'dictypeid',
    key: 'dictypeid',
    width: 260
  }, {
    title: '字典类型名称',
    dataIndex: 'dictypename',
    key: 'dictypename',
    width: 300
  }, {
    title: '关联字典名称',
    dataIndex: 'relatedictypname',
    key: 'relatedictypname'
  }, {
    title: '操作',
    dataIndex: 'operate',
    key: 'operate',
    width: 150,
    render: (text, record) => {
      return (
        <div>
          <a onClick={edit.bind(this, record)} style={{ marginRight: '10px' }}>编辑</a>
          <a onClick={del.bind(this, record)}>删除</a>
        </div>
      );
    }
  }];

  const filterList = list.filter(item => {
    return item.dictypename.indexOf(searchName) > -1;
  });

  return (
    <Page title="字典分类">
      <Toolbar>
        <Button onClick={add}>新增字典类型</Button>
        <Button onClick={setGlobalConfig}>全局扩展字典配置</Button>
        <Toolbar.Right>
          <Search
            placeholder="请输入字典类型名称"
            value={searchName}
            onSearch={val => searchKeyword(val)}
          >
            搜索
          </Search>
        </Toolbar.Right>
      </Toolbar>
      <Table dataSource={filterList} columns={columns} rowKey="dictypeid" pagination={false} scroll={{ y: document.body.clientHeight - 228 }} />
      <FormModal />
      <SetGlobalConfig />
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

