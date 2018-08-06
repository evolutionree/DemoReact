/**
 * Created by 0291 on 2018/8/6.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import { Link } from 'dva/router';

// import TestModal from './TestModal';
// import { requestModal } from '../components/createModal';

function MobileCRMIndex({ dispatch, children }) {
  return (
    <div>
      {children}
      <div>
        <div><Link to='home'>Home</Link></div>
        <div><Link to='test'>Test</Link></div>
      </div>
    </div>
  );
}

MobileCRMIndex.propTypes = {
};

export default MobileCRMIndex;
