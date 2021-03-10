const fs = require('fs');
const path = require('path');

const soureFile = path.resolve(__dirname, '../index.ejs');
const targetFile = path.resolve(__dirname, '../src/index.ejs');

fs.copyFileSync(soureFile, targetFile);
