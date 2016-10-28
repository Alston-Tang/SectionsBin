/**
 * Created by tang on 12/18/14.
 */

$(document).ready(function(){
    $('.remove-page').click(function(){
        removePage($(this).attr('page'));
    })
});

var removePage=function(id){
  $.ajax('/page',{
        type:'DELETE',
        data:{id:id},
        success:removeSuccess,
        error:removeError
    })
};

var removeSuccess= function (data) {
    if (data.success){
        location.reload();
    }
    else removeError(data);
};

var removeError = function(data) {
    alert("Error: " + data.error);
};