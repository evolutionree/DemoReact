import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Menu, Icon } from 'antd';
import * as _ from 'lodash';
import Sider from './Sider';
import IntlText from '../UKComponent/Form/IntlText';
import { uuid } from '../../utils';
import styles from './styles.less';

const { SubMenu, Item } = Menu;
const matchReg = /(?=\/)([^&]+)(?=\?)/gi;
const adminBgColor = '#04366b';
const paasBgColor = '#006f7b';
const adminSelectedColor = '#5a7700';
const paasSelectedColor = '#5a7700';

function getSiseMenuColor(admin, paas, selected) {
  return (admin || paas) ? {
    backgroundColor: `${
      admin ? (selected ? adminSelectedColor : adminBgColor) :
        (selected ? paasSelectedColor : paasBgColor)}`
  } : undefined;
}

function renderMenus(menus, admin, paas) {
  const paths = window.location.hash.match(matchReg);
  return menus.map((menu) => {
    if (menu.children && menu.children.length > 0) {
      return (
        <SubMenu key={menu.id} title={renderLink(menu)} style={getSiseMenuColor(admin, paas)}>
          {renderMenus(menu.children, admin, paas)}
        </SubMenu>
      );
    } else {
      return <Item key={menu.id} style={getSiseMenuColor(admin, paas, (paths && paths[0] === menu.path))}>{renderLink(menu)}</Item>;
    }
  });
}
function renderLink({ name, name_lang, icon, path }) {
  const iconEl = icon ? <Icon type={icon} /> : '';
  const textEl = <IntlText value={name} value_lang={name_lang} />;
  return !path ? <span>{iconEl} {textEl}</span>
    : <Link to={path}>{iconEl} {textEl}</Link>;
}
function mapLocationToMenuKeys(location, menus) {
  let locationNew = location.pathname;
  if (locationNew.split('/').indexOf('entcomm') > -1) {
    locationNew = location.pathname.replace(/entcomm/, 'entcomm-list');
  }
  if (locationNew.split('/').indexOf('notice') > -1) {
    locationNew = location.pathname.replace(/notice/, 'notice-list');
  }
  if (locationNew.split('/').indexOf('role') > -1) {
    locationNew = location.pathname.replace(/role/, 'roles');
  }
  if (locationNew.split('/').indexOf('vocation') > -1) {
    locationNew = location.pathname.replace(/vocation/, 'vocations');
  }
  if (locationNew.split('/').indexOf('affair') > -1) {
    locationNew = location.pathname.replace(/affair/, 'affair-list');
  }

  let openKeys = [];
  const selectedKeys = [];
  walkNodes(menus, menu => locationNew.indexOf(menu.path) > -1 && menu.path, (match, stack) => {
    if (!match) return;
    selectedKeys.push(match.id);
    openKeys = stack.map(s => s.id);
  });
  return {
    openKeys,
    selectedKeys
  };
}
function walkNodes(nodes, prediction, cb) {
  let match;
  const stack = [];
  innerWalkNodes(nodes);
  cb(match, stack);

  function innerWalkNodes(currNodes) {
    return currNodes.some((node) => {
      if (prediction(node)) {
        match = node;
        return true;
      } else if (node.children) {
        if (innerWalkNodes(node.children)) {
          stack.push(node);
          return true;
        }
      }
      return false;
    });
  }
}

const AppMenu = ({ location, menus, siderFold, permissionLevel }) => {
  const { openKeys, selectedKeys } = mapLocationToMenuKeys(location, menus);
  let bottomMenu = null;
  const admin = /admin/.test(window.location.pathname);
  const paas = /paas/.test(window.location.pathname);

  if (permissionLevel === 3) {
    let meta = [];
    if (admin) {
      meta = [
        { href: '/', title: 'CRM', icon: 'team' },
        { href: '/paas.html', title: 'PaaS', icon: 'fork' }
      ];
    } else if (paas) {
      meta = [
        { href: '/', title: 'CRM', icon: 'team' },
        { href: '/admin.html', title: '系统管理' }
      ];
    } else {
      meta = [
        { href: '/admin.html', title: '系统管理' },
        { href: '/paas.html', title: 'PaaS', icon: 'fork' }
      ];
    }

    bottomMenu = (
      <div className={styles.bottomMenu}>
        {
          meta.map((item, index) => (
            <a key={index} href={item.href}>
              <div>
                <Icon type={item.icon} />
                {item.title}
              </div>
            </a>
          ))
        }
      </div>
    );
  }

  return (
    <Sider fold={siderFold} fixBottom={bottomMenu} style={getSiseMenuColor(admin, paas)}>
      <Menu mode={siderFold ? 'vertical' : 'inline'}
        theme="dark"
        style={getSiseMenuColor(admin, paas)}
        key={siderFold ? '' : uuid()}
        defaultOpenKeys={openKeys}
        defaultSelectedKeys={selectedKeys}>
        {renderMenus(menus, admin, paas)}
      </Menu>
    </Sider>
  );
};
AppMenu.propTypes = {
  siderFold: PropTypes.bool,
  menus: PropTypes.arrayOf(PropTypes.object).isRequired,
  location: PropTypes.object,
  permissionLevel: PropTypes.number
};
AppMenu.defaultProps = {
  menus: [],
  permissionLevel: 0
};

export default connect(
  state => {
    return _.pick(state.app, ['location', 'menus', 'siderFold', 'permissionLevel']);
  }
)(AppMenu);
