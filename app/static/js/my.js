/**
 * Created by Tang on 2014/6/5.
 */

var root;
var b;

var initial=function(){
    root=document.getElementById('index-board');

    var opt={
        navOff:document.getElementById('nav-bar').offsetHeight
    };
    b=new IndexBoard(root,opt);
};
$(document).ready(initial);