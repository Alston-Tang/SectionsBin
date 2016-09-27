/**
 * Created by tang on 12/26/14.
 */
var memberTableIns;
var memberTableDom;
var memberElements=['lastname','firstname','year','college','sid','major','email','tel'];

$(document).ready(function(){
    memberTableDom=document.getElementById("member-list-table");
    memberTableIns=$(memberTableDom).DataTable({
        'drawCallback':initializeButton
    });
    initializeButton();
});

var initializeButton=function(){
    var $editModal=$('#edit-modal');
    $(memberTableDom).find(".remove-member").each(function(){
        this.onclick=removeMember;
    });
    $(memberTableDom).find('.edit-member').each(function(){
        this.onclick=editMember;
    });
    document.getElementById('add-button').onclick=editMember;
    $editModal.find('.cancel-button').each(function(){
        this.onclick=editModalClear;
    });
    $editModal.find('.save-button').each(function(){
        this.onclick=editMemberSave;
    })
};

var updateTotalCount=function(count){
    var memberCount=document.getElementById("member-count");
    memberCount.innerHTML=count;
};

var errorInf=function(fieldError){
    var dom=document.createElement('span');
    dom.setAttribute("class", "error help-inline");
    dom.innerHTML=fieldError.join('\n');
    return dom;
};

var markError=function(fieldName, fieldError){
    var $field=$("#"+fieldName);
    if ($field){
        $field.parent().addClass("has-error").append(errorInf(fieldError));
    }
};

//Edit Functions
var editModalClear=function(){
    var $modal=$('#edit-modal');
    $modal.find('.member-inf').each(function(){
        this.value="";
        var $parent=$(this).parent();
        $parent.removeClass('has-error');
        $parent.find('span').remove();
    }).val("");
    $($modal).find('#year').val(1);
};

var editMember=function(newMember){
    if (newMember) {
        var rowDom = this.parentNode.parentNode;
        var id = rowDom.getAttribute('id');
        var $modal = $('#edit-modal');
        $(rowDom).children().each(function () {
            var field = this.getAttribute('field');
            if (field !== null && this.innerHTML != "None") {
                $modal.find('#' + field).val(this.innerHTML);
            }
        });
        $modal.find('.save-button').attr('member-id', id);
    }
    $modal.modal();

};

var editMemberSave=function(){
    var data={};
    var $modal=$("#edit-modal");
    $modal.find('.member-inf').each(function(){
        var key=this.getAttribute('id');
        data[key]=this.value;
    });
    data["csrf_token"]=$modal.find('#csrf_token').val();
    data['id']=this.getAttribute('member-id');
    $.ajax("/manage/members", {
        type: 'PUT',
        data: data,
        success: saveSuccess,
        error: saveError
    })
};

var editTable=function(member){
    var memberData=memberTableIns.row("#"+member['_id']).data();
    if (!memberData){
        // ID does not exists, a new member is added
        memberData=[];
        for (var i = 0; i < memberElements.length; i++) {
            memberData[i] = member[memberElements[i]];
        }
        memberData.push('<button class="btn btn-warning edit-member">Edit</button><button class="btn btn-danger remove-member">Remove</button>');
        memberTableIns.row.add(memberData).draw(false);
    }
    else {
        // Edit a exist member
        for (i = 0; i < memberElements.length; i++) {
            memberData[i] = member[memberElements[i]];
        }
        memberTableIns.row("#"+member['_id']).data(memberData).draw(false);
    }
};

var saveSuccess=function(data){
    data=JSON.parse(data);
    if (data.success){
        editTable(data.member);
        $("#edit-modal").modal("hide");
        updateTotalCount(data.count);
    }
    else if(data.error=="Invalid Input"){
        for(var field in data.error_inf){
            if(data.error_inf.hasOwnProperty(field)){
                markError(field, data.error_inf[field]);
            }
        }
    }
    else{
        alert('Delete failed:'+data.error);
    }
};

var saveError=function(data){
    alert('Save failed');
};

// Remove Functions
var removeFromTable=function(id){
    memberTableIns.row('#'+id).remove().draw(false);
};

var removeMember=function(){
    var id=this.parentNode.parentNode.getAttribute("id");
    var $modal=$("#confirm-modal");
    $modal.find('.confirm-button').each(function(){
        this.setAttribute('remove-id', id);
        this.onclick=removeUserConfirm
    });
    $modal.modal();
};

var removeUserConfirm=function(){
    var id=this.getAttribute('remove-id');
    $.ajax("/manage/members", {
        type: 'DELETE',
        data: {id:id},
        success: removeSuccess,
        error: removeError
    });
};

var removeSuccess=function(data){
    data=JSON.parse(data);
    if(data.success) {
        removeFromTable(data.id);
        updateTotalCount(data.count)
    }
    else {
        alert('Delete failed:'+data.error);
    }
};

var removeError=function(){
    alert('Delete failed');
};
