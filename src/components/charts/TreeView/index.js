import React, { PropTypes, Component } from 'react'
import { Tree, Input, message } from 'antd'
import classnames from 'classnames'
import _ from 'lodash'
import styles from './index.less'

const Search = Input.Search
const { TreeNode } = Tree

function transformResultToTree (data) {
  if (!(Array.isArray(data) && data.length)) return []
  const root = _.find(data, item => item.parentid === '00000000-0000-0000-0000-000000000000')
  const tree = [root]

  function loopChildren (nodes) {
    nodes.forEach((node, index) => {
      node.key = node.recid
      node.label = node.recname

      const children = data.filter(item => item.parentid === node.recid)
      nodes[index].children = children.length ? children : undefined
      loopChildren(children)
    })
  }

  loopChildren(tree)
  return tree
}

const getTreeTitle = (text, keyword) => {
  if (!(text && keyword)) return text
  const index = text.indexOf(keyword)
  const beforeStr = text.substr(0, index)
  const afterStr = text.substr(index + keyword.length)
  return index > -1 ? (
    <span>
      {beforeStr}
      <span style={{ color: '#f50' }}>{keyword}</span>
      {afterStr}
    </span>
  ) : (
    <span>{text}</span>
  )
}

const getParentKey = (value, tree, field = 'recid') => {
  let parentKey

  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some(item => item[field] === value)) {
        parentKey = node.key
      } else if (getParentKey(value, node.children, field)) {
        parentKey = getParentKey(value, node.children, field)
      }
    }
  }
  return parentKey
}

class TreeView extends Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    onChange: PropTypes.func,
    selected: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    departmentSelectable: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this.state = {
      list: [],
      cacheList: [],
      originList: [],
      expandedKeys: [],
      searchValue: ''
    }
    this.onSearch = _.debounce(this.onSearch, 500)
  }

  componentDidMount () {
    const { list, expandedKeys } = this.props
    if (Array.isArray(list) && list.length) {
      const result = transformResultToTree(list)
      this.setState({
        list: result,
        cacheList: result,
        originList: list,
        expandedKeys
      })
    }
    message.config({
      maxCount: 3,
      getContainer: this.treeNode
    })
  }

  componentWillReceiveProps (nextProps) {
    const { list: oldList } = this.props
    const { list: newList, expandedKeys } = nextProps

    if (oldList !== newList) {
      const result = transformResultToTree(newList)
      this.setState({
        list: result,
        cacheList: result,
        originList: newList,
        expandedKeys
      })
    }
  }

  parseValue = () => {
    const { value } = this.props
    if (!value) return []
    return value.split(',')
  }

  onSelectChange = (value, event) => {
    const { onChange } = this.props

    if (onChange) onChange(value.join(','), event)
  }

  renderTreeNodes (data, searchValue) {
    return data.map(item => {
      const title = getTreeTitle(item.label, searchValue)
      return item.children && item.children.length ? (
        <TreeNode key={item.key} title={title} selectable={this.props.departmentSelectable}>
          {this.renderTreeNodes(item.children, searchValue)}
        </TreeNode>
      ) : (
        <TreeNode key={item.key} title={title} isLeaf />
      )
    })
  }

  onChangeSearch = e => {
    const value = e.target.value
    this.setState({ searchValue: value }, _.debounce(this.onSearch, 50).bind(null, value))
  }

  onSearch = (value, searchType) => {
    const { onSearch, comboKeyOption, searchFilter, expandedKeys: defaultExpandedKeys } = this.props
    const { cacheList, originList } = this.state

    if (comboKeyOption) {
      const { key, title } = comboKeyOption

      const expandedKeys = originList
        .map(item => {
          return item[title].indexOf(value) > -1 ? getParentKey(item[key], cacheList, key) : null
        })
        .filter((o, i, self) => o && self.indexOf(o) === i)

      if (!expandedKeys.length) {
        this.setState({ searchValue: value })
        if (searchType === 'onSearch') message.info('没有匹配的数据！')
        return
      }

      if (onSearch) onSearch(value)

      if (searchFilter) {
        const filterChildren = data => {
          let totalMatch = false
          for (let k in data) {
            let isMatch = data[k][title].indexOf(value) > -1
            if (!isMatch && Array.isArray(data[k].children)) {
              isMatch = filterChildren(data[k].children)
            }
            if (!isMatch) delete data[k]
            if (isMatch) totalMatch = true
          }
          return totalMatch
        }

        const _list = _.cloneDeep(cacheList)
        filterChildren(_list)

        this.setState({ list: _list })
      }

      this.setState({
        expandedKeys: value ? expandedKeys : defaultExpandedKeys || [],
        searchValue: value
      })
    }
  }

  onExpand = expandedKeys => this.setState({ expandedKeys })

  render () {
    const {
      width = '100%',
      height = '100%',
      style,
      className,
      checkable,
      departmentSelectable,
      placeholder
    } = this.props
    const { list, searchValue, expandedKeys } = this.state
    const value = this.parseValue()

    return (
      <div
        className={className}
        ref={node => (this.treeNode = node)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width,
          height,
          borderRadius: '4px',
          boxShadow: '0 0 8px rgba(0, 0, 0, 0.2)',
          ...style
        }}
      >
        <div
          style={{
            background: '#f5f5f5',
            padding: '8px 12px',
            borderBottom: '1px solid #d9d9d9'
          }}
        >
          <Search
            width='100%'
            value={searchValue}
            placeholder={placeholder}
            onChange={this.onChangeSearch}
            onSearch={value => this.onSearch(value, 'onSearch')}
          />
        </div>
        {list.length ? (
          <div style={{ width, height: height - 56, overflow: 'auto' }}>
            <Tree
              className={classnames(className, {
                [styles.parentNotSelectable]: !departmentSelectable
              })}
              checkedKeys={value}
              selectedKeys={value}
              onCheck={this.onSelectChange}
              onSelect={this.onSelectChange}
              checkable={checkable}
              onExpand={this.onExpand}
              expandedKeys={expandedKeys}
              style={{ width: '100%' }}
            >
              {this.renderTreeNodes(list, searchValue)}
            </Tree>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 10 }}>没有对应数据！</div>
        )}
      </div>
    )
  }
}

export default TreeView
