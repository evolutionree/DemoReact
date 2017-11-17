/**
 * Created by 0291 on 2017/9/8.
 */
import React from 'react';
import styles from './css/Card.less';


function Card({
                params,
                html,
                data,
                style
              }) {
  // const renderHtml = "<div class='card'><div class='header_center'><span>2017-08-01至2017-08-01</span></div>" +
  //   "<div class='body_threePart_children'><span><div>预销售额（元）</div><div>662000000</div><div class='line'></div></span><span><div>赢率</div><div>30%</div><div class='line'></div></span>" +
  //   "<span><div>赢率</div><div>30%</div></span></div></div>";

  let renderHtml = html;
  if (data && data instanceof Array && data.length > 0) {
      params && params.map((item) => {
        renderHtml = renderHtml.replace('#' + item + '#', data[0][item]);
      });
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: renderHtml }} style={{ ...style, overflow: 'hidden' }}></div>
  );
}

export default Card;
