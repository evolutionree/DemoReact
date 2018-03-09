import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button, Menu, Modal, Select, Table } from 'antd'
import * as _ from 'lodash';
import Page from '../../components/Page';
import styles from './styles.less';
import Search from '../../components/Search';
import Toolbar from '../../components/Toolbar';
import PrintTemplateForm from './PrintTemplateForm';

const Column = Table.Column;
const Option = Select.Option;

const contentStyle = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  padding: 0
};
class PrintTemplate extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      queries,
      entities,
      list,
      currentItems,
      entitySearchKey,
      searchEntity,
      selectEntity,
      selectItems,
      search,
      add,
      edit,
      del,
      openVisibleRule,
      toggleStatus
    } = this.props;
    const selectedEntity = _.find(entities, ['entityid', queries.entityId]);
    return (
      <Page title="套打模板" contentStyle={contentStyle}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <div className={styles.box}>
              <div className={styles.leftContent}>
                <div className={styles.subtitle}>实体</div>
                <div style={{ marginBottom: '15px' }}>
                  <Search placeholder="输入实体名称搜索" value={entitySearchKey} onSearch={searchEntity} />
                </div>
                <div>
                  <Menu
                    selectedKeys={[queries.entityId]}
                    style={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'hidden' }}
                    onSelect={event => selectEntity(event.key)}
                  >
                    {entities.map(entity => (
                      <Menu.Item key={entity.entityid}>{entity.entityname}</Menu.Item>
                    ))}
                  </Menu>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.box}>
              <div className={styles.rightContent}>
                <div className={styles.subtitle}>{selectedEntity && selectedEntity.entityname}</div>
                <Toolbar
                  selectedCount={currentItems.length}
                  actions={[
                    { label: '编辑', handler: edit, single: true },
                    { label: '删除', handler: del },
                    { label: '停用', handler: toggleStatus, single: true,
                      show: () => currentItems[0].recstatus === 1 },
                    { label: '启用', handler: toggleStatus, single: true,
                      show: () => currentItems[0].recstatus === 0 },
                    { label: '适用范围', handler: openVisibleRule }
                  ]}
                >
                  <Select value={queries.recState} onChange={search.bind(null, 'recState')} style={{ width: '80px' }}>
                    <Option value="1">启用</Option>
                    <Option value="0">停用</Option>
                  </Select>
                  <Button onClick={add}>新增</Button>
                </Toolbar>
                <Table
                  scroll={{ x: '100%' }}
                  className={styles.table}
                  rowKey="recid"
                  dataSource={list}
                  rowSelection={{
                    selectedRowKeys: currentItems.map(item => item.recid),
                    onChange: (keys, items) => { selectItems(items); }
                  }}
                  pagination={false}
                >
                  <Column title="模板名称" dataIndex="templatename" key="templatename" render={text => <span>{text}</span>} />
                  <Column title="模板类型" dataIndex="templatetype" key="templatetype" render={i => <span>{['Excel', 'Word'][i]}</span>} />
                  <Column title="状态" dataIndex="recstatus" key="recstatus" render={i => <span>{['停用', '启用'][i]}</span>} />
                  <Column title="适用规则说明" dataIndex="ruledesc" key="ruledesc" render={text => <span>{text}</span>} />
                  <Column title="版本号" dataIndex="recversion" key="recversion" render={text => <span>{text}</span>} />
                  <Column title="创建人" dataIndex="reccreator" key="reccreator" render={text => <span>{text}</span>} />
                  <Column title="创建时间" dataIndex="reccreated" key="reccreated" render={text => <span>{text}</span>} />
                  <Column title="最后修改人" dataIndex="recupdator" key="recupdator" render={text => <span>{text}</span>} />
                  <Column title="最后修改时间" dataIndex="recupdated" key="recupdated" render={text => <span>{text}</span>} />
                </Table>
              </div>
            </div>
          </div>
        </div>
        <PrintTemplateForm />
      </Page>
    );
  }
}

export default connect(
  state => state.printTemplate,
  dispatch => {
    return {
      searchEntity(searchKey) {
        dispatch({ type: 'printTemplate/searchEntity', payload: searchKey });
      },
      selectEntity(entityId) {
        dispatch({ type: 'printTemplate/selectEntity', payload: entityId });
      },
      selectItems(items) {
        dispatch({ type: 'printTemplate/putState', payload: { currentItems: items } });
      },
      search(key, value) {
        const objSearch = typeof key === 'object' ? key : { [key]: value };
        dispatch({ type: 'printTemplate/search', payload: objSearch });
      },
      add() {
        dispatch({ type: 'printTemplate/showModals', payload: 'add' });
      },
      edit() {
        dispatch({ type: 'printTemplate/showModals', payload: 'edit' });
      },
      del() {
        Modal.confirm({
          title: '确定删除选中的模板吗？',
          onOk() {
            dispatch({ type: 'printTemplate/del' });
          }
        });
      },
      toggleStatus() {
        dispatch({ type: 'printTemplate/toggleStatus' });
      },
      openVisibleRule() {
        dispatch({ type: 'printTemplate/showModals', payload: 'visibleRule' });
      }
    };
  }
)(PrintTemplate);
