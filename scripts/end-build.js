const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '../dist/index.html');
const roadhogPath = path.resolve(__dirname, '../.roadhogrc');

// 同步获取html文件夹
const html = fs.readFileSync(indexPath).toString();

// 匹配获取link标签
const matchedLinks = html.match(/<link href=".\/.*?rel="stylesheet">/gi);
// 匹配获取script标签
const matchedScripts = html.match(/<script type="text\/javascript" src=".\/.*?<\/script>/gi);

if (matchedLinks.length <= 1 && matchedScripts.length <= 1) {
  console.log('无可修改文件');
  return;
}

// 获取入口文件名称
const data = fs.readFileSync(roadhogPath).toString();
const entryStr = data.match(/src.*?.js/gi);
const htmlNames = [];
entryStr.forEach(s => {
  const arr = s.split('/');
  const last = arr[arr.length - 1];
  htmlNames.push(last.split('.')[0]);
});

// 遍历修改文件
htmlNames.forEach(h => {
  const link = matchedLinks.find(l => l.indexOf(h) > -1);
  const script = matchedScripts.find(l => l.indexOf(h) > -1);
  const reLink = `${link}`;
  const reScript = `${script}`;
  const htmlPath = path.resolve(__dirname, `../dist/${h}.html`);
  let newHtml = html;
  if (h === 'index') {
    newHtml = newHtml.replace(/<link href=".\/index.*?<\/head>/, '</head>').replace(/<script type="text\/javascript" src=".\/index.*?<\/body>/, '</body>');
  } else {
    newHtml = fs.readFileSync(htmlPath).toString();
  }
  if (link) newHtml = newHtml.replace(`<link href="${h}.css" rel="stylesheet">`, reLink);
  if (script) newHtml = newHtml.replace(`<script type="text/javascript" src="${h}.js"></script>`, reScript);
  fs.writeFileSync(htmlPath, newHtml);
});

// 删除pre-build脚本复制在src里面的index.ejs文件
fs.unlinkSync(path.resolve(__dirname, '../src/index.ejs'));

