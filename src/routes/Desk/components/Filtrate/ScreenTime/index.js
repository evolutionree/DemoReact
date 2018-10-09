/*
 * @Author: geewonii 
 * @Date: 2018-09-21 15:39:12 
 * @Last Modified by: geewonii
 * @Last Modified time: 2018-09-25 13:47:58
 */
import React from 'react';
import { Popover, DatePicker, Button, InputNumber, Icon } from 'antd';
import styles from './index.less';
import dayjs from 'dayjs';

const ScreenTime = (props) => {
  const {
    title, minYear, dataSource, content, endOpen,
    showText, startValue, endValue, visible,
    changeScreenTimeNumber, changeTimeType, changeTime, changeEndOpen, handleVisibleChange
  } = props;

  const disabledStartDate = (startValue) => {
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  const disabledEndDate = (endValue) => {
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  const startTimeChange = (date, dateString) => {
    changeTime({ StartTime: dateString, TimeRangeType: '12' }, { startValue: date });
  }

  const endTimeChange = (date, dateString) => {
    changeTime({ EndTime: dateString, TimeRangeType: '12' }, { endValue: date });
  }

  const handleStartOpenChange = (open) => {
    if (!open) changeEndOpen(!endOpen);
  }

  const handleEndOpenChange = (open) => changeEndOpen(open);

  const contents = (
    <div className={styles.selectTimeWrap}>
      {
        Array.isArray(dataSource) && dataSource.map(item => {
          switch (item.key) {
            case '11':
              return (
                <InputNumber
                  style={{ width: '68px', margin: '10px' }}
                  key={item.key}
                  placeholder={item.name}
                  min={minYear}
                  max={dayjs().year()}
                  onChange={value => changeScreenTimeNumber(item.key, value)}
                />
              );
            case '12':
              return (
                <div key={item.key}>
                  <DatePicker
                    style={{ margin: '10px', marginRight: '0' }}
                    disabledDate={disabledStartDate}
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    value={startValue}
                    placeholder="开始时间"
                    onChange={startTimeChange}
                    onOpenChange={handleStartOpenChange}
                    getCalendarContainer={trigger => trigger.parentNode}
                  />
                  &nbsp;-&nbsp;
                  <DatePicker
                    style={{ marginTop: '10px' }}
                    disabledDate={disabledEndDate}
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    value={endValue}
                    placeholder="结束时间"
                    onChange={endTimeChange}
                    open={endOpen}
                    onOpenChange={handleEndOpenChange}
                    getCalendarContainer={trigger => trigger.parentNode}
                  />
                </div>
              );
            default:
              return <Button type='default' key={item.key} onClick={changeTimeType.bind(this, item)}>{item.name}</Button>
          }
        })
      }
    </div>
  );

  return (
    <Popover
      placement="bottom"
      content={!!content ? content : contents}
      title={title}
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibleChange}
    >
      <Button type='default'>{showText}<Icon type="down" /></Button>
    </Popover>
  );
}

export default ScreenTime;