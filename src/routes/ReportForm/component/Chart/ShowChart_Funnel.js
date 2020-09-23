/**
 * Created by 0291 on 2017/8/29.
 */
import React, { Component } from 'react';
import { message } from 'antd';
import EchartsReact from './EchartsReact';
// then import echarts modules those you have used manually.
import echarts from 'echarts';
import _ from 'lodash';


function ShowFunnelChart({
  loading,
  dataSource,
  onEvents,
  deviceType,
  component
}) {
  const colors = ['#60ab5e', '#24b3c1', '#ffc742', '#fb7844', '#fb5654', '#50ade3'];


  function getData() {
    return dataSource.data.filter((item) => {
      return item.stagename !== '输单';
    }).map((item) => {
      return { value: item.oppcount, name: item.stagename };
    });
  }


  function getMinValue() {
    let min = 0;
    dataSource.data.map((item) => {
      if (item.oppcount < min) {
        min = item.oppcount;
      }
    });
    return min;
  }


  function getMaxValue() {
    const arr = dataSource.data.map((item) => {
      return item.oppcount;
    });

    return _.max(arr);
  }


  const option = {
    color: colors,
    title: deviceType === 'mobile' ? {
      text: dataSource.categoryname,
      left: 'center',
      bottom: deviceType === 'mobile' ? 15 : 0,
      textStyle: {
        color: '#596372',
        fontSize: '13px'
      }
    } : {
      text: dataSource.categoryname,
      left: 'center',
      bottom: 0
    },
    tooltip: {
      trigger: 'item',
      formatter: component.commonextinfo.detailformat ? function (obj) {
        let formatstr = component.commonextinfo.detailformat;
        const keys = formatstr && formatstr.match(/#.*?#/g, '');
        const data = dataSource.data;
        if (data && data instanceof Array && data.length > 0) {
          if (keys && keys instanceof Array) {
            for (let i = 0; i < keys.length; i++) {
              formatstr = formatstr.replace(keys[i], data[obj.dataIndex][keys[i].replace(/#/g, '')]);
            }
          }
        }
        return formatstr;
      } : null
    },
    toolbox: deviceType === 'mobile' ? {} : {
      showTitle: false,
      right: 8,
      top: 0,
      feature: {
        saveAsImage: {
          name: dataSource.categoryname
        }
      }
    },
    legend: deviceType === 'mobile' ? {} : {
      type: 'scroll',
      orient: 'vertical',
      right: 0,
      top: 30,
      bottom: 20,
      data: getData().map(item => item.name)
    },
    calculable: true,
    series: [
      {
        name: '',
        type: 'funnel',
        left: deviceType === 'mobile' ? '10%' : '0%',
        top: deviceType === 'mobile' ? 0 : 0,
        //x2: 80,
        bottom: deviceType === 'mobile' ? 35 : 30,
        width: deviceType === 'mobile' ? '80%' : '78%',
        // height: {totalHeight} - y - y2,
        min: getMinValue(),
        max: getMaxValue(),
        // minSize: '20%',
        // maxSize: '100%',
        sort: 'none',
        gap: 2,
        label: {
          normal: {
            show: false,
            position: 'inside'
          },
          emphasis: {
            show: false,
            textStyle: {
              fontSize: 20
            }
          }
        },
        labelLine: {
          normal: {
            length: 10,
            lineStyle: {
              width: 1,
              type: 'solid'
            }
          }
        },
        itemStyle: {
          normal: {
            borderColor: '#fff',
            borderWidth: 1
          }
        },
        data: getData()
      }
    ]
  };


  return (
    <EchartsReact
      echarts={echarts}
      onEvents={onEvents}
      showLoading={loading}
      style={{ width: '100%', height: '100%' }}
      option={option}
      notMerge
      lazyUpdate />
  );
}

export default ShowFunnelChart;
