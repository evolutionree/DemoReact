/**
 * Created by 0291 on 2017/6/29.
 */
import React from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import DynamicFieldView from '../../../../components/DynamicForm/DynamicFieldView';
import HeaderModel from './HeaderModel.js';
import moment from 'moment';
import { Link } from 'dva/router';
import request from '../../../../utils/request';
import { Modal, Button, Form, Input, Table, message, Spin } from 'antd';
import styles from '../../index.less';

const rowKey = 'key';

class DataGrid extends  React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageSize: this.props.pageSize,
      total: this.props.total,
      current: this.props.current,
      dataSource: this.props.dataSource,
      params: this.props.params,
      slectRows: this.props.slectRows,
      columns: this.props.columns, //表頭
      loading: this.props.loading,
      url: this.props.url,
      queryListParams: null
    };
  }

  componentWillReceiveProps(nextProps) {
   if (nextProps.url) { //  区分开 父组件传url则表示数据源通过url获取，否则通过更新父组件传过来的dataSource更新
     this.setState({
       params: nextProps.params,
       url: nextProps.url,
       slectRows: nextProps.slectRows
     });
     if (this.state.url !== nextProps.url || (JSON.stringify(nextProps.params) !== JSON.stringify(this.state.params) && nextProps.reload)) {
       this.reloadReportData(nextProps.url, nextProps.params, 1, 10);
     }
   } else {
     this.setState({
       dataSource: this.transformDataSource(nextProps.dataSource),
       current: nextProps.current,
       slectRows: nextProps.slectRows,
       loading: nextProps.loading
     });
   }
  }

  transformDataSource(dataSource) {
    if (!this.props.rowKey) {
      return dataSource.map((item, index) => {
        item[rowKey] = index;
        return item;
      });
    } else {
      return dataSource;
    }
  }

  componentDidMount() {
    this.reloadReportData(this.state.url, this.state.params, 1, 10);
  }

  reload(params) {
    this.setState({
      params: params
    })
    this.reloadReportData(this.state.url, params, 1, 10);
  }

  reloadReportData(url, paramsChange, current, pageSize) {
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

    let datasources = this.props.datasources;
    let parameArray = [];
    datasources && datasources.parameters instanceof Array && datasources.parameters.map((item1) => {
      _.forIn(item1, function(value, key) {
        parameArray.push(value);  //value：前端查詢字段 key ：請求Url的參數名
      });
    })

    const queryListParams = {
      DataSourceId: datasources.datasourcedefineid,
      InstId: datasources.instid,
      Parameters: {
        ...getParameters()
      }
    };
    this.setState({
      queryListParams: queryListParams
    })

    for (let key in params) {
      if (parameArray.indexOf(key) > -1) {
        this.queryListData(url, {
          DataSourceId: datasources.datasourcedefineid,
          InstId: datasources.instid,
          Parameters: {
            ...getParameters(),
            ['@pageindex']: current,
            ['@pagesize']: pageSize
          }
        }, current, pageSize);
        break;
      }
    }

    function getParameters() { //請求參數 前端字段转换成后端接口请求参数字段
      let returnParams = {};
      datasources.parameters.map((item) => {
        _.forIn(item, function(value, key) {
          returnParams[key] = params[value] ? params[value] : '';
        });
      })

      return returnParams;
    }
  }


  queryListData(url, params, current, pageSize) {
    if (url == null) {
      return false;
    }

    this.setState({
      loading: true
    });
    request(url, {
      method: 'post', body: JSON.stringify({ ...params })
    }).then((result) => {
      let dataSource = result.data.data;
      if (!this.props.rowKey) {
        dataSource = result.data.data.map((item, index) => {
          item[rowKey] = index;
          return item;
        });
      }
      this.setState({
        dataSource: dataSource,
        columns: result.data.columns ? result.data.columns : this.state.columns,
        total: result.data.page[0].total,
        loading: false,
        current,
        pageSize
      });
    }).catch((e) => {
      console.error(e);
      message.error(e.message);
      this.setState({
        loading: false
      });
    });
  }

  getColumns(tableextinfo, datasourcename) {
    //DataGrid 列获取
    let columns = this.state.columns || [];

    let columnsTotalWidth = 0;
    columns instanceof Array && columns.map((item) => {
      if (item.iscolumngroup === 1) { //表头有合并
        getColumnWidth(item.subcolumns);
        function getColumnWidth(column) {
          for (let i = 0; i < column.length; i++) {
            if (column[i].iscolumngroup === 1) {
              getColumnWidth(column[i].subcolumns);
            } else {
              columnsTotalWidth += (column[i].width > 0 ? column[i].width + 20 + 2 : 150 + 20 + 2);
            }
          }
        }
      } else {
        columnsTotalWidth += (item.width > 0 ? item.width + 20 + 2 : 150 + 20 + 2); //scroll.x 需要大于 表格每列的总宽度，否则 表头与内容行对不齐 20:td-padding 2: td-border
      }
    });

    window.tableHasScrollX = true;
    if ((this.props.width - 52) > columnsTotalWidth) { //不会出现横向滚动条 让表格适配整个页面
      window.tableHasScrollX = false;
    }

    const returnColumns = columns instanceof Array && columns.map((column, index) => {
        if (column.iscolumngroup === 1) {

          return getChildrenColumns(column.subcolumns);

          function getChildrenColumns(childrenColumns) {
            const children = [];
            if (childrenColumns instanceof Array) {
              for (let i = 0; i < childrenColumns.length; i++) {
                if (childrenColumns[i].iscolumngroup === 1) {
                  children.push(getChildrenColumns(childrenColumns[i].subcolumns));
                } else {
                  children.push(getFormatColumn(childrenColumns[i]));
                }
              }
            }
            return new HeaderModel(column.title, null, null, null, null, children);
          }
        } else {
          return getFormatColumn(column)
        }

        function formatDate(text, fmt) {
          if (!text) return text;
          if (!fmt) return text;
          return moment(text, 'YYYY-MM-DD HH:mm:ss').format(fmt.replace(/y/g, 'Y').replace(/d/g, 'D'));
        }

        function getFormatColumn(item) {
          const setWidth = window.tableHasScrollX ? (item.width > 0 ? item.width : 150) : 0;  //后端会给定列宽，没给则默认设置为150
          const style = window.tableHasScrollX ? {
            width: setWidth,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-block'
          } : {
            maxWidth: '340px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-block'
          };

          const hederModelWidth = window.tableHasScrollX ? setWidth + 22 : 0
          if (item.linkscheme) { //有链接
            return new HeaderModel(item.title, item.fieldname, (text, record, rowIndex) => {
              const targetType = ['', '_self', '_blank'];

              let cellText = text instanceof Object ? text.name : text;
              // 格式化日期
              if ((item.controltype === 8 || item.controltype === 9) && item.formatstr) {
                cellText = formatDate(text, item.formatstr);
              }

              function getScheme(index = 0) {
                let scheme = item.linkscheme;
                const keys = scheme && scheme.match(/#.*?#/g, '');
                if (keys && keys instanceof Array) {
                  for (let i = 0; i < keys.length; i++) {
                    const dataSourceKey = record[keys[i].replace(/#/g, '')];
                    scheme = scheme.replace(keys[i], dataSourceKey instanceof Object ? getValue(dataSourceKey.id, index) : getValue(dataSourceKey, index));
                  }
                }

                return scheme;
              }

              function getValue(value, index) {
                if (value && value.toString().indexOf(',') > -1) {
                  return value.split(',')[index];
                } else {
                  return value;
                }
              }

              if (cellText && cellText.toString().indexOf(',') > -1) { //多数据源
                return (
                  <span style={style}>
                    {
                      cellText.split(',').map((item, index) => {
                        return <Link key={index} style={{ marginRight: '10px' }} title={item}
                                     target={targetType[item.targettype]} to={getScheme(index)}>{item}</Link>;
                      })
                    }
                  </span>
                );
              } else {
                return <Link style={style} title={cellText} target={targetType[item.targettype]}
                             to={getScheme()}>{cellText}</Link>;
              }
            }, hederModelWidth);
          } else {
            return new HeaderModel(item.title, item.fieldname, (text, record, rowIndex) => {
              // 先取 _name
              const text_name = record[item.fieldname + '_name'];
              let cellText = text_name !== undefined ? text_name : text instanceof Object ? text.name : text;
              // 格式化日期
              if ((item.controltype === 8 || item.controltype === 9) && item.formatstr) {
                cellText = formatDate(text, item.formatstr);
              }
              return (
                <span style={style} title={cellText} className={styles.datagridTdWrap}>
                  <DynamicFieldView value={cellText} value_name={cellText} controlType={item.controltype} />
                </span>
              );
            }, hederModelWidth, null);
          }
        }
    })
    return returnColumns;
  }

  getColumnsTotalWidth(columns) { //获取列表的总宽度
    let columnsTotalWidth = 0;
    columns instanceof Array && columns.map((item) => {
      if (!item.width) { //表头有合并
        getColumnWidth(item.children);
        function getColumnWidth(column) {
          if (column instanceof Array) {
            for (let i = 0; i < column.length; i++) {
              if (!column[i].width) {
                getColumnWidth(column[i].children);
              } else {
                columnsTotalWidth += column[i].width;
              }
            }
          }
        }
      } else {
        columnsTotalWidth += item.width; //scroll.x 需要大于 表格每列的总宽度，否则 表头与内容行对不齐 20:td-padding 2: td-border
      }
    });
    return columnsTotalWidth;
  }

  tableChange(pagination, filters, sorter) {
    const { current, pageSize } = pagination;
    this.reloadReportData(this.state.url, this.state.params, current, pageSize);
  }

  rowSelectHandler(selectedRowKeys, selectedRows) {
    this.setState({
      slectRows: selectedRows
    });
    this.props.selectRowHandler && this.props.selectRowHandler(selectedRows);
  }

  exportHandler() {
    request('api/ReportEngine/export', {
      method: 'post', body: JSON.stringify({
        DataQueryModel: this.state.queryListParams,
        Columns: this.state.columns
      })
    }).then(result => {
      const fileid = result.data;
      window.open('api/ReportEngine/export2file?fileid=' + fileid, '_self');
    }).catch((e) => {
      console.error(e);
      message.error(e.message);
    });
  }

  render() {
    const key = this.props.rowKey ? this.props.rowKey : rowKey;
    const rowSelection = this.props.rowSelection ? {
      selectedRowKeys: this.state.slectRows.map(item => item[key]),
      onChange: this.rowSelectHandler.bind(this)
    } : null;

    const pagination = this.props.pagination ? {
      pageSize: this.state.pageSize,
      total: this.state.total,
      current: this.state.current
    } : false;

    let props = {};
    if (this.props.width && this.props.height) {
      props = window.tableHasScrollX ? {
        scroll: { x: this.getColumnsTotalWidth(this.getColumns()), y: this.props.height }
      } : {
        scroll: { x: '100%' }
      };
    }

    return (
      <div>
        <div style={{ textAlign: 'right', display: this.props.showExport === 1 ? 'block' : 'none' }}>
          <Button className={styles.export} onClick={this.exportHandler.bind(this)}>导出</Button>
        </div>
        <Table
          loading={this.state.loading}
          scroll={this.props.scroll}
          dataSource={this.state.dataSource}
          rowKey={key}
          rowSelection={rowSelection}
          pagination={pagination}
          onChange={this.tableChange.bind(this)}
          columns={this.getColumns()}
          {...props}
        />
      </div>
    );
  }
}

DataGrid.propTypes = {
  columns: React.PropTypes.array,
  current: React.PropTypes.number,
  total: React.PropTypes.number,
  pageSize: React.PropTypes.number,
  dataSource: React.PropTypes.array,
  url: React.PropTypes.string,
  params: React.PropTypes.object,
  slectRows: React.PropTypes.array,
  rowKey: React.PropTypes.string
}

DataGrid.defaultProps = {
  columns: [],
  current: 1,
  total: 0,
  pageSize: 10,
  dataSource: [],
  url: null,
  params: {},
  slectRows: [],
  pagination: true, //是否分页
  rowSelection: true//列表项是否可选择
}

export default DataGrid;
