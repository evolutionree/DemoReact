import React, { PropTypes, Component } from 'react';
import _ from 'lodash';
import { Modal, Col, Row, Icon, message, Spin } from 'antd';
import Search from '../../../components/Search';
import Toolbar from '../../../components/Toolbar';
import { queryProductSerialData } from '../../../services/basicdata';
import styles from './SelectUser.less';

class SelectProductSerialModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    sourceId: PropTypes.string,
    selected: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string
    })),
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    multiple: PropTypes.bool
  };
  static defaultProps = {
    visible: false,
    selected: [],
    multiple: true
  };

  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      currentSelected: props.selected.map(i => i.id),
      list: [],
      totalList: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        keyword: '',
        currentSelected: nextProps.selected.map(i => i.id)
      }, this.fetchList);
    }
  }

  fetchList = () => {
    this.setState({ loading: true });
    queryProductSerialData().then(result => {
      this.setState({ loading: false });
      const list = result.data.productserial;
      this.setState({ list });
    }, err => {
      this.setState({ loading: false });
      message.error(err.message || '加载数据失败');
    });
  };

  handleOk = () => {
    const { currentSelected, list } = this.state;
    const arrIdName = currentSelected
      .map(id => _.find(list, ['productsetid', id]))
      .map(item => ({ id: item.productsetid, name: item.productsetname }));
    this.props.onOk(arrIdName);
  };

  onSearch = (keyword) => {
    this.setState({
      keyword,
      currentSelected: this.props.multiple ? this.state.currentSelected : []
    }, this.fetchList);
  };

  selectAll = () => {
    this.setState({
      currentSelected: _.map(this.state.list, 'productsetid')
    });
  };

  select = data => {
    const currSelected = this.state.currentSelected;
    const hasSelected = _.includes(currSelected, data.productsetid);
    if (!hasSelected) {
      this.setState({
        currentSelected: [...currSelected, data.productsetid]
      });
    }
  };

  selectSingle = data => {
    this.setState({
      currentSelected: [data.productsetid]
    });
  };

  remove = data => {
    this.setState({
      currentSelected: this.state.currentSelected.filter(id => id !== data.productsetid)
    });
  };

  removeAll = () => {
    this.setState({ currentSelected: [] });
  };

  render() {
    const { visible, onCancel, multiple } = this.props;
    const { currentSelected, list } = this.state;
    const currentSelectedItem = list.length ? currentSelected.map(id => _.find(list, ['productsetid', id])) : [];
    return (
      <Modal
        title="选择产品系列"
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        wrapClassName={multiple ? 'ant-modal-custom-large' : ''}
      >
        {/*<Toolbar>*/}
          {/*<Search*/}
            {/*width="200px"*/}
            {/*value={this.state.keyword}*/}
            {/*onSearch={this.onSearch}*/}
            {/*placeholder="请输入关键字"*/}
          {/*>*/}
            {/*搜索*/}
          {/*</Search>*/}
        {/*</Toolbar>*/}
        <Spin spinning={this.state.loading}>
          {multiple ? (
            <Row gutter={20}>
              <Col span={11}>
                <ul className={styles.userlist}>
                  {this.state.list.map(item => (
                    <li key={item.productsetid} onClick={this.select.bind(this, item)}>
                      <span title={item.productsetname}>{item.productsetname}</span>
                    </li>
                  ))}
                </ul>
              </Col>
              <Col span={2}>
                <div style={{ height: '400px' }} className={styles.midcontrol}>
                  <Icon type="right" onClick={this.selectAll} />
                  <Icon type="left" onClick={this.removeAll} />
                </div>
              </Col>
              <Col span={11}>
                <ul className={styles.userlist}>
                  {currentSelectedItem.map(item => (
                    <li key={item.productsetid}>
                      <span title={item.productsetname}>{item.productsetname}</span>
                      <Icon type="close" onClick={this.remove.bind(this, item)} />
                    </li>
                  ))}
                </ul>
              </Col>
            </Row>
          ) : (
            <ul className={styles.userlist}>
              {this.state.list.map(item => {
                const cls = currentSelected[0] === item.productsetid ? styles.highlight : '';
                return (
                  <li key={item.productsetid} onClick={this.selectSingle.bind(this, item)} className={cls}>
                    <span title={item.productsetname}>{item.productsetname}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Spin>
      </Modal>
    );
  }
}

export default SelectProductSerialModal;
