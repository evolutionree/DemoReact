const fs = require('fs');
const path = require('path');

const filename = path.resolve(__dirname, '../dist/index.html');

module.exports = () => new Promise((resolve, reject) => {
  console.log('给index.html资源文件(js, css)添加时间戳..');
  fs.readFile(filename, 'utf8', (err, content) => {
    if (err) return reject(err);

    const ts = new Date().getTime();
    const signedContent = content
      .replace(/(index\.css)([\?\d]*)([^\?])/g, `$1?${ts}$3`)
      .replace(/(index\.js)([\?\d]*)([^\?])/g, `$1?${ts}$3`);

    fs.writeFile(filename, signedContent, 'utf8', err2 => {
      if (err2) return reject(err2);
      console.log('添加完成！');
      resolve();
    });
  });
});
