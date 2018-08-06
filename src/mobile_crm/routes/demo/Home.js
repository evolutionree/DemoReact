import React from 'react';
import { connect } from 'dva';
import List from '../../Component/List';

function Home({ dispatch }) {
  return (
    <div >
      <List />
    </div>
  );
}

Home.propTypes = {
};

export default connect()(Home);
