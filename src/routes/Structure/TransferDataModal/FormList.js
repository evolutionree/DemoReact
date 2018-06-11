/**
 * Created by 0291 on 2018/6/11.
 */
import React from 'react';
import { Icon, Select, Button } from 'antd';

const Option = Select.Option;

class FormList extends React.Component {
  static propTypes = {
    model: React.PropTypes.array.isRequired
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      model: props.model
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      model: nextProps.model
    });
  }

  delRow = () => {

  }

  addModel = () => {

  }

  render() {
    return (
      <div>
        <ul>
          {
            this.props.model.map((item, index) => {
              return (
                <li key={index} style={{ marginBottom: '4px' }}>
                  <Select defaultValue="lucy" style={{ width: 220 }}>
                    <Option value="lucy">Lucy</Option>
                  </Select>
                  <Select defaultValue="lucy" style={{ width: 240, marginLeft: '10px' }}>
                    <Option value="lucy">Lucy</Option>
                  </Select>
                  <Icon type="delete" style={{ marginLeft: '4px', cursor: 'pointer' }} onClick={this.delRow} />
                </li>
              );
            })
          }
        </ul>
        <Button onClick={this.addModel}>添加</Button>
      </div>
    );
  }
}

export default FormList;
