import React from 'react';
import { Table, Input, Button, Select } from 'antd';
import { connect } from 'dva';

class CreatEntity extends React.Component {

  static propTypes = {
    entityFieldListForAdd: React.PropTypes.array,
    entityList: React.PropTypes.array,
    onEntityChange: React.PropTypes.func,
    onSave: React.PropTypes.func,
  };

  	constructor(props) {
	    super(props);
		this.state = {
			selectedEntity:undefined,
			selectedField:undefined,
			relName:''
		};
		this.onSaveEntity = this.onSaveEntity.bind(this);	 
		this.handleInputChange = this.handleInputChange.bind(this);	
	}

	onSaveEntity(){
		var entityField = null;
		for (var item of Array.from(this.props.entityFieldListForAdd)) {
			if (item.fieldid = this.state.selectedField){
				entityField = item;
			}
		  }
		
		this.props.onSave(this.state.selectedField,entityField.icons,this.state.selectedEntity,this.state.relName);
	}

  	handleInputChange(event) {

  		this.state.relName = event.target.value
    }

	entityChange = value =>{
		this.props.onEntityChange(value);
		this.setState({
			selectedEntity:value,
			selectedField:undefined
	    });
	};

	fieldChange = value =>{
		this.setState({
			selectedField:value
	    });
	};

    render() {
    return (
    	<div style={{ margin: '20px 0px' }}>
			<Input onChange={this.handleInputChange} placeholder="请输入页签名称" style={{ width: 150}}></Input>
		    <Select
		      value={this.state.selectedEntity}
	          style={{ width: 150,marginLeft:15 }}
	   	      placeholder="请选择关联实体"
	   	      onChange={this.entityChange}>
			    {this.props.entityList.map(t => (
                  <Option value={t.entityid} key={t.entityid}>{t.entityname}</Option>
                ))}
	        </Select>
	        <Select          
	          value={this.state.selectedField}
	          style={{ width: 150,marginLeft:15 }}
	   	      placeholder="请选择关联字段"
	   	      onChange={this.fieldChange}>
			  	{this.props.entityFieldListForAdd.map(t => (
                  <Option value={t.fieldid} key={t.fieldid}>{t.datasrcname}</Option>
                ))}
	        </Select>
	        <Button onClick={this.onSaveEntity} style={{marginLeft:15}}>添加页签</Button>
		</div>
    );
  }
}

 export default CreatEntity;