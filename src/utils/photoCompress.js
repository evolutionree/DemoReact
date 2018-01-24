/**
 * Created by 0291 on 2018/1/24.
 */

export function photoCompress(file, callback) {
  let ready = new FileReader();
  /*开始读取指定的Blob对象或File对象中的内容. 当读取操作完成时,readyState属性的值会成为DONE,
  如果设置了onloadend事件处理程序,则调用之.同时,result属性中将包含一个data: URL格式的字符串以表示所读取文件的内容.*/
  ready.readAsDataURL(file);
  ready.onload = (event) => {
    let imgData = event.target.result;
    canvasDataURL(imgData, callback);
  };
}

function canvasDataURL(path, callback) {
  let img = new Image();
  img.src = path;
  img.onload = function () {
    // 默认按比例压缩
    let w = this.width;
    let h = this.height;
    let scale = w / h;

    if (w <= 1280 && h <= 1280) {

    } else if ((w > 1280 || h > 1280) && (scale <= 2)) {
        if (w >= h) {
          h = 1280 * h / w;
          w = 1280;
        } else {
          w = 1280 * w / h;
          h = 1280;
        }
    } else if ((w > 1280 || h > 1280) && (scale > 2) && (w < 1280 || h < 1280)) {

    } else if (w > 1280 && h > 1280 && (scale > 2)) {
      if (w >= h) {
        w = 1280 * w / h;
        h = 1280;
      } else {
        h = 1280 * h / w;
        w = 1280;
      }
    }


    let quality = 0.5;  // 默认图片质量为0.5
    //生成canvas
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    // 创建属性节点
    let anw = document.createAttribute('width');
    anw.nodeValue = w;
    let anh = document.createAttribute('height');
    anh.nodeValue = h;
    canvas.setAttributeNode(anw);
    canvas.setAttributeNode(anh);
    ctx.drawImage(this, 0, 0, w, h);
    // 图像质量
    // if (obj.quality && obj.quality <= 1 && obj.quality > 0) {
    //   quality = obj.quality;
    // }
    // quality值越小，所绘制出的图像越模糊
    let base64 = canvas.toDataURL('image/jpeg', quality);
    // 回调函数返回Blob对象
    callback(convertBase64UrlToBlob(base64));
  };
}
/**
 * 将以base64的图片url数据转换为Blob
 * @param urlData
 *            用url方式表示的base64图片数据
 */
function convertBase64UrlToBlob(urlData) {
  let arr = urlData.split(',');
  let mime = arr[0].match(/:(.*?);/)[1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
