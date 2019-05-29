/*
 * @Author: geewonii
 * @Date: 2018-12-27 11:44:25 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-05-14 17:18:49
 */
import React from 'react';
import { Input } from 'antd';
import styles from './styles.less';

const FilterNode = (props) => {
  const { value, record, onHandleValue, onClose } = props;

  const title = record.title || '';
  const key = record.key || '';

  const text = value;

  const formatStr = (e) => {
    const formatValue = e;
    return formatValue;
  };

  const renderComponent = () => {
    return (
      <Input
        className={styles.input}
        placeholder="请输入筛选条件"
        value={text === 'isnull' ? '' : text}
        onChange={e => onHandleValue(formatStr(e.target.value), key)}
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
        <span onClick={() => onClose(key)}>删除</span>
      </div>
    </div>
  );
};

export default FilterNode;
