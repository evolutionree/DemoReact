import React, { PropTypes } from 'react';
import css from './ImgCard.less';

const ImgCard = ({ img, label, onClick }) => {
  const style = {
    cursor: onClick ? 'pointer' : 'default'
  };
  return (
    <div className={css.imgCard} style={style} onClick={onClick}>
      <img src={img} alt="图片" onError={e => e.target.src = '/img_img_card.png'} style={{ width: '40px', height: '40px' }} />
      <span title={label}>{label}</span>
    </div>
  );
};
ImgCard.propTypes = {
  img: PropTypes.string,
  label: PropTypes.node,
  onClick: PropTypes.func
};

export default ImgCard;
