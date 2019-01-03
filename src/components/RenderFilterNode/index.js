/*
 * @Author: geewonii
 * @Date: 2018-12-27 11:44:25 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-01-02 18:32:54
 */
import React from 'react';
import { Input, DatePicker } from 'antd';
import moment from 'moment';
import { getIntlText } from '../UKComponent/Form/IntlText';
import SingleSelect from '../DynamicTable/FilterDropComponent/SingleSelect';
import SelectList from '../DynamicTable/FilterDropComponent/SelectList';
import RangeNumber from '../DynamicTable/FilterDropComponent/RangeNumber';
import styles from './styles.less';

const { RangePicker } = DatePicker;

const RenderFilterNode = (props) => {
  const { entityId, value, record, onHandleValue, onClose } = props;

  const filterShowComponent = { //不同类型的字段 搜索面板不一样
    date: [8, 9, 1004, 1005, 1011],
    multiple: [3], //为了不该后端  前端把类型1009的暂时 只让用户单选过滤
    single: [1009],
    number: [6, 7]
  };
  const title = getIntlText('displayname', record) || '';
  const fieldname = record.fieldname || '';
  const controltype = record.controltype || '';
  const getTransformDateValue = (toTransformValue) => {
    if (typeof toTransformValue === 'string' && toTransformValue !== '') {
      let newValue = toTransformValue;
      if (filterShowComponent.multiple.indexOf(controltype) === -1 && toTransformValue === 'isnull') return null;

      if (filterShowComponent.date.indexOf(controltype) > -1) {
        newValue = newValue && newValue.split(',');
        const dateFormat = 'YYYY-MM-DD';
        newValue[0] = moment(newValue[0], dateFormat);
        newValue[1] = moment(newValue[1], dateFormat);
      } else if (filterShowComponent.multiple.indexOf(controltype) > -1 || filterShowComponent.number.indexOf(controltype) > -1) {
        newValue = newValue && newValue.split(',').map(item => {
          let newItem = item;
          if (newItem !== 'isnull' && controltype !== 1009) {
            newItem = Number(item);
          }
          return newItem;
        });
      }
      return newValue;
    } else {
      return null;
    }
  };
  const text = getTransformDateValue(value);

  const formatStr = (e) => {
    const formatValue = e;
    const dateFormat = 'YYYY-MM-DD';
    if (formatValue === 'isnull') return formatValue;

    if (filterShowComponent.date.indexOf(controltype) > -1) {
      if (formatValue && formatValue.length === 2) {
        return [formatValue[0].format(dateFormat) + ' 00:00:00', formatValue[1].format(dateFormat) + ' 23:59:59'].join(',');
      }
      return [];
    }

    if (filterShowComponent.multiple.indexOf(controltype) > -1 || filterShowComponent.number.indexOf(controltype) > -1) {
      return formatValue ? formatValue.join(',') : [];
    }
    return formatValue;
  };

  const renderComponent = () => {
    if (filterShowComponent.date.indexOf(controltype) > -1) {  // 日期查询
      const dateFormat = 'YYYY-MM-DD';
      return <RangePicker style={{ width: 240, marginRight: 8 }} allowClear={false} onChange={e => onHandleValue(formatStr(e), fieldname)} value={text || null} format={dateFormat} />;
    }

    if (filterShowComponent.single.indexOf(controltype) > -1) { // 实体类型
      return <SingleSelect width={240} entityId={entityId} onChange={e => onHandleValue(formatStr(e), fieldname)} value={text || []} />;
    }

    if (filterShowComponent.multiple.indexOf(controltype) > -1) { // 字典
      const { dataSource } = record.fieldconfig;
      return <SelectList width={240} entityId={entityId} type={controltype} onChange={e => onHandleValue(formatStr(e), fieldname)} dataSource={dataSource} value={text || []} />;
    }

    if (filterShowComponent.number.indexOf(controltype) > -1) { // 数字筛选
      return <RangeNumber width={240} onChange={e => onHandleValue(formatStr(e), fieldname)} value={text || []} />;
    }

    return (
      <Input
        className={styles.input}
        placeholder="请输入筛选条件"
        value={text}
        onChange={e => onHandleValue(formatStr(e.target.value), fieldname)}
      />
    );
  };

  return (
    <div className={styles.wrap}>
      <span
        title={title}
        className={styles.labelName}
      >
        <span>{title}</span>
        <font>：</font>
      </span>
      {renderComponent()}
      <div className={styles.close}>
        <span onClick={() => onClose(fieldname)}>删除</span>
      </div>
    </div>
  );
};

export default RenderFilterNode;
