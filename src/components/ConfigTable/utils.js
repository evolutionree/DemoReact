import React from 'react';
import { Tooltip } from 'antd';
import styles from './index.less';

// 平铺数据
function expandedArray(arr, field) {
  return arr.reduce((item, next) => {
    let list = item;
    list.push(next);
    if (next[field].length) list = [...list, ...expandedArray(next[field], field)];
    return list;
  }, []);
}

function sum(data) {
  const values = data;
}

function getLength(data, n) {
  let values = data;
}

function isObject(value) {
  const type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

const NumberInt = (val) => {
  const v = val;
  if (v) return isNaN(v) ? 0 : parseInt(v, 10);
  return 0;
};

const NumberFloat = (val) => {
  const v = val;
  if (v) return isNaN(v) ? 0 : parseFloat(v);
  return 0;
};

export const formatWan = (val) => {
  const v = val * 1;
  if (!v || Number.isNaN(v)) return '';
  let result = val;
  const showFont = (font = '万', num = 10000) => (
    <span>
      {`${(val / num).toFixed(2)}`}
      <span
        style={{
          position: 'relative',
          fontSize: 14,
          fontStyle: 'normal',
          marginLeft: 2
        }}
      >
        {font}
      </span>
    </span>
  );

  if (val > 10000) {
    return showFont();
  } else if (val > 100000000) {
    return showFont('亿', 100000000);
  }
  return result;
};

/**
 * 处理串联 || 的条件
 * @param {*} value 
 * @param {*} valueList 
 */
const judgement = (value, valueList = [undefined, null, '']) => valueList.includes(value);

/**
 * 对象链式取值
 * @param {Array} p 
 * @param {Object} o 
 */
const _get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);

/**
 * 数组去重
 * @param {Array} arr 
 * @param {String} field 
 */
const heavyArray = (arr = [], field = 'recid') => {
  if (!arr) return [];
  if (!(Array.isArray(arr) && arr.length)) return [];
  const isObject = typeof arr[0] === 'object';
  const _hash = {};
  let handleArr = null;

  if (isObject) {
    handleArr = arr.reduce((item, next) => {
      if (_hash[next[field]]) _hash[next[field]] = true && item.push(next);
      return item;
    }, []);
  } else {
    handleArr = arr.reduce((item, next) => {
      if (_hash[next]) _hash[next] = true && item.push(next);
      return item;
    }, []);
  }
  return handleArr;
};

/**
 * 
 * @param {Array} data 
 * @param {Map} funList 
 */

const resultSort = (data, funList) => {
  const dataList = [...data];
  for (const [key, fun] of funList) {
    for (let i = 1; i < dataList.length; i += 1) {
      for (let j = i; j > 0; j -= 1) {
        if (fun(dataList[j - 1], dataList[j]) > 0) {
          const temp = dataList[j - 1];
          dataList[j - 1] = dataList[j];
          dataList[j] = temp;
        } else {
          break;
        }
      }
    }
  }
  return dataList;
};

/**
 * 
 * @param {Array} list 
 * @param {Object} obj 
 * @param {String} fieldname 
 */
const computName = (list, obj, fieldname) => (list && list.find(name => obj[fieldname] && obj[fieldname].includes(name) && name));

/**
 * 
 * @param {Object} aa 
 * @param {Object} bb 
 * @param {String} fieldname 
 * @param {Array} list 
 */
const handleSortResult = (aa, bb, fieldname, list = ['总裁', '总经', '分公司', '一部', '二部', '三部', '四部', '五部', '六部', '七部', '八部', '经理', '员工']) => {
  const aValue = computName(list, aa, fieldname);
  const bValue = computName(list, bb, fieldname);
  const aIdx = aValue ? list && list.indexOf(aValue) : list.length;
  const bIdx = bValue ? list && list.indexOf(bValue) : list.length;
  return aIdx - bIdx;
};

/**
 * 
 * @param {Array} orgdata 
 * @param {Array} TableColumns 
 * @param {Object} filterinfo 
 */
function FilterData(orgdata, TableColumns, filterinfo) {
  if (orgdata === undefined) return [];
  if (Array.isArray(orgdata)) {
    return orgdata.filter(item => {
      try {
        TableColumns.forEach(columnInfo => {
          if (Object.prototype.hasOwnProperty.call(filterinfo, columnInfo.key)) {
            if (judgement(filterinfo[columnInfo.key], [undefined, null, '', 'null', 'undefined', ','])) return true;
            const filterValue = filterinfo[columnInfo.key];
            const dataType = columnInfo.dataType;
            let dataValue = item[columnInfo.key];
            dataValue = judgement(dataValue) ? dataValue : typeof dataValue === 'object' ? dataValue.name : dataValue;

            if (dataType === 'text') {
              if (filterValue === 'isnull') {
                if (!(judgement(dataValue, [undefined, null, '', 0]) || dataValue.length === 0)) {
                  throw new Error('不匹配');
                }
              } else {
                if (!(judgement(filterValue) || filterValue.length === 0)) {
                  if (judgement(dataValue) || dataValue.length === 0) {
                    throw new Error('不匹配');
                  } else {
                    if (dataValue.toLowerCase().indexOf(filterValue.toLowerCase()) < 0) {
                      throw new Error('不匹配');
                    }
                  }
                }
              }
            } else if (dataType === 'number') {
              if (!(judgement(filterValue) || filterValue.length === 0)) {
                if (filterValue === 'isnull') {
                  if (!(judgement(dataValue, [undefined, null, 0, '0', '']) || dataValue.length === 0 || isNaN(dataValue))) throw new Error('不匹配');
                } else {
                  if (judgement(dataValue) || dataValue.length === 0 || isNaN(dataValue)) throw new Error('不匹配');
                  const numbersplits = filterValue.split(',');
                  if (numbersplits[0].length > 0) {
                    if (Number(dataValue) < Number(numbersplits[0])) throw new Error('不匹配');
                  }
                  if (numbersplits[1].length > 0) {
                    if (Number(dataValue) > Number(numbersplits[1])) throw new Error('不匹配');
                  }
                }
              }
            } else if (dataType === 'percent') {
              if (!(judgement(filterValue, [undefined, null, ',']) || filterValue.length === 0)) {
                if (filterValue === 'isnull') {
                  if (!(judgement(dataValue) || dataValue.length === 0 || isNaN(dataValue))) throw new Error('不匹配');
                } else {
                  if (judgement(dataValue) || dataValue.length === 0 || isNaN(dataValue)) throw new Error('不匹配');
                  const numbersplits = filterValue.split(',');
                  if (numbersplits[0].length > 0) {
                    if (Number(dataValue) * 100 < Number(numbersplits[0])) throw new Error('不匹配');
                  }
                  if (numbersplits[1].length > 0) {
                    if (Number(dataValue) * 100 > Number(numbersplits[1])) throw new Error('不匹配');
                  }
                }
              }
            } else if (dataType === 'list') {
              if (!(judgement(filterValue) || filterValue.length === 0)) {
                const selectedItems = filterValue.split(',');
                let checkedOK = false;
                for (let i = 0; i < selectedItems.length; i += 1) {
                  if (selectedItems[i] === 'isnull') {
                    if (judgement(dataValue, [undefined, null, '-1', -1]) || dataValue.length === 0) {
                      checkedOK = true;
                      break;
                    }
                  } else {
                    if (`${dataValue}` === `${selectedItems[i]}`) {
                      checkedOK = true;
                      break;
                    }
                  }
                }
                if (checkedOK === false) throw new Error('不匹配');
              }
            }
          }
        });
      } catch (e) {
        return false;
      }
      return true;
    });
  }
}

/**
 * 
 * @param {*} number 
 * @param {*} places 
 * @param {*} symbol 
 * @param {*} thousand 
 * @param {*} decimal 
 */
function formatMoney(number, places, symbol, thousand, decimal) {
  number = number || 0;
  places = !isNaN(places = Math.abs(places)) ? places : 2;
  symbol = '';
  thousand = thousand || ',';
  decimal = decimal || '.';
  var negative = number < 0 ? '-' : '',
    i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + '',
    j = (j = i.length) > 3 ? j % 3 : 0;
  return symbol + negative + (j ? i.substr(0, j) + thousand : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
}

/**
 * 
 * @param {*} fieldname 
 * @param {*} columnFilter 
 */
function CheckHasFilter(fieldname, columnFilter) {
  if (judgement(fieldname) || fieldname.length === 0) return false;
  if (judgement(columnFilter)) return false;
  if (judgement(columnFilter[fieldname]) || columnFilter[fieldname].length === 0) return false;
  return true;
}

/**
 * 
 * @param {*} fieldname 
 * @param {*} columnFilter 
 */
function GetFilterValue(fieldname, columnFilter) {
  if (judgement(fieldname) || fieldname.length === 0) return null;
  if (judgement(columnFilter)) return null;
  if (judgement(columnFilter[fieldname]) || columnFilter[fieldname].length === 0) return null;
  return columnFilter[fieldname];
}

/**
 * 
 * @param {*} fieldname 
 * @param {*} FilterVisibles 
 */
function GetFilterVisible(fieldname, FilterVisibles) {
  if (judgement(fieldname) || fieldname.length === 0) return false;
  if (judgement(FilterVisibles)) return false;
  if (judgement(FilterVisibles[fieldname]) || FilterVisibles[fieldname].length === 0) return false;
  return FilterVisibles[fieldname];
}

/**
 * 
 * @param {*} num 
 */
function formatCurrency(num) {
  num = num.toString().replace(/\$|\,/g, '');
  if (isNaN(num)) num = '0';
  var sign = (num == (num = Math.abs(num)));
  num = Math.floor(num * 100 + 0.50000000001);
  var cents = num % 100;
  num = Math.floor(num / 100).toString();
  if (cents < 10)
    cents = '0' + cents;
  for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i += 1)
    num = num.substring(0, num.length - (4 * i + 3)) + ',' +
      num.substring(num.length - (4 * i + 3));
  return (((sign) ? '' : '-') + num + '.' + cents);
}

const transfromValue = (fieldname, obj, list) => {
  const _info = obj;
  for (const [key, value] of list) if (_info[fieldname] === value) return _info[fieldname] = key;
};

const _bmwList = new Map([
  ['-1', '空'],
  ['0', 'B'],
  ['1', 'M'],
  ['2', 'W']
]);
const _boolList = new Map([
  ['0', '空'],
  ['1', '是'],
  ['2', '否']
]);
const calculateAttribute = (e, record, keyName) => {
  if (!keyName) return;
  const recordobj = { ...record };
  typeof e !== 'object' ? recordobj[keyName] = e : recordobj[keyName] = e.target.value;
  const transfromList = new Map([
    ['bmwprediction', _bmwList],
    ['newsign', _boolList],
    ['upper', _boolList]
  ]);
  for (const [key, value] of transfromList) {
    if (keyName === key) {
      recordobj[keyName] = transfromValue(key, recordobj, value);
      break;
    }
  }

  const _checkValue = [
    'count',
    'interestrate',
    'patch',
    'agencyfee',
    'income',
    'guaranteedbudget',
    'optimisticbudget'
  ];
  const computedFun = (obj) => { // 计算属性函数
    const bmw = judgement(`${obj.bmwprediction}`, ['0', '1', '2']) ?
      parseInt(obj.bmwprediction, 10) !== 1 ?
        (parseInt(obj.bmwprediction, 10) !== 2 ? 0 : 1)
        : 0.5
      : undefined;
    if (bmw === undefined) {
      _checkValue.forEach(value => obj[value] = 0);
      return { ...obj };
    }
    const count = judgement(obj.count) ? 0 : parseFloat(obj.count, 10);
    const interestrate = judgement(obj.interestrate) ? 0 : parseFloat(obj.interestrate, 10);
    const patch = judgement(obj.patch) ? 0 : parseFloat(obj.patch, 10);
    const agencyfee = judgement(obj.agencyfee) ? 0 : parseFloat(obj.agencyfee, 10);
    let income = judgement(obj.income) ? 0 : parseFloat(obj.income, 10); // 毛利
    let guaranteedbudget = 0; // 必保
    let optimisticbudget = 0; // 乐观

    obj.productname === '短彩流量' &&
      judgement(keyName, ['count', 'interestrate']) &&
      (income = parseFloat(count, 10) * 10000 * parseFloat(interestrate, 10));

    optimisticbudget = parseFloat(patch, 10) + (parseFloat(income, 10) - parseFloat(agencyfee, 10));

    guaranteedbudget = optimisticbudget * bmw;

    return {
      ...obj,
      income,
      guaranteedbudget,
      optimisticbudget
    };
  };

  if (!judgement(keyName, ['support', 'remark'])) {
    if (_checkValue.every(value => judgement(recordobj[value]))) return { ...recordobj, guaranteedbudget: 0, optimisticbudget: 0 };
    return computedFun(recordobj);
  }
  return { ...recordobj };
};

/**
 * monthBudget的table columns的常用 render()
 * @param {*} text 
 * @param {String} dataType 
 */
const tooltipElements = (text, dataType = 'text', width, precision = 2) => {
  const money = formatMoney(Number(text), precision);
  const num = formatWan(Number(text));
  return !judgement(text) ?
    <div
      className={`${text}`.length > 5 ? styles.hide : ''}
      title={`${text}`}
      style={{ textAlign: (!judgement(dataType, ['number', 'num', 'date']) ? 'left' : 'right'), maxWidth: `${width - 21}px` }}
    >
      {dataType === 'number' ? money : dataType === 'num' ? num : `${text}`}
    </div> : '';
};

const tooltipElement = (text, dataType = 'text', width, precision = 2) => {
  const money = formatMoney(Number(text), precision);
  const num = formatWan(Number(text));
  return !judgement(text) ?
    (
      `${text}`.length > 5 ? (
        <Tooltip title={`${text}`} overlayClassName={styles.tooltipElement}>
          <div
            className={styles.hide}
            style={{ textAlign: (!judgement(dataType, ['number', 'num', 'date']) ? 'left' : 'right'), maxWidth: `${width - 21}px` }}
          >
            {dataType === 'number' ? money : dataType === 'num' ? num : `${text}`}
          </div>
        </Tooltip>
      ) : (<div
        title={`${text}`}
        style={{ textAlign: (!judgement(dataType, ['number', 'num', 'date']) ? 'left' : 'right') }}
      >
        {dataType === 'number' ? money : dataType === 'num' ? num : `${text}`}
      </div>
        )
    )
    : '';
};

export {
  NumberInt,
  NumberFloat,
  _get,
  heavyArray,
  resultSort,
  computName,
  handleSortResult,
  judgement,
  tooltipElements,
  tooltipElement,
  FilterData,
  formatMoney,
  CheckHasFilter,
  GetFilterValue,
  GetFilterVisible,
  formatCurrency,
  calculateAttribute,
  _bmwList,
  _boolList,
  expandedArray
};
