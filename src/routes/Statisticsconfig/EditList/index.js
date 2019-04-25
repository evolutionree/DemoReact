import React, { Component } from 'react';
import { Button, Icon, message, Tooltip } from 'antd';
import IntlEdittableCell from '../../../components/UKComponent/Form/IntlEdittableCell';
import styles from './index.less';

const NodeChildren = (props) => {
  const { record = {}, onChange, api, isEdit, ...rest } = props;
  return (
    isEdit ? (
      <IntlEdittableCell
        style={{ width: 'calc(100% - 10px)' }}
        record={record}
        onChange={onChange}
        api={api}
        {...rest}
      />
    ) : <div>{record ? record.displayname : ''}</div>
  );
};

class EditList extends Component {
  constructor(props) {
    super(props);
    const list = this.addId(props.list);
    this.state = {
      list,
      cacheList: list
    };
  }

  previousCell = null;
  listDom = null;

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    const thisProps = this.props;
    if (nextProps.list.length !== thisProps.list.length) {
      const list = this.addId(nextProps.list);
      this.setState({ list, cacheList: list });
    }
  }

  addId = list => (list.map((item, id) => ({ ...item, id })));

  add = () => {
    const { list } = this.state;
    const newRow = {
      id: list.length
    };
    const newList = [...list, newRow];
    this.setState({ list: newList });
  }

  restList = () => {
    message.success('列表已重置');
    this.setState({ list: this.state.cacheList });
  }

  onChangeItem = (record, e) => {
    const { onChange } = this.props;
    if (onChange) onChange(record, e);
  }

  callback = self => {
    if (this.previousCell) this.previousCell.check();
    this.previousCell = self;
  };

  render() {
    const { width = 250, height = 200, title = '标题', tips = '提示信息' } = this.props;
    const { list } = this.state;
    return (
      <div className={styles.wrap} style={{ width }}>
        <div className={styles.header}>
          <div>
            <span>{title}</span> <small>共{list.length}条</small>
          </div>
          <div>
            <Tooltip title={tips}>
              <Icon className={styles.helf} type="question-circle" />
            </Tooltip>
            <Icon title="点击重置列表" className={styles.reset} type="sync" onClick={this.restList} />
          </div>
        </div>
        <div className={styles.wrapList}>
          <div className={styles.list} style={{ height }} ref={node => this.listDom = node}>
            {
              list.length ? list.map(item => (
                <NodeChildren
                  key={item.id}
                  record={item}
                  className={styles.children}
                  active={styles.childrenActive}
                  onChange={this.onChangeItem}
                  isEdit
                  callback={this.callback}
                />
              )) : null
            }
          </div>
        </div>
        <div className={styles.footer}>
          <Button
            title="点击增加一项"
            type="dashed"
            onClick={this.add}
          >
            <Icon type="plus" />
          </Button>
        </div>
      </div>
    );
  }
}

export default EditList;
