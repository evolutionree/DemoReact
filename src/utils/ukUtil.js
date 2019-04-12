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

function bin2hex(s) {
  let o = '';
  let n;
  let string = s + '';
  for (let i = 0; i < string.length; i++) {
    n = string.charCodeAt(i).toString(16);
    o += n.length < 2 ? '0' + n : n;
  }
  return o;
}

export function getBrowserUUID(domain) {
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  let txt = domain;
  ctx.textBaseline = 'top';
  ctx.font = "14px 'Arial'";
  ctx.textBaseline = 'tencent';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText(txt, 2, 15);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText(txt, 4, 17);

  let b64 = canvas.toDataURL().replace('data:image/png;base64,', '');
  let bin = atob(b64);
  let crc = bin2hex(bin.slice(-16, -12));
  return crc;
}

