const fs = require('fs');
const archiver = require('archiver');

module.exports = (sourceDir, outputPath) => new Promise((resolve, reject) => {
  // create a file to stream archive data to.
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  // listen for all archive data to be written
  output.on('close', () => {
    console.log('打包完成，文件大小 ' + archive.pointer() + ' 字节');
    resolve(outputPath);
  });

  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', err => {
    if (err.code === 'ENOENT') {
      // log warning
    } else {
      // throw error
      reject(err);
    }
  });

  // good practice to catch this error explicitly
  archive.on('error', err => {
    reject(err);
  });

  // pipe archive data to the file
  archive.pipe(output);

  // append files from a sub-directory, putting its contents at the root of archive
  archive.directory(sourceDir, false);

  // // append files from a glob pattern
  // archive.glob('subdir/*.txt');

  // finalize the archive (ie we are done appending files but streams have to finish yet)
  archive.finalize();

  console.log('开始打包dist目录...');
});
