/**
 * Created by tang on 12/14/14.
 */

var PageEditor={};

$(document).ready(function(){
    PageEditor.initAssembleArea();
    $('#btn-save').click(PageEditor.save.request);
    $('#delete-area').sortable({update:PageEditor.deleteSection});
    $('#assemble-area').sortable({connectWith:"#delete-area", update:PageEditor.updatePreview});
    $('#sections-pool').children('.section').draggable({connectToSortable:"#assemble-area", helper:"clone"});
});

PageEditor.deleteSection=function(e, ui){
    ui.item.remove()
};

PageEditor.initAssembleArea=function(){
    //Get the sections preview image from sections pool
    var $assembleArea = $('#assemble-area');
    var $sectionsPool = $('#sections-pool');
    $assembleArea.children('.section').each(function(){
        var find=false;
        var curSection = this;
        var sectionId = $(this).children(".section-id").html();
        $sectionsPool.children().each(function(){
            if ($(this).children('.section-id').html() == sectionId){
                $(curSection).children('.preview-img').html($(this).children('.preview-img').html());
                find=true;
            }
        });
        if (!find) throw "Can not find current section in sections pool";
    });
    //Draw preview image
    PageEditor.updatePreview();
};

PageEditor.updatePreview=function(e, ui){
    var $assembleArea = $('#assemble-area');
    PageEditor._clear();
    $assembleArea.children('.section').each(function(){
        var data=$(this).children('.preview-img').html();
        PageEditor._appendImg(data);
    });
};

PageEditor._appendImg=function(data){
    var imgDom=document.createElement('img');
    imgDom.setAttribute('src', data);
    var container=document.getElementById('page-preview');
    container.appendChild(imgDom);
};


PageEditor._clear=function(){
    document.getElementById('page-preview').innerHTML="";
};

PageEditor._serialize=function(){
    var $assembleArea = $('#assemble-area');
    var rv=[];
    $assembleArea.children('.section').each(function(){
        rv.push($(this).children('.section-id').html());
    });
    return rv;
};

PageEditor.title=function(){
    return document.getElementById('title-area').value;
};

PageEditor.save = {};
PageEditor.save.request=function(){
    var data=PageEditor._serialize();
    var pageId = document.getElementById('page-id').value;
    data=JSON.stringify(data);
    $.ajax("/manage/page_editor",{type:"POST", data:{id:pageId, data:data, title:PageEditor.title()}, success:PageEditor.save.success, error:PageEditor.save.error})
};

PageEditor.save.success=function(data, textStatus, jqXHR){
    data=JSON.parse(data);
    if (data.success){
        document.getElementById('page-id').value=data.id;
        alert("success");
    }
    else
    {
        alert(data.error);
    }
};

PageEditor.save.error=function(data, textStatus, jqXHR){
    alert("fail");
};



