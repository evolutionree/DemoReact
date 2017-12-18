import React from 'react';
import { connect } from 'dva';
import { Select, Button, message, Modal, Breadcrumb, Menu, Dropdown, Icon, Table } from 'antd';
import * as _ from 'lodash';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import styles from './styles.less';

const Option = Select.Option;

function DBSQLObjectList({
  queries,
  list,
  edit,
  search,
  currentUser
}) {
  function exportData() {
    window.open(`/api/excel/exportdata?TemplateType=0&FuncName=products_export&QueryParameters=${params}&UserId=${currentUser}`);
  }

  function getColumns() {
    return [{
      title: '对象名称',
      dataIndex: 'objname'
    }, {
      title: '参数',
      dataIndex: 'procparam'
    }, {
      title: '显示名称',
      dataIndex: 'name'
    }, {
      title: '对象类型',
      dataIndex: 'objtype_name'
    }, {
      title: '需要初始化',
      dataIndex: 'needinitsql_name'
    }, {
      title: '操作',
      dataIndex: 'action',
      width: 80,
      render: (text, record, index) => {
        return (
          <div className={styles.actionWrap}>
            <span style={{ marginRight: 4 }} onClick={edit.bind(this, 'editList', record)}>编辑</span>
            <Dropdown overlay={
              <Menu onClick={({ key }) => { edit(key, record) }}>
                <Menu.Item key="editDataJs">
                  <span>编辑初始化数据脚本</span>
                </Menu.Item>
                <Menu.Item key="viewStructureJs">
                  <span>查看初始化结构脚本</span>
                </Menu.Item>
              </Menu>
            } placement="bottomCenter">
              <span><Icon type="down" /></span>
            </Dropdown>
          </div>
        );
      }
    }];
  }
  return (
    <div className={styles.rightContent}>
      <Toolbar>
        <Select value={queries.objecttype + ''} onChange={search.bind(this, 'objecttype')}>
          <Option key="0">全部</Option>
          <Option key="1">表格</Option>
          <Option key="2">函数</Option>
          <Option key="3">类型</Option>
        </Select>
        <Button >全部生成</Button>
        <Button >导出</Button>
        <Toolbar.Right>
          <Search
            value={queries.searchKey}
            onSearch={search.bind(null, 'searchKey')}
            placeholder="请输入对象名称"
          />
        </Toolbar.Right>
      </Toolbar>

      <Table
        columns={getColumns()}
        dataSource={list}
        rowKey="id"
      />
    </div>
  );
}

function mapStateToProps(state) {
  return {
    ...state.dbmanager,
    currentUser: state.app.user.userid
  };
}
function mapDispatchToProps(dispatch) {
  return {
    search: (key, value) => {
      dispatch({ type: 'dbmanager/search', payload: { [key]: value } });
    },
    edit: function(type, currentItem) {
      dispatch({ type: 'dbmanager/showInfoModals', payload: type });
      dispatch({ type: 'dbmanager/putState', payload: { currItem: currentItem } });
      if (type === 'editDataJs' || type === 'viewStructureJs') {
        dispatch({ type: 'dbmanager/getobjectsql', payload: { type, currItem: currentItem } });
      }
    }
  };
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DBSQLObjectList);
