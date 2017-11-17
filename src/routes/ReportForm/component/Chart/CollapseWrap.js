/**
 * Created by 0291 on 2017/8/31.
 */
import React, { Component } from 'react';
import _ from 'lodash';
import { Collapse, Row, Col, Checkbox } from 'antd';
const Panel = Collapse.Panel;
import styles from '../../index.less';

function CollapseWrap({
                     dataSource,
                     value,
                     onChange,
                        changeMap,
                     mapSeriesType
                   }) {

  const checkedChangeHandler = (parame, dkey, e) => {
    const newValue = _.cloneDeep(value);
    if (e.target.checked) { //选中
      let changeParam = newValue[parame] ? newValue[parame].split(',') : [];
      changeParam.push(dkey);
      newValue[parame] = changeParam.join();
    } else {
      newValue[parame] = _.remove(newValue[parame].split(','), function(n) {
        return n != dkey;  //  不用全等
      }).join();
    }

    onChange(newValue);

  };

  return (
    <div className={styles.collapsewrap}>
      <Collapse defaultActiveKey={['1']}>
        {
          dataSource && dataSource.map((item, index) => {
            if (item.ctrlname === 'regions') {
              return (
                <Panel header={item.title} key={index}>
                  <ul>
                    {
                      item.data && item.data.map((regionItem, regionIndex) => {
                        return (
                          <li key={regionIndex} style={{ paddingBottom: (regionIndex < item.data.length - 1) ? '10px' : 0 }}>
                            {
                              mapSeriesType === 'map' ? <a onClick={() => { changeMap(regionItem.regionname) }}>{regionItem.regionname}({regionItem.count})</a> :
                                <div>
                                  <div>{regionItem.recname}</div>
                                  <div>地址：{regionItem.address}</div>
                                </div>
                            }
                          </li>
                        );
                      })
                    }
                  </ul>
                </Panel>
              );
            } else {
              return (
                <Panel header={item.title} key={index}>
                  <ul>
                    {
                      item.data && item.data.map((filterItem, filterIndex) => {
                        return (
                          <li key={filterIndex}>
                            <Row>
                              <Col span={16}>
                                <span style={{ paddingRight: '10px' }}>{filterItem.dvalue}</span>
                              </Col>
                              <Col span={6}>
                                <span title={filterItem.dcount} className={styles.textEllipsis}>{filterItem.dcount}</span>
                              </Col>
                              <Col span={2}>
                                <Checkbox checked={(',' + value[item.paramname] + ',').indexOf(',' + filterItem.dkey + ',') > -1 ? true : false}
                                          onChange={checkedChangeHandler.bind(this, item.paramname, filterItem.dkey)}
                                          className='collapseCheckBox' />
                              </Col>
                            </Row>
                          </li>
                        );
                      })
                    }
                  </ul>
                </Panel>
              );
            }
          })
        }
      </Collapse>
    </div>
  );
}

export default CollapseWrap;
