import React, { Component, PropTypes } from 'react';
import { Table, Modal, Button } from 'antd';
import { Link } from 'dva/router';
import { connect } from 'dva';
import moment from 'moment';
import { getGeneralProtocol, getEntcommDetail } from '../../services/entcomm';
import Avatar from '../../components/Avatar';
import styles from './styles.less';

function formatDate(text, fmt) {
  if (!text) return text;
  if (!fmt) return text;
  return moment(text, 'YYYY-MM-DD HH:mm:ss').format(fmt.replace(/y/g, 'Y').replace(/d/g, 'D'));
}

class DynamicTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      innerTableVisible: false,
      innerTableTitle: '查看明细',
      innerTableProtocol: [],
      innerTableRecords: []
    };
  }
  getColumns = () => {
    const { protocol, ignoreRecName } = this.props;
    // 把第一列作为跳转详情列
    const linkField = ignoreRecName ? undefined : protocol.filter(field => {
      return [13, 14, 15, 20, 22, 23, 24].indexOf(field.controltype) === -1;
    })[0];

    // 过滤掉分组
    return protocol.filter(field => {
      return field.controltype !== 20;
    }).map((field, index) => {
      return {
        key: field.fieldname,
        dataIndex: field.fieldname,
        title: field.displayname,
        render: (text, record) => {
          const isLinkField = field === linkField;
          return this.renderCell(text, field, record, isLinkField);
        }
      };
    });
  };
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
      // 普通文本，日期
      case 1012:
      case 1:
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
    const titleStyle = {
      display: 'inline-block',
      maxWidth: '340px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };
    let linkUrl = `/entcomm/${field.typeid}/${record.recid}`;
    if (this.props.linkUrl) {
      linkUrl = this.props.linkUrl(textView, field, record);
    }

    return <Link to={linkUrl} style={titleStyle} title={textView}>{textView || '(查看详情)'}</Link>;
  };
  renderText = (text) => {
    const titleStyle = {
      display: 'inline-block',
      maxWidth: '340px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };
    let text_ = text;
    if (typeof text_ === 'object' && text_ !== null) {
      text_ = JSON.stringify(text_);
    }
    return <span style={titleStyle} title={text_}>{text_}</span>;
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
  renderAttachment = (filesJSON) => {
    let files = [];
    if (filesJSON) {
      files = JSON.parse(filesJSON);
    }
    const text = files.map(f => f.filename).join(', ');
    return this.renderText(text);
  };
  render() {
    const { protocol, ignoreRecName, ...restProps } = this.props;
    return (
      <div>
        <Table
          scroll={{ x: '100%' }}
          className={styles.dynamictable}
          {...restProps}
          columns={this.getColumns()}
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
      </div>
    );
  }
}

export default connect(
  state => state.app
)(DynamicTable);
