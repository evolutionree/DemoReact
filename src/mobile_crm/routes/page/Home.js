import React from 'react';
import { connect } from 'dva';
import Menu from '../../Component/Menu';

function Home({ dispatch }) {
  return (
    <div >
      <Menu />
    </div>
  );
}

Home.propTypes = {
};

export default connect()(Home);
