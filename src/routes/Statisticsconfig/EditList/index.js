import React, { Component } from 'react';
import { Button, Icon, message, Tooltip } from 'antd';
import IntlEdittableCell from '../../../components/UKComponent/Form/IntlEdittableCell';
import styles from './index.less';

const NodeChildren = (props) => {
  return (
    <IntlEdittableCell
      style={{ width: 'calc(100% - 10px)' }}
      {...props}
    />
  );
};

class EditList extends Component {
  constructor(props) {
    super(props);
    const list = this.addFields(props.list);
    const cacheList = this.addFields(props.cacheList);
    this.state = {
      list,
      cacheList,
      selectedItemId: ''
    };
  }

  previousCell = null;

  componentWillReceiveProps(nextProps) {
    const thisProps = this.props;
    if (nextProps.list.length !== thisProps.list.length) {
      const list = this.addFields(nextProps.list);
      const cacheList = this.addFields(nextProps.cacheList);
      this.setState({ list, cacheList });
    }
  }

  addFields = list => (list.map((item, id) => ({
    ...item,
    id,
    active: id === 0 || false,
    displayname: item.groupmark || undefined,
    displayname_lang: item.groupmark_lang || null
  })));

  add = () => {
    const { list } = this.state;
    const newRow = {
      id: list.length,
      active: false,
      displayname: undefined,
      displayname_lang: null
    };
    const newList = [...list, newRow];
    this.setState({ list: newList });
  }

  restList = () => {
    const { list, cacheList } = this.state;
    if (list.length) {
      message.success('列表已重置');
      this.setState({ list: cacheList });
    }
  }

  onChangeItem = (record, value, e) => {
    const { onChange } = this.props;
    const { list, selectedItemId } = this.state;

    const newList = [...list].map(item => ({ ...item, active: !!(item.id === record.id) }));
    if ((onChange && e === undefined) || selectedItemId !== record.id) onChange(record, value, e);
    this.setState({ list: newList, selectedItemId: record.id });

    let count = 0;
    list.forEach(item => {
      if (item.name === (value && value.cn)) count += 1;
    });
    if (value && count > 1) {
      message.warn('存在相同组名称！');
    }
  }

  callback = self => {
    if (self !== this.previousCell) {
      if (this.previousCell) this.previousCell.check();
      this.previousCell = self;
    }
  };

  render() {
    const { width = 250, height = '100%', title = '标题', tips = '提示信息', getFieldsValue, onActive } = this.props;
    const { list } = this.state;
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
                <NodeChildren
                  key={item.id}
                  getFieldsValue={getFieldsValue}
                  api="/api/StatisticsSetting/updatestatisticsgroupsetting"
                  otherParams={{ groupname: item.displayname || '', newgroupname_lang: null, newgroupname: '' }}
                  record={item}
                  active={item.active}
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
