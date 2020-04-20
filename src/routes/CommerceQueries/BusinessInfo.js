import React from 'react';
import { Row, Col } from 'antd';
import styles from './index.less';


const BusinessInfo = (props) => {
  const { list = [] } = props;

  return (
    <Row className={styles.listWrap}>
      {list.map((item, index) => (
        <Col key={index + ''} span={item.span} className={styles.listItem}>
          <div className={styles.title}>{item.title}</div>
          <div className={styles.content}>{item.content}</div>
        </Col>
      ))}
    </Row>
  );
};

export default BusinessInfo;
