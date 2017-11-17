/**
 * Created by 0291 on 2017/11/3.
 */
import React from 'react';
import { Button } from 'antd';
import LabelList from './LabelList';
import DeptSelectModal from './DeptSelectModal';
import styles from '../../routes/NoticeList/NoticeSendModal/styles.less';

class DeptSelect extends React.Component {
  static propTypes = {
    // value: React.PropTypes.arrayOf(React.PropTypes.shape({
    //   name: React.PropTypes.string,
    //   id: React.PropTypes.string
    // })),
    value: React.PropTypes.shape({
      depts: React.PropTypes.array,
      roles: React.PropTypes.array
    }),
    onChange: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false
    };
  }

  handleOk = ({ depts, roles }) => {
    this.hideModal();
    // const retVal = this.props.value.filter(i => {
    //   const tmpVal = depts.filter(j => j.id === i.id);
    //   return !(!tmpVal);
    // });
    // let okVal = [...retVal, ...depts];
    // this.props.onChange(okVal);
    this.props.onChange({ depts, roles });
  };

  showModal = () => {
    this.setState({ modalVisible: true });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  handleRemove = (item) => {
    const depts = this.props.value.depts.filter(i => i !== item);
    this.props.onChange({
      ...this.props.value,
      depts
    });
  };

  renderValue = () => {
    const { value: { depts }, placeholder } = this.props;
    if (!depts || !depts.length) {
      return <div className={styles.placeholder}>{placeholder || ''}</div>;
    }
    return (
      <LabelList labels={depts} onRemove={this.handleRemove} textKey="name" key="id" />
    );
  };

  render() {
    const { depts, roles } = this.props.value;
    return (
      <div className={styles.fieldwrap}>
        {this.renderValue()}
        <Button onClick={this.showModal}>选择团队</Button>
        <DeptSelectModal
          selectedDepts={depts}
          selectedRoles={roles}
          visible={this.state.modalVisible}
          onOk={this.handleOk}
          onCancel={this.hideModal}
        />
      </div>
    );
  }
}

export default DeptSelect;
