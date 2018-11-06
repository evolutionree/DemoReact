/**
 * Created by 0291 on 2018/11/6.
 */
import React, { PropTypes, Component } from 'react';
import { Icon, Select, Spin, Button, Row, Col, Input } from 'antd';
import styles from './MappingRelation.less';
import { uuid } from "../../../utils/index";

class MappingRelation extends Component {
  static propTypes = {

  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      data: props.value || []
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.value || []
    });
  }

  handleSelectChange = () => {

  }

  add = () => {
    const { data } = this.state;
    const newData = [
      ...data,
      {
        id: uuid(),
        originField: '',
        fillField: ''
      }
    ];
    this.props.onChange && this.props.onChange(newData);
  }

  del = (item) => {
    const { data } = this.state;
    const newData = data.filter(dataItem => dataItem.id !== item.id);
    this.setState({
      data: newData
    });
  }

  render() {
    const { data } = this.state;
    return (
      <div className={styles.mappingRelationWrap}>
        <ul>
          {
            data instanceof Array && data.map(item => {
              return (
                <li key={item.id}>
                  <div>
                    <Select
                      placeholder="Select a option and change input text above"
                      onChange={this.handleSelectChange}
                      style={{ width: '300px' }}
                    >
                      <Select.Option value="male">male</Select.Option>
                      <Select.Option value="female">female</Select.Option>
                    </Select>
                  </div>
                  <Icon type="swap" />
                  <div>
                    <Select
                      placeholder="Select a option and change input text above"
                      onChange={this.handleSelectChange}
                      style={{ width: '300px' }}
                    >
                      <Select.Option value="male">male</Select.Option>
                      <Select.Option value="female">female</Select.Option>
                    </Select>
                  </div>
                  <Icon type="delete" onClick={this.del.bind(this, item)} style={{ cursor: 'pointer' }} />
                </li>
              );
            })
          }
        </ul>
        <Button type="dashed" onClick={this.add}>
          <Icon type="plus" /> 添加
        </Button>
      </div>
    );
  }
}

export default MappingRelation;
