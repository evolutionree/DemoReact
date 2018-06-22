/**
 * Created by 0291 on 2018/6/13.
 */
import React, { PropTypes, Component } from 'react';
import { Dropdown, Menu, Modal, Icon, Button } from 'antd';
import { connect } from 'dva';
import ButtonGroup from '../../Component/ButtonGroup';
import Search from '../../Component/Search';
import _ from 'lodash';
import styles from './index.less';

class OriginGroup extends Component {
  static propTypes = {
    showGoBack: PropTypes.bool
  };
  static defaultProps = {
    showGoBack: false
  };
  constructor(props) {
    super(props);
    this.state = {
      buttonModel: [{
        name: 'contact',
        title: '联系人',
        active: true
      }, {
        name: 'dept',
        title: '部门',
        active: false
      }]
    };
  }
  componentWillReceiveProps(nextProps) {

  }

  backHandler = () => {
    this.props.dispatch({ type: 'webIM/putState', payload: {
      showChildrenPanel: '',
      childrenPanelInfo: ''
    } });
  }

  closePanel = () => {
    this.props.dispatch({ type: 'webIM/closeOtherPanel' });
  }

  btnGroupClickHandler = (btnName) => {
    const newBtnModel = this.state.buttonModel.map(item => {
      item.active = false;
      if (item.name === btnName) {
        item.active = true;
      };
      return item;
    });
    this.setState({
      buttonModel: newBtnModel
    });
  }

  nextStep = () => {
    this.props.dispatch({
      type: 'webIM/showPanel',
      payload: {
        showPanel: 'GroupIMPanel',
        panelInfo: {}
      }
    });
  }

  render() {
    const textAlignStyle = { position: 'relative', left: '50%', transform: 'translateX(-50%)' };
    const activeBtnObj = _.find(this.state.buttonModel, item => item.active);
    return (
      <div className={styles.OriginGroupWrap}>
        <div className={styles.header}>
          {
            this.props.showGoBack ? <Icon type="left" onClick={this.backHandler} /> : null
          }
          <h3>发起群聊</h3>
          <Icon type="close" onClick={this.closePanel} />
        </div>
        <div className={styles.body}>
          <div className={styles.fl}>
            <div className={styles.btnGroupWrap}>
              <ButtonGroup model={this.state.buttonModel} onClick={this.btnGroupClickHandler} />
            </div>

            <div style={{ display: activeBtnObj.name === 'contact' ? 'block' : 'none' }}>
              <Search style={{ ...textAlignStyle }} />
              <div className={styles.contactlistWrap}>
                <h3>Y</h3>
                <ul>
                  <li>
                    <img src="./img_demo_avatar.png" />
                    <span>余萍</span>
                  </li>
                  <li>
                    <img src="./img_demo_avatar.png" />
                    <span>余萍</span>
                  </li>
                  <li>
                    <img src="./img_demo_avatar.png" />
                    <span>余萍</span>
                  </li>
                </ul>
              </div>
            </div>

            <div style={{ display: activeBtnObj.name === 'dept' ? 'block' : 'none' }}>
              部门
            </div>
          </div>
          <div className={styles.fr}>
            <div className={styles.frHeader}>
              <h2>已选择</h2>
              <h3>清空</h3>
            </div>
            <div className={styles.categoryList}>
              <h4>联系人（2）</h4>
              <ul>
                <li>余萍<Icon type="close-circle" /></li>
                <li>何德生<Icon type="close-circle" /></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button type="default">取消</Button>
          <Button onClick={this.nextStep}>下一步</Button>
        </div>
      </div>
    );
  }
}

export default connect(state => {
    return {
      ...state.webIM
    };
  },
  dispatch => {
    return {
      dispatch
    };
  })(OriginGroup);
