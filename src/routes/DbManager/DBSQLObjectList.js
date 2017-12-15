import React from 'react';
import { connect } from 'dva';
import { Select, Button, message, Modal, Breadcrumb } from 'antd';
import DataGrid from './DataGrid';
import * as _ from 'lodash';
import DynamicTable from '../../components/DynamicTable';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import styles from './styles.less';

const Option = Select.Option;
const columns = [{
  title: '对象名称',
  dataIndex: 'objname',
  key: 'objname'
}, {
  title: '参数',
  dataIndex: 'procparam',
  key: 'procparam'
}, {
  title: '显示名称',
  dataIndex: 'name',
  key: 'name'
}, {
  title: '对象类型',
  dataIndex: 'objtype_name',
  key: 'objtype_name'
}, {
  title: '需要初始化',
  dataIndex: 'needinitsql_name',
  key: 'needinitsql_name'
}, {
  title: '操作',
  key: 'action'
}];

function DBSQLObjectList({
  queries,
  total,
  list, edit,
  search,
  currentUser,currItems,
  selectItems
}) {
  function exportData() {
    window.open(`/api/excel/exportdata?TemplateType=0&FuncName=products_export&QueryParameters=${params}&UserId=${currentUser}`);
  }
  return (
    <div className={styles.rightContent}>
      {/*<div className={styles.subtitle}>{currentFullPath && currentFullPath.productsetname}</div>*/}

      <Toolbar
        selectedCount={currItems.length}
        actions={[
          { label: '编辑', handler: edit, single: true },
          { label: '编辑初始化结构脚本', handler: edit, single: true },
          { label: '查看初始化数据脚本', handler: edit, single: true }
        ]}
      >
        <Select value={queries.objecttype + ''} onChange={search.bind(null, 'objecttype')}>
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

      <DataGrid
        columns={columns}
        dataSource={list}
        slectRows={currItems}
        selectRowHandler={selectItems}
        pagination={{
          total,
          current: +queries.pageIndex,
          pageSize: +queries.pageSize,
          onChange: search.bind(null, 'pageIndex'),
          onShowSizeChange: (page, size) => { search('pageSize', size); }
        }}
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
      dispatch({type: 'dbmanager/search', payload: {[key]: value}});
    },
    edit: function() {
      dispatch({ type: 'dbmanager/showInfoModals', payload: 'edit' } );
    },
    selectItems: (items) => {
      dispatch({ type: 'dbmanager/putState', payload: { currItems: items } });
    },
  };
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DBSQLObjectList);
