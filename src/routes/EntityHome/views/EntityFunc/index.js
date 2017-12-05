import React from 'react';
import { connect } from 'dva';
import { Button } from 'antd';

function EntcommFunc({

  }) {
  return (
    <div>
      test
    </div>
  );
}

export default connect(
  state => {
    return {
      ...state.entityFunc
    };
  },
  dispatch => {
    return {

    };
  }
)(EntcommFunc);
