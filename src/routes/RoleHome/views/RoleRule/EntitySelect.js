import React from 'react';
import { Menu } from 'antd';
import { getIntlText } from '../../../../components/UKComponent/Form/IntlText';

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
        <Menu.Item key={entity.entityid}>{getIntlText('entityname', entity)}</Menu.Item>
      ))}
    </Menu>
  );
}

export default EntitySelect;
