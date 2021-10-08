/**
 * Created by 0291 on 2018/7/18.
 */
import React, { Component, PropTypes } from 'react';
import { Table, Pagination, Select } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { getGeneralProtocolForGrid } from '../../../services/entcomm';
import DynamicFieldView from '../DynamicFieldView';
import styles from './RelTable.less';
import ProductStockModal from '../../../routes/ProductManager/ProductStockModal';

const normalStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'inline-block'
};

const basePageSizeOptions = [
  { label: '5 条/页', value: '5' },
  { label: '10 条/页', value: '10' },
  { label: '20 条/页', value: '20' },
  { label: '50 条/页', value: '50' },
  { label: '100 条/页', value: '100' }
];


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
      width: document.body.clientWidth,
      showPage: 1,
      showCount: 10
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
    const { value } = this.props;
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
    });
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
    const { fieldname, hiddenRowField } = this.props;
    // return this.state.fields.filter(item => !!(item.fieldconfig && item.fieldconfig.isVisible && (item.fieldconfig.isVisibleJS !== 0)));
    return this.state.fields.filter(field => {
      if ((field.controltype > 1000 && field.controltype !== 1012 && field.controltype !== 1006)) { //(field.controltype === 31) ||
        return false;
      }

      if (field.fieldname === 'sourcerecid' || field.fieldname === 'sourcerecitemid') {
        return false;
      }

      if (field.fieldconfig.isVisible !== 1) {
        return false;
      } else if (field.fieldconfig.isVisibleJS === 0) {
        return false;
      }
      if(!fieldname){
        return false;
      }

      // 支持查看setRowFieldVisible方法的兼容
      const hiddenArr = hiddenRowField[fieldname];
      if (hiddenArr && hiddenArr.length && hiddenArr.includes(field.fieldname)) {
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

  onViewStock = (record) => {
    this.setState({ ProductStockVisible: true, productids: [record.productname] });
  }

  onCancelProductStockModal = () => this.setState({ ProductStockVisible: false });

  render() {
    const { ProductStockVisible, productids,showPage, showCount  } = this.state;
    const values = this.parseValue();
    const cellWidth = 125;
    const showFields = this.getShowFields();
    const tableWidth = showFields.reduce((sum, currentItem) => sum + cellWidth, 0);
    const isLessField = tableWidth < 1200;

    let columns = showFields.map((item, index) => {
      return {
        title: item.displayname, width: cellWidth, dataIndex: item.fieldname, key: item.fieldname, render: (text, record, rowIndex) => {
          // 先取 _name
          const text_name = record[item.fieldname + '_name'];

          return (
            <span style={{ ...normalStyle, width: isLessField ? undefined : cellWidth - 26 }} className={styles.tableCell}>
              <DynamicFieldView
                width={isLessField ? undefined : cellWidth - 21}
                value={text}
                value_name={text_name}
                controlType={item.controltype}
                config={item.fieldconfig}
                fieldname={item.fieldname}
                onViewStock={() => this.onViewStock(record)}
              />
            </span>
          );
        }, fixed: showFields.length >= 6 ? (index < 1 ? 'left' : null) : null
      };
    });

    const scroll = { x: isLessField ? undefined : showFields.length * cellWidth, y: 400 };
    const otherObj = isLessField ? null : { scroll };

    let width = this.state.width - (this.props.siderFold ? 61 : 200); //系统左侧 200px显示菜单(未折叠  折叠61)
    width = width < 1080 ? 1080 : width; // 系统设置了最小宽度
    if ((width - 52) > showFields.length * cellWidth) { //如果表格没有横向滚动条，则不需要对列固定  -52:计算出表格真实占用的宽度
      columns = columns.map((item) => {
        item.fixed = false;
        return item;
      });
    }
    
    const total = values.length;
    const showPager = total > 10;
    let pageSizeOptions = [];
    if (showPager) {
      pageSizeOptions = basePageSizeOptions.filter(p => p.value <= total);
      const poLast = pageSizeOptions.pop();
      if (total - poLast.value === 0) {
        pageSizeOptions.push({ label: '显示全部', value: String(5000) });
      } else if (total > poLast.value) {
        pageSizeOptions.push(poLast);
        pageSizeOptions.push({ label: '显示全部', value: String(5000) });
      }
    }
    const showValues = values.slice((showPage - 1) * showCount, showPage * showCount);


    return (
      <div>
        <Table
          rowKey="key"
          columns={columns}
          dataSource={showValues}
          pagination={false}
          {...otherObj}
        />
        {
          showPager ? (
            <div className={styles.wrapPage} style={{ position: 'relative'}}>
              <Pagination 
                current={showPage}
                pageSize={showCount}
                total={total}
                showQuickJumper={false}
                showSizeChanger={false}
                onChange={page => this.setState({ showPage: page })}
              />
              <Select
                value={String(showCount)}
                className={styles.allSel}
                onChange={sc => this.setState({ showPage: 1, showCount: Number(sc) })}
              >
                {pageSizeOptions.map(p => <Option key={p.value} value={p.value}>{p.label}</Option>)}
              </Select>
            </div>
          ) : null
        }
        {
          ProductStockVisible ? (
            <ProductStockModal
              visible={ProductStockVisible}
              productids={productids}
              entityid={this.props.mainEntityId}
              onCancel={this.onCancelProductStockModal}
            />
          ) : null
        }
      </div>
    );
  }
}

export default connect(
  state => state.app
)(RelTableView);
