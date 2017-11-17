/**
 * Created by 0291 on 2017/8/31.
 */
import React, { Component } from 'react';
import { message } from 'antd';
import EchartsReact from './EchartsReact';
// then import echarts modules those you have used manually.


function ShowFunnelChart({
                           loading,
                           dataSource,
                           onEvents,
                           echarts,
                           bmapCenter,
                           geoCoorddata,
                           component
                         }) {
  let mapGeoCoorddata = [];
  let mapGeoDataSouce = [];

  if (geoCoorddata instanceof Array) {
    for (let i = 0; i < geoCoorddata.length; i++) {
      if (geoCoorddata[i].datasetname === 'regiondata') {
        mapGeoDataSouce = geoCoorddata[i].data;
        mapGeoCoorddata = geoCoorddata[i].data && geoCoorddata[i].data.map((item) => {
          return {
            name: item.address,
            value: [item.lon, item.lat]
          };
        });
        break;
      }
    }
  }

  function getBmapCenter() {
    let finallyBmapCenter = bmapCenter;
    // if (mapGeoCoorddata.length > 0) {
    //   finallyBmapCenter = mapGeoCoorddata[0].value;
    // }

    return finallyBmapCenter;
  }

  let option = {
    tooltip : {
      confine: true, //是否将 tooltip 框限制在图表的区域内。
      trigger: 'item',
      axisPointer: {
        type: 'cross'
      },
      textStyle: {
        fontSize: 14
      },
      show: true,
      formatter: component.mapextinfo.formatformap ? function (obj) {
        let formatstr = component.mapextinfo.formatformap;
        const keys = formatstr && formatstr.match(/#.*?#/g, '');
        if (mapGeoDataSouce && mapGeoDataSouce instanceof Array && mapGeoDataSouce.length > 0) {
          if (keys && keys instanceof Array) {
            for (let i = 0; i < keys.length; i++) {
              formatstr = formatstr.replace(keys[i], mapGeoDataSouce[obj.dataIndex][keys[i].replace(/#/g, '')]);
            }
          }
        }
        return formatstr;
      } : null
    },
    bmap: {
      center: getBmapCenter(),
      zoom: 14,
      roam: true
    },
    series: [
      {
        type: 'effectScatter',
        mapType: 'china',
        coordinateSystem: 'bmap',
        zlevel: 3,
        z: 3,
        data: mapGeoCoorddata,
        showEffectOn: 'render', //配置何时显示特效。
        rippleEffect: {
          brushType: 'stroke'
        },
        hoverAnimation: true,
        symbolSize: 16,
        itemStyle: {
          normal: {
            color: '#32c1d4',
            shadowBlur: 18,
            shadowColor: '#a5db70'
          }
        }
      }]
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

export default ShowFunnelChart;
