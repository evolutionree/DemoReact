/**
 * Created by 0291 on 2017/10/23.
 */
import React from "react";
import { Row, Col, message, Carousel } from "antd";
import _ from "lodash";
import { Link } from "dva/router";
import { connect } from "dva";
import classnames from "classnames";
import ShowChart from "./component/ShowChart";
import ShowFunnelChart from "./component/ShowChart_Funnel";
import Card from "./component/Card";
import MapChart from "./component/MapChart";

import request from "../../utils/request";
import Styles from "./index.less";
import List from "./component/List";

class Home extends React.Component {
  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      width: this.props.siderFold
        ? document.body.clientWidth - 61
        : document.body.clientWidth - 200, //系统左侧 200px显示菜单
      height: document.body.clientHeight - 60,
      columnsinfo: [],
    };
  }

  componentWillMount() {
    this.queryReportDefine();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      width: nextProps.siderFold
        ? document.body.clientWidth - 61
        : document.body.clientWidth - 200,
    });
  }

  componentDidMount() {
    window.addEventListener("resize", this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
  }

  onWindowResize = () => {
    this.setState({
      width: this.props.siderFold
        ? document.body.clientWidth - 61
        : document.body.clientWidth - 200,
    });
  };

  queryReportDefine() {
    request("/api/ReportEngine/mainpagereport", {
      method: "post",
      body: JSON.stringify({}),
    }).then((result) => {
      this.setState({
        columnsinfo: result.data.columnsinfo,
      });
      result.data.datasources &&
        result.data.datasources instanceof Array &&
        result.data.datasources.map((item) => {
          this.setState({
            [item.instid + "loading"]: true,
          });
          this.queryData(item, {
            DataSourceId: item.datasourcedefineid,
            InstId: item.instid,
            Parameters: this.defineParamsTransform(item.params),
          });
        });
    });
  }

  defineParamsTransform(params) {
    let newParams = {};
    if (params && params instanceof Array) {
      for (let i = 0; i < params.length; i++) {
        newParams[params[i].paramname] = params[i].paramvalue;
      }
    }
    return newParams;
  }

  queryData(item, params) {
    request("/api/ReportEngine/queryData", {
      method: "post",
      body: JSON.stringify(params),
    })
      .then((getData) => {
        this.setState({
          [item.instid]: getData.data.data,
          [item.instid + "loading"]: false,
          [item.instid + "xseries"]: getData.data.xseries, //散点图 的X轴坐标
        });
      })
      .catch((e) => {
        console.error(e);
        message.error(e.message);
        this.setState({
          [item.instid]: [],
          [item.instid + "loading"]: false,
          [item.instid + "xseries"]: [], //散点图 的X轴坐标
        });
      });
  }

  renderComponentItem(width, component) {
    const chartHeight =
      component.height > 0
        ? component.height
        : width * Math.abs(component.height);
    const style = {
      width: "100%",
      height: chartHeight,
      background: "rgb(0,66,130)",
    };

    switch (
      component.reportiteminfo.commoncomponentinfo &&
      component.reportiteminfo.commoncomponentinfo.elemtype
    ) {
      //柱状图、折线图
      case 1:
        return (
          <div style={{ ...style }}>
            <ShowChart
              chartType="barOrline"
              loading={this.state[component.cellid + "loading"]}
              component={
                component.reportiteminfo.commoncomponentinfo.barandlineinfo
              }
              dataSource={this.state[component.cellid]}
            />
          </div>
        );
      //散点图
      case 2:
        return (
          <div style={{ ...style }}>
            <ShowChart
              chartType="scatter"
              loading={this.state[component.cellid + "loading"]}
              component={
                component.reportiteminfo.commoncomponentinfo.scatterinfo
              }
              xseries={this.state[component.cellid + "xseries"]} //散点图 X轴坐标数据
              dataSource={this.state[component.cellid]}
            />
          </div>
        );
      // 漏斗图
      case 3:
        let chartData = this.state[component.cellid] || [];
        return (
          <div style={{ ...style }}>
            {chartData.length > 0 ? (
              <Carousel autoplay>
                {chartData.map((chartItem, chartIndex) => {
                  return (
                    <div
                      key={chartIndex}
                      style={{ width: "100%", height: "100%" }}
                    >
                      <ShowFunnelChart
                        loading={this.state[component.cellid + "loading"]}
                        component={
                          component.reportiteminfo.commoncomponentinfo.funelinfo
                        }
                        dataSource={chartItem}
                      />
                    </div>
                  );
                })}
              </Carousel>
            ) : null}
          </div>
        );
      //仪表盘
      case 4:
        return (
          <div style={{ ...style }}>
            <ShowChart
              chartType="gauge"
              loading={this.state[component.cellid + "loading"]}
              component={component.reportiteminfo.commoncomponentinfo.gaugeinfo}
              dataSource={this.state[component.cellid]}
            />
          </div>
        );
      case 6:
        const isUnitConversion = component.title === "本年业绩";
        return (
          <div style={{ ...style, height: component.title === "本年业绩"?"200px":120, background: "transparent" }}>
            <Card
              component={
                component.reportiteminfo.commoncomponentinfo.diveleminfo
              }
              dataSource={this.state[component.cellid]}
              isUnitConversion={isUnitConversion}
            />
          </div>
        );
      case 7:
        const isPagination = component.title === "风险客户"; // 分页
        return (
          <div
            style={{ ...style, height: chartHeight }}
          >
            <List
              component={
                component.reportiteminfo.commoncomponentinfo.simplelistinfo
              }
              dataSource={this.state[component.cellid]}
              totalHeight={chartHeight}
              isPagination={isPagination}
            />
          </div>
        );
      default:
        return null;
    }
  }

  render() {
    let width = this.state.width;
    width = width < 1080 ? 1080 : width; // 系统设置了最小宽度

    let total = 0;
    let columnWithArray = this.state.columnsinfo.map((item) => {
      total += item.width > 0 ? item.width : Math.abs(width * item.width);
      return item.width > 0 ? item.width : Math.abs(width * item.width);
    });

    for (let i = 0; i < columnWithArray.length; i++) {
      if (columnWithArray[i] === 0) {
        columnWithArray[i] = width - total;
        if (this.state.columnsinfo && this.state.columnsinfo instanceof Array) {
          columnWithArray[i] =
            columnWithArray[i] - 20 - this.state.columnsinfo.length * 10;
        }
      }
    }

    const cls = classnames([Styles.HomeWrap, Styles.clearfix]);

    return (
      <div
        className={cls}
        style={{ width: "100%", height: "calc(100vh - 60px)" }}
      >
        {this.state.columnsinfo &&
          this.state.columnsinfo instanceof Array &&
          this.state.columnsinfo.map((item, index) => {
            return (
              <div
                key={index}
                style={{ width: columnWithArray[index] + 10, float: "left" }}
              >
                {item.cellitems &&
                  item.cellitems instanceof Array &&
                  item.cellitems.map((component, componentIndex) => {
                    if (
                      component.reportiteminfo &&
                      component.reportiteminfo.componenttype === 1
                    ) {
                      const chartHeight =
                        component.height > 0
                          ? component.height
                          : width * Math.abs(component.height);
                      const style = { width: "100%", height: chartHeight };
                      return (
                        <div key={componentIndex} className={Styles.chartWrap}>
                          <div className={Styles.normalChartTitle}>
                          客户分布图
                          </div>
                          <div style={{ ...style, height: 640 }}>
                            <MapChart />
                          </div>
                        </div>
                      );
                    } else if (
                      component.reportiteminfo &&
                      component.reportiteminfo.componenttype === 2
                    ) {
                      return (
                        <iframe
                          src={component.reportiteminfo.iframeinfo.url}
                          width="100%"
                          height="100%"
                          style={{ border: "none" }}
                        ></iframe>
                      );
                    } else if (
                      component.reportiteminfo &&
                      component.reportiteminfo.componenttype === 3
                    ) {
                      return (
                        <div key={componentIndex} className={Styles.chartWrap}>
                          {component.isdisplaytitle ? (
                            <div title={component.remark} className={Styles.normalChartTitle}>
                              {component.title}
                            </div>
                          ) : null}
                          {this.renderComponentItem(
                            columnWithArray[index],
                            component
                          )}
                        </div>
                      );
                    }
                  })}
              </div>
            );
          })}
      </div>
    );
  }
}

export default connect((state) => {
  return state.app;
})(Home);
