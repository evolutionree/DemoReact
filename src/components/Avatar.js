import React, { PropTypes } from 'react';
import defaultAvatar from '../assets/img_default_avatar.png';

const UserAvatar = ({ image, width, name, style, ...restProps }) => {
  let _style = {
    borderRadius: '100%'
  };
  if (width) {
    _style.width = width + 'px';
    _style.height = width + 'px';
  }
  if (style) {
    _style = {
      ..._style,
      ...style
    };
  }
  return (
    <img
      style={_style}
      title={name}
      src={image}
      onError={(e) => { e.target.src = defaultAvatar; }} //eslint-disable-line
      alt={name}
      {...restProps}
    />
  );
};
UserAvatar.propTypes = {
  image: PropTypes.string,
  width: PropTypes.number,
  name: PropTypes.string,
  style: PropTypes.object
};
UserAvatar.defaultProps = {
  image: defaultAvatar,
  width: 50,
  name: '头像'
};

export default UserAvatar;
