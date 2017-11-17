import React from 'react';
import { Menu } from 'antd';

function EntitySelect({
    value,
    entities,
    onChange
  }) {
  return (
    <Menu selectedKeys={[value]}
          style={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'hidden' }}
          onSelect={event => onChange(event.key)}>
      {entities.map(entity => (
        <Menu.Item key={entity.entityid}>{entity.entityname}</Menu.Item>
      ))}
    </Menu>
  );
}

export default EntitySelect;
