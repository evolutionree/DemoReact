/**
 * Created by 0291 on 2018/7/18.
 */
import React, { Component, PropTypes } from 'react';
import { Table } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { getGeneralProtocolForGrid } from '../../../services/entcomm';
import DynamicFieldView from '../DynamicFieldView';
import styles from './RelTable.less';

const normalStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'inline-block'
};

class RelTableView extends Component {
  static propTypes = {
    entityTypeId: PropTypes.string.isRequired,
    value: PropTypes.arrayOf(PropTypes.shape({
      TypeId: PropTypes.string,
      FieldData: PropTypes.object
    })),
    entityId: PropTypes.string
  };
  static defaultProps = {
    value: []
  };

  constructor(props) {
    super(props);
    this.state = {
      fields: [],
      width: document.body.clientWidth
    };
  }

  componentDidMount() {
    this.props.entityId && this.queryFields(this.props.entityId);
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.entityId !== nextProps.entityId) {
      this.queryFields(nextProps.entityId);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize = (e) => {
    this.setState({
      height: document.body.clientHeight,
      width: document.body.clientWidth
    });
  }

  parseValue = () => {
    let { value } = this.props;
    if (!value) return [];
    if (!Array.isArray(value)) return [];
    return value.map((item, index) => {
      item.key = index;
      return item;
    });
  };

  queryFields = entityId => {
    const params = {
      entityId,
      OperateType: 2,  // 0新增 1编辑 2查看
      typeId: this.props.entityTypeId // 主表单typeid
    };
    this.setState({
      loading: true
    })
    getGeneralProtocolForGrid(params).then(result => {
      this.setState({
        fields: result.data,
        loading: false
      });
    }).catch(e => {
      console.error(e.message);
      this.setState({
        loading: false
      });
    });
  };

  getShowFields = () => {
    // return this.state.fields.filter(item => !!(item.fieldconfig && item.fieldconfig.isVisible && (item.fieldconfig.isVisibleJS !== 0)));
    return this.state.fields.filter(field => {
      if ((field.controltype > 1000 && field.controltype !== 1012 && field.controltype !== 1006)) { //(field.controltype === 31) ||
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


  formatDate(text, fmt) {
    if (!text) return text;
    if (!fmt) return text;
    return moment(text, 'YYYY-MM-DD HH:mm:ss').format(fmt.replace(/y/g, 'Y').replace(/d/g, 'D'));
  }

  render() {
    const cellWidth = 125;
    const showFields = this.getShowFields();
    let columns = showFields.map((item, index) => {
      return { title: item.displayname, width: cellWidth, dataIndex: item.fieldname, key: item.fieldname, render: (text, record, rowIndex) => {
        // 先取 _name
        const text_name = record[item.fieldname + '_name'];
        // let cellText = text_name !== undefined ? text_name : text instanceof Object ? text.name : text;
        // // 格式化日期
        // if ((item.controltype === 8 || item.controltype === 9) && item.formatstr) {
        //   cellText = this.formatDate(text, item.formatstr);
        // }
        return (
          <span style={{ ...normalStyle, width: cellWidth - 26 }} className={styles.tableCell}>
            <DynamicFieldView value={text} value_name={text_name} controlType={item.controltype} />
          </span>
        );
      }, fixed: showFields.length >= 6 ? (index < 1 ? 'left' : null) : null };
    })

    const scroll = showFields.length >= 6 ? { x: showFields.length * cellWidth, y: 400 } : { x: '100%' };

    let width = this.state.width - (this.props.siderFold ? 61 : 200); //系统左侧 200px显示菜单(未折叠  折叠61)
    width = width < 1080 ? 1080 : width; // 系统设置了最小宽度
    if ((width - 52) > showFields.length * cellWidth) { //如果表格没有横向滚动条，则不需要对列固定  -52:计算出表格真实占用的宽度
      columns = columns.map((item) => {
        item.fixed = false;
        return item;
      });
    }

    return (
      <div className={styles.tableView}>
        <Table rowKey="key" columns={columns} dataSource={this.parseValue()} pagination={false} scroll={{ ...scroll }} />
      </div>
    );
  }
}

export default connect(
  state => state.app
)(RelTableView);
