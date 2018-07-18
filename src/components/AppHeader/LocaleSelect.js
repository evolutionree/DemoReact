/**
 * Created by 0291 on 2018/5/10.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Button, Menu } from "antd";
import _ from 'lodash';

class LocaleSelect extends Component {
  static propTypes = {
    langlist: PropTypes.array
  };
  static defaultProps = {
    /*
     [{
     "key":"CN",
     "dispaly":"中文",
     "gmt":"GMT+8"}
     ]
     */
    langlist: []
  };

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
    const SUPPOER_LOCALES = this.props.langlist;
    const currentLocaleObj = _.find(SUPPOER_LOCALES, item => item.key === this.props.currentLocale);
    const menu = (
      <Menu onClick={this.selectLocaleHandler} style={{ minWidth: '100px', textAlign: 'center' }}>
        {
          SUPPOER_LOCALES.map(item => {
            return (
              <Menu.Item key={item.key}>
                <span>{item.dispaly}</span>
              </Menu.Item>
            );
          })
        }
      </Menu>
    );
    return (
      <Dropdown overlay={menu} placement="bottomCenter">
        <div style={{ paddingRight: '10px' }}>
          <span style={{ padding: '2px', border: '1px solid #4A4A4A', borderRadius: '5px', position: 'relative', top: '3px' }}>{currentLocaleObj && currentLocaleObj.key}</span>
        </div>
      </Dropdown>
    );
  }
}

export default connect(
  state => {
    return {
      currentLocale: state.app.currentLocale,
      langlist: state.app.langlist
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
