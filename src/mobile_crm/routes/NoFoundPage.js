import React from 'react';
import { connect } from 'dva';

// import TestModal from './TestModal';
// import { requestModal } from '../components/createModal';

function IndexPage({ dispatch }) {
  // function testOpen() {
  //   dispatch(requestModal('testModal'));
  // }
  return (
    <div >
      <ul>
        <li>找不到页面</li>
      </ul>
    </div>
  );
}

IndexPage.propTypes = {
};

export default connect()(IndexPage);
