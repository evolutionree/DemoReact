import React from 'react';
import { Card, Col, Row, Table, Checkbox, Input, Button} from 'antd';
import styles from './SystemNotifications.less';
import Page from '../../components/Page';
import NumericInput from './NumericInput.js';
import NotificationsLevel from './NotificationsLevel.js';
import { connect } from 'dva';

class NotificationsNode extends React.Component {
  static propTypes = {
    items: React.PropTypes.array,
    onSave: React.PropTypes.func
  };

  	constructor(props) {
	    super(props);
		this.state = {
			items: this.props.items,
		};
	    this.handleInputChange = this.handleInputChange.bind(this);
	    this.handleChecked = this.handleChecked.bind(this);
	    this.renderItem = this.renderItem.bind(this);
	    this.handleItemChange = this.handleItemChange.bind(this);
	    this.handleLevelItemChange = this.handleLevelItemChange.bind(this);
	    this.saveButtonOnClick = this.saveButtonOnClick.bind(this);	      
	  }

  	handleInputChange(val,index) {
    	const item = this.props.items[index];
	   	if(item){
	   		item.checkday = val;
	   		this.handleItemChange(item,index);
	   	}
    }

    handleItemChange(item,index){
    	this.state.items[index] = item;
    	this.setState({
    		items: this.state.items
    	});
    }

    handleLevelItemChange(items,index){
    	this.props.items[index].items = items;
	    this.setState({
	    		items: this.props.items
    	});
    }

    handleChecked(val,index){
    	const item = this.props.items[index];
	   	if(item){
	   		item.recstatus = val ? 1 : 0 ;
	   		this.handleItemChange(item,index);
	   	}
	 }

	saveButtonOnClick(){
		//dispatch({type: 'systemNotifications/save'});
		this.props.onSave(this.props.items)
	}

	renderItem(item, index, { length }) {
	//const { onOrderUp, onOrderDown, onSwitch, onDel } = this.props;
	const isFirst = index === 0;
	const isLast = index === length - 1;

	return (
	<div key={index}>
		<Row key= {item.id} type="flex" align="middle"  style={isFirst ? {} : {marginTop: '20px'}}>
			<Col span={1}></Col><Col span={5}><Checkbox className={styles.notificationscheckboxspan} checked={item.recstatus === 1 ? true : false} onChange={(event) => this.handleChecked(event.target.checked,index)}>{item.name}</Checkbox></Col>
			<Col span={14} >
				<span>{item.jobdesc.split('{0}')[0]}</span>
				<span className={styles.notificationsinput}><NumericInput value={item.checkday} onChange={(value) => this.handleInputChange(value,index)} style={{marginLeft: '3px', marginRight: '3px'}}></NumericInput></span>
				<span>{item.jobdesc.split('{0}')[1]}</span>
			</Col>
		</Row>
		{item.items ? 
			(<Row type="flex" align="middle" style={{marginTop: '20px'}}>
				<Col span={1}></Col><Col span={3}><span style={{paddingLeft: '19px'}}>提醒的客户级别</span></Col>
				<Col span={14} >
					<NotificationsLevel
						items={item.items}
						parentIndex={index}
						onChange={this.handleLevelItemChange}
					/>
				</Col>
			</Row>) : '' 	
		}
	</div>
	);
	}

    render() {
    return (
    	<div>
		 {this.props.items.map(this.renderItem)}
		 <Col span={1}></Col>
		 <row span={5}><Button type="primary" style={{marginTop:'20px'}} onClick={this.saveButtonOnClick}>保存</Button></row>
		</div>
    );
  }
}
 export default NotificationsNode;