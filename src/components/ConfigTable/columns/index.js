import React from 'react';
import { Icon } from 'antd';
import FilterDrop from '../../DynamicTable/FilterDropComponent';
import { tooltipElements, GetFilterValue, CheckHasFilter, GetFilterVisible } from '../utils';

export const getColumns = (params, LoopList, defaultColwidth, callback) => {
  const { onFilter, toggleFilter, columnFilter, FilterVisibles, searchOrder } = params;

  const filterDropdown = (
    fieldName = 'No incoming fieldName',
    name = 'No incoming name',
    controltype = 1,
    optionList,
    fieldconfig = { dataSource: {} }
  ) => (<FilterDrop
    value={GetFilterValue(fieldName, columnFilter)}
    visible={GetFilterVisible(fieldName, FilterVisibles)}
    field={{
      controltype,
      fieldname: `${fieldName}`,
      fieldconfig,
      displayname: `${name}`
    }}
    optionList={optionList}
    onFilter={(fieldNames, value) => onFilter(`${fieldNames}`, value)}
    hideFilter={(fieldNames, value) => toggleFilter(`${fieldNames}`, value)}
  />);

  const filterIcon = (fieldName = 'No incoming fieldName') => (
    <Icon
      type="filter"
      style={{ color: CheckHasFilter(`${fieldName}`, columnFilter) ? '#108ee9' : '#aaa' }}
      onClick={(e) => {
        e.nativeEvent.stopImmediatePropagation();
        toggleFilter(`${fieldName}`, true);
      }}
    />
  );

  const renderList = (list) => (
    list.map(item => {
      const filterObj = item.sorter ? {
        sorter: item.sorter || true,
        sortOrder: searchOrder ? searchOrder.split(' ')[0] === item.key && (searchOrder.split(' ')[1] + 'end') : false,
        filterDropdown: item.filterDropdown ? item.filterDropdown : filterDropdown(item.key, item.title, (item.filterType || 1)),
        filterIcon: item.filterIcon ? item.filterIcon : filterIcon(item.key),
        filterDropdownVisible: item.filterDropdownVisible ? item.filterDropdownVisible : GetFilterVisible(item.key, FilterVisibles)
      } : {};
      return {
        ...item,
        dataIndex: item.key,
        width: item.width || defaultColwidth,
        fixed: item.fixed || false,
        dataType: item.dataType || 'text',
        render: item.render || ((text, record) => tooltipElements((item.name ? record[item.name] : text), item.dataType || 'text', item.width || defaultColwidth)),
        children: item.children ? renderList(item.children) : false,
        ...filterObj
      };
    })
  );

  if (callback) callback(renderList(LoopList).reduce((sum, current) => sum + current.width, 0));


  return renderList(LoopList);
};
