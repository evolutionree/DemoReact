/**
 * Created by 0291 on 2017/10/26.
 */
import React from "react";
import Styles from "./List.less";
import Avatar from "../../../components/Avatar";
import { Pagination } from "antd";

function List({ component, dataSource, totalHeight, isPagination }) {
  if (!dataSource) {
    return null;
  }
  //console.log(component,dataSource,totalHeight)
  function getValue(param, data) {
    let returnValue = param;
    const keys = returnValue && returnValue.match(/#.*?#/g, "");
    if (keys && keys instanceof Array) {
      for (let i = 0; i < keys.length; i++) {
        returnValue = returnValue.replace(
          keys[i],
          data[keys[i].replace(/#/g, "")]
        );
      }
    }
    return returnValue;
  }

  switch (component.stypename) {
    case "IconAndTitle":
      const num = (totalHeight - 8) / 56;
      // 有分页功能
      if (isPagination) {
        return (
          <PaginationList
            dataSource={dataSource}
            getValue={getValue}
            component={component}
          />
        );
      }
      return (
        <ul className={Styles.List}>
          {dataSource &&
            dataSource instanceof Array &&
            dataSource.map((item, index) => {
              if (index < num) {
                return (
                  <li key={index}>
                    <Avatar
                      style={{
                        width: "36px",
                        height: "36px",
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        marginTop: "-18px",
                      }}
                      image={`/api/fileservice/read?fileid=${getValue(
                        component.item1valuescheme,
                        item
                      )}&filetype=3`}
                    />
                    <span title={getValue(component.item2valuescheme, item)}>
                      {getValue(component.item2valuescheme, item)}
                    </span>
                  </li>
                );
              } else {
                return null;
              }
            })}
        </ul>
      );
    default:
      return null;
  }
}

class PaginationList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      total: 0,
    };
  }
  componentWillMount() {
    // 页面初始化
    this.setState({
      currentPage: 1,
      total: Array.isArray(this.props.dataSource)
        ? this.props.dataSource.length
        : 0,
    });
  }

  onChange = (page, pageSize) => {
    this.setState({ currentPage: page });
  };

  render() {
    const { currentPage, total } = this.state;
    const { getValue, component } = this.props;
    return (
      <div className={Styles.isPagination}>
        <ul className={Styles.List}>
          {Array.isArray(this.props.dataSource) &&
            this.props.dataSource
              //copy一份新数组
              .slice(0)
              //在新数组上分页截取
              .splice((currentPage - 1) * 10, 10)
              // 渲染
              .map((item, index) => {
                if (index < 10) {
                  return (
                    <li key={index}>
                      <Avatar
                        style={{
                          width: "36px",
                          height: "36px",
                          position: "absolute",
                          left: "10px",
                          top: "50%",
                          marginTop: "-18px",
                        }}
                        image={`/api/fileservice/read?fileid=${getValue(
                          component.item1valuescheme,
                          item
                        )}&filetype=3`}
                      />
                      <span title={getValue(component.item2valuescheme, item)}>
                        {getValue(component.item2valuescheme, item)}
                      </span>
                    </li>
                  );
                } else {
                  return null;
                }
              })}
        </ul>
        <Pagination
          simple
          defaultCurrent={currentPage}
          total={total}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default List;
