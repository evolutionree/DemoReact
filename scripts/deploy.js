const Client = require('ssh2').Client;

const SERVER = {
  host: '10.187.134.10',
  port: 22,
  username: 'root',
  password: 'Set0322@'
};

module.exports = (localFilePath, remoteFilePath, deployTargets) => {
  if (!deployTargets.length) {
    return Promise.reject(new Error('未指定发布路径'));
  }

  const conn = new Client();

  return Promise.resolve()
    .then(connectServer)
    .then(upload)
    .then(() => {
      return Promise.all(deployTargets.map(unzip));
    });

  function connectServer() {
    return new Promise((resolve, reject) => {
      console.log('连接服务器..');
      conn.on('ready', () => {
        console.log('连接服务器成功！');
        resolve(conn);
      });
      conn.on('error', reject);
      conn.connect(SERVER);
    });
  }

  function upload() {
    return new Promise((resolve, reject) => {
      console.log('上传压缩包 ' + localFilePath + ' ==> ' + remoteFilePath);
      conn.sftp((err, sftp) => {
        if (err) return reject(err);

        sftp.fastPut(localFilePath, remoteFilePath, (err2, result) => {
          if (err2) return reject(err2);

          console.log('上传完成！');
          resolve(result);
        });
      });
    });
  }

  function unzip(target) {
    return new Promise((resolve, reject) => {
      // console.log(`unzip -o ${REMOTE_PATH} -d ${TARGET_PATH_DEV}`);
      // resolve();

      const cmd = `unzip -o ${remoteFilePath} -d ${target}`;
      console.log('解压压缩包 ' + cmd);

      conn.shell((err, stream) => {
        if (err) return reject(err);

        stream.on('close', () => {
          console.log('完成文件覆盖！');
          conn.end();
          resolve();
        }).on('data', data => {
          // console.log('STDOUT: ' + data);
        }).stderr.on('data', data => {
          console.log('STDERR: ' + data);
        });
        stream.end(`${cmd}\nexit\n`);
      });
    });
  }
};
