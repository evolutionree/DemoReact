/**
 * Created by 0291 on 2017/12/7.
 */
import React from 'react';
import { connect } from 'dva';
import Page from '../../components/Page';
import DbSystemPathTree from '../DbManager/DbSystemPathTree';
import DBSQLObjectList from '../DbManager/DBSQLObjectList';
import Styles from './styles.less';
import SQLObjectFormModal from './SQLObjectFormModal';
import JsModal from './JsModal';

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
                     queries,
                     currItem
                         }) {
  return (
    <Page title="数据库初始脚本管理" contentStyle={contentStyle}>
      <div className={Styles.wrap}>
        <div className={Styles.left}>
          <DbSystemPathTree
            data={treeData}
            onChange={changeTreeValue}
            value={queries.fullpath}
          />
        </div>
        <div className={Styles.right}>
          <DBSQLObjectList list={listData} />
        </div>
      </div>
      <SQLObjectFormModal value={currItem} />
      <JsModal />
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
