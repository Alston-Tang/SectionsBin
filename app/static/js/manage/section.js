/**
 * Created by tang on 9/3/14.
 */

$(document).ready(function(){
    $('.remove-section').click(function(){
        removeSection($(this).attr('section'));
    })
});

var removeSection=function(id){
    $.ajax('/manage/sections',{
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