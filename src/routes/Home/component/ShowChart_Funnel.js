/**
 * Created by 0291 on 2017/8/29.
 */
import React, { Component } from 'react';
import { message } from 'antd';
import EchartsReact from '../../ReportForm/component/Chart/EchartsReact';
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
  const colors = ['#63ac5d', '#25b4c2', '#ffc73f', '#fc7945', '#fb5655', '#51ace3'];


  function getData() {
    return dataSource.data.filter((item) => {
      return item.stagename !== '输单';
    }).map((item) => {
      return  { value: item.totalamount, name: item.stagename };
    });
  }


  function getMinValue() {
    let min = 0
    if (dataSource.data[dataSource.data.length - 1].winrate === 1) {
      min = dataSource.data[dataSource.data.length - 1].totalamount;
    }
    return min;
  }


  function getMaxValue() {
    let arr = dataSource.data.map((item) => {
      return item.totalamount;
    });

    return _.max(arr);
  }


  const option = {
    color: colors,
    title: {
      text: dataSource.categoryname,
      left: 'center',
      bottom: 15,
      textStyle: {
        color: '#4ae1ef',
        fontSize: '13px'
      }
    },
    tooltip: {
      trigger: 'item',
      confine: true, //是否将 tooltip 框限制在图表的区域内。
      formatter: component.detailformat ? function (obj) {
        let formatstr = component.detailformat;
        const keys = formatstr && formatstr.match(/#.*?#/g, '');
        let data = dataSource.data;
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
    toolbox: {},
    legend: {},
    calculable: true,
    series: [
      {
        name: '',
        type: 'funnel',
        left: '10%',
        top: 25,
        //x2: 80,
        bottom: 40,
        width: '80%',
        // height: {totalHeight} - y - y2,
        min: getMinValue(),
        max: getMaxValue(),
        minSize: '20%',
        maxSize: '100%',
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
            borderWidth: 0
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
      notMerge={true}
      lazyUpdate={true} />
  );
}

export default ShowFunnelChart;
