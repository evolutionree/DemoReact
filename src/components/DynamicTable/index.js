import React, { Component, PropTypes } from 'react';
import { Table, Modal, Button, message } from 'antd';
import { Link } from 'dva/router';
import { connect } from 'dva';
import _ from 'lodash';
import moment from 'moment';
import { getGeneralProtocol, getEntcommDetail, getCustomHeaders, saveCustomHeaders } from '../../services/entcomm';
import Avatar from '../../components/Avatar';
import CustomHeaderModal from '../../components/CustomHeaderModal';
import styles from './styles.less';

function formatDate(text, fmt) {
  if (!text) return text;
  if (!fmt) return text;
  return moment(text, 'YYYY-MM-DD HH:mm:ss').format(fmt.replace(/y/g, 'Y').replace(/d/g, 'D'));
}

class DynamicTable extends Component {
  static propTypes = {
    fixedHeader: false //是否固定表头
  }

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
      fixedColumnCount: 0
    };
  }

  componentWillMount() {
    this.fetchCustomHeaderData();
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  componentWillReceiveProps() {

  }

  onWindowResize(e) {
    this.setState({
      height: document.body.clientHeight,
      width: document.body.clientWidth
    });
  }

  getcombineCustomProtocol() { //web列表返回的字段协议 与 个人列定义的协议 做交集处理
    const { protocol } = this.props;
    // 过滤掉分组
    let filterField = protocol.filter(field => {
      return field.controltype !== 20;
    });
    let customProtocol = this.state.customProtocol;

    for (let i = 0; i < filterField.length; i++) {
      filterField[i].columnConfig = { //整合成 设置表头Modal需要的UI数据
        fieldid: filterField[i].fieldid,
        isdisplay: 1,
        width: filterField[i].defaultwidth < 100 ? 100 : filterField[i].defaultwidth //后端会给定默认列宽，没给则默认设置为100
      };
    }

    //个人定义的列表数据 可能和 web列表定义的数据 不一致（web列表定义的字段可以在配置做修改） 先优先处理个人定义的数据（在web列表定义中存在）,再添加在个人定义不存在但在web定义存在的数据
    let newProtocol = [];
    for (let i = 0; i < customProtocol.length; i++) {
      const findFilterFieldIndex = _.findIndex(filterField, item => item.fieldid === customProtocol[i].fieldid);
      if (findFilterFieldIndex > -1) {
        let column = filterField[findFilterFieldIndex];
        column.columnConfig = {
          fieldid: customProtocol[i].fieldid,
          isdisplay: customProtocol[i].isdisplay,
          width: customProtocol[i].width
        }
        newProtocol.push(column);
      }
    }


    for (let i = 0; i < filterField.length; i++) {
      if (_.findIndex(newProtocol, item => item.fieldid === filterField[i].fieldid) === -1) {
        newProtocol.push(filterField[i]);
      }
    }
    return newProtocol;
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
      return [13, 14, 15, 20, 22, 23, 24].indexOf(field.controltype) === -1;
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
        width: setWidth
      } : {
        ...normalStyle,
        maxWidth: '340px'
      };

      return {
        key: field.fieldname,
        dataIndex: field.fieldname,
        title: field.displayname,
        sorter: this.props.sorter,
        width: this.props.fixedHeader ? setWidth + 21 : 0, //21：padding + border
        fixed: this.props.fixedHeader ? (index < this.state.fixedColumnCount ? 'left' : false) : false,
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

  fetchCustomHeaderData = () => {
    getCustomHeaders({
      EntityId: this.props.entityId
    }).then((result) => {
      this.setState({
        customProtocol: result.data.columns,
        fixedColumnCount: result.data.fixedcolumncount
      });
    });
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
      const protocol = res1.data;
      const recordDetail = res2.data.detail;
      const tableData = (recordDetail && recordDetail[field.fieldname]) || [];
      this.setState({
        innerTableProtocol: protocol,
        innerTableRecords: tableData
      });
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
      case 10:
      case 11:
      case 12:
      case 13:
      case 14:
      case 16:
      case 17:
      case 18:
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
  renderText = (text) => {
    let text_ = text;
    if (typeof text_ === 'object' && text_ !== null) {
      text_ = JSON.stringify(text_);
    }
    return <span title={text_}>{text_}</span>;
  };
  renderAvatar = (fileId, field) => {
    const { headShape } = field.fieldconfig || {};
    const url = `/api/fileservice/read?fileid=${fileId}`;
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
    const urls = strFileIds.split(',').map(id => `/api/fileservice/read?fileid=${id}`);
    return urls.map((url, index) => (
      <img
        key={index}
        src={url}
        alt=""
        onClick={() => {
          this.props.dispatch({ type: 'app/viewImages', payload: urls.map(src => ({ src, active: src === url })) });
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

    const width = (this.state.width - 200) < 1080 ? 1080 : this.state.width; // 系统设置了最小宽度
    if (width > parseInt(this.getColumnsTotalWidth(columns))) { //如果表格没有横向滚动条，则不需要对列固定
      columns = columns.map((item) => {
        item.fixed = false;
        return item;
      });
    }

    return (
      <div>
        <Table
          scroll={fixedHeader ? { x: scrollX, y: this.state.height - 316 } : { x: '100%' }}
          className={styles.dynamictable}
          {...restProps}
          columns={columns}
        />
        <Modal
          width={860}
          title={this.state.innerTableTitle}
          visible={this.state.innerTableVisible}
          onCancel={this.hideInnerTable}
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
            />
          ) : 'loading..'}
        </Modal>
        <CustomHeaderModal visible={this.state.setCustomHeadersVisible}
                           dataSource={this.getcombineCustomProtocol()}
                           fixedColumnCount={this.state.fixedColumnCount}
                           onCancel={this.hideSetCustomHeaders}
                           saveCustomHeaders={this.saveCustomHeaders} />
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
