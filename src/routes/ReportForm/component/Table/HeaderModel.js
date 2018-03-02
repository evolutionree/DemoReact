/**
 * Created by 0291 on 2017/6/29.
 */
class HeaderModel {
  constructor(title, dataIndex, render, width = null, fixed = null, children, filters, onFilter)
  {
    this.title = title;
    this.dataIndex = dataIndex;
    this.render = render;
    this.width = width;
    this.fixed = fixed;
    this.children = children;
    this.filters = filters;
    this.onFilter = onFilter;
  }
}
module.exports = HeaderModel;
