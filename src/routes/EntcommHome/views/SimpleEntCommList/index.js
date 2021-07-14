import { Component } from "react";
import { Table, Modal, Button, message, Icon, Menu, Dropdown } from 'antd';
import { Link } from 'dva/router';
import IntlText from "../../../../components/UKComponent/Form/IntlText";
import { connect } from 'dva';
import _ from 'lodash';
import styles from './style.less';
import classnames from 'classnames';
import request from "../../../../utils/request";

const  protocol =[
    {
      controltype:1,
      defaultvalue:null,
      defaultwidth:200,
      displayname:'协议名称',
      displayname_lang:{cn: '协议名称', tw: '協議名稱'},
      fieldconfig:{style: 1, regExp: '', scanner: 0, encrypted: 0, isVisible: 1},
      fieldid:'99bb657c-aec9-4c41-b08d-e3ecc4773fd1',
      fieldlabel:'协议名称',
      fieldlabel_lang:{cn: '协议名称', tw: '協議名稱'},
      fieldname:'customername',
      fieldtype:0,
      isreadonly:false,
      isrequire:false,
      isvisible:true,
      typeid:'2c63b681-1de9-41b7-9f98-4cf26fd37e11'},
      {
      controltype:1,
      defaultvalue:null,
      defaultwidth:200,
      displayname:'部门',
      displayname_lang:{cn: '部门', tw: '部門'},
      fieldconfig:{style: 1, regExp: '', scanner: 0, encrypted: 0, isVisible: 1},
      fieldid:'99bb657c-aec9-4c41-b08d-e3ecc4773fd2',
      fieldlabel:'部门',
      fieldlabel_lang:{cn: '部门', tw: '部門'},
      fieldname:'signdept',
      fieldtype:0,
      isreadonly:false,
      isrequire:false,
      isvisible:true,
      typeid:'2c63b681-1de9-41b7-9f98-4cf26fd37e21'},
      {
      controltype:1006,
      defaultvalue:null,
      defaultwidth:200,
      displayname:'签约人',
      displayname_lang:{cn: '签约人', tw: '簽約人'},
      fieldconfig:{style: 1, regExp: '', scanner: 0, encrypted: 0, isVisible: 1},
      fieldid:'99bb657c-aec9-4c41-b08d-e3ecc4773fd3',
      fieldlabel:'签约人',
      fieldlabel_lang:{cn: '签约人', tw: '簽約人'},
      fieldname:'recmanager',
      fieldtype:0,
      isreadonly:false,
      isrequire:false,
      isvisible:true,
      typeid:'2c63b681-1de9-41b7-9f98-4cf26fd37e31'},
      {
      controltype:1,
      defaultvalue:null,
      defaultwidth:200,
      displayname:'协议有效期',
      displayname_lang:{cn: '协议有效期', tw: '協議有效期'},
      fieldconfig:{style: 1, regExp: '', scanner: 0, encrypted: 0, isVisible: 1},
      fieldid:'99bb657c-aec9-4c41-b08d-e3ecc4773fd4',
      fieldlabel:'协议有效期',
      fieldlabel_lang:{cn: '协议有效期', tw: '協議有效期'},
      fieldname:'validity',
      fieldtype:0,
      isreadonly:false,
      isrequire:false,
      isvisible:true,
      typeid:'2c63b681-1de9-41b7-9f98-4cf26fd37e41'}]
class SimpleEntCommList extends Component{
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
    
    constructor(props){
        super(props);
        this.state={ 
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
            DataSourceDetailModalTitle: '',
            DataSource:[],
        }
    }

    componentDidMount() {
        this.queryData(this.props.params.recordId);
      }
    
      queryData(custId) {
        request('/api/customer/getcustframeprotocol', {
          method: 'post', body: JSON.stringify({ CustId: custId })
        }).then((result) => {
          this.setState({
            DataSource: result.data || []
          });
        });
      }

    getColumns = () => {
        const {  ignoreRecName } = this.props;
    
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
            ...normalStyle
              // maxWidth: '340px'
          };
    
          const sortFieldAndOrder = this.props.sortFieldAndOrder;
    
          let filterObj = {};
          if (this.props.onFilter) {
            filterObj = {
              filterDropdown: has_No_Filter_Field.indexOf(field.controltype) > -1 ? null : (
                <FilterDrop
                  visible={!!this.state.filterVisible[field.fieldname]}
                  field={field}
                  value={this.props.ColumnFilter[field.fieldname]}
                  onFilter={this.onFilter}
                  hideFilter={this.hideFilter}
                />
              ),
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
            title: <IntlText name="displayname" value={field} />,
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
        return this.renderText(cellText, field, record);
      };

      renderText = (text, field, record) => {
        let text_ = text;
        if (typeof text_ === 'object' && text_ !== null) {
          text_ = JSON.stringify(text_);
        }
    
        const { iflinkfield, linkfieldname } = (field || {}).fieldconfig || {};
        if (iflinkfield && linkfieldname && record[linkfieldname]) {
          const rtxt = record[linkfieldname];
          const linkUrl = rtxt.indexOf('http') === 0 ? rtxt : `http://${rtxt}`;
          return <a title={text_} href={linkUrl} target="_blank">{text_ || '(查看连接)'}</a>;
        } else if (text_ && typeof text_ === 'string' && (text_.indexOf('http') === 0 || text_.indexOf('www') === 0)) {
          const linkUrl = text_.indexOf('http') === 0 ? text_ : `http://${text_}`;
          return <a title={text_} href={linkUrl} target="_blank">{text_}</a>;
        }
    
        return <span title={text_}>{text_}</span>;
      };
    
    
      getColumnsTotalWidth(columns) { //获取列表的总宽度
        let columnsTotalWidth = 0;
        columns.map((item) => {
          columnsTotalWidth += item.width;
        });
        return columnsTotalWidth;
      }

      getDefaultProtocol() { //默认的协议
    
        const cloneProtocol = _.cloneDeep(protocol);
        // 过滤掉分组
        const filterField = cloneProtocol.filter(field => {
          return field.controltype !== 20;
        });
    
        const defaultProtocol = filterField.map(item => {
          item.columnConfig = { //整合成 设置表头Modal需要的UI数据
            fieldid: item.fieldid,
            isdisplay: 1,
            width: item.defaultwidth < 100 ? 100 : item.defaultwidth //后端会给定默认列宽，没给则默认设置为100
          };
          return item;
        });
    
        return defaultProtocol;
      }
    

      getcombineCustomProtocol() { //web列表返回的字段协议 与 个人列定义的协议 做交集处理
        const defaultProtocol = this.getDefaultProtocol();
        const customProtocol = this.state.customProtocol;
    
        //个人定义的列表数据 可能和 web列表定义的数据 不一致（web列表定义的字段可以在配置做修改） 先优先处理个人定义的数据（在web列表定义中存在）,再添加在个人定义不存在但在web定义存在的数据
        const newProtocol = [];
        for (let i = 0; i < customProtocol.length; i++) {
          const findFilterFieldIndex = _.findIndex(defaultProtocol, item => item.fieldid === customProtocol[i].fieldid);
          if (findFilterFieldIndex > -1) {
            const column = defaultProtocol[findFilterFieldIndex];
            column.columnConfig = {
              fieldid: customProtocol[i].fieldid,
              isdisplay: customProtocol[i].isdisplay,
              width: customProtocol[i].width
            };
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

    
        render() {
            const {  ignoreRecName, fixedHeader, ...restProps } = this.props;
            const { DataSource } = this.state;
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

            const style = fixedHeader ? { height: this.state.height - this.props.otherHeight } : {};
            
            return (
                <div>
                <Table
                  scroll={fixedHeader ? { x: scrollX + 6, y: this.state.height - this.props.otherHeight - 104 } : { x: '100%' }}
                  className={classnames({
                    [styles.dynamictable]: true,
                    [styles.notFixedHeaderTable]: !fixedHeader
                  })}
                  style={{ ...style }}
                  {...restProps}
                  dataSource={DataSource}
                  columns={columns}
                />
               </div>
            );
    //         return (
    //         <Page title={entityName}>
                
    //             <DetailModal
    //               entityId="e450bfd7-ff17-4b29-a2db-7ddaf1e79342"
    //               title={recordName}
    //               recordId={recordId}
    //               visible={detailModalVisible}
    //               onCancel={this.cancelDetailModal}
    //             />
    //         </Page>
    // );
    }
}
export default connect(
    state => state.app,
    null,
    undefined,
    { withRef: true }
  )(SimpleEntCommList);