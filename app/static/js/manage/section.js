/**
 * Created by tang on 9/3/14.
 */

$(document).ready(function(){
    $('.remove-section').click(function(){
        removeSection($(this).attr('section'));
    })
});

var removeSection=function(id){
    $.ajax('/section',{
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
    else {
        removeError(data);
    }
};

var removeError = function(data) {
    alert("Error: " + data.error);
};