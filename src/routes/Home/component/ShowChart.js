/**
 * Created by 0291 on 2017/8/10.
 */
import React, { Component } from 'react';
import { message } from 'antd';
import EchartsReact from '../../ReportForm/component/Chart/EchartsReact';
// then import echarts modules those you have used manually.
import echarts from 'echarts';

function ShowChart({
                     loading,
                     component,
                     dataSource,
                     onEvents,
                     deviceType,
                     axisDataSource,
                     xseries,
                     chartType
                   }) {
  const colors = ['#3398db', '#7ed321', '#675bba'];

  function transformData(item) {
    const seriesData = item.data;
    let newSeresData = [];
    seriesData.map((seriesDataItem) => {
      let arr = [];
      arr.push(seriesDataItem[item.xfieldname]);
      arr.push(seriesDataItem[item.yfieldname]);
      arr.push(seriesDataItem[item.sizefieldname]);
      arr.push(JSON.stringify(seriesDataItem)); //需要传字符串  添加这项主要是为了 散点图 如果有事件处理函数可以回调当前项的整个对象数据
      newSeresData.push(arr);
    });
    return newSeresData;
  }

  function dedupe(array) {
    return Array.from(new Set(array));
  }

  function getScatterXAxisData() {
    let xAsix = [];
    dataSource && dataSource.map((item) => {
      item.data.map((item2) => {
        xAsix.push(item2[item.xfieldname]);
      });
    });

    xAsix = dedupe(xAsix);
    xAsix = xAsix.sort();

    return  xAsix;
  }

  function getAxisName(axisLable) { //坐标轴 Lable可能存在变量  需替换
    let returnAxisLable = axisLable;
    const keys = returnAxisLable && returnAxisLable.match(/#.*?#/g, '');
    if (axisDataSource && axisDataSource instanceof Array && axisDataSource.length > 0) {
      if (keys && keys instanceof Array) {
        for (let i = 0; i < keys.length; i++) {
          returnAxisLable = returnAxisLable.replace(keys[i], axisDataSource[0][keys[i].replace(/#/g, '')]);
        }
      }
    }

    return returnAxisLable;
  }

  function getBarItemColor(colorsettings) {  //柱状图的颜色
    if (colorsettings && colorsettings instanceof Array) {
      return {
        color: function (params) {
          return compareValueGetColor(colorsettings, params);
        }
      };
    } else {
      return null;
    }
  }

  function compareValueGetColor(colorsettings, params) { // 柱状图根据 后台规则 显示不同的颜色
    if (dataSource && dataSource instanceof Array && params.dataIndex >= 0) {
      for (let i = 0; i < colorsettings.length; i++) {
        let leftitemValue = dataSource[params.dataIndex][colorsettings[i].leftitem.replace(/#/g, '')];
        let rightitemValue = dataSource[params.dataIndex][colorsettings[i].rightitem.replace(/#/g, '')];
        let operator = colorsettings[i].operator;
        switch (operator) {
          case '>':
            if (leftitemValue > rightitemValue) {
              return colorsettings[i].result;
            }
            break;
          case '=':
            if (leftitemValue === rightitemValue) {
              return colorsettings[i].result;
            }
            break;
          case '<':
            if (leftitemValue < rightitemValue) {
              return colorsettings[i].result;
            }
            break;
          default:
            console.error('未匹配成功');
        }
      }
      return colorsettings[0].result;
    } else {
      return colorsettings[0].result;
    }
  }

  let option = {
    title: { text: '' },
    tooltip: {},
    xAxis: { data: [] },
    yAxis: {},
    series: []
  };



  const optionSet = {
    tooltip: {
      trigger: 'axis', //触发类型。 axis: 坐标轴触发  item:数据项图形触发
      axisPointer: {
        type: 'cross'
      },
      confine: true, //是否将 tooltip 框限制在图表的区域内。
      textStyle: {
        fontSize: 14
      },
      formatter: component.detailformat ? function (obj) {
        let formatstr = component.detailformat;
        const keys = formatstr && formatstr.match(/#.*?#/g, '');
        if (dataSource && dataSource instanceof Array && dataSource.length > 0) {
          if (keys && keys instanceof Array) {
            for (let i = 0; i < keys.length; i++) {
              formatstr = formatstr.replace(keys[i], dataSource[obj[0].dataIndex][keys[i].replace(/#/g, '')]);
            }
          }
        }
        return formatstr;
      } : null
    },
    grid: {
      left: '10px',
      right: '0px',
      bottom: '10px',
      top: '40px',
      containLabel: true
    },
    graphic: [],
    toolbox: {
      show: true,
      showTitle: false,
      right: 8,
      top: 16,
      feature: {
        saveAsImage: {
          name: component.exporttitle ? component.exporttitle : component.title
        }
      },
      iconStyle: {
        normal: {
          borderColor: '#b8c7ce',
          opacity: 1
        },
        emphasis: {
          borderColor: '#b8c7ce',
          opacity: 0.8
        }
      }
    },
    axisLineLineStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0, color: '#3c475d' // 0% 处的颜色
        }, {
          offset: 1, color: '#3c475d' // 100% 处的颜色
        }],
        globalCoord: false // 缺省为 false
      }
    },
    mobileAxisLineLineStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0, color: '#c7c7c7' // 0% 处的颜色
        }, {
          offset: 1, color: '#c7c7c7' // 100% 处的颜色
        }],
        globalCoord: false // 缺省为 false
      }
    },
    asisLineAndasisLabel: {
      //是否显示坐标轴刻度
      axisTick: {
        show: false
      },
      //坐标轴刻度标签
      axisLabel: {
        formatter: component.xformat ? component.xformat : null,
        color: '#fff',
        textStyle: {
          fontSize: 14
        }
      }
    },
    yAxisStyle: {
      //坐标轴在 grid 区域中的分隔线。
      splitLine: {
        lineStyle: {
          type: 'solid',
          color: '#3c475d'
        }
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: '#fff'
        }
      },
      //是否显示坐标轴刻度
      axisTick: {
        show: false
      }
    }
  };

  switch (chartType) {
    case 'barOrline':
      option = {
        backgroundColor: 'rgb(0,66,130)',
        color: colors,
        title: {
          text: component.title,
          textStyle: {
            color: '#fff'
          }
        },
        grid: optionSet.grid,
        //提示框组件
        tooltip: optionSet.tooltip,
        //原生图形元素组件
        graphic: optionSet.graphic,
        //工具栏
        toolbox: null,
        //X轴坐标
        xAxis: {
          splitLine: {
            lineStyle: {
              //type: 'dashed'
            }
          },
          nameLocation: 'end',
          nameGap: -40,
          nameTextStyle: {
            color: '#fff'
          },
          axisLine: {
            show: true,
            onZero: false,
            lineStyle: optionSet.axisLineLineStyle
          },
          ...optionSet.asisLineAndasisLabel,
          data: dataSource && dataSource.map((item) => {
            return item[component.xfieldname];
          })
        },
        //Y轴坐标
        yAxis: component.yfieldlist ? component.yfieldlist.map((item) => { //多个Y轴
          return {
            type: 'value',
            name: getAxisName(item.name),
            //坐标轴名称的文字样式
            nameTextStyle: {
              color: '#fff'
            },
            //坐标轴刻度标签
            axisLabel: {
              formatter: item.formatstr ? item.formatstr : null,
              color: '#fff',
              textStyle: {
                fontSize: 14
              }
            },
            ...optionSet.yAxisStyle
          };
        }) : {
          //坐标轴名称的文字样式
          nameTextStyle: {
            color: '#fff'
          },
          //坐标轴刻度标签
          axisLabel: {
            color: '#fff',
            textStyle: {
              fontSize: 14
            }
          },
          ...optionSet.yAxisStyle
        },
        //图例组件
        legend: {
          textStyle: {
            color: '#fff'
          },
          right: 0,
          top: 0,
          formatter: '{name} : ',
          align: 'right',
          data: component.series.length < 2 ? [] : component.series.map((item) => {
            return {
              name: item.seriesname,
              icon: 'roundRect'
            };
          })
        },
        //系列列表。每个系列通过 type 决定自己的图表类型
        series: component.series.map((item, index) => {
          return {
            name: item.seriesname,
            type: item.chartype,
            stack: item.stack, //数据堆叠，同个类目轴上系列配置相同的stack值可以堆叠放置
            smooth: false, //是否平滑曲线显示。
            showAllSymbol: false,
            symbol: 'emptyCircle', //折线转折点的 样式
            symbolSize: 6, //折线转折点的 大小

            itemStyle: {
              normal: item.chartype === 'bar' ? item.basecolor ? { color: item.basecolor } : getBarItemColor(item.colorsettings) : {}
            },
            lineStyle: { //折线的样式
              normal: {
                width: 3,
                shadowColor: 'rgba(0,0,0,0.4)',
                shadowBlur: 10,
                shadowOffsetY: 10
              }
            },
            yAxisIndex: item.ylabel, //对应的Y轴
            //图形上的文本标签，可用于说明图形的一些数据信息
            label: {
              normal: {
                show: false,
                position: 'top',
                textStyle: {
                  color: '#fff'
                }
              }
            },
            data: dataSource && dataSource.map((dataItem) => {
              return dataItem[item.fieldname];
            })
          };
        })
      }
      break;
    case 'scatter':
      option = {
        title: {
          text: component.title,
          textStyle: {
            color: '#fff'
          }
        },
        grid: optionSet.grid,
        //提示框组件
        tooltip: {
          confine: true, //是否将 tooltip 框限制在图表的区域内。
          textStyle: {
            fontSize: 14
          },
          formatter: component.detailformat ? function (obj) {
            const currentData = JSON.parse(obj.data[3]);
            let formatstr = component.detailformat;
            const keys = formatstr && formatstr.match(/#.*?#/g, '');
            if (dataSource && dataSource instanceof Array && dataSource.length > 0) {
              if (keys && keys instanceof Array) {
                for (let i = 0; i < keys.length; i++) {
                  formatstr = formatstr.replace(keys[i], currentData[keys[i].replace(/#/g, '')]);
                }
              }
            }
            return formatstr;
          } : null
        },
        //原生图形元素组件
        graphic: optionSet.graphic,
        //工具栏
        toolbox: null,
        //X轴坐标
        xAxis: {
          splitLine: {
            show: false,
            lineStyle: {
              type: 'solid',
              color: '#c7c7c7'
            }
          },
          nameTextStyle: {
            color: '#fff'
          },
          // axisLine: {
          //   show: true,
          //   onZero: false,
          //   lineStyle: {
          //     color: deviceType === 'mobile' ? '#c7c7c7' : '#53516a'
          //   }
          // },
          axisLine: {
            show: true,
            onZero: false,
            lineStyle: optionSet.axisLineLineStyle
          },
          ...optionSet.asisLineAndasisLabel,
          data: (xseries instanceof Array && xseries.length > 0) ? xseries.map((item) => { return item.xvalue }) : getScatterXAxisData()
        },
        //Y轴坐标
        yAxis: (component.yfieldlist && component.yfieldlist.length > 0) ? component.yfieldlist.map((item) => { //多个Y轴
          return {
            type: 'value',
            max: item.maxvalue ? item.maxvalue : 100,
            min: item.minvalue ? item.minvalue : 0,
            name: getAxisName(item.name),
            //坐标轴名称的文字样式
            nameTextStyle: {
              color: '#fff'
            },
            //坐标轴刻度标签
            axisLabel: {
              formatter: item.formatstr ? item.formatstr : null,
              color: '#fff',
              textStyle: {
                fontSize: 14
              }
            },
            ...optionSet.yAxisStyle,
            splitLine: {
              lineStyle: {
                type: 'solid',
                color: '#3c475d'
              }
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#c7c7c7'
              }
            }
          };
        }) : {
          type: 'value',
          min: 0,
          max: 100,
          //坐标轴名称的文字样式
          nameTextStyle: {
            color: '#fff'
          },
          //坐标轴刻度标签
          axisLabel: {
            color: '#fff',
            textStyle: {
              fontSize: 14
            }
          },
          ...optionSet.yAxisStyle,
          splitLine: {
            lineStyle: {
              type: 'solid',
              color: '#3c475d'
            }
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#c7c7c7'
            }
          }
        },
        series: dataSource ? dataSource.map((item, index) => {
          return {
            name: item.seriename,
            data: transformData(item),
            type: 'scatter',
            symbolSize: function (data) {
              return data[2] < 1 ? 8 : Math.log(data[2]) * 5 < 8 ? 8 : Math.log(data[2]) * 5;
            },
            label: {
              emphasis: {
                show: false,
                position: 'top',
                color: 'auto'
              }
            },
            itemStyle: {
              normal: {
                color: item.seriecolor ? item.seriecolor : colors[index % 3],
                borderColor: '#FFFFFF',
                borderWidth: 0,
                opacity: 1
              }
            }
          };
        }) : []
      };
      break;
    case 'gauge':
      option = {
        tooltip: {
          formatter: "{a} <br/>{b} : {c}%"
        },

        series: [
          {
            center : ['50%', '60%'],
            name: '业务指标',
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            radius : '80%',
            min: component.minvalue,
            max: component.maxvalue,
            axisLine: { //仪表盘轴线相关配置。
              lineStyle: {
                color: component.areainfo && component.areainfo instanceof Array && component.areainfo.map((item, index) => {
                  return [item.arearate, item.areacolor];
                }),
                opacity: 1
              }
            },
            splitLine: { //分隔线样式。
              show: false,
              lineStyle: {
                color: 'transparent'
              }
            },
            axisLabel: { //刻度标签
              show: false,
              textStyle: {
                color: '#ffffff'
              }
            },
            axisTick: { //刻度样式。
              show: false,
              splitNumber: 1
            },
            pointer: {
              length: '90%',
              width: 3
            },
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: 'rgba(255, 255, 255, 1)'
                }, {
                  offset: 0.8,
                  color: 'rgba(162, 107, 251, 1)'
                }], false),
                shadowColor: 'rgba(0, 0, 0, 0.5)',
                shadowBlur: 10,
                width: 4
              }
            },
            detail: {
              show: true,
              formatter: '{value}%',
              offsetCenter: [0, 22],
              textStyle: {
                fontSize: 16,
                color: '#4ae1ef'
              }
            },
            data: [{ value: dataSource instanceof Array && dataSource[0] && dataSource[0][component.valuefieldname], name: '' }]
          }
        ]
      }
      break;
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

export default ShowChart;
