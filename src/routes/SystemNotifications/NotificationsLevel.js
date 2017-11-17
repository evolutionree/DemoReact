import React from 'react';
import { Card, Col, Row, Table, Checkbox, Input} from 'antd';
import styles from './SystemNotifications.less';

class NotificationsLevel extends React.Component {
  static propTypes = {
    items: React.PropTypes.array,
    parentIndex: React.PropTypes.number,
    onChange: React.PropTypes.func
  };

  	constructor(props) {
	    super(props);
		this.state = {
			levelItems: this.props.items,
		};
	    this.handleChecked = this.handleChecked.bind(this);
	    this.renderItem = this.renderItem.bind(this);
	    this.handleItemChange = this.handleItemChange.bind(this);
	  }

	handleChecked(val,index){
    	const levelItem = this.props.items[index];
	   	if(levelItem){
	   		levelItem.ischeck = val;
	   		this.handleItemChange(levelItem,index);
	   	}
    	
	  }

	handleItemChange(levelItem,index){
    	this.props.items[index] = levelItem;
    	this.props.onChange(this.props.items,this.props.parentIndex);
    }

	renderItem(item, index, { length }) {
	    //const { onOrderUp, onOrderDown, onSwitch, onDel } = this.props;
	    const isFirst = index === 0;
	    const isLast = index === length - 1;
	    //Object.assign(obj, { bar: true });
	    if(item.ischeck === undefined){
	    	item.ischeck  = item.itemid ? true : false;
			//this.handleItemChange(item,index);
	    }
	    return (
			<span style={{paddingLeft: '20px'}} key={index} >
				<Checkbox id = {item.dicid} className={styles.notificationscheckboxspan} checked={item.ischeck} onChange={(event) => this.handleChecked(event.target.checked,index)}>{item.dataval}</Checkbox>
			</span>
	    );
	  }

	  render() {
  		return(
  			<div>
			 {this.props.items.map(this.renderItem)}
			</div>
  		);
	  }

}

export default NotificationsLevel;