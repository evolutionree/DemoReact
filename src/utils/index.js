import React from 'react';
import draftToHtml from 'draftjs-to-html';
import { Modal, message, Tooltip, Icon } from 'antd';
import * as _ from 'lodash';
import moment from 'moment';
import copy from 'copy-to-clipboard';
import htmlToDraft from 'html-to-draftjs';
import { convertToRaw, EditorState, ContentState } from 'draft-js';

import { photoCompress } from './photoCompress';

const confirm = Modal.confirm;
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
 * 复制到剪贴板
 * @param text
 * @returns {*}
 */
export function copyAction(text) {
  copy(text);
  message.success(`已复制 [${text}] 到剪切板`);
}

export function copyNode(text, name) {
  return (
    <Tooltip title={`点击复制${name}`}>
      <Icon
        type="copy"
        style={{ cursor: 'pointer', marginRight: 5 }}
        onClick={() => copyAction(text)}
      />
    </Tooltip>
  );
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
  let args = sHref.toString().split("?");
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
  let retTreeData = _.cloneDeep(treeData);
  if (pathSearches.length) {
    retTreeData = filterTreeByPathSearch(retTreeData, pathSearches);
  }
  if (excludeSearches.length) {
    retTreeData = excludeTreeByPathSearch(retTreeData, excludeSearches);
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
    return revPath[index].indexOf(item) > -1;
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

  let flag = 1;
  if (val < 0) {
    flag = 0;
    val = -val;
  }
  let str = val.toString();

  //n为小数部分
  let n = str.slice(str.lastIndexOf('.'))
  if (n.indexOf('.') === -1) {
    n = '';
  }

  //str为整数部分
  let interStr = parseInt(val).toString();
  let list = interStr.split('').reverse();
  for (let i = 0; i < list.length; i++) {
    if (i % 4 === 3) {
      list.splice(i, 0, ',');
    }
  }
  if (flag === 1) {
    return list.reverse().join('') + n;
  } else {
    return '-' + list.reverse().join('') + n;
  }
}

export function uploadImg(uploadObj, onSuccess, isProvideCompress = true) { //isProvideCompress ture:让用户选择上传原图/上传压缩图  false: 直接上传压缩图
  if (isProvideCompress) {
    confirm({
      title: '是否上传压缩图？',
      okText: '  是  ',
      cancelText: '上传原图',
      onOk() {
        photoCompressAjax(); //压缩上传
      },
      onCancel() {
        AjaxFileData(uploadObj.file); //不压缩直接上传
      }
    });
  } else {
    photoCompressAjax();
  }

  function photoCompressAjax() {
    if (uploadObj.file.size / 1024 > 600) { //大于600/1024 M，进行压缩上传
      photoCompress(uploadObj.file, function (imgBlob) {
        AjaxFileData(imgBlob);
      });
    } else {
      AjaxFileData(uploadObj.file);
    }
  }

  function AjaxFileData(imgData) {
    let form = new FormData(); // FormData 对象
    form.append('data', imgData); // 文件对象
    form.append('filename', uploadObj.file.name); // 文件对象
    let xhr = new XMLHttpRequest();  // XMLHttpRequest 对象
    xhr.open('post', uploadObj.action, true); //post方式，url为服务器请求地址，true 该参数规定请求是否异步处理。
    xhr.onload = ({ currentTarget }) => {
      const response = JSON.parse(currentTarget.response);
      if (response && response.error_code === 0) {
        // 上传成功，拿uuid
        const fileId = response.data;
        onSuccess && onSuccess(fileId);
      } else {
        console.error(response.error_msg);
      }
    }; //请求完成
    xhr.onerror = uploadObj.onError; //请求失败
    const headers = uploadObj.headers;
    for (let item in headers) {
      xhr.setRequestHeader(item, headers[item]);
    }
    xhr.send(form); //开始上传，发送form数据
  }
}

export function uuid() { //生成uuid
  let s = [];
  let hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-';

  let uuid = s.join('');
  return uuid;
}

export function getDefaultPath(data) {
  let defaultPath = '';
  let findFirstPath = true;

  let menuData = data;
  function loop(menus) {
    for (let i = 0; i < menus.length; i++) {
      if (menus[i].children && menus[i].children.length > 0) {
        loop(menus[i].children);
      } else {
        if (menus[i].isDefaultPage * 1 === 1) {
          defaultPath = menus[i].path;
          break;
        }
        if (findFirstPath && menus[i].path) {
          defaultPath = menus[i].path;
          findFirstPath = false;
        }
      }
    }
  }
  loop(menuData);
  return defaultPath;
}

export function heighLightKeyWord(text, keyword) {
  const index = text.indexOf(keyword);
  const beforeStr = text.substr(0, index);
  const afterStr = text.substr(index + keyword.length);
  return index > -1 ? (
    <span>
      {beforeStr}
      <span style={{ color: '#f50' }}>{keyword}</span>
      {afterStr}
    </span>
  ) : <span>{text}</span>;
}
