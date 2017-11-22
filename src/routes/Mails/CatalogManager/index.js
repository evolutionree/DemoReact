import React, { PropTypes, Component } from 'react';
import { Button, Collapse, Modal, Input } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import CatalogTree from './CatalogTree';
import CatalogModal from './CatalogModal';
import styles from './styles.less';
import ImgIcon from '../../../components/ImgIcon';
import Search from '../../../components/Search';

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

  onSearch = () => {

  };

  render() {
    const { openedCatalog, myCatalogData, deptCatalogData, userCatalogData, selectedCatalogNode, catSearchKey, putState } = this.props;
    const panelHeight = key => (openedCatalog === key ? 'calc(100% - 38px)' : '38px');
    const selected = selectedCatalogNode || {};
    const isMyCat = openedCatalog === 'my';
    const isPersonalCat = isMyCat && selected.ctype === 3002;
    const isCustCat = isMyCat && selected.ctype === 4001;
    return (
      <div style={{ height: '100%', minWidth: '300px' }}>
        <div style={{ padding: '10px' }}>
          <Button ghost onClick={this.props.addCatalog} disabled={!isPersonalCat}>新增</Button>
          <Button ghost onClick={this.props.editCatalog} disabled={!isPersonalCat}>编辑</Button>
          <Button ghost onClick={this.props.delCatalog} disabled={!isPersonalCat}>删除</Button>
          <ImgIcon name="refresh" onClick={this.props.refreshCatalog} />
          <ImgIcon name="arrow-down-bordered" onClick={this.onOrderDown} disabled={!isPersonalCat && !isCustCat} />
          <ImgIcon name="arrow-up-bordered" onClick={this.onOrderUp} disabled={!isPersonalCat && !isCustCat} />
        </div>
        <div style={{ position: 'relative', background: '#f7f7f7', height: '44px', paddingLeft: '10px' }}>
          <span style={{ lineHeight: '44px' }}>{openedCatalog === 'my' ? '用户文件夹' : '下属员工'}</span>
          {openedCatalog === 'my' && <div style={{ position: 'absolute', right: '10px', top: '8px', width: '180px' }}>
            {/*<Input.Search*/}
              {/*size="default"*/}
              {/*placeholder="搜索文件夹"*/}
              {/*style={{ width: '100%', height: '28px' }}*/}
              {/*value={catSearchKey}*/}
              {/*maxLength="20"*/}
              {/*onChange={evt => putState({ catSearchKey: evt.target.value })}*/}
              {/*onSearch={this.props.refreshCatalog}*/}
            {/*/>*/}

            <Search
              mode="icon"
              placeholder="搜索文件夹"
              value={catSearchKey}
              onSearch={val => putState({ catSearchKey: val })}
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
            header={<div><ImgIcon name="user" /><span>用户文件夹</span></div>}
            key="my"
            style={{ transition: 'all .2s', height: panelHeight('my') }}
          >
            <CatalogTree
              data={myCatalogData}
              selected={selected.recid}
              onSelect={this.props.selectCatalog}
              searchString={catSearchKey}
            />
          </Collapse.Panel>
          <Collapse.Panel
            header={<div><ImgIcon name="structure" /><span>下属员工</span></div>}
            key="dept"
            style={{ transition: 'all .2s', height: panelHeight('dept') }}
          >
            <CatalogTree
              isDeptTree
              data={deptCatalogData}
              onDataChange={this.onDeptCatalogDataChange}
              selected={selected.recid}
              onSelect={this.props.selectCatalog}
            />
          </Collapse.Panel>
          <Collapse.Panel
            header={<div><ImgIcon name="structure" /><span>内部往来</span></div>}
            key="user"
            style={{ transition: 'all .2s', height: panelHeight('user') }}
          >
            <ul className={styles.userCatalog}>
              {userCatalogData.map(item => (
                <li
                  key={item.userid}
                  className={classnames({ selected: selected.recid === item.userid })}
                  onClick={() => this.props.selectCatalog(item.userid, item)}
                >
                  <span>{item.username}</span>
                  {!!item.unread && <span style={{ color: '#3398db' }}>({item.unread})</span>}
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
      selectCatalog(catalog, catalogNode) {
        dispatch({ type: 'mails/selectCatalog', payload: catalogNode });
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
        dispatch({ type: 'mails/queryCatalogTree' });
      },
      dispatch
    };
  }
)(CatalogManager);
