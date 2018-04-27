import React from 'react';
import { connect } from 'dva';
import { Spin, Layout, Menu, Icon } from 'antd';
import classnames from 'classnames';
import AppHeader from '../components/AppHeader/AppHeader';
import AppMenu from '../components/AppMenu/AppMenu';
import SiteLogo from '../components/AppHeader/SiteLogo';
import styles from '../styles/main.less';
import ModifyPwdModal from './modals/ModifyPwdModal';
import ModifyAvatarModal from './modals/ModifyAvatarModal';
import UserFeedBackModal from './modals/UserFeedBackModal';
import ImportModal from './modals/ImportModal/ImportModal';
import ProgressModal from './modals/ProgressModal/ProgressModal';
import ImageGallery from '../components/ImageGallery';
import MapModal from '../components/MapModal';
import JsonEditModal from '../components/JsonEditModal';
import IntlWrap from './IntlWrap'; //国际版(多语言)容器

const { Sider, Header, Content, Footer } = Layout;

// const App = ({ children, location, siderFold, loading, dispatch }) => {
//   const cls = classnames({ [styles.app]: true, [styles.fold]: siderFold });
//   return (
//     <div className={cls}>
//       <AppHeader />
//       <AppMenu location={location} />
//       <Spin spinning={loading}>
//         <div className={styles.main}>
//           {children}
//         </div>
//       </Spin>
//       <ModifyPwdModal />
//       <ModifyAvatarModal />
//       <ImageGallery />
//       <MapModal />
//       <UserFeedBackModal />
//       <ImportModal />
//       <ProgressModal />
//       <JsonEditModal />
//     </div>
//   );
// };

const App = ({ children, location, siderFold, loading, permissionLevel, dispatch }) => {
  const cls = classnames({ [styles.app]: true, [styles.fold]: siderFold });

  let bottomMenu = null;
  if (permissionLevel === 3) {
    const meta = /admin/.test(window.location.pathname)
      ? { href: '/', title: 'CRM', icon: 'team' }
      : { href: '/admin.html', title: '设置', icon: 'setting' };
    bottomMenu = (
      <Menu theme="dark">
        <Menu.Item style={{ paddingLeft: '24px' }}>
          <a href={meta.href}>
            <Icon type={meta.icon} />
            {' '}
            <span>{meta.title}</span>
          </a>
        </Menu.Item>
      </Menu>
    );
  }

  return (
    <div className={cls}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={siderFold}
        >
          <SiteLogo />
          <AppMenu location={location} />
          <div style={{ width: siderFold ? '64px' : '200px' }}>
            {bottomMenu}
          </div>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }} >
            <AppHeader />
          </Header>
          <Content style={{ margin: '0 16px' }}>
            <Spin spinning={loading}>
              <div className={styles.main}>
                {children}
              </div>
            </Spin>
          </Content>
        </Layout>
      </Layout>

      <ModifyPwdModal />
      <ModifyAvatarModal />
      <ImageGallery />
      <MapModal />
      <UserFeedBackModal />
      <ImportModal />
      <ProgressModal />
      <JsonEditModal />
    </div>
  );
};

export default connect(state => ({ ...state.app, loading: state.loading > 0 }))(IntlWrap(App));
