import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import _ from 'lodash';
import { Button, Checkbox } from 'antd';
import DepartmentTree from './DepartmentTree';
import DepartmentFormModal from './DepartmentFormModal';
import styles from './Structure.less';

function DepartmentManager({
  checkFunc,
  queries,
  departments,
  showDisabledDepts,
  selectDept,
  addDept,
  editDept,
  expandTree,
  orderDept,
  toggleDeptStatus,
  toggleShowDisabledDepts
}) {
  const currentDept = _.find(departments, ['deptid', queries.deptId]) || {};
  const deptStatus = currentDept.recstatus;
  const deptsData = showDisabledDepts ? departments : departments.filter(item => item.recstatus === 1);
  return (
    <div className={styles.leftContent}>
      <div className={styles.subtitle}>
        目录
      </div>
      <div style={{ marginBottom: '15px' }}>
        {checkFunc('DepartmentAdd') && deptStatus === 1 && <Button size="default" onClick={addDept}>新增</Button>}
        {checkFunc('DepartmentEdit') && deptStatus === 1 && <Button size="default" onClick={editDept}>编辑</Button>}
        {checkFunc('DepartmentEnable') && deptStatus === 1 && <Button size="default" onClick={toggleDeptStatus}>停用</Button>}
        {checkFunc('DepartmentEnable') && deptStatus === 0 && <Button size="default" onClick={toggleDeptStatus}>启用</Button>}
        {/*<Button size="default">导入</Button>*/}
        {/*<Button size="default" type={showDisabledDepts ? 'primary' : 'default'} onClick={toggleShowDisabledDepts}>显示停用</Button>*/}
        <Checkbox
          checked={showDisabledDepts}
          onChange={toggleShowDisabledDepts}
          style={{ marginTop: '10px' }}
        >
          显示停用
        </Checkbox>
      </div>
      <div className={styles.treectrl}>
        {/*<a onClick={expandTree} href="javascript:;">全部展开</a>*/}
        <a onClick={() => { orderDept(-1); }} href="javascript:;">上移</a>
        <a onClick={() => { orderDept(1); }} href="javascript:;">下移</a>
      </div>
      <div>
        <DepartmentTree
          data={deptsData}
          value={queries.deptId}
          onChange={selectDept}
        />
      </div>
      <DepartmentFormModal />
    </div>
  );
}

export default connect(
  state => state.structure,
  dispatch => {
    return {
      selectDept: deptId => {
        dispatch({ type: 'structure/search', payload: { deptId } });
      },
      addDept: () => {
        dispatch({ type: 'structure/showModals', payload: 'addDept' });
      },
      editDept: () => {
        dispatch({ type: 'structure/showModals', payload: 'editDept' });
      },
      expandTree: () => {

      },
      orderDept: dir => {
        dispatch({ type: 'structure/orderDept', payload: dir });
      },
      toggleShowDisabledDepts: () => {
        dispatch({ type: 'structure/toggleShowDisabledDepts' });
      },
      toggleDeptStatus: () => {
        dispatch({ type: 'structure/toggleDeptStatus' });
      }
    };
  }
)(DepartmentManager);
