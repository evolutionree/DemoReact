import React, { Component, PropTypes } from 'react';
import { Table, Modal, Button, message, Icon, Input } from 'antd';
import { Link } from 'dva/router';
import { connect } from 'dva';
import _ from 'lodash';
import moment from 'moment';
import { getGeneralProtocol, getEntcommDetail, getCustomHeaders, saveCustomHeaders } from '../../services/entcomm';
import Avatar from '../../components/Avatar';
import CustomHeaderModal from '../../components/CustomHeaderModal';
import DSourceDetail from './DSourceDetail';
import FilterDrop from './FilterDropComponent/index';
import styles from './styles.less';

function formatDate(text, fmt) {
  if (!text) return text;
  if (!fmt) return text;
  return moment(text, 'YYYY-MM-DD HH:mm:ss').format(fmt.replace(/y/g, 'Y').replace(/d/g, 'D'));
}

const has_No_Filter_Field = [15, 20, 22];
class DynamicTable extends Component {
  static propTypes = {
    onChange: React.PropTypes.func,
    fixedHeader: React.PropTypes.bool,
    sorter: React.PropTypes.bool,
    ColumnFilter: React.PropTypes.object,
    onFilter: React.PropTypes.func,
    otherHeight: React.PropTypes.number
  };
  static defaultProps = {
    fixedHeader: false, //是否固定表头
    sorter: false, //是否字段排序
    fetchCustomHeader: true, //是否请求自定义列表数据接口
    ColumnFilter: {}, //表格列（字段）排序集
    otherHeight: 0  //页面其他元素的总高度（除了Table以外的元素）
  };

  constructor(props) {
    super(props);
    this.state = {
      innerTableVisible: false,
      innerTableTitle: '查看明细',
      innerTableProtocol: [],
      innerTableRecords: [],
      height: document.body.clientHeight,
      width: document.body.clientWidth,
      setCustomHeadersVisible: false, //是否显示 设置表头 Modal
      customProtocol: [], //自定义表列数据
      fixedColumnCount: 0,
      filterVisible: {},
      dSourceDetailVisible: false,
      DataSourceRelEntityId: '', //数据源关联实体Id
      DataSourceRelRecId: '',
      DataSourceDetailModalTitle: ''
    };
  }

  componentWillMount() {
    this.fetchCustomHeaderData();
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    document.addEventListener('click', this.hideList.bind(this), false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('click', this.hideList, false);
  }

  hideList(e) {
    this.setState({
      dSourceDetailVisible: false
    });
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.entityId !== nextProps.entityId) { //不同的实体之间切换页面了  需再次请求最新的表头自定义设置数据
      this.fetchCustomHeaderData(nextProps.entityId);
    }
    this.setState({
      height: document.body.clientHeight,
      width: document.body.clientWidth
    });
  }

  onWindowResize(e) {
    this.setState({
      height: document.body.clientHeight,
      width: document.body.clientWidth
    });
  }

  getDefaultProtocol() { //默认的协议
    const { protocol } = this.props;

    let cloneProtocol = _.cloneDeep(protocol);
    // 过滤掉分组
    let filterField = cloneProtocol.filter(field => {
      return field.controltype !== 20;
    });

    let defaultProtocol = filterField.map(item => {
      item.columnConfig = { //整合成 设置表头Modal需要的UI数据
        fieldid: item.fieldid,
        isdisplay: 1,
        width: item.defaultwidth < 100 ? 100 : item.defaultwidth //后端会给定默认列宽，没给则默认设置为100
      };
      return item;
    })

    return defaultProtocol;
  }

  getcombineCustomProtocol() { //web列表返回的字段协议 与 个人列定义的协议 做交集处理
    let defaultProtocol = this.getDefaultProtocol();
    let customProtocol = this.state.customProtocol;

    //个人定义的列表数据 可能和 web列表定义的数据 不一致（web列表定义的字段可以在配置做修改） 先优先处理个人定义的数据（在web列表定义中存在）,再添加在个人定义不存在但在web定义存在的数据
    let newProtocol = [];
    for (let i = 0; i < customProtocol.length; i++) {
      const findFilterFieldIndex = _.findIndex(defaultProtocol, item => item.fieldid === customProtocol[i].fieldid);
      if (findFilterFieldIndex > -1) {
        let column = defaultProtocol[findFilterFieldIndex];
        column.columnConfig = {
          fieldid: customProtocol[i].fieldid,
          isdisplay: customProtocol[i].isdisplay,
          width: customProtocol[i].width
        }
        newProtocol.push(column);
      }
    }


    for (let i = 0; i < defaultProtocol.length; i++) {
      if (_.findIndex(newProtocol, item => item.fieldid === defaultProtocol[i].fieldid) === -1) {
        newProtocol.push(defaultProtocol[i]);
      }
    }
    return newProtocol;
  }

  onFilter = (fieldname, value) => { //提交搜索
    this.hideFilter(fieldname, false);
    const newColumnFilter = { ...this.props.ColumnFilter };
    newColumnFilter[fieldname] = value;
    this.props.onFilter && this.props.onFilter(newColumnFilter);
  }

  hideFilter = (fieldname, visible) => {
    const newFilterVisible = { ...this.state.filterVisible };
    newFilterVisible[fieldname] = visible ? newFilterVisible[fieldname] ? true : false : visible;
    this.setState({
      filterVisible: newFilterVisible
    });
  }

  toggleShowFilter = (fieldname, e) => { //点击icon[filter]显示/隐藏 搜索框
    e.nativeEvent.stopImmediatePropagation();
    const newFilterVisible = { ...this.state.filterVisible };
    for (let key in newFilterVisible) {
      newFilterVisible[key] = false;
    }
    newFilterVisible[fieldname] = !newFilterVisible[fieldname];
    this.setState({
      filterVisible: newFilterVisible
    });
  }

  getColumns = () => {
    const { protocol, ignoreRecName } = this.props;

    const combineCustomProtocol = this.getcombineCustomProtocol();
    let filterField = combineCustomProtocol;
    if (_.findIndex(combineCustomProtocol, item => item.columnConfig.isdisplay === 1) > -1) { //如果所有列都设置了不显示 则表格显示所有列
      filterField = combineCustomProtocol.filter((item) => {
        return item.columnConfig.isdisplay === 1;
      });
    }

    // 把第一列作为跳转详情列
    const linkField = ignoreRecName ? undefined : filterField.filter(field => {
      return [13, 14, 15, 18, 20, 22, 23, 24, 32].indexOf(field.controltype) === -1;
    })[0];

    return filterField instanceof Array && filterField.map((field, index) => {
      /*
        Ant Table: 实现表格表头固定的话，需给每列设置固定宽度（表头可换行），单元格超出给定宽则做超出显示处理，ScrollX 需大于等于表格总宽度
       */
      const setWidth = field.columnConfig.width;
      const normalStyle = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'inline-block'
      };
      const style = this.props.fixedHeader ? {
        ...normalStyle,
        width: setWidth - 4
      } : {
        ...normalStyle,
        maxWidth: '340px'
      };

      const sortFieldAndOrder = this.props.sortFieldAndOrder;

      let filterObj = {};
      if (this.props.onFilter) {
        filterObj = {
          filterDropdown: has_No_Filter_Field.indexOf(field.controltype) > -1 ? null : <FilterDrop visible={!!this.state.filterVisible[field.fieldname]} field={field} value={this.props.ColumnFilter[field.fieldname]} onFilter={this.onFilter} hideFilter={this.hideFilter} />,
          filterIcon: <Icon type="filter" style={{ color: this.props.ColumnFilter[field.fieldname] ? '#108ee9' : '#aaa' }} onClick={this.toggleShowFilter.bind(this, field.fieldname)} />,
          filterDropdownVisible: !!this.state.filterVisible[field.fieldname], //字段搜索框是否显示
          onFilterDropdownVisibleChange: () => {
            return false;
          }
        };
      }

      return {
        key: field.fieldname,
        dataIndex: field.fieldname,
        title: field.displayname,
        sorter: this.props.sorter,
        sortOrder: (this.props.sorter && sortFieldAndOrder) ? sortFieldAndOrder.split(' ')[0] === field.fieldname && (sortFieldAndOrder.split(' ')[1] + 'end') : false,
        width: this.props.fixedHeader ? setWidth + 22 : 0, //22：padding + border
        fixed: this.props.fixedHeader ? (index < this.state.fixedColumnCount ? 'left' : false) : false,
        ...filterObj,
        render: (text, record) => {
          const isLinkField = field === linkField;
          return (
            <span style={style}>
              {
                this.renderCell(text, field, record, isLinkField)
              }
            </span>
          );
        }
      };
    });
  };
  getColumnsTotalWidth(columns) { //获取列表的总宽度
    let columnsTotalWidth = 0;
    columns.map((item) => {
      columnsTotalWidth += item.width;
    });
    return columnsTotalWidth;
  }
  showInnerTable = (record, field) => {
    this.setState({
      innerTableVisible: true,
      innerTableTitle: field.displayname || '查看明细'
    }, () => this.fetchInnerTableData(record, field));
  };
  hideInnerTable = () => {
    this.setState({
      innerTableVisible: false,
      innerTableTitle: '查看明细',
      innerTableProtocol: [],
      innerTableRecords: []
    });
  };

  openSetCustomHeaders = () => {
    this.fetchCustomHeaderData();
    this.setState({
      setCustomHeadersVisible: true
    });
  };

  hideSetCustomHeaders = () => {
    this.setState({
      setCustomHeadersVisible: false
    });
  };

  saveCustomHeaders = (columnsConfig, FixedColumnCount) => {
    saveCustomHeaders({
      EntityId: this.props.entityId,
      viewconfig: {
        Columns: columnsConfig,
        FixedColumnCount: FixedColumnCount
      }
    }).then(() => {
      message.success('保存成功');
      this.hideSetCustomHeaders();
      this.fetchCustomHeaderData();
    });
  }

  fetchCustomHeaderData = (entityId = this.props.entityId) => { //放在这个组件里去请求数据 主要是考虑 一次代码多次复用 不然交给上一层组件去请求，那么独立实体 简单实体 动态实体列表都得写一遍
    if(this.props.fetchCustomHeader) {
      getCustomHeaders({
        EntityId: entityId
      }).then((result) => {
        this.setState({
          customProtocol: result.data.columns,
          fixedColumnCount: result.data.fixedcolumncount
        });
      });
    }
  };


  fetchInnerTableData = (record, field) => {
    const entityId = field.fieldconfig && field.fieldconfig.entityId;
    Promise.all([
      getGeneralProtocol({
        typeId: entityId,
        operatetype: 2
      }),
      getEntcommDetail({
        entityId: this.props.entityId,
        recId: record.recid,
        needPower: 0
      })
    ]).then(([res1, res2]) => {
      const protocol = this.processFields(res1.data);
      const recordDetail = res2.data.detail;
      const tableData = (recordDetail && recordDetail[field.fieldname]) || [];
      this.setState({
        innerTableProtocol: protocol,
        innerTableRecords: tableData
      });
    });
  };

  processFields = fields => {
    return fields.filter(field => {
      if ((field.controltype === 31) || (field.controltype > 1000 && field.controltype !== 1012 && field.controltype !== 1006)) {
        return false;
      }
      if (field.fieldconfig.isVisible !== 1) {
        return false;
      } else if (field.fieldconfig.isVisibleJS === 0) {
        return false;
      }
      return true;
    });
  };

  renderCell = (text, field, record, isLinkField) => {
    // 先取 _name
    const text_name = record[field.fieldname + '_name'];
    let cellText = text_name !== undefined ? text_name : text;

    // 格式化日期
    if ((field.controltype === 8 || field.controltype === 9)
        && field.fieldconfig && field.fieldconfig.format) {
      cellText = formatDate(text, field.fieldconfig.format);
    }

    if (field.controltype === 3 && field.fieldconfig && field.fieldconfig.dataSource && field.fieldconfig.dataSource.sourceKey && field.fieldconfig.dataSource.sourceKey === 'weekinfo') {
      const yearWeekData = this.props.yearWeekData;
      for (let i = 0; i < yearWeekData.length; i++) {
        if (cellText && cellText.indexOf(yearWeekData[i].value) > -1) {
          cellText = yearWeekData[i].label;
          break;
        }
      }
    }

    // 是否跳转详情列
    if (isLinkField) {
      if (this.props.renderLinkField) return this.props.renderLinkField(cellText, field, record, this.props);
      return this.renderDetailLink(cellText, field, record);
    }

    switch (field.controltype) {
      // 头像
      case 15:
        return this.renderAvatar(cellText, field);
      // 数据源
      case 18:
        return this.renderdSourceDetail(cellText, field, record);
      // 图片
      case 22:
        return this.renderPictures(cellText, field);
      // 附件
      case 23:
        return this.renderAttachment(cellText, field);
      // 表格
      case 24:
        return this.renderTable(cellText, field, record);
      case 1:
        return this.renderInputText(cellText, field, record);
        //手机
      case 10:
        return this.renderTelePhone(cellText);
        //关联业务
      case 32:
        return this.renderRelBusiness(cellText);
      // 普通文本，日期
      case 1012:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 11:
      case 12:
      case 13:
      case 14:
      case 16:
      case 17:
      case 25:
      case 28:
      case 29:
      case 31:
      default:
        return this.renderText(cellText);
    }
  };
  renderDetailLink = (text, field, record) => {
    let textView = text;
    let linkUrl = `/entcomm/${field.typeid}/${record.recid}`;
    if (this.props.linkUrl) {
      linkUrl = this.props.linkUrl(textView, field, record);
    }

    return <Link to={linkUrl} title={textView}>{textView || '(查看详情)'}</Link>;
  };


  renderRelBusiness = (text) => {
    const relBusinessData = text && text.dataSourceValue;
   if (relBusinessData && relBusinessData instanceof Object) {
     const relId = relBusinessData.id.split(',');
     const relName = relBusinessData.name.split(',');

     let arr = [];
     for (let i = 0; i < relId.length; i++) {
       arr.push({
         id: relId[i],
         name: relName[i]
       });
     }

     return arr.map((item, index) => {
       return <a key={index} title={item.name} className={styles.relbusinessLink} onClick={(e) => {
         e.nativeEvent.stopImmediatePropagation();
         this.setState({
           dSourceDetailVisible: true,
           DataSourceRelEntityId: text.entityId,
           DataSourceRelRecId: item.id,
           DataSourceDetailModalTitle: ''
         });
       }}>{item.name}{index === arr.length - 1 ? '' : ','}</a>;
     });
   }
    return '';
  }

  renderdSourceDetail = (text, field, record) => {
    let text_ = text;
    if (typeof text_ === 'object' && text_ !== null) {
      text_ = JSON.stringify(text_);
    }

    let DataSourceRelEntityId = '';
    if (field.fieldconfig && field.fieldconfig.DataSource) {
      DataSourceRelEntityId = field.fieldconfig.DataSource.EntityId;
    }

    const DataSourceRelRecId = record[field.fieldname] && record[field.fieldname].id;
    const DataSourceDetailModalTitle = field.displayname;
    return <a title={text_} onClick={(e) => {
      e.nativeEvent.stopImmediatePropagation();
      this.setState({
        dSourceDetailVisible: true,
        DataSourceRelEntityId,
        DataSourceRelRecId,
        DataSourceDetailModalTitle
      });
    }}>{text_}</a>;
  };

  renderText = (text) => {
    let text_ = text;
    if (typeof text_ === 'object' && text_ !== null) {
      text_ = JSON.stringify(text_);
    }
    return <span title={text_}>{text_}</span>;
  };

  renderTelePhone = (text) => {
    // if (this.props.entityId === 'e450bfd7-ff17-4b29-a2db-7ddaf1e79342') { //云拨号 暂停开发
    //   return (
    //     <span>
    //       <span>{text}</span>
    //       <span className={styles.call} onClick={() => { this.props.onCall && this.props.onCall(text) }}>
    //         <Icon type="phone" />
    //       </span>
    //     </span>
    //   );
    // } else {
    //
    // }
    return <span>{text}</span>;
  };

  renderAvatar = (fileId, field) => {
    const { headShape } = field.fieldconfig || {};
    const url = `/api/fileservice/read?fileid=${fileId}&filetype=3`;
    return (
      <Avatar
        image={url}
        style={{
          borderRadius: headShape === 0 ? '0' : '100%',
          width: '32px',
          height: '32px'
        }}
      />
    );
  };
  renderPictures = (strFileIds, field) => {
    if (!strFileIds) return '';
    const urls = strFileIds.split(',').map(id => `/api/fileservice/read?fileid=${id}&filetype=1`);
    const originUrls = strFileIds.split(',').map(id => `/api/fileservice/read?fileid=${id}`);
    return urls.map((url, index) => (
      <img
        key={index}
        src={url}
        alt=""
        onClick={() => {
          this.props.dispatch({ type: 'app/viewImages', payload: originUrls.map(src => ({ src, active: src === url })) });
        }}
        style={{
          width: '32px',
          height: '32px',
          marginRight: index === urls.length - 1 ? '0' : '8px'
        }}
      />
    ));
  };
  // TODO 显示表格
  renderTable = (cellText, field, record) => {
    if (!cellText) return null;
    return <a onClick={() => this.showInnerTable(record, field)}>{field.displayname}</a>;
  };
  renderInputText = (cellText, field, record) => {
    const { fieldconfig } = field;
    if (fieldconfig && fieldconfig.encrypted) {
      return cellText ? '********' : '';
    }
    return this.renderText(cellText);
  };
  renderAttachment = (filesJSON) => {
    let files = [];
    if (filesJSON) {
      files = JSON.parse(filesJSON);
    }
    const text = files.map(f => f.filename).join(', ');
    return this.renderText(text);
  };
  render() {
    const { protocol, ignoreRecName, fixedHeader, ...restProps } = this.props;
    let columns = this.getColumns();
    const scrollX = this.props.rowSelection ? parseInt(this.getColumnsTotalWidth(columns)) + 63 : parseInt(this.getColumnsTotalWidth(columns)); //63 表格如果支持选择，则加上选择列的宽度

    let width = this.state.width - (this.props.siderFold ? 61 : 200); //系统左侧 200px显示菜单(未折叠  折叠61)
    width = width < 1080 ? 1080 : width; // 系统设置了最小宽度
    if ((width - 52) > (parseInt(this.getColumnsTotalWidth(columns)) + (this.props.rowSelection ? 63 : 0))) { //如果表格没有横向滚动条，则不需要对列固定  -52:计算出表格真实占用的宽度 +63 表格各列宽+ 列头的checkBox宽
      columns = columns.map((item) => {
        item.fixed = false;
        return item;
      });
    }

    const style = fixedHeader ? { height: this.state.height - this.props.otherHeight } : {}
    return (
      <div>
        <Table
          scroll={fixedHeader ? { x: scrollX + 6, y: this.state.height - this.props.otherHeight - 104 } : { x: '100%' }}
          className={styles.dynamictable}
          style={{ ...style }}
          {...restProps}
          columns={columns}
        />
        <Modal
          width={860}
          title={this.state.innerTableTitle}
          visible={this.state.innerTableVisible}
          onCancel={this.hideInnerTable}
          className="innerTableWrap"
          footer={[
            <Button key="close" type="default" onClick={this.hideInnerTable}>关闭</Button>
          ]}
        >
          {this.state.innerTableProtocol.length ? (
            <DynamicTable
              ignoreRecName
              protocol={this.state.innerTableProtocol}
              rowKey="recid"
              dataSource={this.state.innerTableRecords}
              total={this.state.innerTableRecords.length}
              pagination={false}
              fixedHeader={false}
              fetchCustomHeader={false}
            />
          ) : 'loading..'}
        </Modal>
        <CustomHeaderModal visible={this.state.setCustomHeadersVisible}
                           dataSource={this.getcombineCustomProtocol()}
                           defaultDataSource={this.getDefaultProtocol()}
                           fixedColumnCount={this.state.fixedColumnCount}
                           onCancel={this.hideSetCustomHeaders}
                           saveCustomHeaders={this.saveCustomHeaders} />
        <DSourceDetail visible={this.state.dSourceDetailVisible} entityId={this.state.DataSourceRelEntityId} recordId={this.state.DataSourceRelRecId} title={this.state.DataSourceDetailModalTitle} />
      </div>
    );
  }
}

export default connect(
  state => state.app,
  null,
  undefined,
  { withRef: true }
)(DynamicTable);
