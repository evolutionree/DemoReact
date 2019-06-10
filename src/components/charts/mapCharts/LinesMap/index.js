import React, { Component } from 'react'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/visualMap'
import 'echarts/lib/chart/map'

const comboMapData = (data, type = 'lines', key = 'dataname') => {
  const _list = [];
  if (!(Array.isArray(data) && data.length)) return [];

  return [...data].reduce((next, item) => {
    const KeyIdx = _list.findIndex(name => item[key] === name);
    const result = [...next];

    if (type === 'lines') {
      if (KeyIdx !== -1) {
        result[KeyIdx].coords.push([item.lng, item.lat])
      } else {
        result.push({ name: item[key], coords: [[item.lng, item.lat]] });
        _list.push(item[key]);
      }
    }

    if (type === 'effectScatter') result.push({ name: item[key], value: [item.lng, item.lat, item.number || 15] });
    return result;
  }, []);
}

class LinesMap extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }
  myChart = null

  componentDidMount () {
    this.initUI()
  }

  componentWillReceiveProps(nextProps) {
    this.initUI()
  }

  initUI = () => {
    const { data } = this.props;

    if (this.myChart) {
      const list = Array.isArray(data) ? [...data] : [];
      const myChart = echarts.init(this.myChart);
      const center = list.filter(item => [1].includes(item.datatype)).length ? list.filter(item => [1].includes(item.datatype)) : [{ lat: 39.9110666857, lng: 116.4136103013 }];
      const lines = comboMapData(list.filter(item => [2, 6].includes(item.datatype)));
      const points = comboMapData(list.filter(item => [4, 6].includes(item.datatype)), 'effectScatter');

      myChart.setOption({
        tooltip : {
          trigger: 'item'
        },
        bmap: {
          center: [center[0].lng, center[0].lat],
          zoom: 14,
          roam: true,
          itemStyle: {
            normal: {
              areaColor: '#323c48',
              borderColor: '#404a59'
            },
            emphasis: {
              areaColor: '#2a333d'
            }
          }
        },
        series: [{
          name: 'line1',
          type: 'lines',
          coordinateSystem: 'bmap',
          zlevel: 1,
          polyline: true,
          effect: {
            show: true,
            period: 6,
            trailLength: 0.7,
            color: '#fff',
            symbolSize: 5
          },
          lineStyle: {
            normal: {
              color: 'purple',
              width: 5,
              opacity: 0.6,
              curveness: 0.1
            }
          },
          data: lines
          }, {
            name: 'line2',
            type: 'lines',
            coordinateSystem: 'bmap',
            zlevel: 2,
            polyline: true,
            symbol: ['none', 'arrow'],
            symbolSize: 100,
            lineStyle: {
              normal: {
                color: 'purple',
                width: 3,
                opacity: 0.6,
                curveness: 0.1
              }
            },
            data: lines
        }, {
          name: '打卡坐标',
          type: 'scatter',
          coordinateSystem: 'bmap',
          rippleEffect: {
            brushType: 'stroke'
          },
          label: {
            normal: {
              show: true,
              position: 'right',
              formatter: '{b}'
            },
            position: 'end'
          },
          showEffectOn: 'emphasis',
          symbolSize: function (val) {
            return val[2];
          },
          itemStyle: {
            normal: {
              color: 'purple'
            }
          },
          data: points
        }]
      })
    }
  }

  render () {
    return (
      <div
        ref={node => (this.myChart = node)}
        style={{ width: '100%', height: 600 }}
      >
        loading...
      </div>
    )
  }
}

export default LinesMap
