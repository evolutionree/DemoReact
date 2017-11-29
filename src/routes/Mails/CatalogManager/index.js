import React, { PropTypes, Component } from 'react';
import { Button, Collapse, Modal, Input } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import CatalogTree from './CatalogTree';
import CatalogModal from './CatalogModal';
import styles from './styles.less';
import ImgIcon from '../../../components/ImgIcon';
import Search from '../../../components/Search';

const catTitle = {
  my: '邮件文件夹',
  dept: '下属员工',
  user: '内部往来'
};

class CatalogManager extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  onDeptCatalogDataChange = () => {
    // 触发render
    const { deptCatalogData } = this.props;
    this.props.dispatch({
      type: 'mails/putState',
      payload: { deptCatalogData: [...deptCatalogData] }
    });
  };

  onUserCatalogDataChange = () => {

  };

  onOrderDown = () => {
    const { selectedCatalogNode } = this.props;
    this.props.orderCatalog(selectedCatalogNode, 'down');
  };

  onOrderUp = () => {
    const { selectedCatalogNode } = this.props;
    this.props.orderCatalog(selectedCatalogNode, 'up');
  };

  onSearch = val => {
    this.props.searchCatalog(val);
  };

  render() {
    const { openedCatalog, myCatalogData, deptCatalogData, userCatalogData, selectedCatalogNode, catSearchKey, putState } = this.props;
    const panelHeight = key => (openedCatalog === key ? 'calc(100% - 38px)' : '38px');
    const selected = selectedCatalogNode || {};
    const isMyCat = openedCatalog === 'my';
    const isPersonalCat = isMyCat && selected.ctype === 2002;
    const isPersonalSubCat = isMyCat && selected.ctype === 3002;
    const isCustCat = isMyCat && selected.ctype === 4001;
    return (
      <div style={{ height: '100%', minWidth: '330px' }}>
        <div style={{ padding: '10px' }}>
          <Button ghost onClick={this.props.addCatalog} disabled={!isPersonalCat && !isPersonalSubCat}>新增</Button>
          <Button ghost onClick={this.props.editCatalog} disabled={!isPersonalSubCat}>编辑</Button>
          <Button ghost onClick={this.props.transferCatalog} disabled={!isPersonalSubCat && !isCustCat}>转移</Button>
          <Button ghost onClick={this.props.delCatalog} disabled={!isPersonalSubCat}>删除</Button>
          <ImgIcon name="refresh" onClick={this.props.refreshCatalog} />
          <ImgIcon name="arrow-down-bordered" onClick={this.onOrderDown} disabled={!isPersonalSubCat && !isCustCat} />
          <ImgIcon name="arrow-up-bordered" onClick={this.onOrderUp} disabled={!isPersonalSubCat && !isCustCat} />
        </div>
        <div style={{ position: 'relative', background: '#f7f7f7', height: '44px', paddingLeft: '10px' }}>
          <span style={{ lineHeight: '44px' }}>{catTitle[openedCatalog] || '邮箱'}</span>
          {!!catTitle[openedCatalog] && <div style={{ position: 'absolute', right: '10px', top: '8px', width: '180px' }}>
            <Search
              mode="icon"
              placeholder={openedCatalog === 'my' ? '搜索文件夹' : '搜索人员'}
              value={catSearchKey[openedCatalog] || ''}
              onSearch={this.onSearch}
            />
          </div>}
        </div>
        <Collapse
          accordion
          bordered={false}
          activeKey={openedCatalog}
          onChange={this.props.toggleOpenedCatalog}
          style={{ height: 'calc(100% - 129px)' }}
        >
          <Collapse.Panel
            header={<div><ImgIcon name="user" /><span>{catTitle.my}</span></div>}
            key="my"
            style={{ transition: 'all .2s', height: panelHeight('my') }}
          >
            <CatalogTree
              data={myCatalogData}
              selected={selected.recid}
              onSelect={(id, node) => this.props.selectCatalog(node, 'my')}
            />
          </Collapse.Panel>
          <Collapse.Panel
            header={<div><ImgIcon name="structure" /><span>{catTitle.dept}</span></div>}
            key="dept"
            style={{ transition: 'all .2s', height: panelHeight('dept') }}
          >
            <CatalogTree
              isDeptTree
              data={deptCatalogData}
              onDataChange={this.onDeptCatalogDataChange}
              selected={selected.recid}
              onSelect={(id, node) => this.props.selectCatalog(node, 'dept')}
            />
          </Collapse.Panel>
          <Collapse.Panel
            header={<div><ImgIcon name="structure" /><span>{catTitle.user}</span></div>}
            key="user"
            style={{ transition: 'all .2s', height: panelHeight('user') }}
          >
            <ul className={styles.userCatalog}>
              {userCatalogData.map(item => (
                <li
                  key={item.treeid}
                  className={classnames({ [styles.selected]: selected.treeid === item.treeid })}
                  onClick={() => this.props.selectCatalog(item, 'user')}
                >
                  <span>{item.treename}</span>
                  {!!item.unreadcount && <span style={{ color: '#3398db' }}>({item.unreadcount})</span>}
                </li>
              ))}
            </ul>
          </Collapse.Panel>
        </Collapse>
        <CatalogModal />
      </div>
    );
  }
}

export default connect(
  state => state.mails,
  dispatch => {
    return {
      toggleOpenedCatalog(catalogKey) {
        dispatch({ type: 'mails/toggleOpenedCatalog', payload: catalogKey });
      },
      selectCatalog(catalogNode, catalogType) {
        dispatch({ type: 'mails/selectCatalog', payload: { catalogNode, catalogType } });
      },
      addCatalog() {
        dispatch({ type: 'mails/showModals', payload: 'addCatalog' });
      },
      editCatalog() {
        dispatch({ type: 'mails/showModals', payload: 'editCatalog' });
      },
      delCatalog() {
        Modal.confirm({
          title: '确定删除选中的文件夹吗？',
          onOk() {
            dispatch({ type: 'mails/delCatalog' });
          }
        });
      },
      orderCatalog(catalog, type) {
        dispatch({ type: 'mails/orderCatalog', payload: { catalog, type } });
      },
      putState(assignment) {
        dispatch({ type: 'mails/putState', payload: assignment });
      },
      refreshCatalog() {
        dispatch({ type: 'mails/reloadCatalogTree' });
      },
      searchCatalog(searchKey) {
        dispatch({ type: 'mails/searchCatalog', payload: searchKey });
      },
      transferCatalog() {
        dispatch({ type: 'mails/showModals', payload: 'transferCatalog' });
      },
      dispatch
    };
  }
)(CatalogManager);
