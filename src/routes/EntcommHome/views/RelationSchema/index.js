/**
 * Created by 0291 on 2017/7/10.
 */
 import React, { PropTypes, Component } from 'react';
 import { connect } from 'dva';
 import { Button, Select } from 'antd';
 import EchartsReact from '../../../ReportForm/component/Chart/EchartsReact';
 // then import echarts modules those you have used manually.
 import echarts from 'echarts';
 
 class RelationSchema extends Component {
   static propTypes = {};
   static defaultProps = {};
 
   constructor(props) {
     super(props);
     this.state = {
 
     };
   }
 
   componentDidMount() {
 
   }
 
   componentWillReceiveProps(nextProps) {
 
   }
 
   render() {
     const option = {
       title: {
         text: `${this.props.recname}的关系图谱`,
         left: 'center'
       },
       tooltip: {
         formatter: function (x) {
           return x.data.des;
         }
       },
       series: [
         {
           type: 'graph',
           layout: 'force',
           symbolSize: 55,
           roam: true,
           focusNodeAdjacency: true,
           edgeSymbol: ['circle', 'arrow'],
           edgeSymbolSize: [4, 10],
           edgeLabel: {
             normal: {
               textStyle: {
                 fontSize: 16
               }
             }
           },
           force: {
             repulsion: 500,
             edgeLength: [10, 50]
           },
           draggable: true,
           itemStyle: {
             normal: {
               color: '#3398db',
               borderColor: '#fff',
               borderWidth: 1,
               shadowBlur: 10,
               shadowColor: 'rgba(0, 0, 0, 0.3)'
             }
           },
           lineStyle: {
             normal: {
               color: 'source',
               curveness: 0.3
             }
           },
           edgeLabel: {
             normal: {
               show: true,
               formatter: function (x) {
                 return x.data.name;
               }
             }
           },
           label: {
             normal: {
               show: true,
               textStyle: {
               }
             }
           },
           data: this.props.data.map((item, idx) => {
             return {
               name: item.name,
               x: (item.x || item.x === 0) ? item.x : 100 + 100 * (idx + 1),
               y: (item.y || item.y === 0) ? item.y : 300,
               itemStyle: item.name === this.props.recname ? {
                 normal: {
                   color: '#ff8b3c'
                 }
               } : null
             };
           }),
           links: this.props.linkData
         }
       ]
     };
     return (
       <div style={{ height: document.documentElement.clientHeight + 200 }}>
         <div>
           <Select defaultValue={3} value={this.props.levelValue} style={{ width: 120 }} onChange={(levelValue) => this.props.onSearch(levelValue)}>
             <Option value={1}>一级</Option>
             <Option value={2}>二级</Option>
             <Option value={3}>三级</Option>
             <Option value={4}>四级</Option>
           </Select>
           {/* <Button style={{ marginLeft: '10px' }} onClick={this.props.onSearch}>搜索</Button> */}
         </div>
         <EchartsReact
           echarts={echarts}
           showLoading={this.props.loading}
           style={{ width: '100%', height: '100%' }}
           option={option}
           notMerge
           lazyUpdate
         />
       </div>
     );
   }
 }
 
 export default connect(
   state => {
     return {
       data: state.relationschema.data,
       linkData: state.relationschema.linkData,
       loading: state.relationschema.loading,
       levelValue: state.relationschema.levelValue,
       recname: state.entcommHome.recordDetail.recname
     };
   },
   dispatch => {
     return {
       levelhandleChange(levelValue) {
         dispatch({ type: 'relationschema/putState', payload: { levelValue } });
       },
       onSearch(levelValue) {
         dispatch({ type: 'relationschema/onSearch', payload: { levelValue } });
       }
     };
   }
 )(RelationSchema);
 