import React, { Component } from 'react'
import { Popover, Button, Upload, Icon, message, Radio } from 'antd'
import request, { getDeviceHeaders } from '../../../utils/request'
import styles from './ImportButton.less'

const { Dragger } = Upload

class ImportButton extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isconvertimport: true,
      fileList: [],
      visible: false,
      uploading: false
    }
  }

  onChangeRadio = e => this.setState({ isconvertimport: !!(e.target.value === 1) })

  getUploadParams = file => {
    const { isconvertimport, fileList: data } = this.state
    return { isconvertimport, data, filename: file.name }
  }

  handleUploadChange = info => {
    const { status } = info.file
    let fileList = info.fileList
    fileList = fileList.slice(-1)
    this.setState({ fileList })

    if (status !== 'uploading') console.log(info.file, info.fileList)

    if (info.file.response && info.file.response.error_code !== 0) message.error(info.file.response.error_msg)

    if (status === 'done') {
      message.success(`${info.file.name} 文件上传成功`)
    } else if (status === 'error') {
      message.error(`${info.file.name} 上传失败`)
    }
  }

  beforeUpload = (file, fileList) => {
    this.setState({ fileList })
    return false
  }

  onRemove = file => {
    this.setState(({ fileList }) => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      return { fileList: newFileList }
    })
  }

  submit = () => {
    const { done } = this.props
    const { isconvertimport, fileList } = this.state

    this.setState({ uploading: true })

    if (fileList instanceof Array && fileList.length === 0) {
      message.error('请先选择文件，再执行导入操作')
      return
    }

    const formData = new FormData()
    formData.append('isconvertimport', isconvertimport)
    formData.append('data', fileList[0])

    const xhr = new XMLHttpRequest() // XMLHttpRequest 对象
    xhr.open('post', '/api/ReportRelation/importreportrelation', true)
    xhr.onload = ({ currentTarget }) => {
      const response = JSON.parse(currentTarget.response)
      if (response && response.error_code === 0) {
        // 上传成功
        this.setState({ uploading: false })
        const { data } = response
        if (data.error_code === 0) {
          message.success(data.error_msg)
          this.setState({ visible: false, isconvertimport: true, fileList: [] })
          if (done) done()
        } else {
          message.error(data.error_msg)
        }
      } else {
        this.setState({ uploading: false })
        message.error(response.error_msg)
        console.error(response.error_msg)
      }
    } // 请求完成
    xhr.onerror = e => {
      this.setState({ uploading: false })
      console.error(e.message)
      message.error(e.message)
    } // 请求失败
    const headers = {
      ...getDeviceHeaders(),
      Authorization: 'Bearer ' + this.props.token
    }
    for (const item in headers) {
      xhr.setRequestHeader(item, headers[item])
    }
    xhr.send(formData) // 开始上传，发送form数据
  }

  content = () => {
    const {
      name = 'data',
      accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
      multiple = false,
      action = '/api/excel/importdata'
    } = this.props
    const { isconvertimport, fileList, uploading } = this.state

    const DraggerProps = {
      name,
      accept,
      multiple,
      fileList,
      beforeUpload: this.beforeUpload,
      onRemove: this.onRemove
    }

    return (
      <div style={{ width: 300 }} className={styles.wrap}>
        <Radio.Group style={{ marginBottom: 8 }} onChange={this.onChangeRadio} value={isconvertimport ? 1 : 2}>
          <Radio value={1}>全量导入</Radio>
          <Radio value={2}>覆盖导入</Radio>
        </Radio.Group>

        <Dragger {...DraggerProps} style={{ marginBottom: 8 }}>
          <p style={{ marginBottom: 8 }}>
            <Icon style={{ fontSize: 30, color: '#64b1e4' }} type='inbox' />
          </p>
          <p style={{ fontSize: 14 }}>点击击或拖动文件到此区域</p>
        </Dragger>
        <div style={{ marginTop: 8 }}>
          <Button onClick={this.submit} loading={uploading}>
            开始导入
          </Button>
        </div>
      </div>
    )
  }

  handleVisibleChange = visible => this.setState({ visible })

  render () {
    const { title = '导入', trigger = 'hover', placement = 'top', content } = this.props
    const { visible } = this.state

    return (
      <Popover
        content={content || this.content()}
        visible={visible}
        onVisibleChange={this.handleVisibleChange}
        title={title}
        trigger={trigger}
        placement={placement}
      >
        <Button style={{ marginLeft: 15 }}>导入</Button>
      </Popover>
    )
  }
}

export default ImportButton
