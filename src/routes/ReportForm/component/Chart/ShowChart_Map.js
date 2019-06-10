/**
 * Created by 0291 on 2017/8/29.
 */
import React, { Component } from 'react';
import { message } from 'antd';
import EchartsReact from './EchartsReact';
// then import echarts modules those you have used manually.


function ShowMapChart({
                           loading,
                           dataSource,
                           onEvents,
                           title,
                            titleShow = true,
                           exporttitle,
                           mapType,
                           echarts,
                           roam,
                        tooltipShow = true,
                           mapItemStyle,
                          toolboxShow = true,
                          visualMapShow = true,
                          label,
                        visualMap
                         }) {
  let option = {
    title: {
      show: titleShow,
      text: title,
      left: 'center'
    },
    tooltip: {
      show: tooltipShow,
      trigger: 'item',
      formatter: function(obj) {
        return obj.seriesName + '<br/>' + obj.name + ': ' + (obj.value ? obj.value : 0);
      }
    },
    visualMap: visualMap ? visualMap : {
      show: visualMapShow,
      seriesIndex: 0,
      min: 1,
      max: 200,
      left: 'left',
      bottom: 30,
      text: ['高', '低'],           // 文本，默认为数值文本
      calculable: true,
      color: ['#1772c6', '#2d81c8', '#408dce', '#5197d2', '#77b2de', '#a3cae7', '#bedbeb', '#d0e6f3']
    },

    toolbox: {
      show: toolboxShow,
      showTitle: false,
      orient: 'vertical',
      left: 'right',
      top: 'top',
      feature: {
        saveAsImage: {
          name: exporttitle ? exporttitle : title
        }
      }
    },
    series: [
      {
        name: title,
        type: 'map',
        mapType: mapType,
        roam: (roam || roam === false) ? roam : true, //是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移，可以设置成 'scale' 或者 'move'。设置成 true 为都开启
        itemStyle: mapItemStyle ? mapItemStyle : {
          normal: {
            areaColor: '#FFFFFF',
            borderColor: '#3398db'
          },
          emphasis: {
            areaColor: '#ffbe23',
            borderColor: '#ffbe23'
          }
        },
        label: label ? label : {
          normal: {
            show: true
          },
          emphasis: {
            show: true
          }
        },
        data: dataSource
      }
    ]
  }


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

export default ShowMapChart;
