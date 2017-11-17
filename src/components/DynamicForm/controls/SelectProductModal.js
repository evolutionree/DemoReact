import React, { PropTypes, Component } from 'react';
import _ from 'lodash';
import { Modal, Col, Row, Icon, message, Spin } from 'antd';
import Search from '../../../components/Search';
import Toolbar from '../../../components/Toolbar';
import { queryProductData } from '../../../services/basicdata';
import styles from './SelectUser.less';

class SelectProductModal extends Component {
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
    queryProductData().then(result => {
      this.setState({ loading: false });
      const list = result.data.product;
      this.setState({ list });
    }, err => {
      this.setState({ loading: false });
      message.error(err.message || '加载数据失败');
    });
  };

  handleOk = () => {
    const { currentSelected, list } = this.state;
    const arrIdName = currentSelected
      .map(id => _.find(list, ['productid', id]))
      .map(item => ({ id: item.productid, name: item.productname }));
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
      currentSelected: _.map(this.state.list, 'productid')
    });
  };

  select = data => {
    const currSelected = this.state.currentSelected;
    const hasSelected = _.includes(currSelected, data.productid);
    if (!hasSelected) {
      this.setState({
        currentSelected: [...currSelected, data.productid]
      });
    }
  };

  selectSingle = data => {
    this.setState({
      currentSelected: [data.productid]
    });
  };

  remove = data => {
    this.setState({
      currentSelected: this.state.currentSelected.filter(id => id !== data.productid)
    });
  };

  removeAll = () => {
    this.setState({ currentSelected: [] });
  };

  render() {
    const { visible, onCancel, multiple } = this.props;
    const { currentSelected, list } = this.state;
    const currentSelectedItem = list.length ? currentSelected.map(id => _.find(list, ['productid', id])) : [];
    return (
      <Modal
        title="选择产品"
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
                    <li key={item.productid} onClick={this.select.bind(this, item)}>
                      <span title={item.productname}>{item.productname}</span>
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
                    <li key={item.productid}>
                      <span title={item.productname}>{item.productname}</span>
                      <Icon type="close" onClick={this.remove.bind(this, item)} />
                    </li>
                  ))}
                </ul>
              </Col>
            </Row>
          ) : (
            <ul className={styles.userlist}>
              {this.state.list.map(item => {
                const cls = currentSelected[0] === item.productid ? styles.highlight : '';
                return (
                  <li key={item.productid} onClick={this.selectSingle.bind(this, item)} className={cls}>
                    <span title={item.productname}>{item.productname}</span>
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

export default SelectProductModal;
