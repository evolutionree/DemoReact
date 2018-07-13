/**
 * Created by 0291 on 2018/5/10.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Button, Menu } from "antd";
import { routerRedux } from 'dva/router';
import _ from 'lodash';

const SUPPOER_LOCALES = [
  {
    name: '简体中文',
    value: 'zh-CN'
  },
  {
    name: 'English',
    value: 'en-US'
  },
  {
    name: '日本の',
    value: 'ja-JP'
  }
];

class LocaleSelect extends Component {
  static propTypes = {

  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

  }

  selectLocaleHandler = ({ key }) => {
    this.props.changeCurrentLocale && this.props.changeCurrentLocale(key);
  }

  render() {
    const currentLocaleObj = _.find(SUPPOER_LOCALES, item => item.value === this.props.currentLocale);
    const menu = (
      <Menu onClick={this.selectLocaleHandler}>
        {
          SUPPOER_LOCALES.map(item => {
            return (
              <Menu.Item key={item.value}>
                <span>{item.name}</span>
              </Menu.Item>
            );
          })
        }
      </Menu>
    );
    return (
      <Dropdown overlay={menu} placement="bottomCenter">
        <div style={{ paddingRight: '10px' }}>
          <Button type="default">{currentLocaleObj && currentLocaleObj.name}</Button>
        </div>
      </Dropdown>
    );
  }
}

export default connect(
  state => {
    return {
      currentLocale: state.app.currentLocale
    };
  },
  dispatch => {
    return {
      changeCurrentLocale(newLocale) {
        dispatch({ type: 'app/changeCurrentLocale', payload: newLocale });
      }
    };
  }
)(LocaleSelect);
