import React from 'react';

function ImgIcon({ marginLess = false, name, size = 'default', style = {}, onClick, disabled = false, ...rest }) {
  const sizeMap = {
    large: 18,
    'default': 16,
    small: 14
  };
  const styl = {
    display: 'inline-block',
    verticalAlign: 'middle',
    textAlign: 'center',
    lineHeight: 1,
    marginRight: marginLess ? '0' : '8px',
    height: sizeMap[size] + 'px'
  };
  if (onClick) {
    styl.cursor = disabled ? 'not-allowed' : 'pointer';
  }
  return (
    <img src={'/icon/' + name + '.png'} alt="" style={{ ...styl, ...style }} onClick={disabled ? undefined : onClick } {...rest} />
  );
}

export default ImgIcon;

