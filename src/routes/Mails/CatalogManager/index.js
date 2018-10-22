import React, { PropTypes, Component } from 'react';
import { Button, Collapse, Modal, Input, message, Menu, Dropdown, Icon } from 'antd';
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

  mailMenuHandler({ key, domEvent }) {
    this.props.changeBoxId(key);
  }

  renderMailText = () => {
    let showName = '';
    const mailBoxList = this.props.mailBoxList;
    for (let i = 0; i < mailBoxList.length; i++) {
      if (mailBoxList[i].recid === this.props.currentBoxId) {
        showName = mailBoxList[i].accountid;
        break;
      }
    };
    return showName;
  }

  render() {
    const { openedCatalog, myCatalogData, deptCatalogData, userCatalogData, selectedCatalogNode, catSearchKey, putState, currentBoxId } = this.props;
    const panelHeight = key => (openedCatalog === key ? 'calc(100% - 38px)' : '38px');
    const selected = selectedCatalogNode || {};
    const hasSubCat = selected.subcatalogs && selected.subcatalogs.length;
    const isMyCat = openedCatalog === 'my';
    const isPersonalCat = selected.ctype === 2002;
    const isPersonalSubCat = selected.ctype === 3002;
    const isCustSubCat = selected.ctype === 4001;
    const isTempCat = [2003, 2006].indexOf(selected.ctype) > -1; // 收件箱 发件箱未归类文件夹
    const isInboxCat = selected.ctype > 2000; // 收件箱子文件夹(包括下属)
    const transCatalog = () => {
      if (!isTempCat && hasSubCat) {
        return message.error('包含子文件夹，无法转移');
      }
      this.props.transferCatalog();
    };
    const menu = (
      <Menu onClick={this.mailMenuHandler.bind(this)}>
        {
          this.props.mailBoxList && this.props.mailBoxList instanceof Array && this.props.mailBoxList.map((item, index) => {
            return (
              <Menu.Item key={item.recid}>{`${item.recname} <${item.accountid}>`}</Menu.Item>
            );
          })
        }
      </Menu>
    );
    return (
      <div className={styles.CatelogManagerWrap}>
        <div style={{ padding: '10px' }}>
          <Button ghost onClick={this.props.addCatalog} disabled={!isMyCat || !isPersonalCat}>新增</Button>
          <Button ghost onClick={this.props.editCatalog} disabled={!isMyCat || !isPersonalSubCat}>编辑</Button>
          <Button ghost onClick={transCatalog} disabled={!isPersonalSubCat && !isCustSubCat && !isTempCat}>转移</Button>
          <Button ghost onClick={this.props.delCatalog} disabled={!isMyCat || !isPersonalSubCat}>删除</Button>
          <Button ghost onClick={this.props.initMailCol} disabled={!isMyCat || !isTempCat}>归集</Button>
          <ImgIcon name="refresh" onClick={this.props.refreshCatalog} />
          {isMyCat && (isPersonalSubCat || isCustSubCat) && <ImgIcon name="arrow-down-bordered" onClick={this.onOrderDown} />}
          {isMyCat && (isPersonalSubCat || isCustSubCat) && <ImgIcon name="arrow-up-bordered" onClick={this.onOrderUp} />}
        </div>
        <div style={{ position: 'relative', background: '#f7f7f7', height: '44px', paddingLeft: '10px' }}>
          <span style={{ lineHeight: '44px' }}>{catTitle[openedCatalog] || '邮箱'}</span>
          {!!catTitle[openedCatalog] && <div style={{ position: 'absolute', right: '10px', top: '8px', width: '180px' }}>
            <Search
              mode="icon"
              placeholder={openedCatalog === 'my' ? '搜索文件夹' : '搜索下属员工'}
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
          style={{ height: 'calc(100% - 86px)' }}
        >
          <Collapse.Panel
            header={<div style={{ position: 'relative' }}><ImgIcon name="user" /><span onClick={e => e.stopPropagation()}>{
                <Dropdown overlay={menu}>
                  <div className={styles.boxMail}><span>{this.renderMailText()}</span> <Icon type="down" /></div>
                </Dropdown>
            }</span></div>}
            key="my"
            style={{ transition: 'all .2s', height: panelHeight('my') }}
          >
            <CatalogTree
              data={myCatalogData}
              selected={selected.recid}
              onSelect={(id, node) => this.props.selectCatalog(node, 'my')}
              BoxId={currentBoxId}
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
              selected={selected.uuid || selected.recid}  //同一下属不同邮箱下的数据的recid会一致  所以前端生成唯一key值uuid
              onSelect={(id, node) => this.props.selectCatalog(node, 'dept')}
            />
          </Collapse.Panel>
          {false && <Collapse.Panel
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
          </Collapse.Panel>}
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
      initMailCol() {
        dispatch({ type: 'mails/initMailCol' });
      },
      putState(assignment) {
        dispatch({ type: 'mails/putState', payload: assignment });
      },
      refreshCatalog() {
        dispatch({ type: 'mails/reloadSyncMails__' });
        dispatch({ type: 'mails/reloadCatalogTree' });
      },
      searchCatalog(searchKey) {
        dispatch({ type: 'mails/searchCatalog', payload: searchKey });
      },
      transferCatalog() {
        dispatch({ type: 'mails/showModals', payload: 'transferCatalog' });
      },
      changeBoxId(boxId) {
        dispatch({ type: 'mails/changeBoxId', payload: boxId });
      },
      dispatch
    };
  }
)(CatalogManager);
