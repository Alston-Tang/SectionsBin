/**
 * Created by tang on 12/18/14.
 */

$(document).ready(function(){
    $('.remove-page').click(function(){
        removePage($(this).attr('page'));
    })
});

var removePage=function(id){
  $.ajax('/manage/pages',{
        type:'DELETE',
        data:{id:id},
        success:removeSuccess,
        error:removeError
    })
};

var removeSuccess= function (data) {
    data=JSON.parse(data);
    if (data.success){
        location.reload();
    }
};

var removeError = function(data) {
    alert('Delete failed!')
};