import React from 'react';
import { Link } from 'dva/router';
import styles from './styles.less';

const SiteLogo = ({ path, onLogoClick }) => (
  <Link to={path} className={styles.siteLogo} onClick={onLogoClick}>
    <img src="img_site_logo.png" alt="uk100" />
  </Link>
);

export default SiteLogo;
