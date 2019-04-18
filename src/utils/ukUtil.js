import Fingerprint from 'fingerprintjs';

export function downloadFile(url) { //下载文件
  // 创建隐藏的可下载链接
  let eleLink = document.createElement('a');
  eleLink.download = url;
  eleLink.style.display = 'none';
  // 字符内容转变成blob地址
  eleLink.href = url;
  // 触发点击
  document.body.appendChild(eleLink);
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
}

export function getBrowserUUID() {
  return new Fingerprint({ canvas: true }).get();
}
