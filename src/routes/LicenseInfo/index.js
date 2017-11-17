import React from 'react';
import { connect } from 'dva';
import { Card, Col, Row } from 'antd';
import styles from './LicenseInfo.less';
import Page from '../../components/Page';


function LicenseInfo({dispatch, licenseInfo}) {
    const company = licenseInfo ? licenseInfo.company :'';
	const endtime = licenseInfo ? licenseInfo.endtime :'';
    const totaluser = licenseInfo ? licenseInfo.totaluser : 0;
    const usercount = licenseInfo ? licenseInfo.usercount : 0;
    const allowregcount = licenseInfo ? licenseInfo.allowregcount : 0;
    return (
        <Page title="授权信息" >
			<div>
  				<Row gutter={16} style={{padding: '1px'}}>
			        <Card title="授权单位" extra="截止时间" bordered={false} >
			        	<Row gutter={16}>
				        	<Col span={16}>
								<h3>{company}</h3>				        	
				        	</Col>
				        	<Col span={8} style={{padding: '0px'}}>
				        		<p className={styles.endTime}>{endtime}</p>
				        	</Col>			        	
    			    	</Row>
			        </Card>	    
			    </Row>			
  				<Row gutter={16} style={{padding: '1px'}}>
			    	<Col span={8}>
			        	<Card title="总授权人数" bordered={false}>{totaluser}</Card>
		   			 </Col>
			    	<Col span={8}>
			        	<Card title="已授权人数" bordered={false}>{usercount}</Card>
			  		</Col>
			      	<Col span={8}>
			        	<Card title="可授权人数" bordered={false}>{allowregcount}</Card>
			        </Col>
		    	</Row>
		  	</div>
    	</Page>
    );
}

export default connect(
    state => state.licenseInfo
)(LicenseInfo)