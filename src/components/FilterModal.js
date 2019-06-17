import React, { PropTypes, Component } from 'react'
import { Modal, Select } from 'antd'
import RenderFilterNode from './RenderFilterNode'

const Option = Select.Option

export default class FilterModal extends Component {
  static propTypes = {
    keyName: PropTypes.string,
    title: PropTypes.string,
    protocol: PropTypes.array,
    ColumnFilter: PropTypes.object,
    visible: PropTypes.bool,
    entityId: PropTypes.string
  }
  static defaultProps = {}

  constructor (props) {
    super(props)
    this.state = {
      selectValueList: [],
      ColumnFilter: {},
      loading: false
    }

    this.onhandleSelectChange = this.onhandleSelectChange.bind(this)
    this.cancel = this.cancel.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.entityId !== nextProps.entityId) {
      this.setState({ selectValueList: [], ColumnFilter: {} })
    }
    const isOpening = !this.props.visible && nextProps.visible
    const isClosing = this.props.visible && !nextProps.visible

    if (isOpening) {
      const { ColumnFilter } = this.props
      const fieldnames = ColumnFilter
        ? Object.keys(ColumnFilter)
          .map(item => item)
          .filter(name => ![null, undefined, ''].includes(ColumnFilter[name]))
        : []

      this.setState({
        selectValueList: Array.isArray(fieldnames) ? fieldnames : [],
        ColumnFilter: ColumnFilter || {}
      })
    } else if (isClosing) {
      this.setState({ loading: false })
    }
  }

  handleOk = () => {
    const { keyName, dispatch } = this.props
    const { ColumnFilter } = this.state
    dispatch({ type: `${keyName}/cancelFilter`, payload: ColumnFilter })
    dispatch({ type: `${keyName}/showModals`, payload: '' })
  }

  cancel () {
    const { keyName, dispatch } = this.props
    dispatch({ type: `${keyName}/showModals`, payload: '' })
  }

  onhandleSelectChange (list) {
    const { ColumnFilter } = this.state
    const Obj = {}
    list.forEach(key => {
      if (ColumnFilter.hasOwnProperty(key)) {
        Obj[key] = ColumnFilter[key]
      } else {
        Obj[key] = ''
      }
    })
    this.setState({ selectValueList: list, ColumnFilter: Obj })
  }

  close (value) {
    const { selectValueList, ColumnFilter } = this.state
    const newColumnFilter = { ...ColumnFilter }
    delete newColumnFilter[value]
    this.setState({
      selectValueList: selectValueList.filter(item => item !== value),
      ColumnFilter: newColumnFilter
    })
  }

  handleValue (e, fieldname) {
    const { ColumnFilter } = this.state
    const value = e
    const newColumnFilter = { ...ColumnFilter, [fieldname]: value }
    this.setState({ ColumnFilter: newColumnFilter })
  }

  render () {
    const { visible, title, protocol, dictionaryData, entityId } = this.props
    const { selectValueList, ColumnFilter } = this.state
    const has_No_Filter_Field = [15, 20, 22]
    const defaultProtocol =
      protocol &&
      protocol.filter(field => !has_No_Filter_Field.includes(field.controltype))

    return (
      <Modal
        width={768}
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.cancel}
        centered
        maskClosable
      >
        <div>
          <Select
            mode='tags'
            style={{ width: '100%', marginBottom: 10 }}
            onChange={this.onhandleSelectChange}
            tokenSeparators={[',']}
            allowClear
            value={selectValueList}
            placeholder='请选择筛选项'
          >
            {defaultProtocol.map(item => (
              <Option key={item.fieldname}>{`${item.displayname}`}</Option>
            ))}
          </Select>
          {Array.isArray(selectValueList) &&
            selectValueList.map(name => {
              const record = protocol.find(obj => obj.fieldname === name)
              const fieldid = record.fieldid || ''
              const value = ColumnFilter[name] || ''
              return (
                <RenderFilterNode
                  entityId={entityId}
                  key={fieldid}
                  value={value}
                  record={record}
                  dictionaryData={dictionaryData}
                  onClose={this.close.bind(this)}
                  onHandleValue={this.handleValue.bind(this)}
                />
              )
            })}
        </div>
      </Modal>
    )
  }
}
