import React from 'react';
import styles from './styles.less';

const SiteLogo = ({ onLogoClick }) => (
  <a className={styles.siteLogo} onClick={onLogoClick}>
    <img src="img_site_logo.png" alt="uk100" />
  </a>
);

export default SiteLogo;
