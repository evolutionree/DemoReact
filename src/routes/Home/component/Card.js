/**
 * Created by 0291 on 2017/10/26.
 */
import React from "react";
import Styles from "./Card.less";

function unitConvert(num) {
  let moneyUnits = ["元", "万元", "亿元", "万亿"];
  let dividend = 10000;
  let curentNum = num;
  //转换数字
  let curentUnit = moneyUnits[0];
  //转换单位
  for (let i = 0; i < 4; i++) {
    curentUnit = moneyUnits[i];
    if (strNumSize(curentNum) < 5) {
      break;
    }
    curentNum = curentNum / dividend;
  }
  let m = { num: 0, unit: "" };
  m.num = curentNum.toFixed(2);
  m.unit = curentUnit;
  return m;
}

function strNumSize(tempNum) {
  let stringNum = tempNum.toString();
  let index = stringNum.indexOf(".");
  let newNum = stringNum;
  if (index != -1) {
    newNum = stringNum.substring(0, index);
  }
  return newNum.length;
}

function Card({ component, dataSource, isUnitConversion = false }) {
  if (!dataSource) {
    return null;
  }

  function getValue(param) {
    let returnValue = param;
    const keys = returnValue && returnValue.match(/#.*?#/g, "");
    if (dataSource && dataSource instanceof Array && dataSource.length > 0) {
      if (keys && keys instanceof Array) {
        for (let i = 0; i < keys.length; i++) {
          returnValue = returnValue.replace(
            keys[i],
            dataSource[0][keys[i].replace(/#/g, "")]
          );
        }
      }
    }

    return returnValue;
  }

  const columnNum =
    component.styletype && component.styletype.split("normal")[1];

  function UnitConversion(value) {
    const data = unitConvert(Number(value));
    return data.num + data.unit;
  }

  function getRenderColumn() {
    let html = [];
    for (let i = 1; i <= columnNum; i++) {
      html.push(
        <li key={i} style={{ width: 100 / columnNum + "%" }}>
          <div>
            {(isUnitConversion&&i!==3)
              ? UnitConversion(
                  getValue(component[`item${i}valuescheme`]).replaceAll(",", "")
                )
              : getValue(component[`item${i}valuescheme`])}
          </div>
          <div>{getValue(component[`item${i}labelscheme`])}</div>
          {i === parseInt(columnNum) ? null : <span></span>}
        </li>
      );
    }
    return html;
  }

  return (
    <div className={Styles.Card}>
      <ul>{getRenderColumn()}</ul>
    </div>
  );
}

export default Card;
