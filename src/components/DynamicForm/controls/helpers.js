const blurHelperElem = document.createElement('input');
document.body.appendChild(blurHelperElem);
blurHelperElem.style.position = 'absolute';
blurHelperElem.style.top = '-5000px';
blurHelperElem.style.left = '-5000px';
export function blurByHelper() {
  blurHelperElem.focus();
}
