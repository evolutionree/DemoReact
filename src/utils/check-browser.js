import UAParser from 'ua-parser-js';

const parser = new UAParser();
const engine = parser.getEngine();

if (!isSupportedEngine(engine)) {
  showTips();
}

function isSupportedEngine(engine) {
  // Gecko, WebKit
  const name = engine.name;
  console.log('enginename' + name);
  return /gecko|webkit|edgehtml|blink/.test(name.toLowerCase());
}

function showTips() {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.right = '0';
  div.style.bottom = '0';
  div.style.backgroundColor = '#fff';
  div.innerHTML = `
    <p style="margin: 100px auto auto;width: 400px;text-align: center;">
      不支持此浏览器,建议使用<a href="https://www.baidu.com/s?wd=chrome">谷歌浏览器</a>，或使用<a href="https://www.baidu.com/s?wd=360%E6%B5%8F%E8%A7%88%E5%99%A8">360浏览器极速模式</a>。
    </p>
  `;
  document.body.appendChild(div);
}
