import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { Button, Menu, Col, Row, Spin, Radio } from 'antd';
import Toolbar from '../../../../components/Toolbar';
import RuleTable from './RuleTable';

const MenuItem = Menu.Item;

function EntityRules({
  dispatch,
  useType,
  currentMenu = {},
  menus = [],
  list = [],
  entityType
}) {
  function handleSave() {
    const li = _.cloneDeep(list);
    for (let i = 0; i < li.length; i += 1) {
      delete li[i]['rule-add-isVisible'];
      delete li[i]['rule-add-isRequired'];
      delete li[i]['rule-add-isReadOnly'];
      delete li[i]['rule-edit-isVisible'];
      delete li[i]['rule-edit-isRequired'];
      delete li[i]['rule-edit-isReadOnly'];
      delete li[i]['rule-detail-isVisible'];
      delete li[i]['rule-detail-isRequired'];
      delete li[i]['rule-detail-isReadOnly'];
      delete li[i]['rule-import-isVisible'];
      delete li[i]['rule-import-isRequired'];
      delete li[i]['rule-import-isReadOnly'];

      if (useType === 0) {
        li[i].rules.forEach((rule, index) => {
          // 先将viewRule的isVisible同步到isVisible
          li[i].rules[index].isvisible = rule.viewrule.isVisible;
          li[i].rules[index].isrequired = rule.validrule.isRequired;
          li[i].rules[index].isreadonly = rule.viewrule.isReadOnly;

          // 将rule转成json
          li[i].rules[index].validrulestr = JSON.stringify(rule.validrule);
          li[i].rules[index].viewrulestr = JSON.stringify({ ...rule.viewrule, style: style0 ? 0 : 1 });

          delete li[i].rules[index].validrule;
          delete li[i].rules[index].viewrule;
        });
      } else {
        li[i].rules.forEach((rule, index) => {
          // 先将viewRule的isVisible同步到isVisible
          // li[i].rules[index].isvisible = rule.viewrule.isVisible;
          // li[i].rules[index].isreadonly = rule.viewrule.isReadOnly;

          delete li[i].rules[index].validrule;
          delete li[i].rules[index].viewrule;

          delete li[i].rules[index].isrequired;
        });

        // li[i].vocationid = li[i].typeid;
        delete li[i].typeid;
      }
    }
    dispatch({ type: 'entityRules/saveRules', payload: li });
  }
  function handleMenuSelect({ key }) {
    dispatch({ type: 'entityRules/selectMenu', payload: key });
  }
  function handleCheckboxChange(key, value, index) {
    dispatch({
      type: 'entityRules/checkboxChange',
      payload: { key, value, index }
    });
  }
  function onStyleChange(evt) {
    dispatch({
      type: 'entityRules/styleChange',
      payload: evt.target.value
    });
  }

  const showMenu = entityType === '0' || entityType === '1';
  const btnAtiveStyles = {
    borderColor: '#4990e2',
    color: '#0273b7'
  };

  const inUseList = list.filter(item => item.recstatus === 1);
  let style0, style1;
  if (useType === 0) {
    style0 = inUseList.every(item => {
      return item.rules
        .filter(rule => rule.viewrule.isVisible === 1)
        .every(rule => rule.viewrule.style === 0);
    });
    style1 = inUseList.every(item => {
      return item.rules
        .filter(rule => rule.viewrule.isVisible === 1)
        .every(rule => rule.viewrule.style === 1);
    });
  }

  return (
    <div>
      <Toolbar>
        {showMenu && <Button type="default" style={useType === 0 ? btnAtiveStyles : {}}
                             onClick={() => dispatch({ type: 'entityRules/selectUseType', payload: 0 })}>按类型设置</Button>}
        {showMenu && <Button type="default" style={useType === 1 ? btnAtiveStyles : {}}
                             onClick={() => dispatch({ type: 'entityRules/selectUseType', payload: 1 })}>按职能设置</Button>}
        {useType === 0 && <span style={{ marginLeft: '30px' }}>样式选择：</span>}
        {useType === 0 && <Radio.Group value={style0 ? 0 : (style1 ? 1 : undefined)} onChange={onStyleChange}>
          <Radio value={0}>横向</Radio>
          <Radio value={1}>纵向</Radio>
        </Radio.Group>}
        <Toolbar.Right>
          <Button onClick={handleSave}>保存</Button>
          {/*<Button style={{ marginLeft: '8px' }} disabled>引用</Button>*/}
        </Toolbar.Right>
      </Toolbar>
      <Row gutter={10}>
        {showMenu && <Col span={4}>
          <Menu selectedKeys={[currentMenu]}
                onSelect={handleMenuSelect}>
            {menus.map(menu => (
              <MenuItem key={menu.menuId}>{menu.menuName}</MenuItem>
            ))}
          </Menu>
        </Col>}
        <Col span={showMenu ? 20 : 24}>
          <RuleTable list={list} onCheckboxChange={handleCheckboxChange} useType={useType} />
        </Col>
      </Row>
    </div>
  );
}

export default connect(({ entityRules }) => entityRules)(EntityRules);
