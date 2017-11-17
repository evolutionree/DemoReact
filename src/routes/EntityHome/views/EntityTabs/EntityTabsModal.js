import React from 'react';
import { connect } from 'dva';
import { Modal, Mention, message, Input, Select } from 'antd';
import _ from 'lodash';

class EntityTabsModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedEntity:undefined,
      selectedField:undefined,
      entityname:'',
      relName:'',
      relId:'',
      entityList: [],
      entityFieldListForEdit: []
    };
    this.handleInputChange = this.handleInputChange.bind(this);   
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      // 打开窗口
      if(nextProps.currentItem.relentityid){
          this.props.onEntityChange(nextProps.currentItem.relentityid);
          this.setState({
            selectedEntity:nextProps.currentItem.relentityid,
            selectedField:nextProps.currentItem.fieldid,
            entityname:nextProps.currentItem.entityname,
            relName:nextProps.currentItem.relname,
            relId: nextProps.currentItem.relid,
            icon: nextProps.currentItem.icon,
            entitytaburl: nextProps.currentItem.entitytaburl,
            type: 0
          });
      }else{
          this.setState({
            relId: nextProps.currentItem.relid,
            relName:nextProps.currentItem.relname,
            selectedEntity:undefined,
            selectedField:undefined,
            icon: nextProps.currentItem.icon,
            entitytaburl: nextProps.currentItem.entitytaburl,
            type: 1
          });
      }
    }
  }

  entityChange = value =>{
    this.props.onEntityChange(value);
    this.setState({
      selectedEntity:value,
      selectedField:undefined,
      });
  };

  fieldChange = value =>{
    this.setState({
      selectedField:value
      });
  };

  onSaveEntity =() => {
    var entityField = null;
    console.log(this.props.entityFieldListForEdit);
    for (var item of Array.from(this.props.entityFieldListForEdit)) {
      if (item.fieldid = this.state.selectedField){
        entityField = item;
      }
    }
    
    this.props.onSave(this.state.selectedField,this.state.icon,this.state.selectedEntity,this.state.relName,this.state.relId,this.state.type);
  }

  handleInputChange(event) {
      this.setState({
        relName:event.target.value
      });
    }

  render() {
    const { visible, isEdit, cancel, modalPending } = this.props;
    return (
      <Modal
        width={640}
        maskClosable={false}
        title={isEdit ? '编辑筛选项' : '新增筛选项'}
        visible={visible}
        onOk={this.onSaveEntity}
        onCancel={cancel}
        confirmLoading={modalPending}
      >
      <div>页签名称</div>
      <div style={{ margin: '10px 0 20px' }}>
	      <Input placeholder="请输入页签名称" value={this.state.relName} onChange={this.handleInputChange}></Input>
	    </div>
       <div>关联实体</div>
      <div style={{ margin: '10px 0 20px' }}>
      <Select 
          value={this.state.selectedEntity}
          onChange={this.entityChange}
          disabled={this.state.entitytaburl ? true : false}
          style={{ width: 596 }}
   	      placeholder="请选择关联实体">
            {this.props.entityList.map(t => (
              <Option value={t.entityid} key={t.entityid}>{t.entityname}</Option>
            ))}
      </Select>
      </div>
      <div>关联字段</div>
      <div style={{ margin: '10px 0 20px' }}>
      <Select
          value={this.state.selectedField}
          onChange={this.fieldChange}
          disabled={this.state.entitytaburl ? true : false}
          style={{ width: 596 }}
   	      placeholder="请选择关联字段">
            {this.props.entityFieldListForEdit.map(t => (
              <Option value={t.fieldid} key={t.fieldid}>{t.datasrcname}</Option>
            ))}
      </Select>
      </div>
      </Modal>
    );
  }
}

export default connect(
  ({ entityTabs }) => {
    const { showModals,currentItem,entityList,entityFieldListForEdit } = entityTabs;
    return {
      visible: /edit/.test(showModals),
      isEdit: /edit/.test(showModals),
      currentItem,
      entityList,
      entityFieldListForEdit,
    };
  },
    dispatch => {
    return {
      cancel: () => {
        dispatch({ type: 'entityTabs/showModals', payload: '' });
      },
      onEntityChange: (relEntityId) => {
        const type = 'edit';
        dispatch({ type: 'entityTabs/loadEntityFields', payload:{type,relEntityId}});
      },
      onSave: (fieldId,icon,relEntityId,relName,relId,type) => {
        dispatch({ type: 'entityTabs/editreltab', payload:{fieldId,icon,relEntityId,relName,relId,type}});
      }
    };
  }
)(EntityTabsModal);
