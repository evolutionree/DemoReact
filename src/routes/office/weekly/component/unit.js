/**
 * Created by 0291 on 2017/9/27.
 */
import _ from 'lodash';

export function groupBy(data) {
  // const receiveWeeklistDataSort = _.sortBy(data, function(item) {
  //   return -item.weekNum;
  // });
  const receiveWeeklistDataSort = data;

  let obj = {};
  if (receiveWeeklistDataSort instanceof Array && receiveWeeklistDataSort.length > 0) {
    let initWeekNum = receiveWeeklistDataSort[0].weekNum;
    obj['weekNum' + initWeekNum] = [];
    for (let i = 0; i < receiveWeeklistDataSort.length; i++) {
      if (receiveWeeklistDataSort[i].weekNum !== initWeekNum) {
        initWeekNum = receiveWeeklistDataSort[i].weekNum;
        obj['weekNum' + initWeekNum] = [];
      }
      obj['weekNum' + initWeekNum].push(receiveWeeklistDataSort[i]);
    }
  }

  return obj;
}
