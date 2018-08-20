/**
 * Created by 0291 on 2017/9/6.
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { message, Carousel, Spin } from 'antd';
import _ from 'lodash';
import { login } from '../lib/auth';
import Page from '../component/Page';
import List from '../component/List';
import ShowChart from '../../routes/ReportForm/component/Chart/ShowChart.js';
import ShowFunnelChart from '../../routes/ReportForm/component/Chart/ShowChart_Funnel.js';
import Card from '../component/Card';
import Progress from '../component/Progress';
import { adapt } from '../lib/unit';
import { GetArgsFromHref } from '../../utils/index.js';
import request from '../../utils/request';
import UKBridge from '../lib/uk-bridge';
import Styles from './main.less';

const defaultFontSize = adapt(750, 100);

const currentReportId = GetArgsFromHref('reportid');

class ReportIndex extends Component {
  static propTypes = {
    url: React.PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      components: [],
      datasources: [],
      serchValue: {},
      percent: 20,
      loadingMore: false,
      loading: false
    };
  }

  componentWillMount() {
    this.queryReportDefine(currentReportId);
  }

  componentDidMount() {
    document.querySelector('#page').addEventListener('scroll', (event) => {
      event.preventDefault();//阻止浏览器的默认事件
      let clientHeight = document.body.clientHeight || document.documentElement.clientHeight;
      let scrollTop = document.querySelector('#page').scrollTop;
      let scrollHeight = document.querySelector('#page').scrollHeight;

      if (clientHeight + scrollTop + 20 >= scrollHeight) {
        this.setState({ //暂时 没有分页查询
          loadingMore: false
        });
      } else {

      }
    }, false);
  }

  queryReportDefine(reportId) {
    this.setState({
      loading: true
    })
    request('/api/ReportEngine/queryReportDefine', {
      //9b7b3d5c-91f5-4b3b-b935-a9d5e4edb503 仪表盘
      //0faf4bb4-a4bf-4cc9-84b4-1646eda2cff0 散点图
      // 7a30f216-f05f-4021-9ed0-72bd54dd273f  柱状图
      //553d9780-aba0-4c26-b3fa-0e93215bacd1 漏斗图
      method: 'post', body: JSON.stringify({ "id": reportId ? reportId : '553d9780-aba0-4c26-b3fa-0e93215bacd1' })
    }).then((result) => {
      this.setState({
        components: result.data.components,
        datasources: result.data.datasources,
        loading: false
      });
     try {
       UKBridge.setReportFilter(result.data.components.filter((item) => {
         return item.ctrltype === 3;
       }), (searchParams) => { // Native端 点击查询回调 （按当前查询条件 查询最新数据）
           this.setState({
             serchValue: searchParams
           }, this.reloadReportData(searchParams));
       });
     } catch (e){

     }
      result.data.datasources.map((item, index) => {
        this.setState({
          [item.instid + 'loading']: true
        });
        this.queryData(item, {
          DataSourceId: item.datasourcedefineid,
          InstId: item.instid,
          Parameters: this.getDefaultParameters(item, result.data.components)
        });
      });
    }).catch(e => {
      console.error(e.message);
      message.error(e.message);
      this.setState({
        loading: false
      });
    });
  }


  getDefaultParameters(datasource, components) {
    let filterComponent = _.find(components, function(item) { return item.ctrltype === 3; });
    let defaultSerchValue = {};
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
      } else if (item.ctrltype === 4) { //日期
        defaultSerchValue[item.parametername] = item.datedefaultvalue;
      } else if (item.ctrltype === 1) { //输入框
        defaultSerchValue[item.parametername] = item.textdefaultvalue;
      }
    });


    let params = {};
    for (let key in defaultSerchValue) { //可能参数里包含多个子参数  需拆分
      if (key.indexOf(',') > -1 && key.indexOf('_name') === -1) {
        key.split(',').map((item) => {
          params[item] = defaultSerchValue[key];
        });
      } else {
        params[key] = defaultSerchValue[key];
      }
    }

    function getParameters(dSource, oldPrams) { //請求參數 前端字段转换成后端接口请求参数字段
      let returnParams = {};
      dSource.parameters.map((item) => {
        _.forIn(item, function(value, key) {
          returnParams[key] = oldPrams[value];
        });
      })

      return returnParams;
    }

    this.setState({
      serchValue: defaultSerchValue
    });

    return getParameters(datasource, params);
  }


  reloadReportData(paramsChange, serchValue = this.state.serchValue) { // 页面查询参数发生新改变 查找含有当前参数的API并发起请求，更新页面数据
    console.log(JSON.stringify(serchValue))
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
        if (item.parameArray.indexOf(key) > -1) {
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
          returnParams[key] = (params[value] !== '') ? params[value] : searchValue[value];
        });
      })

      return returnParams;
    }
  }

  getParamsValue(field, componentIndex, dataIndex, chartIndex) { //获取当前点击的节点对应的数据（作为新的参数）
    const currentComponentData = this.state[this.state.components[componentIndex].datasourcename];
    const paramsName = field.split('#')[1].split('#')[0];
    if (chartIndex || chartIndex === 0) { //漏斗图
      return currentComponentData[chartIndex].data[dataIndex][paramsName];
    } else {
      return currentComponentData[dataIndex][paramsName];
    }
  }

  getEvents(component, componentIndex, chartIndex) { //一般图表的 事件获取  chartIndex : 当为漏斗图时，需要知道点击的是哪个漏斗图，再找数据
    const events = component.events;
    let event = {};
    events && events.map((item) => {
      event[item.eventname] = (params) => {
        item.actionlist.map((list) => {
          if(list.actiontype === 1) {

          } else if (list.actiontype === 2) { //改变参数
            let changeParams = {};
            list.changeparam.map((paramsObj) => {
              //this.getParamsValue(paramsObj.parametervalue, componentIndex, params.dataIndex)
              //params.data[3][paramsObj.parametervalue.split('#')[1].split('#')[0]]
              if (component.ctrltype === 1) {
                if (component.commonextinfo.charttype === 3) { //仪表盘
                  changeParams[paramsObj.parametername] = (paramsObj.parametervalue.indexOf('#') > -1) ? this.getParamsValue(paramsObj.parametervalue, componentIndex, params.dataIndex, chartIndex) : paramsObj.parametervalue;
                } else if (component.commonextinfo.series.length > 0) { //柱状图 折线图
                  changeParams[paramsObj.parametername] = (paramsObj.parametervalue.indexOf('#') > -1) ? this.getParamsValue(paramsObj.parametervalue, componentIndex, params.dataIndex, chartIndex) : paramsObj.parametervalue;
                } else { //散点图
                  changeParams[paramsObj.parametername] = (paramsObj.parametervalue.indexOf('#') > -1) ? params.data[3][paramsObj.parametervalue.split('#')[1].split('#')[0]] : paramsObj.parametervalue;
                }
              } else { //漏斗图
                  changeParams[paramsObj.parametername] = (paramsObj.parametervalue.indexOf('#') > -1) ? this.getParamsValue(paramsObj.parametervalue, componentIndex, params.dataIndex, chartIndex) : paramsObj.parametervalue;
              }
            });


            let cloneDatasources = _.cloneDeep(this.state.datasources);
            cloneDatasources.map((dataSourceItem) => {
              dataSourceItem.parameArray = [];
              dataSourceItem.parameters.map((item1) => {
                _.forIn(item1, function(value, key) {
                  dataSourceItem.parameArray.push(value);  //value：前端查詢字段 key ：請求Url的參數名
                });
              })
            });

            console.log(JSON.stringify(changeParams))
            cloneDatasources.map((dataSourceItem) => {
              for (let key in changeParams) {
                if (dataSourceItem.parameArray.indexOf(key) > -1) { //事件发生后 查询参数发生改变  判断数据源中是否存在该请求参数
                  this.reloadReportData({ ...this.state.serchValue, ...changeParams });
                  break;
                }
              }
            });

          }
        });
      };
    });
    return event;
  }

  queryData(item, params) {
    this.setState({
      loading: true
    })
    request('/api/ReportEngine/queryData', {
      method: 'post', body: JSON.stringify(params)
    }).then((getData) => {
      this.setState({
        [item.instid]: getData.data.data,
        [item.instid + 'mobilecolumns']: getData.data.mobilecolumns && getData.data.mobilecolumns instanceof Array && getData.data.mobilecolumns,
        [item.instid + 'xseries']: getData.data.xseries, //散点图 的X轴坐标
        [item.instid + 'loading']: false,
        loading: false
      });
    }).catch((e) => {
      message.error(e.message)
      //消息提醒
      this.setState({
        [item.instid]: [],
        [item.instid + 'mobilecolumns']: [],
        [item.instid + 'xseries']: [],
        [item.instid + 'loading']: false,
        loading: false
      });
    });
  }

  getValue(field, dataSouce) {
    return field.indexOf('#') > -1 ? field.replace('#' + field.split('#')[1].split('#')[0] + '#', dataSouce[field.split('#')[1].split('#')[0]]) : dataSouce[field];
  }

  getMobileColumns(item, datasourcename) {
    let mobileColumns = item.mobiletableinfo;
    if (this.state[datasourcename + 'mobilecolumns']) {
      mobileColumns = {
        ...item.mobiletableinfo,
        detailcolumns: this.state[datasourcename + 'mobilecolumns']
      };
    };

    return mobileColumns;
  }

  renderComponent(item, index) {
    let borderRadius = '12px';
    let margin = '.2rem 0';
    if (item.islinktoup && item.islinktodown) {
      borderRadius = 'none';
      margin = '0';
    } else if (!item.islinktoup && item.islinktodown) {
      borderRadius = '.06rem .06rem 0 0';
      margin = '.2rem 0 0';
    } else if (item.islinktoup && !item.islinktodown) {
      borderRadius = '0 0 .06rem .06rem';
      margin = '0 0 .2rem';
    }


    let commonStyle = { borderRadius: borderRadius, margin: margin, overflow: 'hidden', width: '100%', height: (item.height > 0 ? item.height * 0.01 : window.innerWidth * Math.abs(item.height) * 0.01) + 'rem' };

    switch (item.ctrltype) {
      //一般图表（柱状图、折线图） && 散点图 && 仪表盘
      case 1:
        return (
          <div style={{ ...commonStyle, padding: '2px' }}>
            <ShowChart deviceType="mobile"
                        loading={this.state[item.datasourcename + 'loading']}
                       component={item}
                       dataSource={this.state[item.datasourcename]}
                       xseries={this.state[item.datasourcename + 'xseries']} //散点图 X轴坐标数据
                       onEvents={this.getEvents(item, index)} />
          </div>
        );
      //漏斗图
      case 4:
        let chartData = this.state[item.datasourcename] || [];
        return (
          <div style={{ ...commonStyle }}>
            {
              chartData.length > 0 ? <Carousel autoplay>
                {
                  chartData.map((chartItem, chartIndex) => {
                    return (
                      <div key={chartIndex} style={{ width: '100%', height: '100%' }}>
                        <ShowFunnelChart deviceType="mobile"
                                         loading={this.state[item.datasourcename + 'loading']}
                                         component={item}
                                         dataSource={chartItem}
                                         onEvents={this.getEvents(item, index, chartIndex)} />
                      </div>
                    );
                  })
                }
              </Carousel> : null
            }
          </div>
        );

      //div块
      case 7:
        return (
          <div className={Styles.CardWrap}>
            <Card style={{ borderRadius: borderRadius, margin: margin }} html={item.divctrlextinfo.textlabelscheme} data={this.state[item.datasourcename]} params={item.divctrlextinfo.params} />
          </div>
        );

      //表格(Mobile device)
      case 8:
        const tableInfo = this.getMobileColumns(item, item.datasourcename);
        return ( //this.state[item.datasourcename + 'loading']
          <div className={Styles.ListWrap}>
            {
              this.state[item.datasourcename] && this.state[item.datasourcename].map((dataItem, dataIndex) => {
                return <List key={dataIndex} data={dataItem} tableInfo={tableInfo} style={{ margin: margin }} />;
              })
            }
          </div>
        );

        //Line
      case 9:
        let lineChartData = this.state[item.datasourcename] || [];
        let html = [];
        for (let i = 0; i < lineChartData.length; i = i + 3 ) {
          if (i + 2 < lineChartData.length) {
            html.push(
              <div key={i}>
                <Progress value={this.getValue(item.ukbargraphinfo.valuelabelscheme, lineChartData[i])}
                          category={this.getValue(item.ukbargraphinfo.xfieldname, lineChartData[i])}
                          percent={this.getValue(item.ukbargraphinfo.valuefieldname, lineChartData[i])} />
                <Progress value={this.getValue(item.ukbargraphinfo.valuelabelscheme, lineChartData[i + 1])}
                          category={this.getValue(item.ukbargraphinfo.xfieldname, lineChartData[i + 1])}
                          percent={this.getValue(item.ukbargraphinfo.valuefieldname, lineChartData[i + 1])} />
                <Progress value={this.getValue(item.ukbargraphinfo.valuelabelscheme, lineChartData[i + 2])}
                          category={this.getValue(item.ukbargraphinfo.xfieldname, lineChartData[i + 2])}
                          percent={this.getValue(item.ukbargraphinfo.valuefieldname, lineChartData[i + 2])} />
              </div>
            );
          } else if (i + 1 < lineChartData.length) {
            html.push(
              <div key={i}>
                <Progress value={this.getValue(item.ukbargraphinfo.valuelabelscheme, lineChartData[i])}
                          category={this.getValue(item.ukbargraphinfo.xfieldname, lineChartData[i])}
                          percent={this.getValue(item.ukbargraphinfo.valuefieldname, lineChartData[i])} />
                <Progress value={this.getValue(item.ukbargraphinfo.valuelabelscheme, lineChartData[i + 1])}
                          category={this.getValue(item.ukbargraphinfo.xfieldname, lineChartData[i + 1])}
                          percent={this.getValue(item.ukbargraphinfo.valuefieldname, lineChartData[i + 1])} />
              </div>
            );
          } else {
            html.push(
              <div key={i}>
                <Progress value={this.getValue(item.ukbargraphinfo.valuelabelscheme, lineChartData[i])}
                          category={this.getValue(item.ukbargraphinfo.xfieldname, lineChartData[i])}
                          percent={this.getValue(item.ukbargraphinfo.valuefieldname, lineChartData[i])} />
              </div>
            );
          }
        }

        return (
          <div className={Styles.CarouselWrap}>
            {
              lineChartData.length === 0 ? null : <div style={{ borderRadius: borderRadius, margin: margin, overflow: 'hidden' }}>
                <Carousel autoplay>
                  {
                    html
                  }
                </Carousel>
              </div>
            }
          </div>
        );

      default:
        return null;
    }
  }

  render() {
    return (
      <div className={Styles.reportIndexWrap}>
        <Page>
          {
            this.state.components.map((item, index) => {
              return (
                <div key={index}>
                  {
                    this.renderComponent(item, index)
                  }
                </div>
              );
            })
          }
          <div style={{ display: this.state.loadingMore ? 'block' : 'none', color: '#3398db', fontSize: '12px', paddingTop: '.1rem', textAlign: 'center' }}>
            <Spin size="small" /><span style={{ paddingLeft: '.2rem' }}>正在加载...</span>
          </div>
        </Page>
        <div style={{ display: this.state.loading ? 'block' : 'none' }} className={Styles.modalMask}>
          <Spin spinning={true}></Spin>
        </div>
      </div>
    );
  }
}


try {
  UKBridge.connectWebViewJavascriptBridge(() => {
    login().then(() => {
      ReactDOM.render(<ReportIndex />, document.querySelector('#root'));
    });
  });
} catch (e) {

}

login().then(() => {
  ReactDOM.render(<ReportIndex />, document.querySelector('#root'));
})
