import React from 'react'
import { Button, Popover } from 'antd'
import { downloadFile } from '../../utils/ukUtil';

const PopoverButton = (props) => {
  const {
    title = '请选择操作', id, name = '(空)',
    readed, downLoad,
    content, ...rest
  } = props

  const match = /.pdf$/g.test(name)

  const nodes = (
    <div>
      {
        match && <Button type="primary" onClick={readed.bind(null, id, name)} style={{ marginRight: 16 }}>查看</Button>
      }
      <Button type="primary" onClick={() => downloadFile(`/api/fileservice/download?fileid=${id}`)}>下载</Button>
    </div>
  )

  return (
    <Popover
      content={content || nodes}
      title={title}
      // trigger="click"
      {...rest}
    >
      <a href="javascript:;">{name}</a>
    </Popover>
  )
}

export default PopoverButton
