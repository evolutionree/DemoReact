import React from 'react';
import { connect } from 'dva';

function Home({ dispatch }) {
  return (
    <div >
      <ul>
        <li>Test</li>
      </ul>
    </div>
  );
}

Home.propTypes = {
};

export default connect()(Home);
