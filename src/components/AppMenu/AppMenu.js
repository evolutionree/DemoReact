import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Menu, Icon } from 'antd';
import * as _ from 'lodash';
import Sider from './Sider';
import IntlText from '../UKComponent/Form/IntlText';

const { SubMenu, Item } = Menu;

function renderMenus(menus) {
  return menus.map((menu) => {
    if (menu.children && menu.children.length > 0) {
      return (
        <SubMenu key={menu.id} title={renderLink(menu)}>
          {renderMenus(menu.children)}
        </SubMenu>
      );
    } else {
      return <Item key={menu.id}>{renderLink(menu)}</Item>;
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
  let openKeys = [];
  const selectedKeys = [];
  walkNodes(menus, menu => menu.path === location.pathname, (match, stack) => {
    if (!match) return;
    selectedKeys.push(match.name);
    openKeys = stack.map(s => s.name);
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
  if (permissionLevel === 3) {
    const meta = /admin/.test(window.location.pathname)
      ? { href: '/', title: 'CRM', icon: 'team' }
      : { href: '/admin.html', title: '设置', icon: 'setting' };
    bottomMenu = (
      <Menu theme="dark">
        <Item style={{ paddingLeft: '24px' }}>
          <a href={meta.href}>
            <Icon type={meta.icon} />
            {' '}
            <span>{meta.title}</span>
          </a>
        </Item>
      </Menu>
    );
  }
  return (
    <Sider fold={siderFold} fixBottom={bottomMenu}>
      <Menu mode={siderFold ? 'vertical' : 'inline'}
            theme="dark"
            defaultOpenKeys={openKeys}
            defaultSelectedKeys={selectedKeys}>
        {renderMenus(menus)}
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
