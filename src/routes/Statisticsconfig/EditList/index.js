import React, { Component } from 'react';
import { Button, Icon, message, Tooltip } from 'antd';
import classNames from 'classnames';
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
    const list = this.addFields(props.list);
    this.state = {
      list,
      cacheList: list
    };
  }

  previousCell = null;

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    const thisProps = this.props;
    if (nextProps.list.length !== thisProps.list.length) {
      const list = this.addFields(nextProps.list);
      this.setState({ list, cacheList: list });
    }
  }

  addFields = list => (list.map((item, id) => ({ ...item, id, active: false })));

  add = () => {
    const { list } = this.state;
    const newRow = {
      id: list.length
    };
    const newList = [...list, newRow];
    this.setState({ list: newList });
  }

  restList = () => {
    const { list } = this.state;
    if (list.length) {
      message.success('列表已重置');
      this.setState({ list: this.state.cacheList });
    }
  }

  onChangeItem = (record, e) => {
    const { onChange } = this.props;
    const { list } = this.state;
    if (record) {
      if (onChange) onChange(record, e);
      const newList = [...list].map(item => ({ ...item, active: !!(item.id === record.id) }));
      this.setState({ list: newList });
    }
  }

  callback = self => {
    if (this.previousCell) this.previousCell.check();
    this.previousCell = self;
  };

  render() {
    const { width = 250, height = '100%', title = '标题', tips = '提示信息' } = this.props;
    const { list } = this.state;
    return (
      <div className={styles.wrap} style={{ width, height }}>
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
          <div className={styles.list}>
            {
              list.length ? list.map(item => (
                <NodeChildren
                  isEdit
                  key={item.id}
                  record={item}
                  active={item.active}
                  className={styles.children}
                  hoverStyle={styles.childrenActive}
                  onChange={this.onChangeItem}
                  callback={this.callback}
                />
              )) : (<div style={{ textAlign: 'center', transform: 'translateX(-5px)', color: '#c5c5c5' }}>
                <Icon type="frown-o" /> 暂无数据
              </div>)
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
