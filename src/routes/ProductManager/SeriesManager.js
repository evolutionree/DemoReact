import React from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import { Button, Modal } from 'antd';
import SeriesTree from './SeriesTree';
import SeriesFormModal from './SeriesFormModal';
import styles from './styles.less';

function SeriesManager({
  queries,
  series,
  add,
  edit,
  del,
  selectSeries,
  importData,
  checkFunc
}) {
  const currentSeries = _.find(series, ['productsetid', queries.productSeriesId]);
  const disableDel = currentSeries && currentSeries.nodepath === 0; // 不允许删除顶级产品系列
  return (
    <div className={styles.leftContent}>
      <div className={styles.subtitle}>
        产品系列
      </div>
      <div>
        {checkFunc('ProductSeriseAdd') && <Button size="default" onClick={add}>新增</Button>}
        {checkFunc('ProductSeriseEdit') && <Button size="default" onClick={edit}>编辑</Button>}
        {checkFunc('ProductSeriseImport') && <Button onClick={importData}>导入</Button>}
        {checkFunc('ProductSeriseDelete') && <Button type="danger" size="default" onClick={del} disabled={disableDel}>删除</Button>}
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
      del() {
        Modal.confirm({
          title: '确定删除选中的产品系列吗？',
          onOk() {
            dispatch({ type: 'productManager/delSeries' });
          }
        });
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
      }
    };
  }
)(SeriesManager);

