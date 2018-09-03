/**
 * Created by 0291 on 2018/4/9.
 */
import React, { Component } from 'react';
import { Input, Icon } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import MainLayout from '../MainLayout';
import MailList from '../MailList';
import RelatedInfoPanel from '../RelatedInfoPanel';
import Toolbar from '../../../components/Toolbar';
import Search from '../../../components/Search';
import ImgIcon from '../../../components/ImgIcon';
import EditMailPanel from '../page/EditMailPanel';
import MailDetailTab from '../page/MailDetailPanel';
import Styles from './MailTabs.less';

const LiWidth = 130;

class MailTabs extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      foldTabVisible: false,
      showLiNum: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.mailTabs) !== JSON.stringify(nextProps.mailTabs)) {
      this.updataTabSort(nextProps.mailTabs);
    }
  }

  componentWillMount() {

  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    document.addEventListener('click', this.hideFoldTabPanel.bind(this));
    this.setState({
      width: this.tabWrapRef.offsetWidth
    });
    this.updataTabSort(this.props.mailTabs, this.tabWrapRef.offsetWidth);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('click', this.hideFoldTabPanel);
  }

  onWindowResize(e) {
    this.setState({
      width: this.tabWrapRef.offsetWidth
    });
    this.updataTabSort(this.props.mailTabs, this.tabWrapRef.offsetWidth);
  }

  hideFoldTabPanel() {
    this.setState({
      foldTabVisible: false
    });
  }

  updataTabSort(mailTabs, wrapWidht = this.state.width) { //需要保证Active状态的Tab能在Tab显示区显示（而不是在下拉列表中）
    const availableWidth = wrapWidht - 40;
    const showLiNum = Math.floor(availableWidth / LiWidth); //当前最大能显示的Tab数
    let currentActiveIndex = 0;
    for (let i = 0; i < mailTabs.length; i++) {
      if (mailTabs[i].active) {
        currentActiveIndex = i;
        break;
      }
    }

    if ((currentActiveIndex + 1) > showLiNum) { //当前显示Tab 已经超过页面可放下的tab数
      // 交换第(showLiNum - 1)个和第currentActiveIndex个元素
      // x < y
      let x = showLiNum - 1; let y = currentActiveIndex;
      mailTabs.splice(x, 0, ...mailTabs.splice(y, 1));
    }
    this.setState({
      showLiNum
    })

    this.props.updateMailTabs(mailTabs);
  }

  toggleFoldTab = (e) => {
    e.nativeEvent.stopImmediatePropagation()
    this.setState({
      foldTabVisible: !this.state.foldTabVisible
    });
  }

  tabToggle = (uuid) => {
    let newMailTabs = this.props.mailTabs.map((item, i) => {
      item.uuid === uuid ? item.active = true : item.active = false;
      return item;
    });
    this.updataTabSort(newMailTabs);
  }

  closeAllTab = () => {
    let newMailTabs = this.props.mailTabs.filter((item, i) => {
      item.active = true;
      return item.tabType === 1; //邮件Tab
    });
    this.props.updateMailTabs(newMailTabs);
  }

  delTab(index, type, e) {
    e.stopPropagation();
    let newMailTabs;
    if (type === 'showTab') {
      newMailTabs = this.props.mailTabs.filter((item, i) => {
        item.active = false;
        return index !== i;
      });
      if (newMailTabs[index]) {
        newMailTabs[index].active = true;
      } else {
        newMailTabs = newMailTabs.map(item => {
          item.active = false;
          if (item.tabType === 1) {
            item.active = true;
          }
          return item;
        });
      }
    } else {
      newMailTabs = this.props.mailTabs.filter((item, i) => {
        return index !== i;
      });
    }

    this.updataTabSort(newMailTabs);
  }

  renderMidtop = () => {
    const styl = {
      position: 'relative',
      minWidth: '855px',
      minHeight: '100%',
      paddingBottom: '40px'
    };
    const { mailSelected, selectedCatalogNode: cat, mailSearchKey, mailTotal } = this.props;
    const catName = cat ? (cat.recname || cat.treename) : '--';
    return (
      <div style={styl}>
        <Toolbar style={{ paddingLeft: '10px', paddingRight: '30px' }}>
          <span style={{ marginRight: '5px' }}>{catName}</span>
          {!!cat && <span>
            (共<span style={{ color: '#3499db' }}>{mailTotal}</span>封 / 未读<span style={{ color: '#ff6c68' }}>{cat.unreadcount}</span>封)
          </span>}
          <Toolbar.Right>
            <Search
              mode="icon"
              placeholder={`搜索 ${'主题' || catName}`}
              value={mailSearchKey}
              onSearch={val => this.props.search({ mailSearchKey: val })}
            />
            <ImgIcon name="refresh" onClick={this.props.refreshList} style={{ marginLeft: '8px', height: '20px' }} />
          </Toolbar.Right>
        </Toolbar>
        <MailList />
      </div>
    );
  };


  render() {
    const mailTabs = this.props.mailTabs;
    const showTabs = mailTabs.slice(0, this.state.showLiNum);
    const foldTabs = mailTabs.slice(this.state.showLiNum);
    return (
      <div style={{ width: 'calc(100% - 360px)', height: '100%', float: 'left' }}>
        <ul className={Styles.mailTabsWrap} ref={ref => this.tabWrapRef = ref}>
          {
            showTabs.map((item, index) => {
              const cls = classnames([Styles.tabLi, { [Styles.active]: item.active }]);
              return (
                <li key={item.uuid} title={item.title} onClick={this.tabToggle.bind(this, item.uuid)} className={cls}>{item.title}
                  {
                    item.tabType === 1 ? null : <Icon type="close" onClick={this.delTab.bind(this, index, 'showTab')} />
                  }
                </li>
              );
            })
          }
          <li className={Styles.foldMole} style={{ display: foldTabs.length > 0 ? 'block' : 'none' }} onClick={this.toggleFoldTab}>
            <Icon type="down" />
            <ul style={{ display: this.state.foldTabVisible ? 'block' : 'none' }}>
              <li onClick={this.closeAllTab}>关闭全部标签页</li>
              {
                foldTabs.map((item, index) => {
                  return (
                    <li key={item.uuid} title={item.title} onClick={this.tabToggle.bind(this, item.uuid)}>
                      {
                        item.title
                      }
                      <Icon type="close" onClick={this.delTab.bind(this, index + showTabs.length, 'foldTab')} />
                    </li>
                  );
                })
              }
            </ul>
          </li>
        </ul>
        <div style={{ width: '100%', height: 'calc(100% - 42px)', float: 'left' }}>
          {
            this.props.mailTabs.map((item, index) => {
              const styleProps = { display: item.active ? 'block' : 'none', width: '100%', height: '100%', background: '#fff', overflow: 'auto' };
              switch(item.tabType) {
                case 1:
                  return (
                    <div style={{ ...styleProps }} key={item.uuid}>
                      <MainLayout
                        right={<RelatedInfoPanel />}
                        midtop={this.renderMidtop()}
                      />
                    </div>
                  );
                  break;
                case 2:
                  return ( //新邮件 一直可以加Tab(newMailKey区分不同key)
                    <div style={{ ...styleProps }} key={item.uuid}>
                      <EditMailPanel type={item.editMailType} mailId={item.mailId} />
                    </div>
                  );
                  break;
                case 3:
                  return (
                    <div style={{ ...styleProps }} key={item.uuid}>
                      <MailDetailTab mailInfo={item.mailInfo} />
                    </div>
                  );
              }
            })
          }
        </div>
      </div>
    );
  }
}


export default connect(
  state => state.mails,
  dispatch => {
    return {
      showMailDetail(mail) {
        dispatch({ type: 'mails/showMailDetail', payload: mail });
      },
      search(searchObj) {
        dispatch({ type: 'mails/search', payload: searchObj });
      },
      refreshList() {
        dispatch({ type: 'mails/queryMailList' });
      },
      updateMailTabs(newMailTabs) {
        dispatch({ type: 'mails/updateMailTabs', payload: { mailTabs: newMailTabs } });
      }
    };
  }
)(MailTabs);
