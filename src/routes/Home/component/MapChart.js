/**
 * Created by 0291 on 2017/10/26.
 */
import React from 'react';
import { message } from 'antd';
import echarts from 'echarts';
import chinaJson from '../../../../public/mapJson/china.json'; //china Map Data
echarts.registerMap('china', chinaJson);  //初始中国地图
import ShowMapChart from '../../ReportForm/component/Chart/ShowChart_Map';
import Styles from './MapChart.less';
import request from '../../../utils/request';
import { chinaMap } from './china-main-map';


class MapChart extends React.Component {
  static propTypes = {

  };

  constructor(props) {
    super(props);
    this.state = {
      mapType: 'china',
      regions: [],
      currentRegion: '全国',
      chinaData: [],
      customData: []
    };
    this.echartsInstance = echarts;
  }

  componentWillMount() {
    this.reloadData();
  }

  queryData(type, params) {
    this.setState({
      [type + 'loading']: true
    });
    request('/api/ReportEngine/queryData', {
      method: 'post', body: JSON.stringify(params)
    }).then((getData) => {
      this.setState({
        [type]: getData.data.data,
        [type + 'loading']: false
      });
      if (type === 'regions' && params.Parameters.regions === '') {
        this.setState({
          chinaData: this.getMapChartDataSource(getData.data.data)
        });
      }
    }).catch((e) => {
      console.error(e);
      message.error(e.message);
      this.setState({
        [type]: [],
        [type + 'loading']: false
      });
    });
  }

  reloadData(region = '') {
    this.queryData('regions', {
      DataSourceId: 'dece6aa6-82c8-4d4b-9f30-342caf9529ce',
      InstId: 'custdist',
      Parameters: { regions: region }
    }); //查询最新数据

    this.queryData('customData', {
      DataSourceId: '14005c07-e42d-45ce-bc8b-82bd5fc01f15',
      InstId: 'customData',
      Parameters: { regions: region }
    });
  }
  changeMapShow (mapName) {
    this.reloadData(mapName);
    console.log('changeMapShow')
    if (chinaMap[mapName]) {  //全国  省市区
      request(`mapJson/${chinaMap[mapName]}.json`, { //请求当前地图的数据
        method: 'get'
      }).then((result) => {
        this.echartsInstance.registerMap(chinaMap[mapName], result);
        this.setState({
          mapType: chinaMap[mapName],
          currentRegion: mapName
        })
      }).catch(e => message.error(e.message));
    }
  }

  getMapChartEvents() {
    return {
      click: (params) => {
        if (params.name && (chinaMap[params.name])) {
          this.changeMapShow(params.name);
        }
      }
    };
  }

  showChinaMap() {
    return {
      click: (params) => {
        if (params.name && (chinaMap[params.name])) {
          this.reloadData();
          this.echartsInstance.registerMap('china', chinaJson);
          this.setState({
            mapType: 'china'
          });
        }
      }
    };
  }

  getChinaMapDataSource() {
    return this.state.chinaData && this.state.chinaData.filter((result) => {
        return result.name === this.state.currentRegion;
      });
  }

  getMapChartDataSource(data = this.state.regions) {
    let mapDataSource = [];
    if (data && data instanceof Array) {
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

  render() {
    const customData = this.state.customData;
    return (
      <div className={Styles.mapWrap}>
        {/* <div className={Styles.titleInfo}>
          <div>客户分布图</div>
          <div>与其他区域数据对比</div>
        </div> */}
        <div className={Styles.MapInfo} style={{ height: 'calc(100% - 180px)' }}>
          {
            this.state.mapType === 'china' ? null : <div className={Styles.miniMapWrap}>
              <div>
                <ShowMapChart echarts={this.echartsInstance}
                              loading={false}
                              dataSource={this.getChinaMapDataSource()}
                              roam={false}
                              onEvents={this.showChinaMap()}
                              toolboxShow={false}
                              tooltipShow={false}
                              visualMapShow={false}
                              label={{
                                normal: {
                                  show: false
                                },
                                emphasis: {
                                  show: false
                                }
                              }}
                              mapItemStyle={{
                                normal: {
                                  areaColor: '#fff',
                                  borderColor: '#fff'
                                },
                                emphasis: {
                                  areaColor: '#3398db'
                                }
                              }}
                              mapType='china' />
              </div>
              <div><i></i><i></i></div>
              <div><i></i><i></i></div>
            </div>
          }
          <div style={{ width: this.state.mapType === 'china' ? '100%' : 'calc(100% - 172px)', float: 'left', height: '100%' }}>
            <ShowMapChart title="客户分布图"
                          titleShow={false}
                          echarts={this.echartsInstance}
                          loading={this.state.regionsloading}
                          exporttitle='exporttitle'
                          dataSource={this.getMapChartDataSource()}
                          roam={false}
                          onEvents={this.getMapChartEvents()}
                          visualMap={{
                            show: true,
                            seriesIndex: 0,
                            min: 1,
                            max: 200,
                            left: 'right',
                            bottom: 0,
                            text: ['高', '低'],           // 文本，默认为数值文本
                            calculable: false,
                            color: ['#1772c6', '#2d81c8', '#408dce', '#5197d2', '#77b2de', '#a3cae7', '#bedbeb', '#d0e6f3'],
                            textStyle: {
                              color: '#fff'
                            },
                            orient: 'horizontal'
                          }}
                          toolboxShow={false}
                          label={{
                            normal: {
                              show: false
                            },
                            emphasis: {
                              show: false
                            }
                          }}
                          mapItemStyle={{
                            normal: {
                              areaColor: '#fff',
                              borderColor: '#fff'
                            },
                            emphasis: {
                              areaColor: '#3398db'
                            }
                          }}
                          mapType={this.state.mapType} />
          </div>
        </div>
        <div className={Styles.dataInfo}>
          <div style={{ width: 'calc(100% - 390px)' }}>
            <ul>
              <li>全国排名：{customData.length > 0 ? customData[0].rank : null}</li>
              {/* <li>客户转化率：{customData.length > 0 ? customData[0].changerate : null}</li> */}
              <li>客户数量：{customData.length > 0 ? customData[0].customercount : null}</li>
              {/* <li>业绩贡献额： {customData.length > 0 ? customData[0].signamount : null}</li> */}
            </ul>
          </div>
          {/* <ul>
            <li>
              <div>{customData.length > 0 ? customData[0].avgamount : null}</div>
              <div>平均客户单价</div>
            </li>
            <li>
              <div>{customData.length > 0 ? customData[0].newcustomercount : null}</div>
              <div>新增客户数</div>
            </li>
            <li>
              <div>{customData.length > 0 ? customData[0].signcount : null}</div>
              <div>成单数量</div>
            </li>
          </ul> */}
        </div>
      </div>
    )
  }
}

export default MapChart;
