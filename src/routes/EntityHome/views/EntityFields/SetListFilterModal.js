import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Modal, Checkbox, Select, Row, Col, Icon, Button, message } from 'antd';
import _ from 'lodash';
import styles from './SetListFilterModal.less';
import { saveListFilter, queryListFilter } from '../../../../services/entity';

const Option = Select.Option;

function isSupportSearch({ controltype }) {
  // 不支持搜索的控件类型，见文档 《控件规则说明.xls》
  const types = [2, 15, 20, 22, 23, 24];
  const sysTypes = [1001, 1007, 1008, 1009, 1010];
  return types.indexOf(controltype) === -1 && sysTypes.indexOf(controltype) === -1;
}

function isSupportLikeSearch({ controltype }) {
  // 【日期、日期时间、整数、小数】控件，不支持模糊搜索
  return [1004, 1005, 6, 7, 8, 9].indexOf(controltype) === -1;

  // // 2017/08/16 目前服务端只支持文本类的模糊搜索
  // return [1, 5, 10, 11, 12].indexOf(controltype) !== -1;
}

class SetListFilterModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    close: PropTypes.func
  };
  static defaultProps = {
    visible: false
  };

  constructor(props) {
    super(props);
    this.state = {
      searchField: '',
      allFields: [],
      pickedFields: [],
      currField: null,
      confirmLoading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      queryListFilter(this.props.entityId).then(result => {
        this.setState({
          allFields: result.data.fields.filter(isSupportSearch),
          pickedFields: result.data.fieldssearch,
          searchField: (result.data.simple && result.data.simple[0] && result.data.simple[0].fieldid) || ''
        });
      }, err => {
        message.error(err.message || '获取字段出错', 5);
      });
    } else if (this.props.visible && !nextProps.visible) {
      this.setState({
        searchField: '',
        allFields: [],
        pickedFields: [],
        currField: null,
        confirmLoading: false
      });
    }
  }

  pick = () => {
    const { currField, pickedFields } = this.state;
    if (!currField) return;
    if (pickedFields.indexOf(currField) !== -1) return;
    const newField = {
      ...currField,
      islike: 0
    };
    this.setState({
      pickedFields: [...pickedFields, newField],
      currField: null
    });
  };

  remove = () => {
    const { currField, pickedFields } = this.state;
    if (!currField) return;
    if (pickedFields.indexOf(currField) === -1) return;
    this.setState({
      pickedFields: pickedFields.filter(item => item !== currField),
      currField: null
    });
  };

  onCheckChange = (index, event) => {
    const pickedFields = [...this.state.pickedFields];
    pickedFields[index].islike = event.target.checked ? 1 : 0;
    this.setState({ pickedFields });
  };

  onSearchFieldChange = searchField => {
    this.setState({ searchField });
  };

  onOk = () => {
    this.setState({ confirmLoading: true });
    const params = {
      // searchfield: '00000000-0000-0000-0000-000000000000',
      searchfield: this.state.searchField || '00000000-0000-0000-0000-000000000000',
      viewtype: 0,
      entityid: this.props.entityId,
      advancesearch: this.state.pickedFields.map((item, index) => {
        return {
          fieldid: item.fieldid,
          entityid: this.props.entityId,
          controltype: item.controltype,
          recorder: index,
          islike: item.islike
        };
      })
    };
    saveListFilter(params).then(result => {
      this.setState({ confirmLoading: false });
      message.success('保存成功');
      this.props.close();
    }).catch(e => {
      this.setState({ confirmLoading: false });
      console.error(e);
      message.error(e.message || '保存失败', 5);
    });
  };

  render() {
    const pickedIds = this.state.pickedFields.map(field => field.fieldid);
    const restFields = this.state.allFields.filter(field => pickedIds.indexOf(field.fieldid) === -1);
    return (
      <Modal
        title="设置筛选条件"
        visible={this.props.visible}
        onOk={this.onOk}
        onCancel={this.props.close}
        confirmLoading={this.state.confirmLoading}
        width={580}
      >
        <div style={{ marginBottom: '15px' }}>
          <span>设置简单搜索字段: </span>
          <Select
            value={this.state.searchField}
            style={{ minWidth: '120px' }}
            onChange={this.onSearchFieldChange}
          >
            {/* 过滤掉提示文本、数字，分组、头像、图片、附件、表格、时间 */}
            {this.state.allFields.filter(field => {
              return [2, 20, 15, 22, 23, 24, 6, 7, 8, 9].indexOf(field.controltype) === -1
                && [1001, 1004, 1005, 1007, 1008, 1009, 1011].indexOf(field.controltype) === -1;
            }).map(field => (
              <Option key={field.fieldid} value={field.fieldid}>{field.displayname}</Option>
            ))}
          </Select>
        </div>
        <div>设置高级搜索字段: </div>
        <Row gutter={10}>
          <Col span={10}>
            <div>
              <p className={styles.title}>待选字段</p>
              <ul className={styles.list}>
                {restFields.map(field => (
                  <li
                    className={classnames([styles.item, { [styles.active]: field === this.state.currField }])}
                    key={field.fieldid}
                    onClick={() => { this.setState({ currField: field }); }}
                    title={field.displayname}
                  >
                    {field.displayname}
                  </li>
                ))}
              </ul>
            </div>
          </Col>
          <Col span={4} style={{ textAlign: 'center' }}>
            <Button className={styles.btn} onClick={this.pick}>
              <Icon type="right" />
            </Button>
            <Button className={styles.btn} onClick={this.remove}>
              <Icon type="left" />
            </Button>
          </Col>
          <Col span={10}>
            <div>
              <p className={styles.title}>用于筛选字段</p>
              <ul className={styles.list}>
                <li className={styles.titleitem}>
                  <span>字段名称</span>
                  <span>模糊搜索</span>
                </li>
                {this.state.pickedFields.map((field, index) => (
                  <li
                    className={classnames([styles.item, { [styles.active]: field === this.state.currField }])}
                    key={field.fieldid}
                    onClick={() => { this.setState({ currField: field }); }}
                  >
                    <span title={field.displayname}>{field.displayname}</span>
                    <span>
                      <Checkbox
                        checked={field.islike === 1}
                        disabled={!isSupportLikeSearch(field)}
                        onChange={this.onCheckChange.bind(this, index)}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default connect(
  ({ entityFields }) => {
    const { showModals, list, entityId } = entityFields;
    // 过滤掉记录id,提示文本、分组、头像、图片、附件、表格
    // const searchableFields = list.filter(field => {
    //   return [1001, 2, 15, 20, 22, 23, 24].indexOf(field.controltype) === -1;
    // });
    return {
      visible: /listFilter/.test(showModals),
      // allFields: searchableFields,
      entityId: entityId
    };
  },
  dispatch => {
    return {
      close: () => {
        dispatch({ type: 'entityFields/showModals', payload: '' });
      }
    };
  }
)(SetListFilterModal);
