import React, { Component } from 'react';
import { Button, Icon, message, Tooltip } from 'antd';
import IntlEdittableCell from '../../../components/UKComponent/Form/IntlEdittableCell';
import styles from './index.less';

class EditList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: props.list,
      selectedItemId: 0
    };
  }

  previousCell = null;

  componentWillReceiveProps(nextProps) {
    const list = nextProps.list;
    this.setState({ list });
  }

  add = () => {
    const { addRow } = this.props;
    const { list } = this.state;
    const newRow = {
      id: list.length,
      active: false,
      displayname: undefined,
      displayname_lang: null
    };
    const newList = [...list, newRow];
    this.setState({ selectedItemId: list.length });
    if (addRow) addRow(newList);
  }

  restList = () => {
    const { restFunc } = this.props;
    const { list } = this.state;

    if (list.length) {
      message.success('列表已重置');
      if (restFunc) restFunc();
    }
  }

  onChangeItem = (record, value, e) => {
    const { onChange } = this.props;
    const { list, selectedItemId } = this.state;

    if (onChange) {
      // let count = 0;
      // list.forEach(item => {
      //   if (item.groupmark === (value && value.cn)) count += 1;
      // });
      // if (value && count > 1) {
      //   message.warn('存在相同组名称！');
      //   return;
      // }

      if ((selectedItemId === record.id) && (!value || record.groupmark === value.cn)) {
        return;
      }
      onChange(record, value, e);
    }
    this.setState({ selectedItemId: record.id });
  }

  callback = self => {
    if (self !== this.previousCell) {
      if (this.previousCell) this.previousCell.check();
      this.previousCell = self;
    }
  };

  render() {
    const { width = 250, height = '100%', title = '标题', tips = '提示信息', getFieldsValue, onActive, checkFunc } = this.props;
    const { list, selectedItemId } = this.state;

    return (
      <div className={styles.wrap} style={{ width, height, minHeight: 300 }}>
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
                <IntlEdittableCell
                  style={{ width: 'calc(100% - 10px)' }}
                  key={item.id}
                  getFieldsValue={getFieldsValue}
                  other
                  record={item}
                  active={item.id === selectedItemId}
                  checkFunc={checkFunc}
                  className={styles.children}
                  hoverStyle={styles.childrenActive}
                  onChange={this.onChangeItem.bind(this, item)}
                  callback={this.callback}
                  onActive={onActive && onActive}
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
