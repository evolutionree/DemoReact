/**
 * 用于打包部署到服务器
 * 支持三个选项：
 *  -s 跳过打包环节（直接取 REMOTE_PATH_ZIP_FILE 文件发布）
 *  -d 发布到开发环境
 *  -t 发布到测试环境
 */
const path = require('path');
const pack = require('./pack');
const signFile = require('./sign-file');
const deploy = require('./deploy');

const LOCAL_PATH_SOURCE = path.resolve(__dirname, '../dist');
const LOCAL_PATH_ZIP_FILE = path.resolve(__dirname, 'crmweb.zip');

const REMOTE_PATH_ZIP_FILE = '/data/approot/crmweb.zip';
const REMOTE_PATH_DEV = '/data/approot/crmweb';
const REMOTE_PATH_TEST = '/data/approot/crmweb_v732';

__main();

function __main() {
  const deployTargets = [];
  const opts = getOpts();
  const { s: skip, d: dev, t: test } = opts;
  if (dev) {
    deployTargets.push(REMOTE_PATH_DEV);
  }
  if (test) {
    deployTargets.push(REMOTE_PATH_TEST);
  }

  if (skip) {
    Promise.resolve()
      .then(deploy.bind(null, LOCAL_PATH_ZIP_FILE, REMOTE_PATH_ZIP_FILE, deployTargets))
      .catch(err => {
        console.error(err);
      });
  } else {
    Promise.resolve()
      .then(signFile)
      .then(pack.bind(null, LOCAL_PATH_SOURCE, LOCAL_PATH_ZIP_FILE))
      .then(deploy.bind(null, LOCAL_PATH_ZIP_FILE, REMOTE_PATH_ZIP_FILE, deployTargets))
      .catch(err => {
        console.error(err);
      });
  }
}

function getOpts() {
  const obj = {
    s: false, // 跳过打包环节
    d: false, // 发布到开发环境
    t: false // 发布测试环境
  };
  Array.from(process.argv).forEach(arg => {
    const match = arg.match(/^-(\w+)/);
    if (match) {
      obj[match[1]] = true;
    }
  });
  return obj;
}
