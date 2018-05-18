/**
 * Created by 0291 on 2018/3/20.
 */
import React, { Component, PropTypes } from 'react';
import { Select, Button, Icon, Modal, message } from 'antd';
import SelectDataSource from './SelectDataSource';
import _ from 'lodash';
import Styles from './RelBusiness.less';

const Option = Select.Option;

class RelBusiness extends Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]), // JSON格式, { id, name }
    // value_name: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func,
    dataSource: PropTypes.shape({
      entityId: PropTypes.string,
      entityName: PropTypes.string,
      datasourceid: PropTypes.string.isRequired,
      datasourcename: PropTypes.string
    }),
    designateDataSource: PropTypes.object,
    multiple: PropTypes.oneOf([0, 1]),
    isReadOnly: PropTypes.oneOf([0, 1]),
    placeholder: PropTypes.string
  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    const { dataSource } = this.props;
    const config = dataSource && dataSource.config;
    this.state = {
      sourceId: config && config instanceof Array && config.length > 0 && config[0].datasourceid,
      dataSourceValue: undefined
    };
  }

  setValue = val => {
    this.props.onChange(val, true);
  };

  changeSourceId = (value) => {
    const newValue = {
      sourceId: value,
      dataSourceValue: undefined
    }
    this.props.onChange(newValue, true);
  }

  onSelectDataSource = (value) => {
    const { sourceId } = this.props.value;
    const newValue = {
      sourceId: sourceId,
      dataSourceValue: value
    };
    this.props.onChange(newValue, true);
  }

  render() {
    const { dataSource, value: formItemValue, multiple } = this.props;
    return (
      <div className={Styles.ReBusinessWrap}>
        <Select style={{ width: '150px', float: 'left' }} onChange={this.changeSourceId} value={formItemValue && formItemValue.sourceId}>
          {
            dataSource && dataSource.config && dataSource.config instanceof Array && dataSource.config.map((item, index) => {
              return <Option key={index} value={item.datasourceid}>{item.entityname || '无'}</Option>;
            })
          }
        </Select>
        <SelectDataSource style={{ width: 'calc(100% - 154px)', display: 'inline-block', marginLeft: '4px' }} dataSource={{
          type: 'network',
          sourceId: this.state.sourceId
        }} placeholder="请选择数据源" value={formItemValue && formItemValue.dataSourceValue} onChange={this.onSelectDataSource} multiple={multiple} />
      </div>
    );
  }
}


export default RelBusiness;

//2018-5-18 废弃
// class RelBusiness extends Component {
//   static propTypes = {
//     value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]), // JSON格式, { id, name }
//     // value_name: PropTypes.string,
//     onChange: PropTypes.func.isRequired,
//     onFocus: PropTypes.func,
//     multidataSource: PropTypes.shape({
//       sourceId: PropTypes.string.isRequired,
//       entityId: PropTypes.string,
//       entityName: PropTypes.string,
//       sourceName: PropTypes.string
//     }),
//     designateDataSource: PropTypes.object,
//     multiple: PropTypes.oneOf([0, 1]),
//     isReadOnly: PropTypes.oneOf([0, 1]),
//     placeholder: PropTypes.string
//   };
//   static defaultProps = {
//     dataRange: 0
//   };
//
//   constructor(props) {
//     super(props);
//     const { multidataSource, value } = this.props;
//     this.state = {
//       panelVisible: value && value instanceof Array && value.length > 0 ? false : true,
//       sourceId: multidataSource && multidataSource instanceof Array && multidataSource.length > 0 && multidataSource[0].sourceId,
//       dataSourceValue: undefined
//     };
//   }
//
//   setValue = val => {
//     this.props.onChange(val, true);
//   };
//
//   openAddPanel = (e) => {
//     const { multidataSource } = this.props;
//     this.setState({
//       panelVisible: true,
//       sourceId: multidataSource && multidataSource instanceof Array && multidataSource.length > 0 && multidataSource[0].sourceId
//     });
//   }
//
//   closeAddPanel = () => {
//     this.setState({
//       panelVisible: false
//     });
//   }
//
//   changeSourceId = (value) => {
//     this.setState({
//       sourceId: value,
//       dataSourceValue: undefined
//     });
//   }
//
//   addData = () => {
//     if (!this.state.dataSourceValue) {
//       message.warning('请选择数据源');
//       return false;
//     }
//     const addData = JSON.parse(this.state.dataSourceValue);
//
//     const { multidataSource, value } = this.props;
//     const selectSource = _.find(multidataSource, item => this.state.sourceId === item.sourceId);
//
//     this.props.onChange && this.props.onChange([
//       ...(value || []),
//       {
//         sourceId: selectSource.sourceId,
//         sourceName: selectSource.sourceName,
//         ...addData
//       }
//     ]);
//
//     this.setState({
//       panelVisible: false,
//       sourceId: multidataSource && multidataSource[0].sourceId,
//       dataSourceValue: undefined
//     });
//   }
//
//   delData = (delIndex) => {
//     confirm({
//       title: '你确定删除该数据吗?',
//       content: '',
//       onOk: () => {
//         const { value } = this.props;
//         const newValue = value && value instanceof Array && value.filter((item, index) => {
//             return index !== delIndex;
//         });
//         this.props.onChange && this.props.onChange(newValue);
//       },
//       onCancel() {}
//     });
//   }
//
//   render() {
//     const { multidataSource, value } = this.props;
//     const hasData = value && value instanceof Array && value.length > 0;
//     return (
//       <div className={Styles.ReBusinessWrap}>
//         <div className={Styles.dataWrap}>
//           <ul style={{ width: 'calc(100% - 25px)' }}>
//             {
//               value && value instanceof Array && value.map((item, index) => {
//                 return (
//                   <li key={index}>
//                     <span>{item.sourceName}-{item.name}</span>
//                     <Icon type="close" onClick={this.delData.bind(this, index)} />
//                   </li>
//                 );
//               })
//             }
//           </ul>
//           <Icon type="plus" onClick={this.openAddPanel} style={{ display: hasData ? 'block' : 'none' }} />
//         </div>
//         <div style={{ display: this.state.panelVisible ? 'block' : 'none' }} className={Styles.addPanel}>
//           <div className={Styles.operate}>
//             <Select style={{ width: '150px', float: 'left' }} onChange={this.changeSourceId} value={this.state.sourceId}>
//               {
//                 multidataSource && multidataSource instanceof Array && multidataSource.map((item, index) => {
//                   return <Option key={index} value={item.sourceId}>{item.entityName || '无'}</Option>;
//                 })
//               }
//             </Select>
//             <SelectDataSource style={{ width: 'calc(100% - 154px)', display: 'inline-block', marginLeft: '4px' }} dataSource={{
//               type: 'network',
//               sourceId: this.state.sourceId
//             }} placeholder="请选择数据源" value={this.state.dataSourceValue} onChange={value => this.setState({ dataSourceValue: value })} />
//           </div>
//           <div className={Styles.footer}>
//             <Button type="default" onClick={this.closeAddPanel} disabled={hasData ? false : true}>取消</Button>
//             <Button onClick={this.addData}>确定</Button>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }
//
//
// export default RelBusiness;
