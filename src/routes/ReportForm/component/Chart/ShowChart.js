/**
 * Created by 0291 on 2017/8/10.
 */
import React, { Component } from 'react';
import { message } from 'antd';
import EchartsReact from './EchartsReact';
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
                     legend
                   }) {
  if (!dataSource) {
    return null;
  }
  const colors = ['#3398db', '#7ed321', '#A5CE3A', '#22B14A', '#FBD50B', '#FFB516', '#F46F21', '#A3228E', '#665ABB'];
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
    dataSource && dataSource instanceof Array && dataSource.map((item) => {
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
      formatter: component.commonextinfo.detailformat ? function (obj) {
        let formatstr = component.commonextinfo.detailformat;
        const keys = formatstr && formatstr.match(/#.*?#/g, '');
        if (dataSource && dataSource instanceof Array && dataSource.length > 0) {
          if (keys && keys instanceof Array) {
            for (let i = 0; i < keys.length; i++) {
              formatstr = formatstr.replace(keys[i], dataSource[obj instanceof Array ? obj[0].dataIndex : obj.dataIndex][keys[i].replace(/#/g, '')]);
            }
          }
        }
        return formatstr;
      } : null
    },
    grid: deviceType === 'mobile' ? {
      left: '20px',
      right: 0,
      bottom: '20px',
      top: '40px',
      containLabel: true
    } : {
      left: '30px',
      right: '40px',
      bottom: '20px',
      top: '80px',
      containLabel: true
    },
    graphic: (dataSource && dataSource instanceof Array && dataSource.length > 0) ? [] : [
      {
        type: 'image',
        id: 'logo',
        right: 'center',
        top: 'center',
        z: -10,
        bounding: 'raw',
        origin: [75, 75],
        style: {
          image: '/img_site_logo.png',
          width: 160,
          height: 50,
          opacity: 0.5
        }
      }
    ],
    toolbox: {
      show: true,
      showTitle: false,
      right: 8,
      top: 16,
      feature: {
        saveAsImage: {
          name: component.titleinfo.exporttitle ? component.titleinfo.exporttitle : component.titleinfo.title
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
          offset: 0, color: '#53516a' // 0% 处的颜色
        }, {
          offset: 1, color: '#53516a' // 100% 处的颜色
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
      //坐标轴在 grid 区域中的分隔线。
      splitLine: {
        lineStyle: {
          type: 'solid',
          color: '#53516a'
        }
      },
      //是否显示坐标轴刻度
      axisTick: {
        show: false
      },
      //坐标轴刻度标签
      axisLabel: {
        formatter: component.commonextinfo.xformat,
        color: '#9b9b9b',
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
          color: '#53516a'
        }
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: deviceType === 'mobile' ? '#666666' : '#9b9b9b'
        }
      },
      //是否显示坐标轴刻度
      axisTick: {
        show: false
      }
    }
  };

  let option = {
    title: { text: '' },
    tooltip: {},
    xAxis: { data: [] },
    yAxis: {},
    series: []
  };

  if (component.commonextinfo.charttype === 3) { //仪表盘
    option = {
        tooltip: {
          formatter: "{a} <br/>{b} : {c}%"
        },

        series: [
          {
            center : ['50%', '74%'],
            name: '业务指标',
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            radius : '140%',
            min: component.commonextinfo.gaugeinfo.minvalue,
            max: component.commonextinfo.gaugeinfo.maxvalue,
            axisLine: {
              lineStyle: {
                color: component && component.commonextinfo.gaugeinfo && component.commonextinfo.gaugeinfo.areainfo.map((item) => {
                  return [item.arearate, item.areacolor];
                }),
                width: '40%',
                opacity: 1
              }
            },
            splitLine: {
              length: 6,
              lineStyle: {
                color: '#ffffff'
              }
            },
            axisLabel: {
              textStyle: {
                color: '#ffffff',
                lineHeight: 20
              }
            },
            axisTick: {
              length: 4,
              lineStyle: {
                color: '#ffffff'
              }
            },
            pointer: {
              length: '85%',
              width: 3
            },
            itemStyle: {
              normal: {
                color: '#ffffff',
                shadowColor: 'rgba(0, 0, 0, 0.5)',
                shadowBlur: 10,
                width: 4
              }
            },
            detail: {
              show: true,
              formatter: component.titleinfo.title + ':{value}%',
              offsetCenter: [0, 22],
              textStyle: {
                fontSize: 16,
                color: '#9b9b9b'
              }
            },
            data: [{ value: dataSource instanceof Array && dataSource[0] && dataSource[0][component.commonextinfo.gaugeinfo.valuefieldname], name: '' }]
          }
        ]
      };
  }
  else if (component.commonextinfo.charttype === 4) { //饼图
    option = {
      backgroundColor: '#3a3c4f',
      color: colors,
      title: {
        text: component.titleinfo.title,
        textStyle: {
          color: '#9b9b9b'
        }
      },
      grid: optionSet.grid,
      //提示框组件
      tooltip: {
        ...optionSet.tooltip,
        trigger: 'item'
      },
      //原生图形元素组件
      graphic: [
        {
          type: 'image',
          id: 'logo',
          right: 'center',
          top: 'center',
          z: -10,
          bounding: 'raw',
          origin: [75, 75],
          style: {
            image: '/img_site_logo.png',
            width: 160,
            height: 50,
            opacity: 0.5
          }
        }
      ],
      //工具栏
      toolbox: optionSet.toolbox,
      //图例组件
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 60,
        top: 20,
        bottom: 20,
        pageIconColor: '#FF883E', //翻页按钮颜色
        pageTextStyle: {
          color: '#ffffff'
        },
        textStyle: {
          color: '#9b9b9b'
        },
        // formatter: '{name} : ',
        // align: 'right',
        data: dataSource && dataSource instanceof Array && dataSource.map((dataItem) => {
          return { name: dataItem[component.commonextinfo.xfieldname], icon: 'roundRect' };
        }),
        selected: legend
      },
      //系列列表。每个系列通过 type 决定自己的图表类型
      series: component.commonextinfo.series.map((item, index) => {
        return {
          name: item.seriesname,
          type: item.chartype,
          radius: '70%',
          center: ['50%', '55%'],
          //图形上的文本标签，可用于说明图形的一些数据信息
          label: {
            normal: {
              formatter: item.labelformat ? function (obj) {
                let formatstr = item.labelformat;
                const keys = formatstr && formatstr.match(/#.*?#/g, '');
                if (dataSource && dataSource instanceof Array && dataSource.length > 0) {
                  if (keys && keys instanceof Array) {
                    for (let i = 0; i < keys.length; i++) {
                      formatstr = formatstr.replace(keys[i], dataSource[obj instanceof Array ? obj[0].dataIndex : obj.dataIndex][keys[i].replace(/#/g, '')]);
                    }
                  }
                }
                return formatstr;
              } : '{c}',
              show: true
            }
          },
          data: dataSource && dataSource instanceof Array && dataSource.map((dataItem) => {
            return { value: dataItem[item.fieldname], name: dataItem[component.commonextinfo.xfieldname] };
          }).filter(item => item.value)
        };
      })
    };
  } else if (component.commonextinfo.series.length > 0) { //柱状图 折线图
    option = {
      backgroundColor: '#3a3c4f',
      color: colors,
      title: {
        text: component.titleinfo.title,
        textStyle: {
          color: '#9b9b9b'
        }
      },
      grid: optionSet.grid,
      //提示框组件
      tooltip: optionSet.tooltip,
      //原生图形元素组件
      graphic: optionSet.graphic,
      //工具栏
      toolbox: optionSet.toolbox,
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
          color: '#9b9b9b'
        },
        axisLine: {
          show: true,
          onZero: false,
          lineStyle: optionSet.axisLineLineStyle
        },
        ...optionSet.asisLineAndasisLabel,
        data: (component.commonextinfo && component.commonextinfo.landscape === 1) ? null : dataSource && dataSource instanceof Array && dataSource.map((item) => {
            return item[component.commonextinfo.xfieldname];
        })
      },
      //Y轴坐标
      yAxis: component.commonextinfo.yfieldlist ? component.commonextinfo.yfieldlist.map((item) => { //多个Y轴
        return {
          type: (component.commonextinfo && component.commonextinfo.landscape === 1) ? 'category' : 'value', //横向显示 纵向显示
          name: getAxisName(item.name),
          //坐标轴名称的文字样式
          nameTextStyle: {
            color: '#9b9b9b'
          },
          //坐标轴刻度标签
          axisLabel: {
            formatter: item.formatstr ? item.formatstr : null,
            color: '#9b9b9b',
            textStyle: {
              fontSize: 14
            }
          },
          ...optionSet.yAxisStyle,
          data: (component.commonextinfo && component.commonextinfo.landscape === 1) ? dataSource && dataSource instanceof Array && dataSource.map((item) => {
            return item[component.commonextinfo.xfieldname];
          }) : null
        };
      }) : {
        //坐标轴名称的文字样式
        nameTextStyle: {
          color: '#9b9b9b'
        },
        //坐标轴刻度标签
        axisLabel: {
          color: '#9b9b9b',
          textStyle: {
            fontSize: 14
          }
        },
        ...optionSet.yAxisStyle
      },
      //图例组件
      legend: {
        textStyle: {
          color: '#9b9b9b'
        },
        right: 40,
        top: 20,
        formatter: '{name} : ',
        align: 'right',
        data: component.commonextinfo.series.length < 2 ? [] : component.commonextinfo.series.map((item) => {
          return {
            name: item.seriesname,
            icon: 'roundRect'
          };
        }),
        selected: legend
      },
      //系列列表。每个系列通过 type 决定自己的图表类型
      series: component.commonextinfo.series.map((item, index) => {
        return {
          name: item.seriesname,
          type: item.chartype,
          stack: item.stack, //数据堆叠，同个类目轴上系列配置相同的stack值可以堆叠放置
          smooth: false, //是否平滑曲线显示。
          showAllSymbol: false,
          symbol: 'emptyCircle', //折线转折点的 样式
          symbolSize: 10, //折线转折点的 大小

          itemStyle: {
            normal: item.chartype === 'bar' ? item.basecolor ? { color: item.basecolor } : getBarItemColor(item.colorsettings) : {}
          },
          lineStyle: { //折线的样式
            normal: {
              width: 6,
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
                color: '#9b9b9b'
              }
            }
          },
          data: dataSource && dataSource instanceof Array && dataSource.map((dataItem) => {
            return dataItem[item.fieldname];
          })
        };
      })
    };
  } else { //散点图
    option = {
      title: {
        text: component.titleinfo.title,
        textStyle: {
          color: '#9b9b9b'
        }
      },
      grid: optionSet.grid,
      //提示框组件
      tooltip: {
        confine: true, //是否将 tooltip 框限制在图表的区域内。
        textStyle: {
          fontSize: 14
        },
        formatter: component.commonextinfo.detailformat ? function (obj) {
          const currentData = JSON.parse(obj.data[3]);
          let formatstr = component.commonextinfo.detailformat;
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
      toolbox: deviceType === 'mobile' ? null : optionSet.toolbox,
      //X轴坐标
      xAxis: {
        splitLine: {
          show: deviceType === 'mobile' ? true : false,
          lineStyle: {
            type: 'solid',
            color: '#c7c7c7'
          }
        },
        nameTextStyle: {
          color: '#9b9b9b'
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
          lineStyle: deviceType === 'mobile' ? optionSet.mobileAxisLineLineStyle : optionSet.axisLineLineStyle
        },
        ...optionSet.asisLineAndasisLabel,
        data: (xseries instanceof Array && xseries.length > 0) ? xseries.map((item) => { return item.xvalue }) : getScatterXAxisData()
      },
      //Y轴坐标
      yAxis: (component.commonextinfo.yfieldlist && component.commonextinfo.yfieldlist.length > 0) ? component.commonextinfo.yfieldlist.map((item) => { //多个Y轴
        return {
          type: 'value',
          max: item.maxvalue ? item.maxvalue : 100,
          min: item.minvalue ? item.minvalue : 0,
          name: getAxisName(item.name),
          //坐标轴名称的文字样式
          nameTextStyle: {
            color: '#9b9b9b'
          },
          //坐标轴刻度标签
          axisLabel: {
            formatter: item.formatstr ? item.formatstr : null,
            color: '#9b9b9b',
            textStyle: {
              fontSize: 14
            }
          },
          ...optionSet.yAxisStyle,
          splitLine: {
            lineStyle: {
              type: 'solid',
              color: deviceType === 'mobile' ? '#c7c7c7' : '#53516a'
            }
          },
          axisLine: {
            show: deviceType === 'mobile' ? true : false,
            lineStyle: {
              color: deviceType === 'mobile' ? '#c7c7c7' : '#9b9b9b'
            }
          }
        };
      }) : {
        type: 'value',
        min: 0,
        max: 100,
        //坐标轴名称的文字样式
        nameTextStyle: {
          color: '#9b9b9b'
        },
        //坐标轴刻度标签
        axisLabel: {
          color: '#9b9b9b',
          textStyle: {
            fontSize: 14
          }
        },
        ...optionSet.yAxisStyle,
        splitLine: {
          lineStyle: {
            type: 'solid',
            color: deviceType === 'mobile' ? '#c7c7c7' : '#53516a'
          }
        },
        axisLine: {
          show: deviceType === 'mobile' ? true : false,
          lineStyle: {
            color: deviceType === 'mobile' ? '#c7c7c7' : '#9b9b9b'
          }
        }
      },
      series: dataSource ? dataSource instanceof Array && dataSource.map((item, index) => {
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
              borderWidth: 2,
              opacity: 1
            }
          }
        };
      }) : []
    };
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
