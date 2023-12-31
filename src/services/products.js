import request from '../utils/request';

/**
 * 添加产品系列
 * @param params
 * {
    "SeriesName": "sub",
    "TopSeriesId": "xxx"
  }
 * @returns {Promise.<Object>}
 */
export async function addSeries(params) {
  return request('/api/products/addseries', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 编辑产品系列
 * @param params
 * {
    "SeriesName":"test p22 for update2",
    "ProductsetId":"cb221494-9269-45d5-ba74-725ae852cd39"
  }
 * @returns {Promise.<Object>}
 */
export async function updateSeries(params) {
  return request('/api/products/editseries', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除产品系列
 * @param ProductsetId
 * @returns {Promise.<Object>}
 */
export async function delSeries(ProductsetId) {
  return request('/api/products/deleteseries', {
    method: 'post',
    body: JSON.stringify({ ProductsetId })
  });
}

/**
 * 获取产品系列数据
 * @param params
 * {
    "ProductsetId":"",
    "Direction":"DOWNER",
    "IsGetDisable": 1
  }
 * @returns {Promise.<Object>}
 */
export async function getSeries(params) {
  return request('/api/products/getseries', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 添加产品
 * @param params
 * {
    "productname":"test p",
    "productseriesname":"sub",
    "productfeatures":"nothing"
  }

 * @returns {Promise.<Object>}
 */
export async function addProduct(params) {
  return request('/api/products/addproduct', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 编辑产品
 * @param params
 * {
    "productid":"f0f5b6f5-771d-4195-8936-5fcaa2a24a2a",
    "productname":"test p",
    "productfeatures":"nothing"
  }
 * @returns {Promise.<Object>}
 */
export async function updateProduct(params) {
  return request('/api/products/editproduct', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除产品
 * @param productid
 * @returns {Promise.<Object>}
 */
export async function delProduct(productid) {
  return request('/api/products/deleteproduct', {
    method: 'post',
    body: JSON.stringify({ productid })
  });
}

/**
 * 启用停用产品
 * @param productid
 * @returns {Promise.<Object>}
 */
export async function enableProduct(productid) {
  return request('/api/products/toenableproduct', {
    method: 'post',
    body: JSON.stringify({ productid })
  });
}

/**
 * 启用停用产品系列
 * @param serialid
 * @returns {Promise.<Object>}
 */
export async function enableProductSerial(serialid) {
  return request('/api/products/toenableseries', {
    method: 'post',
    body: JSON.stringify({ ProductsetId: serialid })
  });
}

/**
 * 获取产品数据
 * @param params
 * {
    "productseriesid":"e9a634c8-c8bb-4eb2-9f26-1a82caa0eae2",
    "includechild":"true",
    "recversion":"1",
    "recstatus":"1",
    "pageindex":"1",
    "pagesize":"10",
    "searchkey":""
  }
 * @returns {Promise.<Object>}
 */
export async function getProducts(params) {
  return request('/api/products/getproducts', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 获取产品数据(2018-06-04改用新接口  通过传includefilter excludefilter  查询js动态过滤后得到的数据)
 * @param params
 * {
    istopset: 1,
      psetid: this.state.currentSerial,
      searchKey: this.state.keyword,
      pageIndex: this.state.pageIndex,
      pagecount: 10,
      includefilter: '',
      excludefilter: ''
  }
 * @returns {Promise.<Object>}
 */
export async function searchproductformobile(params) {
  return request('/api/Products/searchproductformobile', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 根据产品id获取相应的详情数据
 * @param params
 * {"recids":"254e367d-a32d-4e6f-8251-6e12aad1a1d6,90cf4b31-1e28-4202-ae83-54cd5f566398"}
 * @returns {Promise.<Object>}
 */
export async function getProductdetail(params) {
  return request('/api/Products/productdetail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 转换产品所属产品系列
 * @param params
 * {
 *  "fieldData":{ "productsetid": "edaf215f-e959-40e1-bd8a-423c9406d96c"},
 *  "recId":"3a9ad417-7dd8-4f7c-910b-6db105d771e5",
 *  "typeId":"59cf141c-4d74-44da-bca8-3ccf8582a1f2"
 * }
 * @returns {Promise.<Object>}
 */
export async function transfer(params) {
  return request('/api/products/changeproductset', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
