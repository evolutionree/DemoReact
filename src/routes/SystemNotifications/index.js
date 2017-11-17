import React from 'react';
import { connect } from 'dva';
import { Card, Col, Row, Table, Checkbox, Input, Button} from 'antd';
import styles from './SystemNotifications.less';
import Page from '../../components/Page';
import NotificationsNode from './NotificationsNode.js';

function SystemNotifications({dispatch,systemNotifications,...state}){


	const Column = Table.Column;
	const items = systemNotifications ? systemNotifications : [];
	const length = items.length;
	function saveButtonOnClick(items){
		const configList = [];
		const setTypeList = [];
		{
			items.map((item, index) => {
				if(item.items){
					item.items.map((item, index) => {
						if(item.ischeck == true){
							const newItem = {id:item.itemid ? item.itemid : item.dicid, dicid:item.dicid, dictypeid:item.dictypeid};
							Array.prototype.push.call(configList,newItem);
						}
					})
					Array.prototype.push.call(setTypeList,item.items[0].dictypeid);
				}
			})
		}
		dispatch({type: 'systemNotifications/save',  payload:{items,configList,setTypeList} });
		
	}

	return (
		<Page title="系统提醒">
						<NotificationsNode
							items={items}
							onSave={saveButtonOnClick}
						/>
		</Page>
	);
}

export default connect(state => state.systemNotifications)(SystemNotifications);