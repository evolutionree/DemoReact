import React from 'react';
import { connect } from 'dva';
import { Row, Col, Icon, Button, Menu, Modal, message } from 'antd';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import classnames from 'classnames';
// import Page from '../../../../components/Page';
import styles from './EntityButtons.less';
import EntityButtonForm from './EntityButtonForm';
import * as _ from 'lodash';

const DragHandle = SortableHandle(props => {
  return props.children;
});
const SortableMenuItem = SortableElement(props => {
  const { children, className, useDragHandle, key, index, ...rest } = props;
  return (
    <Menu.Item
      className={className}
      key={key}
      {...rest}
    >
      {children}
    </Menu.Item>
  );
});
const SortableMenu = SortableContainer(props => {
  const { className, children, ...rest } = props;
  return (
    <Menu className={className} {...rest}>
      {children}
    </Menu>
  );
});

function EntityButtons({
  buttons,
  selectedButton,
  createButton,
  selectButton,
  saveButton,
  delButton,
  reorderButtons,
  formValue,
  onEditingDataChange,
  devDel
}) {
  function handleSortEnd({ oldIndex, newIndex }) {
    const newOrderButtons = arrayMove(buttons, oldIndex, newIndex);
    reorderButtons(newOrderButtons);
  }
  function handleSelect(event) {
    window.formRef.resetFields();
    selectButton(event.key);
  }
  function handleDel(id, event) {
    event.stopPropagation();
    delButton(id);
  }
  const addBtn = () => {
    for (let i = 0; i < buttons.length; i++) {
      if (/^__/.test(buttons[i].id)) {
        message.error('请先保存新增的按钮');
        return false;
      }
    }
    window.formRef.resetFields();
    createButton();
  }
  return (
    <div style={{ position: 'relative' }}>
      <Row gutter={10}>
        <Col span={6}>
          <div>
            <Button onClick={addBtn} style={{ marginBottom: '10px' }}>添加按钮</Button>
            <SortableMenu
              className={styles.btnlist}
              onSortEnd={handleSortEnd}
              selectedKeys={[selectedButton]}
              onSelect={handleSelect}
              useDragHandle
            >
              {buttons && buttons instanceof Array && buttons.map((item, index) => {
                return (
                  <SortableMenuItem key={item.id} index={index} className={styles.btnitem}>
                    <DragHandle>
                      <Icon type="bars" style={{ cursor: 'move', marginRight: '5px' }} />
                    </DragHandle>
                    <span>{item.name}</span>
                    <Icon
                      onClick={handleDel.bind(null, item.id)}
                      type="close"
                      className={styles.closebtn}
                    />
                  </SortableMenuItem>
                );
              })}
            </SortableMenu>
          </div>
        </Col>
        <Col span={18}>
          <div style={{ maxWidth: '580px' }}>
            <EntityButtonForm
              ref={(ref) => { window.formRef = ref }}
              value={formValue}
              onChange={onEditingDataChange}
              onSubmit={saveButton}
            />
          </div>
        </Col>
      </Row>
      <Button onClick={devDel} style={{ display: 'none' }}>开发删除数据</Button>
    </div>
  );
}

export default connect(
  state => state.entityButtons,
  dispatch => {
    return {
      createButton() {
        dispatch({ type: 'entityButtons/createButton' });
      },
      onEditingDataChange(formValue) {
        dispatch({ type: 'entityButtons/putState', payload: { formValue } });
      },
      selectButton(id) {
        dispatch({ type: 'entityButtons/selectButton', payload: id });
      },
      saveButton(formData) {
        dispatch({ type: 'entityButtons/saveButton', payload: formData });
      },
      delButton(id) {
        Modal.confirm({
          title: '确定删除该按钮吗',
          onOk() {
            window.formRef.resetFields();
            dispatch({ type: 'entityButtons/delButton', payload: id });
          }
        });
      },
      devDel() { //用户新增按钮时，字段extraData(json字符串) 经常填入的为非JSON格式，导致返回数据非JSON格式字符串，前端解析出错， 增加一个隐藏的按钮，便于前端删数据(隐藏功能，不对用户开放)，让用户重新新增
        const id = prompt('请输入按钮id', '');
        if (id != null && id !== '') {
          Modal.confirm({
            title: '确定删除该按钮吗',
            onOk() {
              dispatch({ type: 'entityButtons/delButton', payload: id });
            }
          });
        }
      },
      reorderButtons(newOrderButtons) {
        dispatch({ type: 'entityButtons/reorderButtons', payload: newOrderButtons });
      }
    };
  }
)(EntityButtons);
