import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import _ from 'lodash';
import { Select, Button, Table, Dropdown, Menu, Icon, Modal } from 'antd';
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

  const { pageIndex: current, pageSize, typeId, status, entityName } = queries;

  return (
    <Page title="实体配置">
      <Toolbar
        onAction={handleAction}
        selectedCount={currItems.length}
        actions={[
          { name: 'del', label: '删除', single: true, show: checkFunc('EntityDataDelete') },
          { name: 'edit', label: '编辑', single: true, show: checkFunc('EntityEdit') },
          { name: 'disable', label: '停用', single: true,
            show: () => checkFunc('EntityDisabled') && currItems[0].recstatus === 1 },
          { name: 'disable', label: '启用', single: true,
            show: () => checkFunc('EntityDisabled') && currItems[0].recstatus === 0 },
          { name: 'publish', label: '发布', single: true, show: false }
        ]}
      >
        <Select value={status + ''} onChange={bindSearch('status')}>
          <Option value="1">启用</Option>
          <Option value="0">停用</Option>
        </Select>
        <Select value={typeId + ''} onChange={bindSearch( 'typeId')}>
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
      >
        <Column
          title="实体名称"
          key="entityname"
          dataIndex="entityname"
          render={(text, record) => {
            const renderIntlText = <IntlText value={text} value_lang={record.entityname_lang} />;
            return checkFunc('EntityDetail')
              ? <Link to={`/entity-config/${record.entityid}/${record.modeltype}`}>{renderIntlText}</Link>
              : renderIntlText;
          }}
        />
        <Column title="实体类型" key="modeltype" dataIndex="modeltype" render={getTypeName} />
        <Column title="关联实体" key="relentityname" dataIndex="relentityname" />
        <Column title="状态" key="recstatus" dataIndex="recstatus" render={text => ['停用', '启用'][text]} />
        <Column title="发布状态" key="pubstatus" dataIndex="pubstatus" />
        <Column title="描述" key="remark" dataIndex="remark" />
      </Table>

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
