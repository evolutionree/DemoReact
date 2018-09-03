/**
 * Created by 0291 on 2018/6/15.
 * 抽离出成组件
 */
import React from 'react';
import { Row, Col, message, Button, Icon } from 'antd';
import _ from 'lodash';
import { Link } from 'dva/router';
import { connect } from 'dva';
import echarts from 'echarts';

import request from '../../utils/request';

import Page from '../../components/Page';
import DataGrid from './component/Table/DataGrid.jsx';
import HeaderModel from './component/Table/HeaderModel.js';
import SearchBar from './component/SearchBar/SearchBar.js'; //查询组件
import ShowChart from './component/Chart/ShowChart'; //一般图表（柱状图、折线图等）
import ShowFunnelChart from './component/Chart/ShowChart_Funnel'; //漏斗图表
import ShowMapChart from './component/Chart/ShowChart_Map'; //地图
import ShowBMapChart from './component/Chart/ShowChart_Map_BMap'; //详细地图（县级以下）
import CollapseWrap from './component/Chart/CollapseWrap'; //折叠面板
import BreadCrumb from './component/Chart/BreadCrumb'; //面包屑导航条
import { chinaMap } from './component/Chart/china-main-map';
import storage from '../../utils/storage';
import moment from 'moment';
import DynamicFieldView from '../../components/DynamicForm/DynamicFieldView';

import styles from './index.less';

import chinaJson from '../../../public/mapJson/china.json'; //china Map Data
echarts.registerMap('china', chinaJson);  //初始中国地图
import html2canvas from './component/Chart/html2canvas';


class ReportForm extends React.Component {
  static propTypes = {
    url: React.PropTypes.string,
    injectedParams: React.PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      pageName: '',
      components: [],
      datasources: [],
      serchValue: {},
      reload: true, //serchValue 改变时 是否让DataGrid组件重新请求数据（如果用户在点击搜索按钮之前只是修改查询参数，不请求）
      width: document.body.clientWidth,
      mapType: 'china',
      mapSeriesType: 'map',
      bmapCenter: [],
      breadcrumbData: [],
      selectedLegend: null
    };
    this.reloadReportData = this.reloadReportData.bind(this);
    this.echartsInstance = echarts;
  }

  componentWillMount() {
    this.queryReportDefine(this.props.reportId);
  }

  queryReportDefine(reportId) {
    this.echartsInstance.registerMap('china', chinaJson);  //初始中国地图
    request('/api/ReportEngine/queryReportDefine', {
      method: 'post', body: JSON.stringify({ 'id': reportId })
    }).then((result) => {
      const components = result.data.components;
      let dataGridDatasouces = [];
      components && components instanceof Array && components.map((item) => {
        if (item.ctrltype === 2) {
          dataGridDatasouces.push(item.datasourcename);
        }
      });
      this.setState({
        components: components,
        datasources: result.data.datasources,
        pageName: result.data.name,
        dataGridDatasouces: dataGridDatasouces
      });

      result.data.datasources.map((item, index) => {
        const defaultParams = this.getDefaultParameters(item, result.data.components)
        if (_.indexOf(dataGridDatasouces, item.instid) === -1) { //不请求 表格对应的数据源 交给组件DataGrid去处理
          this.setState({
            [item.instid + 'loading']: true
          });
          this.queryData(item, {
            DataSourceId: item.datasourcedefineid,
            InstId: item.instid,
            Parameters: defaultParams
          }, components);
        }
      });
    });
  }

  getDefaultParameters(datasource, components) { //本地localstorage是否存有params  不然则取服务端给的默认params
    let defaultSerchValue = {};
    let filterComponent = _.find(components, function(item) { return item.ctrltype === 3; });
    filterComponent && filterComponent.filterextinfo.ctrls.map((item) => {
      // ctrltype === 3 表示用户/团队 选择项
      if (item.ctrltype === 3) {
        defaultSerchValue[item.parametername] = item.multichoosedata.defaultvalues.map((valueItem) => {
          return valueItem.id;
        }).join();
        defaultSerchValue[item.parametername + '_name'] = item.multichoosedata.defaultvalues.map((valueItem) => {
          return valueItem.name;
        }).join();
      } else if (item.ctrltype === 2) { //下拉选择
        defaultSerchValue[item.parametername] = item.combodata.defaultvalue;
      } else if (item.ctrltype === 5) { // 设置区间
        defaultSerchValue[item.parametername] = item.seriessetting.defaultvalues;
      } else if (item.ctrltype === 4 || item.ctrltype === 9) { //日期
        defaultSerchValue[item.parametername] = item.datedefaultvalue;
      } else if (item.ctrltype === 1) { //输入框
        defaultSerchValue[item.parametername] = item.textdefaultvalue;
      }
    });

    let params = {};
    for (let key in defaultSerchValue) { //可能参数里包含多个子参数  需拆分
      if (key.indexOf(',') > -1) {
        key.split(',').map((item) => {
          params[item] = defaultSerchValue[key];
        });
      } else {
        params[key] = defaultSerchValue[key];
      }
    }

    function getParameters(dSource, oldPrams) { //請求參數 前端字段转换成后端接口请求参数字段(前端定义的跟后端要求的请求参数不一样)
      let returnParams = {};
      dSource.parameters.map((item) => {
        _.forIn(item, function(value, key) {
          returnParams[key] = oldPrams[value];
        });
      })

      return returnParams;
    }

    this.setState({
      serchValue: defaultSerchValue,
      reload: true
    });
    return getParameters(datasource, params);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.reportId || nextProps.reportId === this.props.reportId) return;
    this.setState({
      components: [],
      datasources: [],
      serchValue: {},
      reload: true,
      width: document.body.clientWidth,
      mapType: 'china',
      mapSeriesType: 'map',
      bmapCenter: [],
      breadcrumbData: []
    });
    this.queryReportDefine(nextProps.reportId);
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize(e) {
    this.setState({
      width: document.body.clientWidth
    });
  }

  getParamsValue(field, componentIndex, dataIndex, chartIndex) { //获取当前点击的节点对应的数据（作为新的参数）
    const currentComponentData = this.state[this.state.components[componentIndex].datasourcename];
    const paramsName = field.split('#')[1].split('#')[0];
    if (chartIndex || chartIndex === 0) {
      return currentComponentData && currentComponentData[chartIndex].data[dataIndex][paramsName];
    } else {
      return currentComponentData && currentComponentData[dataIndex][paramsName];
    }
  }

  getEvents(component, componentIndex, chartIndex) { //图表的 事件获取
    const events = component.events;
    let event = {};
    events && events.map((item) => {
      event[item.eventname] = (params) => {
        item.actionlist.map((list) => {
          if (list.actiontype === 1) {

          } else if (list.actiontype === 2) { //改变参数
            let changeParams = {};
            list.changeparam.map((paramsObj) => {
              if (component.ctrltype === 1) {
                if (component.commonextinfo.charttype === 3) { //仪表盘
                  changeParams[paramsObj.parametername] = (paramsObj.parametervalue.indexOf('#') > -1) ? this.getParamsValue(paramsObj.parametervalue, componentIndex, params.dataIndex, chartIndex) : paramsObj.parametervalue;
                } else if (component.commonextinfo.series.length > 0) {  //柱状图 折线图 饼图
                  changeParams[paramsObj.parametername] = (paramsObj.parametervalue.indexOf('#') > -1) ? this.getParamsValue(paramsObj.parametervalue, componentIndex, params.dataIndex, chartIndex) : paramsObj.parametervalue;
                } else { //散点图
                  changeParams[paramsObj.parametername] = (paramsObj.parametervalue.indexOf('#') > -1) ? params.data[3][paramsObj.parametervalue.split('#')[1].split('#')[0]] : paramsObj.parametervalue;
                }
              } else { //漏斗图
                changeParams[paramsObj.parametername] = (paramsObj.parametervalue.indexOf('#') > -1) ? this.getParamsValue(paramsObj.parametervalue, componentIndex, params.dataIndex, chartIndex) : paramsObj.parametervalue;
              }
            });


            let cloneDatasources = _.cloneDeep(this.state.datasources);
            cloneDatasources.map((item) => {
              item.parameArray = [];
              item.parameters.map((item1) => {
                _.forIn(item1, function(value, key) {
                  item.parameArray.push(value);  //value：前端查詢字段 key ：請求Url的參數名
                });
              })
            });


            cloneDatasources.map((item) => {
              for (let key in changeParams) {
                if (item.parameArray.indexOf(key) > -1) { //事件发生后 查询参数发生改变  判断数据源中是否存在该请求参数
                  this.setState({
                    serchValue: { ...this.state.serchValue, ...changeParams },
                    reload: true
                  }, this.reloadReportData(changeParams));
                  break;
                }
              }
            });
          }
        });
      };
    });

    event.legendselectchanged = (params) => { //图例状态发生改变时
      this.setState({
        selectedLegend: params.selected
      });
    };
    return event;
  }

  breadCrumbClickHandler(mapName) {
    let breadcrumbData = this.state.breadcrumbData;
    let newBreadcrumbData = [];

    if (mapName === '全国') {//根节点

    } else {
      for (let i = 0; i < breadcrumbData.length; i++) {
        newBreadcrumbData.push(breadcrumbData[i]);
        if (breadcrumbData[i] === mapName) {
          break;
        }
      }
    }
    this.changeMapShow(mapName, newBreadcrumbData);
  }


  changeMapShow (mapName, newBreadcrumbData) {
    this.setState({
      serchValue: {
        ...this.state.serchValue,
        '@regions': newBreadcrumbData.join()
      },
      reload: true
    }, this.reloadReportData({ ...this.state.serchValue, '@regions': newBreadcrumbData.join() }, { ...this.state.serchValue, '@regions': newBreadcrumbData.join() }));  //查询最新数据

    if (chinaMap[mapName]) {  //全国  省市区
      request(`mapJson/${chinaMap[mapName]}.json`, { //请求当前地图的数据
        method: 'get'
      }).then((result) => {
        this.echartsInstance.registerMap(chinaMap[mapName], result);
        this.setState({
          mapType: chinaMap[mapName],
          mapSeriesType: 'map'
        });
      }).catch(e => message.error(e.message));
    } else { //县级以下
      const myGeo = new BMap.Geocoder();
      myGeo.getPoint(newBreadcrumbData.join()+','+mapName, (point) => {
        if(point){
          this.setState({
            mapSeriesType: 'lines',
            bmapCenter: [point.lng, point.lat]
          });
        }
      });
    }

    this.setState({
      breadcrumbData: newBreadcrumbData
    });
  }

  getMapChartEvents(loading) {
    return {
      click: (params) => {
        if (!loading && params.name && (chinaMap[params.name] || this.state.breadcrumbData.join().indexOf('台湾') === -1)) { //百度详情地图 显示台湾的位置不准确，所以，不显示台湾各县的详情地图
          let breadcrumbData = this.state.breadcrumbData;
          breadcrumbData.push(params.name);
          this.changeMapShow(params.name, breadcrumbData);
        }
      }
    };
  }


  collapseClickMapShow (loading, name) {
    if (!loading) {
      let breadcrumbData = this.state.breadcrumbData;
      breadcrumbData.push(name);
      this.changeMapShow(name, breadcrumbData);
    } else {
      message.warning('正在加载数据中，请稍后请求');
    }
  }

  queryData(item, params, components = this.state.components) {
    let _params = params;
    if (this.props.injectedParams) {
      _params = {
        ...params,
        Parameters: {
          ...(params.Parameters || {}),
          ...this.props.injectedParams
        }
      };
    }
    request('/api/ReportEngine/queryData', {
      method: 'post', body: JSON.stringify(_params)
    }).then((getData) => {
      const currentComponent = _.find(components, componentsItem => componentsItem.datasourcename === item.instid);
      if (getData.data.series) { //可能echarts报表series定义会动态变化
        const newComponents = components instanceof Array && components.map(componentsItem => {
          if (componentsItem.datasourcename === item.instid) {
            componentsItem.commonextinfo.series = getData.data.series;
          }
          return componentsItem;
        });
        this.setState({
          components: newComponents
        });
      };

      let chartData = getData.data.data;
      if (currentComponent && currentComponent.ctrltype === 1 && currentComponent.commonextinfo.charttype === 4) { //饼图  过滤掉为0 的数据
        const pieChartDefine = currentComponent.commonextinfo.series instanceof Array && currentComponent.commonextinfo.series[0];
        chartData = pieChartDefine && chartData && chartData instanceof Array && chartData.filter(dataItem => dataItem[pieChartDefine.fieldname]) || [];
      }
      this.setState({
        [item.instid]: chartData,
        [item.instid + 'columns']: getData.data.columns,
        [item.instid + 'xseries']: getData.data.xseries, //散点图 的X轴坐标
        [item.instid + 'loading']: false
      });
    }).catch((e) => {
      console.error(e);
      message.error(e.message);
      this.setState({
        [item.instid]: [],
        [item.instid + 'columns']: [],
        [item.instid + 'xseries']: [],
        [item.instid + 'loading']: false
      });
    });
  }

  reportSearch(serchValue) { // 页面查询参数发生新改变 查找含有当前参数的API并发起请求，更新页面数据
    // let reportLocalParams = JSON.parse(storage.getLocalItem('reportLocalParams'));
    // if (reportLocalParams) {
    //   reportLocalParams[this.props.reportId] = serchValue;
    // } else {
    //   reportLocalParams = {};
    //   reportLocalParams[this.props.reportId] = serchValue;
    // }
    // storage.setLocalItem('reportLocalParams', JSON.stringify(reportLocalParams));
    //storage.removeLocalItem('reportLocalParams');
    this.setState({
      serchValue: serchValue,
      reload: false
    }, this.reloadReportData(serchValue));

    for (let key in this) { //表格交给表格组件 处理
      if (key.indexOf('dataGridRef') > -1) {
        this[key] && this[key].reload && this[key].reload(serchValue);
      }
    }
  }

  reloadReportData(paramsChange, serchValue = this.state.serchValue) {
    let params = {};
    for (let key in paramsChange) { //可能参数里包含多个子参数  需拆分
      if (key.indexOf(',') > -1) {
        key.split(',').map((item) => {
          params[item] = paramsChange[key];
        });
      } else {
        params[key] = paramsChange[key];
      }
    }


    let cloneDatasources = _.cloneDeep(this.state.datasources);
    cloneDatasources.map((item) => {
      item.parameArray = [];
      item.parameters.map((item1) => {
        _.forIn(item1, function(value, key) {
          item.parameArray.push(value);  //value：前端查詢字段 key ：請求Url的參數名
        });
      })
    });

    cloneDatasources.map((item, index) => {
      for (let key in params) {
        if (item.parameArray.indexOf(key) > -1 && _.indexOf(this.state.dataGridDatasouces, item.instid) === -1) { //不请求 表格对应的数据源 交给组件DataGrid去处理
          this.setState({
            [item.instid + 'loading']: true
          });
          this.queryData(item, {
            DataSourceId: item.datasourcedefineid,
            InstId: item.instid,
            Parameters: getParameters(index, params, serchValue)
          });
          break;
        }
      }
    });

    function getParameters(index, params, searchValue) { //請求參數 前端字段转换成后端接口请求参数字段
      let returnParams = {};
      cloneDatasources[index].parameters.map((item) => {
        _.forIn(item, function(value, key) {
          returnParams[key] = params[value] ? params[value] || '' : searchValue[value] || '';
        });
      })

      return returnParams;
    }
  }


  getCollapseData(component) {
    const mapFilterItems = _.cloneDeep(component.mapextinfo.filteritems);
    const data = this.state[component.datasourcename];

    if (mapFilterItems instanceof Array && data instanceof Array) {
      for (let i = 0; i < mapFilterItems.length; i++) {
        for (let j = 0; j < data.length; j++) {
          if (mapFilterItems[i].datasetname === data[j].datasetname) {
            mapFilterItems[i].data = data[j].data;
            break;
          }
        }
      }
    }


    let newSerchValue = {};
    if (JSON.stringify(this.state.serchValue) === '{}' && data) { //初始化页面时，查询条件全部满足
      for (let i = 0; i < mapFilterItems.length; i++) {
        newSerchValue[mapFilterItems[i].paramname] = currentParamsValue(mapFilterItems[i].data).join();
      }
      this.setState({
        serchValue: newSerchValue,
        reload: true
      });
    }

    function currentParamsValue(data) {
      const returnData = data && data.map((item) => {
          return item.dkey;
        });

      return returnData || [];
    }

    return mapFilterItems;
  }

  getMapChartDataSource(component) {
    const data = this.state[component.datasourcename];

    let mapDataSource = [];
    if (data instanceof Array) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].datasetname === 'regiondata') {
          mapDataSource = data[i].data.map((item) => {
            return {
              name: item.regionname,
              value: item.count
            };
          });
          break;
        }
      }
    }


    return mapDataSource;
  }

  collapseValueChange(serchValue) {
    const breadcrumbData = this.state.breadcrumbData;
    serchValue['@regions'] = breadcrumbData.join();
    this.setState({
      serchValue: serchValue,
      reload: true
    }, this.reloadReportData(serchValue, serchValue));
  }
  getForSummaryValue(keys, title, data) {
    let returnTitle = title;
    if(data && data instanceof Array && data.length>0){
      for(let i=0;i<keys.length;i++){
        returnTitle = returnTitle.replace('#'+keys[i]+'#', data[0][keys[i]]);
      }
    }

    return returnTitle;
  }

  screenCapture(e) { //截屏
    e.preventDefault();
    html2canvas(this.refs.mapRef, {
      allowTaint: true,
      taintTest: false,
      onrendered: function(canvas) {
        canvas.id = "mycanvas";
        //document.body.appendChild(canvas);
        //生成base64图片数据
        const dataUrl = canvas.toDataURL();
        download(dataUrl);

        function download(src) {
          const $a = document.createElement('a');
          $a.setAttribute('href', src);
          $a.setAttribute('download', '客户分布图');

          const evObj = document.createEvent('MouseEvents');
          evObj.initMouseEvent( 'click', true, true, window, 0, 0, 0, 0, 0, false, false, true, false, 0, null);
          $a.dispatchEvent(evObj);
        }
      }
    });
  }


  renderComponent(item, index, height, width) {
    switch (item.ctrltype) {
      //一般图表（柱状图、折线图,仪表盘，散点图）
      case 1:
        return (
          <div style={{ width: '100%', height: '100%' }}>
            {
              item.datasourceforsummary ?
                <div style={{ paddingLeft: '20px', borderRadius: '6px 6px 0 0', height: '45px', lineHeight: '45px', background: '#303243', color: '#cbcbcb' }}>
                  {
                    this.getForSummaryValue(item.compsummaryinfo.paramskey, item.compsummaryinfo.titlescheme, this.state[item.datasourceforsummary])
                  }
                </div> : null
            }
            <div style={{ width: '100%', height: item.datasourceforsummary ? 'calc(100% - 45px)' : '100%', padding: '2px', background: '#3a3c4f', borderRadius: item.datasourceforsummary ? '0 0 6px 6px' : '6px' }}>
              <ShowChart loading={this.state[item.datasourcename + 'loading']}
                         component={item}
                         axisDataSource={this.state[item.datasourceforsummary]} //坐标轴 Lable可能存在变量  需替换
                         dataSource={this.state[item.datasourcename]}
                         xseries={this.state[item.datasourcename + 'xseries']} //散点图 X轴坐标数据
                         onEvents={this.getEvents(item, index)}
                         legend={this.state.selectedLegend} />
            </div>
          </div>
        );
      //表格
      case 2:
        //为分解业务逻辑，表格的数据源 交给DataGrid组件自己去处理，自主处理分页、分页大小，后续可处理排序等等
        //const dataGridParams = this.props.injectedParams ? { ...(this.state.serchValue || {}), ...this.props.injectedParams } : this.state.serchValue;
        return (
          <div className={styles.reportDataGridWrap}>
            <DataGrid columns={item.tableextinfo.columns}
                      titleinfo={item.titleinfo}
                      showExport={item.tableextinfo.showexport}
                      pagination={true}
                      rowSelection={false}
                      params={this.state.serchValue}
                      reload={this.state.reload}
                      url="/api/ReportEngine/queryData"
                      tableDefined={item}
                      width={width}
                      height={height}
                      ref={(ref) => { this[item.datasourcename + 'dataGridRef'] = ref }}
                      datasources={_.find(this.state.datasources, ['instid', item.datasourcename])}
                      reportDataInjectedParams={this.props.injectedParams}
            />
          </div>
        );
      //查询组件
      case 3:
        return item.visible === false ? null : <div className={styles.searchbarWrap}>
          <SearchBar model={item.filterextinfo.ctrls}
                     onSearch={this.reportSearch.bind(this)}
                     onChange={(serchValue) => { this.setState({ serchValue: serchValue, reload: false }); }}
                     value={this.state.serchValue} />
        </div>
      //漏斗图
      case 4:
        let chartData = this.state[item.datasourcename] || [];
        let chartWrapWidth = width - 17 - 80;
        return (
          <div style={{ width: chartData.length > 1 ? ((chartWrapWidth / 2) * chartData.length) : chartWrapWidth, height: '100%' }}>
            {
              chartData.map((chartItem, chartIndex) => {
                return (
                  <div key={chartIndex} style={{ width: (chartData.length > 1 ? ((chartWrapWidth / 2) - 10) : chartWrapWidth), float: 'left', height: '100%', padding: '20px', margin: '0 5px', borderRadius: '4px', boxShadow: '0 0 8px rgba(0, 0, 0, 0.2)' }}>
                    <ShowFunnelChart loading={this.state[item.datasourcename + 'loading']}
                                     component={item}
                                     dataSource={chartItem}
                                     onEvents={this.getEvents(item, index, chartIndex)} />
                  </div>
                );
              })
            }
          </div>
        );
      //map
      case 6:
        return (
          <div style={{ height: '100%', width: '100%', borderRadius: '4px', padding: '20px', boxShadow: '0 0 8px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ width: '260px', height: '100%', border: '1px solid rgb(212, 208, 208)', float: 'left', overflow: 'auto' }}>
              <CollapseWrap mapSeriesType={this.state.mapSeriesType} changeMap={this.collapseClickMapShow.bind(this, this.state[item.datasourcename + 'loading'])} onChange={this.collapseValueChange.bind(this)} dataSource={this.getCollapseData(item)} value={this.state.serchValue} />
            </div>
            <div style={{ width: 'calc(100% - 260px)', height: '100%', float: 'left', paddingLeft: '10px', overflow: 'hidden' }}>
              <BreadCrumb data={this.state.breadcrumbData} onClick={this.breadCrumbClickHandler.bind(this)} />
              <div className={styles.iconDownload} style={{ display: this.state.mapSeriesType === 'map' ? 'none' : 'block' }}>
                <Icon type="download" onClick={this.screenCapture.bind(this)} />
              </div>
              <div style={{ width: '100%', height: '100%' }} ref="mapRef">
                {
                  this.state.mapSeriesType === 'map' ? <ShowMapChart echarts={this.echartsInstance}
                                                                     loading={this.state[item.datasourcename + 'loading']}
                                                                     onEvents={this.getMapChartEvents(this.state[item.datasourcename + 'loading'])}
                                                                     title={item.titleinfo.title}
                                                                     exporttitle={item.titleinfo.exporttitle}
                                                                     dataSource={this.getMapChartDataSource(item)}
                                                                     mapType={this.state.mapType} /> :
                    <ShowBMapChart echarts={this.echartsInstance}
                                   component={item}
                                   loading={this.state[item.datasourcename + 'loading']}
                                   geoCoorddata={this.getCollapseData(item)}
                                   bmapCenter={this.state.bmapCenter} />
                }
              </div>
            </div>
          </div>
        );
    }
  }

  render() {
    let width = this.state.width - (this.props.siderFold ? 61 : 200); //系统左侧 200px显示菜单(未折叠  折叠61)
    width = width < 1080 ? 1080 : width; // 系统设置了最小宽度
    let components = this.state.components;
    let maxWidth = _.max(components.map(item => item.width));
    if (maxWidth <= 2) {
      components = this.state.components.map(item => {
        item.width = item.width * 12;
        return item;
      });
    }
    return (
      <Page contentStyle={{ background: '#ffffff' }} title={this.state.pageName || ''}>
        <Row>
          {

            components.map((item, index) => {
              let widthActually = item.width * width / 24;
              let height = (item.height > 0 ? item.height : widthActually * Math.abs(item.height));
              let style;
              if (item.ctrltype === 2) {
                style = { padding: '10px 10px' } //表格不给固定高  通过scroll.y去设置
              } else if (item.ctrltype === 3) {
                style = {};
              } else {
                style = { height: height, padding: '10px 10px' };
              }
              item.ctrltype === 4 ? style.overflowX = 'auto' : style;
              return (
                <Col key={index} span={item.width} style={style} className={styles.scroll}>
                  {
                    this.renderComponent(item, index, height, widthActually)
                  }
                </Col>
              );
            })
          }
        </Row>
      </Page>
    )
  }
}

export default ReportForm;
