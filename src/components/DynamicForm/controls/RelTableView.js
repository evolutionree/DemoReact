/**
 * Created by 0291 on 2018/7/18.
 */
import React, { Component, PropTypes } from 'react';
import { Table } from 'antd';
import moment from 'moment';
import { getGeneralProtocolForGrid } from '../../../services/entcomm';
import DynamicFieldView from '../DynamicFieldView';

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
      fields: []
    };
  }

  componentDidMount() {
    this.props.entityId && this.queryFields(this.props.entityId);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.entityId !== nextProps.entityId) {
      this.queryFields(nextProps.entityId);
    }
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
    const showFields = this.getShowFields();
    let columns = showFields.map((item, index) => {
      return { title: item.displayname, width: 200, dataIndex: item.fieldname, key: item.fieldname, render: (text, record, rowIndex) => {
        // 先取 _name
        const text_name = record[item.fieldname + '_name'];
        // let cellText = text_name !== undefined ? text_name : text instanceof Object ? text.name : text;
        // // 格式化日期
        // if ((item.controltype === 8 || item.controltype === 9) && item.formatstr) {
        //   cellText = this.formatDate(text, item.formatstr);
        // }
        return (
          <span>
            <DynamicFieldView value={text} value_name={text_name} controlType={item.controltype} />
          </span>
        );
      }, fixed: showFields.length >= 6 ? (index < 1 ? 'left' : null) : null };
    })

    const scroll = showFields.length >= 6 ? { x: showFields.length * 200, y: 400 } : { x: '100%' }
    return (
      <Table rowKey="key" columns={columns} dataSource={this.parseValue()} pagination={false} scroll={{ ...scroll }} />
    );
  }
}

export default RelTableView;
