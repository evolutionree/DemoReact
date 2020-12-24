import * as _ from 'lodash';
import request from '../utils/request';
import { transformArrayToTree, treeForEach } from '../utils';

/**
 * 获取行政区域数据
 * @returns {Promise.<Object>}
 */
export async function queryRegionData() {
  const params = {
    VersionKey: {
      regionsync: 0
    }
  };
  return request('/api/basicdata/syncbasic', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取产品数据
 * @returns {Promise.<Object>}
 */
export async function queryProductData() {
  const params = {
    VersionKey: {
      productsync: 0
    }
  };
  return request('/api/basicdata/syncbasic', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

// 全局缓存有关/api/metaData/getincrementdata的数据请求
const cacheIncrementdata = {
  queryProductTree: null,
  queryProductRaw: null,
  queryDictionaries: null
};

/**
 * 获取产品树（产品系列 + 产品）
 * @returns {Promise.<Object>}
 */
export async function queryProductTree() {
  let promise = cacheIncrementdata.queryProductTree;
  if (promise) return promise;

  const params = [
    { VersionType: 3, VersionKey: 'productsync', RecVersion: -1 },
    { VersionType: 3, VersionKey: 'productserialsync', RecVersion: -1 }
  ];
  promise = request('/api/metaData/getincrementdata', {
    method: 'post',
    body: JSON.stringify(params)
  }).then(result => {
    const { data: { data: { productserialsync: productserial, productsync: product } } } = result;
    const retTree = transformArrayToTree(productserial, 'productsetid', 'productsetname');
    const productBySerial = {};
    product.forEach(item => {
      const serialId = item.productsetid;
      if (!productBySerial[serialId]) productBySerial[serialId] = [];
      productBySerial[serialId].push(item);
    });
    treeForEach(retTree, node => {
      const belongProducts = productBySerial[node.productsetid];
      if (belongProducts) {
        node.children = [...node.children, ...belongProducts];
        node.children.forEach(child => {
          if (!child.path) {
            child.path = [...node.path, child.productname];
          }
        });
      }
    });
    return { data: retTree };
  });

  cacheIncrementdata.queryProductTree = promise;
  return promise;
}
/**
 * 获取产品树（产品系列 + 产品）
 * @returns {Promise.<Object>}
 */
export async function queryProductRaw() {
  let promise = cacheIncrementdata.queryProductRaw;
  if (promise) return promise;

  const params = [
    { VersionType: 3, VersionKey: 'productsync', RecVersion: -1 },
    { VersionType: 3, VersionKey: 'productserialsync', RecVersion: -1 }
  ];
  promise = request('/api/metaData/getincrementdata', {
    method: 'post',
    body: JSON.stringify(params)
  }).then(result => {
    const { data: { data: { productserialsync: productserial, productsync: product } } } = result;
    return { data: { productserial, products: product } };
  });

  cacheIncrementdata.queryProductRaw = promise;
  return promise;
}

/**
 * 获取产品系列数据
 * @returns {Promise.<Object>}
 */
export async function queryProductSerialData() {
  const params = {
    VersionKey: {
      productserialsync: 0
    }
  };
  return request('/api/basicdata/syncbasic', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取字典
 * @param dickeys
 * @returns {Promise.<Object>}
 */
export async function queryDictionaries(dickeys) {
  let promise = cacheIncrementdata.queryDictionaries;
  if (promise) return promise;

  const params = [
    { VersionType: 2, VersionKey: 'datadicsync', RecVersion: -1 }
  ];
  promise = request('/api/metaData/getincrementdata', {
    method: 'post',
    body: JSON.stringify(params)
  }).then(result => {
    const dics = result.data.data.datadicsync.sort((a, b) => a.recorder - b.recorder);
    const dicGrouped = {};
    dics.forEach(dic => {
      if (!dicGrouped[dic.dictypeid]) {
        dicGrouped[dic.dictypeid] = [];
      }
      dicGrouped[dic.dictypeid].push(dic);
    });
    return { data: { dicdata: dicGrouped } };
  });

  cacheIncrementdata.queryDictionaries = promise;
  return promise;
}

// export async function queryDictionaries(dickeys) {
//   let count = 100;
//   let keys = [];
//   while (count) {
//     keys.push(count--);
//   }
//   return request('/api/dynamicentity/generaldic', {
//     method: 'post',
//     body: JSON.stringify({ dickeys: keys.join(',') })
//   });
// }

/**
 * 获取产品系列数据
 * @returns {Promise.<Object>}
 */
export async function queryYearWeekData() {
  const params = {
    VersionKey: {
      yearweeksync: 0
    }
  };
  return request('/api/basicdata/synctemplate', {
    method: 'post',
    body: JSON.stringify(params)
  }).then(result => {
    const { yearweek } = result.data;
    return yearweek.map(item => {
      const start = item.weekstart.slice(0, 10);
      const end = item.weekend.slice(0, 10);
      return {
        label: `第${item.weeknum}周 ${start} 至 ${end}`,
        value: start,
        weekNum: item.weeknum,
        weekStart: item.weekstart,
        weekEnd: item.weekend
      };
    });
  });
}

/**
 * 清除缓存
 * @returns {Promise.<Object>}
 */
export async function clearServerCache() {
  return request('/api/metaData/removecaches', {
    method: 'post',
    body: JSON.stringify({})
  });
}
