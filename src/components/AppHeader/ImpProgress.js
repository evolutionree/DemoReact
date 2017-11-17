import React, { PropTypes } from 'react';
import { Progress, Row, Col } from 'antd';
import styles from './styles.less';

const ImpProgress = ({entity, entryname, percent}) => {

    return (
        <div className={styles.importItem}>
          {
               percent === 100 ? 
                <Row><Col span={19}>导入{entryname}完成</Col>
                <Col span={5}></Col></Row>:<Row>
                <Col span={20}>正在导入{entryname}</Col>
                  <Col span={4} style={{
                      textAlign: 'right'
                }} >{percent}%</Col></Row>
          }
          {  
            percent === 100 ? 
              <Row><Col span={24} className={styles.finishRow} >共导入数据{entity.totalrowscount}条,导入成功{entity.dealrowscount-entity.errorrowscount}条,
                导入失败{entity.errorrowscount}条
             </Col></Row>: <Progress percent={percent} showInfo={false} strokeWidth={5} status="active" />
          }          
        </div>
    );
};
ImpProgress.propTypes = {
    entity: PropTypes.object,
    entryname: PropTypes.string,
    percent: PropTypes.number
};
ImpProgress.defaultProps = {
    percent: 0,
    entryname: ''
};

export default ImpProgress;
