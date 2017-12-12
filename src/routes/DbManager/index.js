/**
 * Created by 0291 on 2017/12/7.
 */
import React from 'react';
import { connect } from 'dva';
import { Select, Button, Table } from 'antd';
import Page from '../../components/Page';
import DbSystemPathTree from '../DbManager/DbSystemPathTree';
import DBSQLObjectList from '../DbManager/DBSQLObjectList';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import Styles from './styles.less';
import DataGrid from './DataGrid';

const Option = Select.Option;

const contentStyle = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  padding: 0
};


function DbManager({
                treeData,
                changeTreeValue,
                     listData,
                     fullpath
                         }) {
  return (
    <Page title="数据库初始脚本管理" contentStyle={contentStyle}>
      <div className={Styles.wrap}>
        <div className={Styles.left}>
          <DbSystemPathTree
            data={treeData}
            onChange={changeTreeValue}
            value={fullpath}
          />
        </div>
        <div className={Styles.right}>
          <div className={Styles.box}>
            <DBSQLObjectList list={listData} />
          </div>
        </div>
      </div>
    </Page>
  );
}

export default connect(
  state => state.dbmanager,
  dispatch => {
    return {
      changeTreeValue(value) {
        dispatch({ type: 'dbmanager/search', payload: { fullpath: value } });
      }
    };
  }
)(DbManager);
