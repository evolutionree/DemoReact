import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import _ from 'lodash';
import { Select, Button, Table, Dropdown, Tooltip, Icon, Modal, message } from 'antd';
import copy from 'copy-to-clipboard';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import EntityFormModal from './EntityFormModal';
import SetEntryModal from './SetEntryModal';
import ImportModal from './ImportModal';
import IntlText from '../../components/UKComponent/Form/IntlText';

const Option = Select.Option;
const Column = Table.Column;

function EntityList({
  dispatch,
  location: { pathname },
  list,
  total,
  queries,
  entityTypes,
  showModals,
  currItems,
  editingRecord,
  modalPending,
  checkFunc
}) {
  function handleAction(action) {
    if ('del' === action) {
      Modal.confirm({
        title: '确认删除该实体吗？',
        onOk() {
          dispatch({ type: 'entityList/del', payload: currItems });
        }
      });
    } else if ('edit' === action) {
      dispatch({ type: 'entityList/edit', payload: currItems[0] });
    } else if ('disable' === action) {
      dispatch({ type: 'entityList/disable', payload: currItems });
    } else if ('publish' === action) {
      dispatch({ type: 'entityList/publish', payload: currItems[0] });
    }
  }
  function bindSearch(key) {
    return function boundSearch(val) {
      const query = typeof key === 'object' ? key : { [key]: val };
      dispatch(routerRedux.push({
        pathname,
        query: {
          ...queries,
          pageIndex: 1,
          ...query
        }
      }));
    }
  }
  function bindAction(actionType, prePayload) {
    return function boundAction(payload) {
      dispatch({ type: `entityList/${actionType}`, payload: prePayload || payload });
    }
  }
  function getTypeName(entityType) {
    const match = _.find(entityTypes, ['id', entityType + '']);
    return match ? match.label : '';
  }

  function importData() {
    dispatch({ type: 'entityList/showModals', payload: 'import' });
  }

  function copyAction(text) {
    copy(text);
    message.success(`已复制 [${text}] 到剪切板`);
  }

  // function handleAdd() {
  //   dispatch({ type: 'entityList/add' });
  // }
  // function handleFormSubmit(data) {
  //   dispatch({ type: 'entityList/save', payload: data });
  // }
  // function handleFormCancel() {
  //   dispatch({ type: 'entityList/hideModal' });
  // }
  // function handleSetEntry() {
  //   dispatch({ type: 'entityList/showModals', payload: 'setEntry' });
  // }
  // function handleSelectItems(items) {
  //   dispatch({ type: 'entityList/currItems', payload: items });
  // }

  const LoopList = [
    {
      title: '实体名称', key: 'entityname',
      render: (text, record) => {
        const renderIntlText = <IntlText value={text} value_lang={record.entityname_lang} />;
        const node = (<div style={{ minWidth: 56 }}>
          <Tooltip title="点击复制entityid">
            <Icon
              type="copy"
              style={{ cursor: 'pointer', marginRight: 5 }}
              onClick={copyAction.bind(this, record.entityid)}
            />
          </Tooltip>
          {
            checkFunc('EntityDetail')
              ? <Link to={`/entity-config/${record.entityid}/${record.modeltype}`}>{renderIntlText}</Link>
              : renderIntlText
          }
        </div>);
        return node;
      }
    },
    { title: '实体表', key: 'entitytable', width: 250 },
    { title: '实体类型', key: 'modeltype', width: 80, render: text => tooltipElements(getTypeName(text), 80, '实体类型') },
    { title: '关联实体', key: 'relentityname', width: 180 },
    // { title: '状态', key: 'recstatus', width: 110, render: text => ['停用', '启用'][text] },
    // { title: '发布状态', key: 'pubstatus', width: 110 },
    {
      title: '描述', key: 'remark', width: 500, render: text => tooltipElements(text, 500, '描述')
    }
  ];

  const tooltipElements = (text, width, title) => {
    const hideStyle = `${text}`.length > 5 ? {
      overflow: 'hidden',
      width: '100%',
      boxSizing: 'border-box',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    } : {};
    const resultStyle = {
      ...hideStyle,
      maxWidth: `${width - 21}px`,
      minWidth: `${title.length * 14 - 21}px`
    };
    return <div title={`${text}`} style={resultStyle}>{text}</div>;
  };

  const renderList = (colList) => (
    colList.map(item => {
      return {
        ...item,
        dataIndex: item.key,
        width: item.width,
        fixed: item.fixed || false,
        render: item.render ? item.render : (text => tooltipElements(text, item.width || 121, item.title)),
        children: item.children ? renderList(item.children) : false
      };
    })
  );
  const { pageIndex: current, pageSize, typeId, status, entityName } = queries;
  const columns = renderList(LoopList);
  const tableWidth = columns.reduce((sum, item) => sum + item.width, 0) + 62;
  const screenHeight = document.body.offsetHeight && document.documentElement.clientHeight;
  const modalHeight = screenHeight * 0.8;

  return (
    <Page title="实体配置">
      <Toolbar
        onAction={handleAction}
        selectedCount={currItems.length}
        actions={[
          { name: 'del', label: '删除', single: true, show: checkFunc('EntityDataDelete') },
          { name: 'edit', label: '编辑', single: true, show: checkFunc('EntityEdit') },
          {
            name: 'disable', label: '停用', single: true,
            show: () => checkFunc('EntityDisabled') && currItems[0].recstatus === 1
          },
          {
            name: 'disable', label: '启用', single: true,
            show: () => checkFunc('EntityDisabled') && currItems[0].recstatus === 0
          },
          { name: 'publish', label: '发布', single: true, show: false }
        ]}
      >
        <Select value={status + ''} onChange={bindSearch('status')}>
          <Option value="1">启用</Option>
          <Option value="0">停用</Option>
        </Select>
        <Select value={typeId + ''} onChange={bindSearch('typeId')}>
          <Option value="-1">全部类型</Option>
          {entityTypes.map(type => (
            <Option key="label" value={type.id}>{type.label}</Option>
          ))}
        </Select>
        {checkFunc('EntityAdd') && <Button onClick={bindAction('add')}>新增</Button>}
        <Button onClick={importData}>导入</Button>
        {checkFunc('EntityEntrance') && <Button onClick={bindAction('showModals', 'setEntry')}>入口定义</Button>}
        <Toolbar.Right>
          <Search
            placeholder="请输入实体名称"
            value={entityName}
            onSearch={bindSearch('entityName')}
          />
        </Toolbar.Right>
      </Toolbar>
      <Table
        rowKey="entityid"
        dataSource={list}
        columns={columns}
        scroll={{ x: `${tableWidth}px`, y: `${modalHeight}px` }}
        pagination={{
          total,
          pageSize,
          current,
          onChange: bindSearch('pageIndex'),
          onShowSizeChange: (curr, size) => {
            bindSearch({ pageIndex: 1, pageSize: size })();
          }
        }}
        rowSelection={{
          selectedRowKeys: currItems.map(item => item.entityid),
          onChange: (keys, items) => { bindAction('currItems')(items); }
        }}
      />

      <EntityFormModal
        entityTypes={entityTypes}
        showModals={showModals}
        editingRecord={editingRecord}
        modalPending={modalPending}
        onOk={bindAction('save')}
        onCancel={bindAction('hideModal')}
      />

      <SetEntryModal />
      <ImportModal />
    </Page>
  );
}

export default connect(state => state.entityList)(EntityList);
