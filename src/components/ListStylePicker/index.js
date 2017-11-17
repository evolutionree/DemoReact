import _ from 'lodash';
import ListStyleConfigurator from './ListStylePicker';
import { presetStyles } from './constants';

export const serverDataToListStyleConfig = (serverData) => {
  const { viewstyleid, fieldkeys, fonts, colors } = serverData;
  const arrFieldKeys = _.reverse(fieldkeys.split(','));
  const arrFonts = _.reverse(fonts.split(','));
  const arrColors = _.reverse(colors.split(','));

  // 兼容老数据问题
  if (viewstyleid < 200) {
    const expectedFieldKeyCount = {
      100: 2,
      101: 3,
      102: 4,
      103: 5,
      104: 6
    };
    if (arrFieldKeys.length < expectedFieldKeyCount[viewstyleid]) {
      arrFieldKeys.push('');
    }
  }

  const fieldStyleConfigs = [];
  arrFieldKeys.forEach((fieldKey, index) => {
    fieldStyleConfigs.unshift({
      fieldKey,
      color: arrColors[index],
      font: arrFonts[index]
    });
  });

  return {
    fieldStyleConfigs,
    styleId: viewstyleid
  };
};

export function parseConfigData(config) {
  const styleId = config.viewstyleid;
  const keys = config.fieldkeys.split(',');
  const fonts = config.fonts.split(',');
  const colors = config.colors.split(',');
  let iconField = null;
  if (styleId < 200) { // 有图片字段
    iconField = { fieldName: keys[0] };
    keys.shift();
  }
  const layoutCode = presetStyles[styleId].substr(1).replace(/0+$/g, '').split('');
  let pos = 0;
  const listFields = layoutCode.map((flag, index) => {
    if (flag === '0') {
      return {
        fieldName: '__empty_holder_' + index
      };
    }
    const obj = {
      fieldName: keys[pos],
      color: colors[pos],
      font: fonts[pos]
    };
    pos += 1;
    return obj;
  });
  return { iconField, listFields };
}

export default ListStyleConfigurator;
