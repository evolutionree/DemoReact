import React from 'react';
import { connect } from 'dva';
import gpsIcon from '../../../assets/icon_gps.png';

function Location() {
  return (
    <div>
      此控件只可在手机端显示
    </div>
  );
}

Location.View = ({ value, dispatch }) => {
  if (!value || !value.address) return <span style={{ color: '#999999' }}>(空)</span>;
  return (
    <div>
      <span style={{ verticalAlign: 'middle' }}>{value.address}</span>
      <img
        style={{ verticalAlign: 'middle', marginLeft: '5px', cursor: 'pointer' }}
        src={gpsIcon}
        alt=""
        onClick={() => { dispatch({ type: 'app/viewMapLocation', payload: value }); }}
      />
    </div>);
};
Location.View = connect()(Location.View);

export default Location;
