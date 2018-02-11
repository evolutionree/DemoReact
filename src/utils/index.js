import draftToHtml from 'draftjs-to-html';
import moment from 'moment';
import htmlToDraft from 'html-to-draftjs';
import { convertToRaw, EditorState, ContentState } from 'draft-js';
import * as _ from 'lodash';

export function checkIsDev() {
  let uke_dev = window.uke_dev;
  let uke_dev_local = localStorage.getItem('uke_dev');
  if (uke_dev && !uke_dev_local) {
    localStorage.setItem('uke_dev', uke_dev);
  }
  return !!(uke_dev || uke_dev_local);
}

function getRandomChar(startChar, range) {
  const startCharCode = startChar.charCodeAt(0);
  const randomCharCode = startCharCode + _.random(range);
  return String.fromCharCode(randomCharCode);
}

export function getRandomLetters(length) {
  let len = length;
  let result = '';
  while (len) {
    const startChar = 'a';
    result += getRandomChar(startChar, 25);
    len -= 1;
  }
  return result;
}

export function convertHtmlToEditorState(html) {
  let editorState = EditorState.createEmpty();
  if (html) {
    const blocksFromHtml = htmlToDraft(html);
    const contentBlocks = blocksFromHtml.contentBlocks;
    const contentState = ContentState.createFromBlockArray(contentBlocks);
    editorState = EditorState.createWithContent(contentState);
  }
  return editorState;
}
export function convertEditorStateToHtml(editorState) {
  return draftToHtml(convertToRaw(editorState.getCurrentContent()));
}

/**
 * 格式化文件大小
 * @param bitLength
 * @returns {*}
 */
export function formatFileSize(bitLength) {
  if (!bitLength) return '0KB';
  if (bitLength < (1 * 1024 * 1024)) return fmNumber(bitLength / 1024) + 'KB';
  return fmNumber(bitLength / 1024 / 1024) + 'MB';

  function fmNumber(x) {
    return x > 10 ? Math.round(x) : Math.round(x * 100) / 100;
  }
}

/**
 * 格式化时间（邮件）
 * @param time
 * @returns {string}
 */
export function formatTime(time) {
  if (!time || time === '0001-01-01 00:00:00') return '';
  const mtime = moment(time);
  if (!mtime.isValid()) return '';
  const now = moment();
  if (mtime.isSame(now, 'day')) {
    return '今天' + mtime.format('HH:mm');
  } else if (mtime.isSame(now.subtract(1, 'd'), 'day')) {
    return '昨天' + mtime.format('HH:mm');
  } else {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    moment.locale('zh-cn');
    return mtime.format(`MM-DD(周${days[mtime.day()]})`);
  }
}

export function getCurrentMonthFirstDay() {
  return moment().startOf('month').format('YYYY-MM-DD');
}
export function getCurrentDay() {
  return moment().format('YYYY-MM-DD');
}
export function getDateStr(num, format = 'YYYY-MM-DD') { //获取当前日期前后N天
  return moment().subtract(num, 'days').format(format);
}

/*
 返回时间的时间戳
 */
export function getTimeStamp(timeStr) {
  const timeStamp = Date.parse(new Date(timeStr));
  return timeStamp / 1000;
}

/**
 * 将数组转化为树形结构
 * @param array 形如 [{ nodepath: 0, ancestor: 'xxx', deptid: 'xxx' }]
 * @param idKey
 * @param [pathKey]
 * @returns {[*]}
 */
export function transformArrayToTree(array, idKey = 'id', pathKey) {
  const root = _.find(array, item => item.nodepath === 0);
  const tree = [root];
  loopChildren(tree);
  return tree;

  function loopChildren(nodes, parentNode) {
    nodes.forEach((node, index) => {
      if (pathKey) {
        node.path = parentNode ? [...parentNode.path, node[pathKey]] : [node[pathKey]];
      }
      const id = node[idKey];
      const children = array.filter(item => item.ancestor === id);
      nodes[index].children = children;
      loopChildren(children, node);
    });
  }
}

/**
 * 遍历树
 * @param nodes
 * @param callback
 * @param childrenKey
 */
export function treeForEach(nodes, callback, childrenKey = 'children') {
  nodes.forEach(node => {
    if (node[childrenKey]) {
      treeForEach(node[childrenKey], callback, childrenKey);
    }
    callback(node);
  });
}

/**
 * 过滤树
 * @param nodes
 * @param filter
 */
export function treeFilter(nodes, filter) {
  return nodes.filter(node => {
    if (filter(node)) {
      if (node.children && node.children.length) {
        node.children = treeFilter(node.children, filter);
      }
      return true;
    } else {
      return false;
    }
  });
}

export function treeFilter2(nodes, predicate, options) {
  const opt = {
    childrenKey: 'children',
    reservePath: false,
    ...options
  };
  const { childrenKey, reservePath } = opt;
  const retNodes = [];
  nodes.forEach(node => {
    if (predicate(node)) {
      const _node = _.clone(node);
      if (_node[childrenKey]) {
        _node[childrenKey] = treeFilter2(_node[childrenKey], predicate, opt);
      }
      retNodes.push(_node);
    } else if (reservePath) {
      let children = node[childrenKey];
      if (children) {
        children = treeFilter2(children, predicate, opt);
        if (children.length) {
          const _node = _.clone(node);
          _node[childrenKey] = children;
          retNodes.push(_node);
        }
      }
    }
  });
  return retNodes;
}

/**
 * 将数组转化为树形结构(客户关系树)
 * @param array
 * @param idKey
 * @returns {[*]}
 */
export function customertransformArrayToTree(array, idKey = 'id') {
  const root = _.find(array, item => item.depth === 1);
  const tree = [root];
  loopChildren(tree);
  return tree;

  function loopChildren(nodes) {
    nodes.forEach((node, index) => {
      const id = node[idKey];
      const children = array.filter(item => item.parent_id === id);
      nodes[index].children = children;
      loopChildren(children);
    });
  }
}

/**
 * 获取地址栏参数的值
 * @param sArgName
 * @returns string
 */
export function GetArgsFromHref(sArgName) {
  let sHref = window.location;
  let args = sHref.toString().split( "?" );
  let retval = '';
  if (args[0] == sHref) /*参数为空*/ {
    return retval;
  }
  let str = args[1];
  args = str.toString().split("&");
  for (let i = 0; i < args.length; i++) {
    str = args[i];
    let arg = str.toString().split("=");
    if (arg.length <= 1) continue;
    if (arg[0] == sArgName) retval = arg[1];
  }
  return retval;
}



/**
 * 根据给出的路径搜索，过滤出符合条件的数据
 * @param treeData
 * @param pathSearches // 指定搜索路径 [{ path: '广州市.天河区', includeSubNode: true }]
 * @param excludeSearches // 指定搜索路径(除外) ['广州市.天河区']
 * @returns {Array}
 */
export function resolveTreeByPathSearch(treeData = [], pathSearches = [], excludeSearches = []) {
  let retTreeData = treeData;
  if (pathSearches.length) {
    retTreeData = filterTreeByPathSearch(_.cloneDeep(treeData), pathSearches);
  }
  if (excludeSearches.length) {
    retTreeData = excludeTreeByPathSearch(_.cloneDeep(treeData), excludeSearches);
  }
  return retTreeData;
}
function filterTreeByPathSearch(treeData, pathSearches) {
  function loopNodes(nodes, conPaths, presetSelectable, presetShow) {
    const showNodes = [];
    nodes.forEach(node => {
      const nodePath = node.path;

      let show = presetShow || false;
      let showChildren = true;
      let forceShowChildren = presetShow || false;
      let selectable = presetSelectable || false;
      let childrenConPaths = [];

      // if (node.recstatus !== 0) {
        conPaths.forEach(item => {
          const { path: conPath, includeSubNode = false } = item;
          if (_.isEqual(nodePath, conPath)) { // ['广东省', '广州市'] equal ['广东省', '广州市']
            show = true;
            selectable = true;
            if (!includeSubNode) {
              showChildren = false;
              forceShowChildren = false;
            } else {
              forceShowChildren = true;
            }
          } else if (startWith(conPath, nodePath)) {
            childrenConPaths.push(item);
            show = true;
          }
        });
      // }

      if (show) {
        showNodes.push(node);

        if (!showChildren) {
          node.children = [];
        } else if (childrenConPaths.length) {
          node.children = loopNodes(node.children || [], childrenConPaths, true, forceShowChildren);
        }
        node.selectable = selectable;
      }
    });
    return showNodes;
  }
  const resolvedPaths = resolvePathSearch(pathSearches, treeData);
  const retTreeData = loopNodes(treeData, resolvedPaths);
  return retTreeData;
}
function excludeTreeByPathSearch(treeData, excludeSearches) {
  function loopNodes(nodes, conPaths) {
    return nodes.filter(node => {
      const nodePath = node.path;
      const exclude = conPaths.some(conPath => _.isEqual(conPath, nodePath));
      if (!exclude) {
        const childrenConPaths = conPaths.filter(conPath => {
          return startWith(conPath, nodePath) && conPath.length !== nodePath.length;
        });
        if (childrenConPaths.length) {
          node.children = loopNodes(node.children, childrenConPaths);
        }
      }
      return !exclude;
    });
  }
  const resolvedPaths = resolvePathSearch(excludeSearches, treeData);
  const retTreeData = loopNodes(treeData, resolvedPaths);
  return retTreeData;
}
/**
 * 根据搜索，遍历树，返回所有匹配的路径
 * @param pathSearches [{ path: '广州市.天河区', includeSubNode: true }] | ['广州市.天河区']
 * @param treeData
 * @returns {Array}
 */
function resolvePathSearch(pathSearches, treeData) {
  let paths = pathSearches.map(item => {
    const isObject = typeof item === 'object';
    const strSearch = isObject ? item.path : item;
    return resolvePathSearchSingle(strSearch, treeData).map(path => {
      return isObject ? { path, includeSubNode: item.includeSubNode } : path;
    });
  });
  paths = _.flatten(paths);
  paths = paths.filter(item => !!item);
  return paths;
}
function resolvePathSearchSingle(searchString, treeData) {
  const resultPaths = [];
  const arrPathSearch = searchString.split('.');
  if (arrPathSearch.length) {
    treeForEach(treeData, node => {
      const nodePath = node.path;
      if (!nodePath) return;
      // if (node.productsetname === '测试编码') debugger;
      if (node.recstatus === 0) return;
      if (endWith(nodePath, arrPathSearch)) {
        resultPaths.push(nodePath);
      }
    });
  }
  return resultPaths;
}
// ['广东省', '广州市', '天河区'] endWith ['广州市', '天河区']
function endWith(path, other) {
  if (path.length < other.length) return false;
  const revPath = _.reverse([...path]);
  const revOther = _.reverse([...other]);
  return revOther.every((item, index) => {
    return revPath[index] === item;
  });
}
// ['广东省', '广州市', '天河区'] startWith ['广东省', '广州市']
function startWith(path, other) {
  if (path.length < other.length) return false;
  return other.every((item, index) => {
    return path[index] === item;
  });
}

// 遍历treedata，找到匹配path的节点
export function matchPath(treeData = [], givenPath = '', pathKey = 'name', callback) {
  for (let i = 0; i < treeData.length; i += 1) {
    const node = treeData[i];
    const { pFullPath = '', children } = node;
    const fullPath = getNodeFullPath(node, pFullPath, pathKey);

    const arrPathKey = pathKey.split('||');
    const lastKey = arrPathKey[arrPathKey.length - 1];

    if (checkNodePathMatched(fullPath, givenPath) && node[lastKey]) {
      callback(node);
      return;
    }
    if (children && children.length) {
      children.forEach(item => { item.pFullPath = fullPath; });
      matchPath(children, givenPath, pathKey, callback);
    }
  }
}
function checkNodePathMatched(fullPath, givenPaths) {
  return givenPaths.split(',').some(path => new RegExp(path + '$').test(fullPath));
}
function getNodeFullPath(node, parentFullPath, pathKey) {
  const arrPathKey = pathKey.split('||');
  if (arrPathKey.length === 1) {
    return parentFullPath ? (parentFullPath + '.' + node[pathKey]) : node[pathKey];
  } else {
    return parentFullPath
      ? (parentFullPath + '.' + (node[arrPathKey[0]] || node[arrPathKey[1]]))
      : (node[arrPathKey[0]] || node[arrPathKey[1]]);
  }
}

/**
 * 数字加千分位，支持小数
 * @param val
 * @returns {*}
 */
export function addSeparator(val) {
  if (!val) return val;

  let arr = (val + '').split('.');
  let intStr = arr[0].replace(/^0+/g, '');
  intStr = intStr || '0';
  let intArr = intStr.split('').reverse();
  let intFormatted = '';
  intArr.forEach(function(n, index) {
      if (index % 3 === 0 && index !== 0) {
          intFormatted = ', ' + intFormatted;
      }
      intFormatted = n + intFormatted;
  });

  if (arr[1]) {
      return intFormatted + '.' + arr[1];
  } else {
      return intFormatted;
  }
}
