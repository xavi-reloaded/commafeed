/**
 * Created with JetBrains PhpStorm.
 * User: xavi
 * Date: 9/18/13
 * Time: 6:07 PM
 * To change this template use File | Settings | File Templates.
 */

window.funcInViewer = function(args) { alert(args); };

window.addEventListener('click', function(evt){
    parent.parent.window.showKeywordPopOver(evt);
});
window.addEventListener('mouseover', function(evt){
    if (!evt.srcElement)  return;
    elem = evt.srcElement;
    if (elem.tagName!='SPAN') return;
    $('#'+evt.target.id).toggleClass('btn-info',500);
});
window.addEventListener('mouseout', function(evt){
    if (!evt.srcElement)  return;
    elem = evt.srcElement;
    if (elem.tagName!='SPAN') return;
    $('#'+evt.target.id).toggleClass('btn-info',500);
});


