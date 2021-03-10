import React, { Component } from 'react';
import { Modal, Table, Menu, Button, Icon, Input, message } from 'antd';
import DynamicFieldView from '../DynamicFieldView';
import { getEntcommDetail, getGeneralProtocolForGrid } from '../../../services/entcomm';
import { detailrellist, makeDetailrellist } from '../../../services/entity';
import styles from './RelTable.less';

const normalStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'inline-block',
  height: '42px',
  lineHeight: '42px'
};

/**
 * 能够运行字符串类型的JS代码并且可以接收返回值
 * @param { String } jsCode 需要执行的js代码
 * @param { Object } app app里面多了queryRows和baseRows两个属性
 */

export function runStringJsCodeWithReturn(jsCode, app) {
  if (!jsCode) return app.queryRows;
  try {
    const fun = new Function(`
      return function(app) {
        try {
          ${jsCode}
        } catch (e) {
          console.error('--run EntityFilterTypeJs error inner--', e);
        }
      }
    `)();
    const returnData = fun(app);
    return returnData || app.queryRows;
  } catch (e) {
    console.error('--run EntityFilterTypeJs error--', e);
  }
}

class RelTablePickerModal extends Component {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      targetId: '',
      currentData: {},
      filterKeyValue: {}
    };
    this.cacheItems = {};
  }

  componentWillMount() {
    const { pickerSource } = this.props;
    this.isAsOrigin = pickerSource.sourceagreement === 2;
    // console.log('--pickerSource--', pickerSource, this.isAsOrigin);
    this.isRunningJs = undefined;
    this.queryData(pickerSource.targets[0].id);
  }

  componentDidMount() {
    this.wrapTableWidth = this.wrapTableNode && this.wrapTableNode.getBoundingClientRect().width;
  }

  getCurrentState = () => {
    const { targetId, currentData } = this.state;
    const { showFields = [], items = [], selectedRowKeys = [] } = currentData[targetId] || {};
    return { targetId, showFields, items, selectedRowKeys, ...this.state };
  }

  setCurrentState = (key, value) => {
    const { targetId, currentData } = this.state;
    this.setState({
      currentData: {
        ...currentData,
        [targetId]: {
          ...currentData[targetId],
          [key]: value
        }
      }
    });
  }

  queryData = async (targetId) => {
    const { currentData } = this.state;
    if (currentData[targetId]) { // 缓存数据避免重复请求
      this.setState({
        targetId,
        filterKeyValue: {}
      }, () => {
        // 切换重置筛选条件
        const items = this.cacheItems[targetId];
        if (items) this.setCurrentState('items', items);
      });
    } else {
      this.setState({ tableDataLoading: true });
      const { pickerSource, fieldId, entityId, entityTypeId, originValues, jsEngine, mainEntityId } = this.props;

      let typeId = entityTypeId;
      if (!this.isAsOrigin) {
        // 获取targetId对应的typeId，再获取协议
        const res = await getEntcommDetail({
          entityId: pickerSource.sourceentityid,
          recId: targetId,
          needPower: 0
        });
        typeId = res.data.detail.rectype;
      }

      let dataPromise;
      if (pickerSource.url) {
        dataPromise = makeDetailrellist(pickerSource.url, {
          entityid: mainEntityId,
          OtherParams: { targetid: targetId }
        });
      } else {
        dataPromise = detailrellist({
          fieldid: fieldId,
          entityid: entityTypeId,
          sourcefieldid: pickerSource.sourcefieldid,
          relentityid: pickerSource.sourceentityid,
          relrecid: targetId,
          nestedtablesfieldid: pickerSource.nestedtablesfieldid,
          needpower: 0
        });
      }

      const protocolPromise = getGeneralProtocolForGrid({
        OperateType: 2,  // 0新增 1编辑 2查看
        entityId: this.isAsOrigin ? entityId : pickerSource.nestedtablesentityid,
        typeId
      });

      Promise.all([dataPromise, protocolPromise]).then(([dataRes, protocolRes]) => {
        const showFields = this.getShowFields(protocolRes.data);
        const baseRows = originValues.length ? originValues.map(o => o.FieldData) : [];
        // 执行过滤JS
        const items = runStringJsCodeWithReturn(
          pickerSource.filterjs,
          {
            ...jsEngine,
            queryRows: dataRes.data,
            baseRows
          }
        );
        // 缓存一份items用于筛选和重置筛选
        this.cacheItems[targetId] = items;

        this.setState({
          tableDataLoading: false,
          targetId,
          currentData: {
            ...currentData,
            [targetId]: {
              items,
              showFields,
              selectedRowKeys: []
            }
          },
          filterKeyValue: {}
        });
      }).catch(err => {
        message.error(err.message);
        this.setState({
          tableDataLoading: false,
          targetId,
          filterKeyValue: {}
        });
      });
    }
  }

  getShowFields = (fields, vcbomConfig) => {
    return fields.filter(field => {
      if ((field.controltype > 1000 && field.controltype !== 1012 && field.controltype !== 1006)) {
        return false;
      }

      if (vcbomConfig && field.fieldid === vcbomConfig.groupfieldid) {
        this.groupField = field;
      }
      if (vcbomConfig && field.fieldid === vcbomConfig.vcbomfieldid) {
        return false;
      }

      if (field.fieldconfig.isVisible !== 1) {
        return false;
      } else if (field.fieldconfig.isVisibleJS === 0) {
        return false;
      }

      return true;
    });
  };

  handleOk = (acceptType) => {
    // 避免多次点击
    if (this.isRunningJs) return;
    this.isRunningJs = true;

    const { currentData } = this.state;
    const { pickerSource, originValues, originVcbomConfig, originGroupField, jsEngine } = this.props;
    const { targets, acceptjs } = pickerSource;
    if (!targets.some(v => currentData[v.id] && currentData[v.id].selectedRowKeys.length)) {
      message.warn('请选择明细');
      this.isRunningJs = undefined;
      return;
    }

    if (!acceptjs) {
      message.warn('请先配置数据接收JS');
      this.isRunningJs = undefined;
      return;
    }

    // 如果源表单是vcbom序号会有相同的时候，所以要重新整理序号
    let groupIndex;
    if (originVcbomConfig.isVcbom && originGroupField && this.groupField) {
      groupIndex = 0;
      if (acceptType === 'append' && originValues.length) {
        groupIndex = originValues[originValues.length - 1].FieldData[originGroupField.fieldname];
      }
    }

    const acceptRows = [];
    targets.forEach(t => {
      if (currentData[t.id]) {
        const { items, selectedRowKeys } = currentData[t.id];
        // 拿到选中的rows,并插入sourcerecid和sourcerecitemid
        let preIndex = -1;
        if (!items) return;

        items.forEach(v => {
          if (selectedRowKeys.includes(v.recid)) {
            const row = {
              ...v,
              sourcerecid: t.id,
              sourcerecitemid: v.recid
            };
            // 重新整理序号
            if (groupIndex || groupIndex === 0) {
              const groupKey = this.groupField.fieldname;
              if (v[groupKey] !== preIndex) {
                groupIndex += 1;
                preIndex = v[groupKey];
              }
              row[groupKey] = groupIndex;
            }
            acceptRows.push(row);
          }
        });
      }
    });

    // 开始执行js
    jsEngine.acceptType = acceptType;
    jsEngine.acceptRows = acceptRows;
    jsEngine.excuteJS(acceptjs, 'acceptjs');

    this.timer = setTimeout(() => {
      this.handleCancel();
      clearTimeout(this.timer);
      this.timer = null;
    });
  };

  handleCancel = () => {
    const { onCancel, jsEngine } = this.props;
    jsEngine.acceptType = undefined;
    jsEngine.acceptRows = undefined;
    onCancel();
  };

  onSelect = (record, selected) => {
    const { selectedRowKeys, items } = this.getCurrentState();
    const theSameKeys = [];
    if (this.groupField) {
      const groupFieldName = this.groupField.fieldname;
      const groupIndex = record[groupFieldName];
      items.forEach(v => {
        if (v[groupFieldName] === groupIndex) {
          theSameKeys.push(v.recid);
        }
      });
    } else theSameKeys.push(record.recid);

    if (selected) {
      // 拼接再去重
      const keys = selectedRowKeys.concat(theSameKeys);
      this.setCurrentState('selectedRowKeys', keys);
    } else {
      const keys = selectedRowKeys.filter(k => !theSameKeys.includes(k));
      this.setCurrentState('selectedRowKeys', keys);
    }
  }

  onSelectAll = (selected, selectedRows) => {
    if (selected) {
      this.setCurrentState('selectedRowKeys', selectedRows.map(v => v.recid));
    } else {
      this.setCurrentState('selectedRowKeys', []);
    }
  }

  handleMenuClick = (menu) => {
    const { targetId } = this.state;
    if (targetId === menu.key) return;
    this.queryData(menu.key);
  }

  onFilter = (fieldname, reset) => {
    const { filterKeyValue, filterText, targetId } = this.state;
    const items = this.cacheItems[targetId];
    if (!items) return;
    if (!filterText && !reset) {
      message.warn('请输入关键字');
      return;
    }

    let newFilterKeyValue;
    if (!reset) {
      newFilterKeyValue = {
        ...filterKeyValue,
        [fieldname]: filterText
      };
    } else {
      newFilterKeyValue = { ...filterKeyValue };
      delete newFilterKeyValue[fieldname];
    }

    const filterKeys = Object.keys(newFilterKeyValue);
    // 筛选
    let newItems = items;
    if (filterKeys.length) {
      newItems = items.filter(v => filterKeys.every(f => JSON.stringify(v[f + '_name'] || v[f]).indexOf(newFilterKeyValue[f]) !== -1));
    }
    this.setState({
      filterKeyValue: newFilterKeyValue,
      filterDropdownVisible: undefined,
      filterText: undefined
    });
    this.setCurrentState('items', newItems);
  }

  render() {
    const {
      tableDataLoading, targetId, showFields: sfs, items, selectedRowKeys, currentData,
      filterKeyValue, filterText
    } = this.getCurrentState();
    const { visible, pickerSource: { targets } } = this.props;

    const cellWidth = 125;
    const showFields = sfs.map(f => {
      if (f.fieldname === 'rownum') return { ...f, cellWidth: 70 };
      if (f.fieldname === 'productcode') return { ...f, cellWidth: 150 };
      if (f.fieldname === 'productmodel') return { ...f, cellWidth: 170 };
      return { ...f, cellWidth };
    });
    const tableWidth = showFields.reduce((sum, field) => sum + field.cellWidth, 0);
    const isLessField = tableWidth < (this.wrapTableWidth || 0);
    const columns = showFields.map((item, index) => {
      const { fieldname, displayname, controltype } = item;
      const filterDropdownVisible = this.state.filterDropdownVisible === fieldname;
      const filterValue = filterKeyValue[fieldname]; // 已筛选的关键字
      return {
        fixed: index === 0,
        width: item.cellWidth,
        title: <span style={{ maxWidth: item.cellWidth - 21, overflowWrap: 'break-wrap', whiteSpace: 'normal' }}>{displayname}</span>,
        dataIndex: fieldname,
        key: fieldname,
        filterDropdown: (
          <div className={styles.customFilterDropdown}>
            <div className={styles.header}>
              <span>
                <Icon type="filter" />
                <label>筛选-{displayname}</label>
              </span>
              {filterValue && <span onClick={() => this.onFilter(fieldname, true)}>清除筛选</span>}
            </div>
            <div className={styles.content}>
              <Input
                ref={ele => this.searchInput = ele}
                placeholder={`请输入${displayname}`}
                value={filterText}
                onChange={e => this.setState({ filterText: e.target.value })}
                onPressEnter={() => this.onFilter(fieldname)}
              />
            </div>
            <div className={styles.footer}>
              <Button type="primary" onClick={() => this.onFilter(fieldname)}>筛选</Button>
            </div>
          </div>
        ),
        filterIcon: <Icon type="filter" style={{ color: filterValue ? '#108ee9' : '#aaa' }} />,
        filterDropdownVisible,
        onFilterDropdownVisibleChange: (v) => {
          let data;
          if (v) data = { filterDropdownVisible: fieldname, filterText: filterValue };
          else data = { filterDropdownVisible: undefined, filterText: undefined };
          this.setState(data, () => this.searchInput.focus());
        },
        render: (text, record) => {
          const text_name = record[fieldname + '_name'];
          return (
            <span style={{ ...normalStyle, width: isLessField ? undefined : item.cellWidth - 26 }}>
              <DynamicFieldView
                  value={text}
                  value_name={text_name}
                  controlType={controltype}
                  width={isLessField ? undefined : item.cellWidth - 21}
                />
            </span>
          );
        }
      };
    });

    const scroll = { x: isLessField ? undefined : tableWidth, y: 500 };

    return (
      <Modal
        title={'选单'}
        visible={visible}
        width={'70vw'}
        onCancel={this.handleCancel}
        footer={[
          <Button key="cancel" type="default" onClick={this.handleCancel}>取消</Button>,
          // <Button key="replace" onClick={() => this.handleOk('replace')}>替换</Button>,
          <Button key="append" onClick={() => this.handleOk('append')}>追加</Button>
        ]}
        wrapClassName={styles.relTablePickerModalWrapCalss}
      >
        <Menu
          onClick={this.handleMenuClick}
          selectedKeys={[targetId]}
          mode="horizontal"
        >
          {targets.map(t => {
            const num = currentData[t.id] && currentData[t.id].selectedRowKeys && currentData[t.id].selectedRowKeys.length;
            return (
              <Menu.Item key={t.id}>
                {t.name}
                {num ? <span> ({num})</span> : null}
              </Menu.Item>
            );
          })}
        </Menu>
        <div ref={node => this.wrapTableNode = node}>
          <Table
            loading={tableDataLoading}
            dataSource={items}
            columns={columns}
            rowKey={'recid'}
            rowSelection={{
              selectedRowKeys,
              onSelect: this.onSelect,
              onSelectAll: this.onSelectAll
            }}
            pagination={false}
            scroll={!isLessField ? scroll : {}}
          />
        </div>
      </Modal>
    );
  }
}

export default RelTablePickerModal;
