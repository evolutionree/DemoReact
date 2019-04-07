/**
 * Created by 0291 on 2018/7/31.
 */
import React, {  PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Menu, Modal, Select, Table, Input, message } from 'antd'
import Page from '../../../components/Page';
import Search from '../../../components/Search';
import { SaveApiInfo } from '../../services/webapiinspector';
import styles from './styles.less';
import _ from "lodash";
const Column = Table.Column;
const Option = Select.Option;

const contentStyle = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  padding: 0
};
class WebApiInspector extends PureComponent {
    static propTypes = {};
    static defaultProps = {};
  
    constructor(props) {
      super(props);
      this.state = {
          searchkey:'',
          CurrentSelectedItem:{}
      };
    }
searchEntity = (searchKey) =>{
    this.setState({searchkey:searchKey});   
}
selectApi = (searchKey) =>{
    const { webapis }  =this.props;
    var selectedapis = webapis.filter((api) => { return api.fullpath === searchKey} );
    console.log(selectedapis);
    this.setState({CurrentSelectedItem:selectedapis[0]});   
}
ApiNameChange=(value) =>{
    const { CurrentSelectedItem } = this.state;
    if (CurrentSelectedItem == undefined || CurrentSelectedItem == null )return ;
    this.setState({CurrentSelectedItem:{...CurrentSelectedItem ,morename:value.target.value}});
}
ApiDescriptionChange=(value) =>{
    const { CurrentSelectedItem } = this.state;
    if (CurrentSelectedItem == undefined || CurrentSelectedItem == null )return ;
    this.setState({CurrentSelectedItem:{...CurrentSelectedItem ,moredescription:value.target.value}});
}
ApiRequestChange=(value) =>{
    const { CurrentSelectedItem } = this.state;
    if (CurrentSelectedItem == undefined || CurrentSelectedItem == null )return ;
    this.setState({CurrentSelectedItem:{...CurrentSelectedItem ,requestsample:value.target.value}});
}
ApiResponseChange=(value) =>{
    const { CurrentSelectedItem } = this.state;
    if (CurrentSelectedItem == undefined || CurrentSelectedItem == null )return ;
    this.setState({CurrentSelectedItem:{...CurrentSelectedItem ,responsesample:value.target.value}});
}
ParameterNameChange=(record,value) =>{
    const { CurrentSelectedItem } = this.state;
    record.parametercnname = value.target.value;
    this.setState({CurrentSelectedItem:{ ...CurrentSelectedItem }});
}
ParameterDescriptionChange=(record,value) =>{
    const { CurrentSelectedItem } = this.state;
    record.description = value.target.value;
    console.log(record);
    this.setState({CurrentSelectedItem:{ ...CurrentSelectedItem }});
}
SaveAction = () =>{
    const { CurrentSelectedItem } = this.state;
    const { updateapilist } = this.props;
    SaveApiInfo(CurrentSelectedItem).then(result => {
        message.info('保存成功');
        updateapilist();
      }, err => {
        //this.setState({ loading: false });
        message.error(err.message || '，保存失败');
      });
}
  render() {
    const {
        queries,
        webapis
      } = this.props;
      const selectedEntity = _.find(webapis, ['fullpath', queries.fullpath]);
      const { searchkey,CurrentSelectedItem }  =this.state;
      console.log("计算后的值:" + ((CurrentSelectedItem.morename != null && CurrentSelectedItem.morename != '' ) ?
      CurrentSelectedItem.morename  : CurrentSelectedItem.apiname));
      const  apiname = (CurrentSelectedItem.morename != null && CurrentSelectedItem.morename != '' ) ?
      CurrentSelectedItem.morename  : CurrentSelectedItem.apiname;
    return (
        <Page title="服务器接口查询" contentStyle={contentStyle}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <div className={styles.box}>
              <div className={styles.leftContent}>
                <div className={styles.subtitle}>接口列表</div>
                <div style={{ marginBottom: '15px' }}>
                  <Search width='300px' placeholder="输入【接口地址、接口名称或者接口备注】进行搜索" value={searchkey} onSearch={this.searchEntity} />
                </div>
                <div>
                  <Menu
                    selectedKeys={[queries.fullpath]}
                    style={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'hidden' }}
                    onSelect={event => this.selectApi(event.key) }
                  >
                    {webapis.filter(api=>{
                        return (
                        searchkey == undefined 
                        || searchkey === '' 
                        || (api.apiname!= undefined && api.apiname != null && api.apiname.includes(searchkey))
                        || (api.morename!= undefined && api.morename != null && api.morename.includes(searchkey))
                        || (api.fullpath.includes(searchkey))
                        || (api.selfdescription != undefined && api.selfdescription !=null 
                                    && api.selfdescription.includes(searchkey))
                        || (api.moredescription != undefined && api.moredescription !=null 
                                                && api.moredescription.includes(searchkey))
                                    );
                    }).map(api => (
                      <Menu.Item key={api.fullpath}>{
                          (
                              (api.morename !=undefined && api.morename!=null && api.morename!='')
                                ?
                                    api.morename
                                :
                                    (
                                        (api.apiname !=undefined && api.apiname != null  && api.apiname != '') 
                                        ?
                                            api.apiname
                                        :
                                        api.fullpath
                                    )
                        )
        
                        }       </Menu.Item>
                    ))}
                  </Menu>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.box}>
              <div className={styles.rightContent}>
                <div className={styles.subtitle}>{selectedEntity && selectedEntity.fullpath}</div>
                <div><label style={{'width':100,'display':'inline-block','font-weight':'bold'}} > 接口路径: </label>  <label > {CurrentSelectedItem.fullpath} </label></div>
                <div><label style={{'width':100,'display':'inline-block','font-weight':'bold'}} > 文件名称: </label>  <label > {CurrentSelectedItem.dllname} </label></div>
                <div><label style={{'width':100,'display':'inline-block','font-weight':'bold'}} > 类名: </label>  <label > {CurrentSelectedItem.classname} </label></div>
                <div><label style={{'width':100,'display':'inline-block','font-weight':'bold'}} > 方法名: </label>  <label > {CurrentSelectedItem.methodname} </label></div>
                <div><label style={{'width':100,'display':'inline-block','font-weight':'bold'}}  > 接口名称: </label>  
                    <Input style={{"display": "inline-block",'width':500}} 
                            value={apiname} onChange={this.ApiNameChange.bind()} />
                </div>
                <div >
                    <label style={{'width':100,'display':'inline-block','font-weight':'bold'}}  > 接口参数: </label> 
                    {
                        ((CurrentSelectedItem==undefined || CurrentSelectedItem == null || 
                            CurrentSelectedItem.parameters == undefined || CurrentSelectedItem.parameters==null
                            ||  CurrentSelectedItem.parameters.length == 0 ))
                        ?
                        (<label>无参数</label> )
                        :
                        (
                            <Table
                                    rowKey = {(record)=>(CurrentSelectedItem.fullpath+'_' + record.parametername)}
                                    pagination={false}
                                    dataSource={CurrentSelectedItem.parameters}
                                >
                                    <Column 
                                    width='100px'
                                    title="参数名称"
                                    key="parametername"
                                    dataIndex="parametername"
                                    />
                                    <Column 
                                        width='200px'
                                        title="中文名称" key="parametercnname" dataIndex="parametercnname"  
                                        render={(text, record) => (
                                            <Input style={ {"display" : "inline-block"} } 
                                            defaultValue={ record.parametercnname}
                                            onChange={this.ParameterNameChange.bind(this,record)} />
                                    )} 
                                    
                                    />
                                    <Column 
                                        width='200px'
                                        title="类型" key="parametertype" dataIndex="parametertype" />
                                    <Column title="备注" key="description" dataIndex="description"  
                                            render={(text, record) => (
                                                    <Input type="textarea" style={ {"display" : "inline-block"} } 
                                                        defaultValue={ record.description} 
                                                        onChange = {this.ParameterDescriptionChange.bind(this,record)}
                                                    />
                                            )}
                                            
                                    />
                                </Table>
                        )
                    }
                </div>
                <div><label style={{'width':100,'display':'inline-block','font-weight':'bold'}} > 备注: </label>  
                    <Input  type="textarea"  style={{"display": "inline-block"}} 
                            value={(CurrentSelectedItem.moredescription != null && CurrentSelectedItem.moredescription != '' ) 
                                        ?CurrentSelectedItem.moredescription  : CurrentSelectedItem.selfdescription} 
                                        
                            onChange={this.ApiDescriptionChange.bind()}/>
                </div>

                <div><label style={{'width':100,'display':'inline-block','font-weight':'bold'}} > 请求参数样例: </label>  
                    <Input  type="textarea"  style={{"display": "inline-block"}} 
                            value={CurrentSelectedItem.requestsample} 
                            onChange = {this.ApiRequestChange.bind()}/>
                </div>
                <div><label style={{'width':100,'display':'inline-block','font-weight':'bold'}} > 返回值样例: </label>  
                    <Input  type="textarea"  style={{"display": "inline-block"}} 
                            value={CurrentSelectedItem.responsesample} 
                            onChange = {this.ApiResponseChange.bind()}/>
                </div>
                <div> <Button onClick={this.SaveAction.bind()}> 保存</Button></div>
              </div>
            </div>
          </div>
        </div>
      </Page>
    )
  }
}
export default connect(
    state => state.webapiinspector,
    dispatch => {
      return {
        updateapilist() {
            dispatch({ type: 'webapiinspector/queryList' });
          },
      };
    }
  )(WebApiInspector);
  