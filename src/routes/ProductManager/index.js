import React from 'react';
import { connect } from 'dva';
import Page from '../../components/Page';
import SeriesManager from './SeriesManager';
import ProductList from './ProductList';
import styles from './styles.less';

const contentStyle = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  padding: 0
};

function ProductsManager({
  checkFunc
}) {
  return (
    <Page title="产品管理" contentStyle={contentStyle}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.box}>
            <SeriesManager checkFunc={checkFunc} />
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.box}>
            <ProductList checkFunc={checkFunc} />
          </div>
        </div>
      </div>
    </Page>
  );
}

export default connect(
  state => state.productManager
)(ProductsManager);
