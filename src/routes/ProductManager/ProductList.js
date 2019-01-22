import React from 'react';
import { connect } from 'dva';
import { Select, Button, message, Modal, Breadcrumb } from 'antd';
import * as _ from 'lodash';
import DynamicTable from '../../components/DynamicTable';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import styles from './styles.less';
import ProductFormModal from './ProductFormModal';
import EntcommDetailModal from '../../components/EntcommDetailModal';
import { downloadFile } from '../../utils/ukUtil';

const Option = Select.Option;

const productEntityId = '59cf141c-4d74-44da-bca8-3ccf8582a1f2';
const titleStyle = {
  display: 'inline-block',
  maxWidth: '340px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

function getSeriesPath(current, allSeries) {
  const path = [];
  let parentSeries = current;
  while (!!parentSeries) {
    path.unshift(parentSeries);
    parentSeries = _.find(allSeries, ['productsetid', parentSeries.pproductsetid]);
  }
  return path;
}

function ProductList({
  series,
  queries,
  total,
  list,
  listProtocol,
  currentItems,
  search,
  add,
  edit,
  enable,
  selectItems,
  importData,
  checkFunc,
  currentUser,
  selectSeries,
  showDetail,
  showDetailId,
  showModals,
  closeModal
}) {
  function exportData() {
    const params = JSON.stringify(_.mapValues({
      ...queries,
      pageIndex: 1,
      pageSize: 65535,
      includeChild: '1'
    }, val => val + ''));
    downloadFile(`/api/excel/exportdata?TemplateType=0&FuncName=products_export&QueryParameters=${params}&UserId=${currentUser}`);
  }
  function handleSeriesSelect(seriesId) {
    if (seriesId === currentSeries.productsetid) return;
    selectSeries(seriesId);
  }
  const currentSeries = _.find(series, ['productsetid', queries.productSeriesId]);
  const seriesPath = getSeriesPath(currentSeries, series);
  const isDisabledSeries = currentSeries && currentSeries.recstatus === 0;
  return (
    <div className={styles.rightContent}>
      {/*<div className={styles.subtitle}>{currentSeries && currentSeries.productsetname}</div>*/}
      <div className={styles.subtitle}>
        <Breadcrumb separator=">">
          {seriesPath.map(({ productsetid, productsetname }) => {
            const jumpable = productsetid !== currentSeries.productsetid;
            const itemProps = { key: productsetid };
            if (jumpable) {
              itemProps.onClick = selectSeries.bind(null, productsetid);
              itemProps.className = styles.breadcrumbLink;
            }
            return <Breadcrumb.Item {...itemProps}>{productsetname}</Breadcrumb.Item>;
          })}
        </Breadcrumb>
      </div>
      <Toolbar
        selectedCount={isDisabledSeries ? 0 : currentItems.length}
        actions={[
          { label: '编辑', handler: edit, single: true, show: checkFunc('ProductEdit') },
          { label: '启用', handler: () => enable(1), show: checkFunc('ProductDelete') && currentItems.some(i => !i.recstatus) },
          { label: '停用', handler: () => enable(0), show: checkFunc('ProductDelete') && currentItems.some(i => !!i.recstatus) }
        ]}
      >
        <Select value={queries.recStatus + ''} onChange={search.bind(null, 'recStatus')}>
          <Option key="1">启用</Option>
          <Option key="0">停用</Option>
        </Select>
        {!isDisabledSeries && checkFunc('ProductAdd') && <Button onClick={add}>新增</Button>}
        {checkFunc('ProductImport') && <Button onClick={importData}>导入</Button>}
        <Button onClick={exportData}>导出</Button>
        <Toolbar.Right>
          <Search
            value={queries.searchKey}
            onSearch={search.bind(null, 'searchKey')}
            width="260px"
            placeholder="请输入产品名称"
          />
        </Toolbar.Right>
      </Toolbar>

      <DynamicTable
        rowKey="recid"
        protocol={listProtocol}
        entityId="59cf141c-4d74-44da-bca8-3ccf8582a1f2"
        dataSource={list}
        rowSelection={{
          selectedRowKeys: currentItems.map(item => item.recid),
          onChange: (keys, items) => { selectItems(items); }
        }}
        pagination={{
          total,
          current: +queries.pageIndex,
          pageSize: +queries.pageSize,
          onChange: search.bind(null, 'pageIndex'),
          onShowSizeChange: (page, size) => { search('pageSize', size); }
        }}
        fixedHeader={false}
        renderLinkField={(text, field, record, props) => (
          <a href="javascript:;" style={titleStyle} title={text} onClick={showDetail.bind(this, record)}>{text}</a>
        )}
      />
      <ProductFormModal />
      <EntcommDetailModal visible={showModals === 'viewDetail'}
                          title="产品详情"
                          entityId={productEntityId}
                          recordId={showDetailId}
                          onOk={closeModal}
                          onCancel={closeModal} />
    </div>
  );
}

function mapStateToProps(state) {
  return {
    ...state.productManager,
    currentUser: state.app.user.userid
  };
}
function mapDispatchToProps(dispatch) {
  return {
    search: (key, value) => {
      dispatch({ type: 'productManager/search', payload: { [key]: value } });
    },
    add: () => {
      dispatch({ type: 'productManager/showModals', payload: 'addProduct' });
    },
    edit: () => {
      dispatch({ type: 'productManager/showModals', payload: 'editProduct' });
    },
    enable: flag => {
      if (!flag) {
        Modal.confirm({
          title: '确定停用选中的产品吗？',
          onOk() {
            dispatch({ type: 'productManager/enableProducts', payload: flag });
          }
        });
      } else {
        dispatch({ type: 'productManager/enableProducts', payload: flag });
      }
    },
    selectItems: (items) => {
      dispatch({ type: 'productManager/putState', payload: { currentItems: items } });
    },
    selectSeries(id, node) {
      dispatch({ type: 'productManager/search', payload: { productSeriesId: id } });
    },
    importData: () => {
      dispatch({
        type: 'task/impModals',
        payload: {
          templateKey: '59cf141c-4d74-44da-bca8-3ccf8582a1f2',
          templateType: 1,
          showOperatorType: false
        }
      });
    },
    showDetail(record) {
      dispatch({ type: 'productManager/putState', payload: { showModals: 'viewDetail', showDetailId: record.recid } });
    },
    closeModal() {
      dispatch({ type: 'productManager/showModals', payload: '' });
    }
  };
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductList);
