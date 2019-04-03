import React from 'react';
import { Menu } from 'antd';
import { getIntlText } from '../../../../components/UKComponent/Form/IntlText';
import Search from '../../../../components/Search';
import { heighLightKeyWord } from '../../../../utils';

function EntitySelect({
  value,
  entities,
  onChange,
  height,
  keyword,
  onSearch
}) {
  return (
    <div>
      <Search
        style={{ width: '100%', marginBottom: 15 }}
        value={keyword}
        placeholder="请输入关键字"
        onSearch={onSearch}
      />
      <Menu selectedKeys={[value]}
        style={{ maxHeight: (height - 68), overflowY: 'auto', overflowX: 'hidden' }}
        onSelect={event => onChange(event.key)}>
        {entities.map(entity => {
          const text = getIntlText('entityname', entity);
          return (
            <Menu.Item key={entity.entityid}>{heighLightKeyWord(text, keyword)}</Menu.Item>
          );
        })}
      </Menu>
    </div>
  );
}

export default EntitySelect;
