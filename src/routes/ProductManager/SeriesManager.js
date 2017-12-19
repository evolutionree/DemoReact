import React from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import { Button, Modal, Checkbox } from 'antd';
import SeriesTree from './SeriesTree';
import SeriesFormModal from './SeriesFormModal';
import styles from './styles.less';

function SeriesManager({
  queries,
  series,
  add,
  edit,
  enable,
  selectSeries,
  importData,
  checkFunc,
  showDisabledSeries,
  toggleShowDisabledSeries
}) {
  const currentSeries = _.find(series, ['productsetid', queries.productSeriesId]);
  const disableDel = currentSeries && currentSeries.nodepath === 0; // 不允许删除顶级产品系列
  const isDisabledSeries = currentSeries && currentSeries.recstatus === 0;
  return (
    <div className={styles.leftContent}>
      <div className={styles.subtitle}>
        产品系列
      </div>
      <div>
        {checkFunc('ProductSeriseAdd') && !isDisabledSeries && <Button size="default" onClick={add}>新增</Button>}
        {checkFunc('ProductSeriseEdit') && !isDisabledSeries && <Button size="default" onClick={edit}>编辑</Button>}
        {checkFunc('ProductSeriseImport') && <Button onClick={importData}>导入</Button>}
        {/*{checkFunc('ProductSeriseDelete') && <Button type="danger" size="default" onClick={enable} disabled={disableDel}>删除</Button>}*/}
        {checkFunc('ProductSeriseDelete') && (currentSeries && !currentSeries.recstatus) && <Button size="default" onClick={() => enable(1)}>启用</Button>}
        {checkFunc('ProductSeriseDelete') && (currentSeries && !!currentSeries.recstatus) && !disableDel && <Button size="default" onClick={() => enable(0)}>停用</Button>}
        <Checkbox
          checked={showDisabledSeries}
          onChange={toggleShowDisabledSeries}
          style={{ marginTop: '10px' }}
        >
          显示停用
        </Checkbox>
      </div>
      <div>
        <SeriesTree
          data={series}
          value={queries.productSeriesId}
          onChange={selectSeries}
        />
      </div>
      <SeriesFormModal />
    </div>
  );
}

export default connect(
  state => state.productManager,
  dispatch => {
    return {
      add() {
        dispatch({ type: 'productManager/showModals', payload: 'addSeries' });
      },
      edit() {
        dispatch({ type: 'productManager/showModals', payload: 'editSeries' });
      },
      enable(flag) {
        if (!flag) {
          Modal.confirm({
            title: '确定停用选中的产品系列吗？',
            onOk() {
              dispatch({ type: 'productManager/enableSeries', payload: flag });
            }
          });
        } else {
          dispatch({ type: 'productManager/enableSeries', payload: flag });
        }
      },
      selectSeries(id, node) {
        dispatch({ type: 'productManager/search', payload: { productSeriesId: id } });
      },
      importData: () => {
        dispatch({
          type: 'task/impModals',
          payload: {
            templateType: 0,
            templateKey: 'products_series_import',
            showOperatorType: false
          }
        });
      },
      toggleShowDisabledSeries() {
        dispatch({ type: 'productManager/toggleShowDisabledSeries' });
      }
    };
  }
)(SeriesManager);

