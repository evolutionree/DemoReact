import React from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import classnames from 'classnames';
import AppHeader from '../components/AppHeader/AppHeader';
import AppMenu from '../components/AppMenu/AppMenu';
import styles from '../styles/main.less';
import ModifyPwdModal from './modals/ModifyPwdModal';
import ModifyAvatarModal from './modals/ModifyAvatarModal';
import UserFeedBackModal from './modals/UserFeedBackModal';
import ImportModal from './modals/ImportModal/ImportModal';
import ProgressModal from './modals/ProgressModal/ProgressModal';
import PrintEntityModal from './modals/PrintEntityModal/PrintEntityModal';
import ImageGallery from '../components/ImageGallery';
import MapModal from '../components/MapModal';
import JsonEditModal from '../components/JsonEditModal';
import IntlWrap from './IntlWrap'; //国际版(多语言)容器

const App = ({ children, location, siderFold, loading, dispatch, user, noMinWidth, redirectPath }) => {
  const cls = classnames({ [styles.app]: true, [styles.fold]: siderFold, [styles.noMinWidth]: noMinWidth });
  return (
    <div className={cls}>
      <AppHeader redirectPath={redirectPath} />
      <AppMenu location={location} />
      <Spin spinning={loading}>
        <div className={styles.main} style={{ minHeight: '200px' }}>
          {user.userid !== undefined && children}
        </div>
      </Spin>
      <ModifyPwdModal />
      <ModifyAvatarModal />
      <ImageGallery />
      <MapModal />
      <UserFeedBackModal />
      <ImportModal />
      <ProgressModal />
      <JsonEditModal />
      <PrintEntityModal />
    </div>
  );
};

export default connect(state => ({ ...state.app, loading: state.loading > 0 }))(IntlWrap(App));
