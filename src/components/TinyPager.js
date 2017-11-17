import React, { PropTypes, Component } from 'react';
import { Pagination, Select } from 'antd';
import styles from './TinyPager.less';

class TinyPager extends Component {
  static propTypes = {
    noText: PropTypes.bool
  };
  static defaultProps = {
    noText: false
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { current, pageSize, total, onChange, onPageSizeChange, style = {}, noText } = this.props;
    return (
      <div className={styles.wrap} style={style}>
        <div className={styles.left}>
          {!noText && <span>显示 </span>}
          <Select size="small" value={pageSize + ''} onChange={val => onPageSizeChange(+val)}>
            <Select.Option key="10">10</Select.Option>
            <Select.Option key="20">20</Select.Option>
            <Select.Option key="50">50</Select.Option>
          </Select>
          {!noText && <span> 条记录</span>}
        </div>
        <Pagination
          simple
          showSizeChanger
          size="small"
          current={current}
          pageSize={pageSize}
          total={total}
          onChange={onChange}
        />
      </div>
    );
  }
}

export default TinyPager;

