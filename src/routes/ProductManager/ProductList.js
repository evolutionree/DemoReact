import React from 'react';
import { connect } from 'dva';
import { Select, Button, Modal, Breadcrumb, Icon } from 'antd';
import * as _ from 'lodash';
import DynamicTable from '../../components/DynamicTable';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import styles from './styles.less';
import TransferProductModal from './TransferProductModal';
import ProductFormModal from './ProductFormModal';
import EntcommDetailModal from '../../components/EntcommDetailModal';
import DynamicLoadFilterModal from '../../components/DynamicLoadFilterModal';
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
  while (parentSeries) {
    path.unshift(parentSeries);
    parentSeries = _.find(allSeries, ['productsetid', parentSeries.pproductsetid]);
  }
  return path;
}

function ProductList({
  dispatch,
  series,
  queries,
  total,
  list,
  listProtocol,
  currentItems,
  search,
  add,
  edit,
  transfer,
  enable,
  selectItems,
  importData,
  checkFunc,
  currentUser,
  selectSeries,
  showDetail,
  showDetailId,
  showModals,
  closeModal,
  ColumnFilter,
  sortFieldAndOrder
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
  function cancelFilter() {
    dispatch({ type: 'productManager/showModals', payload: 'cancelFilter' });
  }
  function filterChange(filterData) {
    dispatch({
      type: 'productManager/putState',
      payload: { ColumnFilter: filterData }
    });
    dispatch({ type: 'productManager/search', payload: { ColumnFilter: filterData } });
  }
  function handleTableChange(pagination, filters, sorter) {
    const searchOrder = sorter.field ? (sorter.field + (sorter.order === 'ascend' ? ' asc' : ' desc')) : '';
    dispatch({ type: 'productManager/search', payload: {
      pageIndex: pagination.current,
      pageSize: pagination.pageSize,
      searchOrder: searchOrder
    } });
  }

  let dynamicTableRef;
  function openSetHeader() {
    dynamicTableRef.getWrappedInstance().openSetCustomHeaders();
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
          { label: '停用', handler: () => enable(0), show: checkFunc('ProductDelete') && currentItems.some(i => !!i.recstatus) },
          { label: '转换产品系列', handler: transfer, single: true }
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
          <Button onClick={cancelFilter} style={{ marginLeft: '10px', height: '31px' }}>筛选</Button>
          <Icon type="setting" onClick={openSetHeader} style={{ fontSize: '20px', marginLeft: '10px', cursor: 'pointer', color: '#9ba1ad', position: 'relative', top: '2px' }} />
        </Toolbar.Right>
      </Toolbar>

      <DynamicTable
        ref={(ref) => dynamicTableRef = ref}
        entityId="59cf141c-4d74-44da-bca8-3ccf8582a1f2"
        protocol={listProtocol}
        rowKey="recid"
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
        sorter
        sortFieldAndOrder={sortFieldAndOrder}
        onChange={handleTableChange}
        ColumnFilter={ColumnFilter || {}}
        onFilter={filterChange}
        fixedHeader={false}
        renderLinkField={(text, field, record, props) => (
          <a href="javascript:;" style={titleStyle} title={text} onClick={showDetail.bind(this, record)}>{text}</a>
        )}
      />
      <DynamicLoadFilterModal
        keyName="productManager"
        title="筛选条件"
        protocol={listProtocol}
        ColumnFilter={ColumnFilter}
      />
      <TransferProductModal />
      <ProductFormModal />
      <EntcommDetailModal visible={showModals === 'viewDetail'}
        title="产品详情"
        entityId={productEntityId}
        recordId={showDetailId}
        onOk={closeModal}
        onCancel={closeModal}
      />
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
    dispatch,
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
    },
    transfer() {
      dispatch({ type: 'productManager/showModals', payload: 'transfer' });
    }
  };
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductList);
