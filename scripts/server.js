const path = require('path')
const os = require('os')
const fs = require('fs')

const FILE_URL = path.resolve(__dirname, '../package.json')
const NETWORK = os.networkInterfaces()
let CURRENT_IP = ''

// 获取本机ip地址
Object.keys(NETWORK).forEach(v => {
  for (let i = 0; i < NETWORK[v].length; i++) {
    if (
      !NETWORK[v][i].internal &&
      NETWORK[v][i].family.toLocaleLowerCase() === 'ipv4'
    ) {
      CURRENT_IP = NETWORK[v][i].address
    }
  }
})

// 设置ip地址到 init 命令
fs.readFile(FILE_URL, 'utf8', (err, data) => {
  if (err) throw err
  const regexp = /("init": )(.+)(roadhog server",)/g
  const replaceStr = `"set HOST=${CURRENT_IP}&&`
  const _data = data.replace(regexp, '$1' + replaceStr + '$3')

  fs.writeFile(FILE_URL, _data, err => {
    if (err) throw err
    console.log(`本机IP地址: ${CURRENT_IP}`)
  })
})
