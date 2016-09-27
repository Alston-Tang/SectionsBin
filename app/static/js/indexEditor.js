/**
 * Created by Tang on 2014/6/24.
 */

if(!IndexBoard){
    throw 'Include indexBoard.js before that.';
}

var indexEditor={};

indexEditor.mapName={
    'fade':'fade in',
    'first':'first time'
};

indexEditor.setDrag=function(){
    var cur=this;
    this.dom.indexEdit=this;
    $(this.dom).addClass('div-context');
    this.dom.drag=new drag({
        dom:cur.dom,
        size:cur.parent.dom
    });
    $(this.dom)
        .attr('touch-action','none')
        .on('thmdragend',function(){
            var sectionWidth=parseFloat(this.indexEdit.parent.parent.globalWidth);
            var sectionHeight=parseFloat(this.indexEdit.parent.bot)-parseFloat(this.indexEdit.parent.top);
            var sectionTop=parseFloat(this.indexEdit.parent.top);
            var left=parseFloat(this.offsetLeft)/sectionWidth;
            var width=parseFloat(this.offsetWidth)/sectionWidth;
            var top=(parseFloat(this.offsetTop)-sectionTop)/sectionHeight;
            var height=parseFloat(this.offsetHeight)/sectionHeight;

            this.indexEdit.resetWidthLeft(left,left+width);
            this.indexEdit.resetHeightTop(top,top+height);
        });
};
indexEditor.preProcess=function(){
    indexEditor.section= b.con[0];
    indexEditor.sectionDom= b.con[0].dom;
    //Set dragable-touch,bind div to dom
    b.traverse(indexEditor.setDrag);
    //bind section to dom
    for(var i=0; i< b.con.length; i++){
        b.con[i].dom.indexEdit= b.con[i];
    }
    //Set nav bar button
    var $navBar=$('#nav-bar');
    $navBar.find('.editor-nav').click(function(){
        indexEditor.content.add($(this).attr('add'));
    });
    $navBar.find('.setting-section').click(function(){
        var sectionDom= b.con[0].dom;
        indexEditor.disModal('sectionSetting',sectionDom);
    });
    $navBar.find('#btn-save').click(function(){
        indexEditor.save.request();
    });
    $($navBar).find('.setting-information').click(function(){
        var sectionDom= b.con[0].dom;
        indexEditor.disModal('sectionInformation',sectionDom)
    });
    //Test the width of editor paenl
    var $panel=$('#edit-modal');
    $panel.css({'visibility':'hidden','display':'inline'});
    indexEditor.panelWidth=$('#edit-panel')[0].offsetWidth;
    $panel.css({'visibility':'visible','display':'none'});
};
indexEditor.save={};
indexEditor.save.request=function(){
    html2canvas(document.getElementById("index-board"), {
        onrendered: indexEditor.save.preDone
    });
};
indexEditor.save.preDone=function(canvas){
    //Get section information
    var hiddenInf=document.getElementById('sectionInf');
    var createTime=$(hiddenInf).find('.create_time').val();
    var id=$(hiddenInf).find('.id').val();
    var currentTime=new Date().getTime()/1000;
    var selection=thmTools.domToString(b.con[0].dom);
    var title= $(b.con[0].dom).attr('section-title');
    var previewImg=canvas.toDataURL('image/jpeg');
    var saveUrl = $("#sectionInf").find("input.save_url").val();
    var type = id ? "PUT" : "POST";
    $.ajax(saveUrl,{
        type:type,
        success:indexEditor.save.success,
        error:indexEditor.save.error,
        data:{
            create_time:createTime,
            id:id,
            modified_time:currentTime,
            title:title,
            content:selection,
            preview_img:previewImg
        }
    });
};
indexEditor.save.success=function(data){
    if(data.success){
        var hidderInf=document.getElementById('sectionInf');
        $(hidderInf).find('.id').val(data.id);
        alert('success');
    }
    else{
        alert(data.error);
    }
};
indexEditor.save.error=function(data){
    alert('error');
};

indexEditor.modal={};
indexEditor.modal.size={
    title:'Size',
    con:{
        id:'size-panel',
        data: function(dom){
            var rv={};
            rv.width=parseFloat($(dom).attr('right'))-parseFloat($(dom).attr('left'));
            rv.height=parseFloat($(dom).attr('bot'))-parseFloat($(dom).attr('top'));
            rv.layer=$(dom).css('z-index');
            return rv;
        }
    },
    setValue:function(dom){
    },
    callback:function(){
        $('#edit-modal').modal('hide');
        var curDom=this.point;
        var curLeft=parseFloat($(this.point).attr('left'));
        var curTop=parseFloat($(this.point).attr('top'));
        var $panelDom=$('#edit-panel');
        curDom.indexEdit.resetLayer(parseInt($panelDom.find('.layer').val()));
        curDom.indexEdit.resetWidthLeft(curLeft,curLeft+parseFloat($panelDom.find('.width').val()));
        curDom.indexEdit.resetHeightTop(curTop,curTop+parseFloat($panelDom.find('.height').val()));
        this.point.drag.reHandlePos();
    }
};
indexEditor.modal.advanced={
    title:'Advanced',
    con:{
        id:'advanced-panel',
        data: function(dom){
            var rv={};
            rv.html=$(dom).html();
            rv.panelWidth=indexEditor.panelWidth;
            return rv;
        }
    },
    setValue:function(dom){
    },
    callback:function(){
        $('#edit-modal').modal('hide');
        $(this.point).attr({'type':"custom"}).html(thmTools.textToHtml($('#edit-panel').find('.innerHTML').val()));
        this.point.indexEdit.resetAll();
        this.point.drag.reHandlePos();
    }
};

indexEditor.modal.content={
    title:'Content',
    con:{
        //No id specified for different content uses different panel. Load this in setValue
    },
    setValue:function(dom){
        var type=dom.indexEdit.type;
        indexEditor.content.disEditModal(type,dom);
    },
    callback:function(){
        var dom=this.point;
        var type=dom.indexEdit.type;
        indexEditor.content.saveHandle(type,dom);
        dom.indexEdit.resetAll();
    }
};

indexEditor.modal.delete={
    title:'Delete',
    con:{
        id:'delete-panel'
    },
    callback:function(){
        $('#edit-modal').modal('hide');
        $(this.point).remove();
        this.point.indexEdit.removeSelf();
    }
};

indexEditor.modal.animation={
    title:'Animation',
    con:{
        id:'animation-panel',
        data:function(dom){
            var rv={};
            rv.animation=[];
            $(dom).children('.animation').each(function(){
                var curAn={};
                curAn.type=$(this).attr('type');
                curAn.trigger=$(this).attr('trigger');
                curAn.speed=$(this).attr('speed');
                switch (curAn.type){
                    case 'fade':
                        break;
                    case 'move':
                        curAn.oriTop=$(this).attr('oriTop');
                        curAn.oriLeft=$(this).attr('oriLeft');
                        curAn.dstTop=$(this).attr('dstTop');
                        curAn.dstLeft=$(this).attr('dstLeft');
                        break;
                    case 'resize':
                        curAn.oriWidth=$(this).attr('oriWidth');
                        curAn.oriHeight=$(this).attr('oriHeight');
                        curAn.dstWidth=$(this).attr('dstWidth');
                        curAn.dstHeight=$(this).attr('dstHeight');
                        break;
                }
                rv.animation.push(curAn);
            });
            return rv;
        }
    },
    setValue:function(dom){
        $('.fa-minus').css({'cursor':'pointer'}).click(function(){
            $(this.parentNode).remove();
        });
        $('.fa-plus').css({'cursor':'pointer'}).click(function(){
            var newDiv=document.createElement('div');
            $(newDiv).addClass('animation').html(tmpl("animation-new-panel")).
                find('button').click(function(){
                    var type=$(newDiv).find('select').val();
                    var html="";
                    html+=tmpl("commonPanel",{'type':type});
                    html+=tmpl(type+"Panel",{});
                    html+="<hr>";
                    $(newDiv).html(html);
                    $('.fa-minus').css({'cursor':'pointer'}).click(function(){
                        $(this.parentNode).remove();
                    });
                });
            this.parentNode.insertBefore(newDiv,this);
        });
    },
    callback:function(){
        var animations=[];
        var panel=document.getElementById('edit-modal');
        $(panel).find('.animation').each(function(){
            var attr={};
            attr.type=$(this).find('.type').val();
            attr.trigger=$(this).find('.trigger').val();
            attr.speed=parseInt($(this).find('.speed').val());
            if (!attr.speed || attr.speed<=0){
                alert("speed should be a positive integer");
                return;
            }
            switch (attr.type){
                case 'fade':
                    break;
                case 'move':
                    attr.oriLeft=parseFloat($(this).find('.oriLeft').val());
                    attr.oriTop=parseFloat($(this).find('.oriTop').val());
                    attr.dstLeft=parseFloat($(this).find('.dstLeft').val());
                    attr.dstTop=parseFloat($(this).find('.dstTop').val());
                    if(!thmTools.isNumber([attr.dstLeft,attr.dstTop])){
                        alert("dstLeft and dstTop can not be empty");
                        return;
                    }
                    if(thmTools.inRange(0.0,1.0,[attr.oriLeft,attr.oriTop,attr.dstLeft,attr.dstTop])!='valid'){
                        alert(("left and top should be float number between 0.0 and 1.0"));
                        return;
                    }
                    break;
                case 'resize':
                    attr.oriWidth=parseFloat($(this).find('.oriWidth').val());
                    attr.oriHeight=parseFloat($(this).find('.oriHeight').val());
                    attr.dstWidth=parseFloat($(this).find('.dstWidth').val());
                    attr.dstHeight=parseFloat($(this).find('.dstHeight').val());
                    if(!thmTools.isNumber([attr.dstWidth,attr.dstHeight])){
                        alert("dstHeight and dstWidth can not be empty");
                        return;
                    }
                    if(thmTools.inRange(0.0,1.0,[attr.oriWidth,attr.oriHeight,attr.dstHeight,attr.dstWidth])!='valid'){
                        alert(("width and height should be float number between 0.0 and 1.0"));
                        return;
                    }
                    break;
            }
            animations.push(attr);
        });
        $('#edit-modal').modal('hide');
        var cur=this;
        $(this.point).find('.animation').each(function(){
            $(this).remove();
        });
        for (var i=0; i<animations.length; i++){
            var animation=document.createElement('span');
            $(animation).attr('class','animation');
            var element;
            for (element in animations[i]){
                //noinspection JSUnfilteredForInLoop
                if(!isNaN(animations[i][element]) || animations[i][element]) {
                    $(animation).attr(element, animations[i][element]);
                }
            }
            cur.point.appendChild(animation);
        }
        this.point.indexEdit.resetAnimation();
    }
};

indexEditor.modal.sectionInformation={
    title:'Section information',
    con:{
        'id':'sectionInformation',
        data:function(dom){
            var rv={};
            var $inf=$('#sectionInf');
            rv.createTime=$inf.find('.create_time').val();
            rv.creator=$inf.find('.creator').val();
            rv.modifiedTime=$inf.find('.modified_time').val();
            return rv;
        }
    },
    callback:function(){
        $('#edit-modal').modal('hide');
    }
};

indexEditor.modal.sectionSetting={
    title:'Section setting',
    con:{
        'id':'sectionSetting',
        data:function(dom){
            var rv={};
            rv.height=$(dom).attr('height');
            rv.boardBackground=$(dom).attr('background');
            var sectionBoard=$(dom).children('.section-board');
            rv.background=$(sectionBoard).attr('color');
            rv.backgroundOpacity=$(sectionBoard).attr('opacity');
            rv.title=$(dom).attr('section-title');
            return rv;
        }
    },
    setValue:function(dom){
        var panel=document.getElementById('edit-panel');
        //Set edit handler
        $(panel).find('.edit').click(function(){
            indexEditor.content.subModal('img',$(panel).find('.background')[0]);
        });
        //Set null handler
        $(panel).find('.null').click(function(){
            $(panel).find('.background').attr('src',"");
        });
        //Set color picker
        $(panel).find('.pick-a-color').pickAColor({'showHexInput':false});
    },
    callback:function(){
        var panel=document.getElementById('edit-panel');
        //Get value in panel
        var color='#'+$(panel).find('.pick-a-color').val();
        var opacity=parseFloat($(panel).find('.opacity').val());
        var background=$(panel).find('.background').attr('src');
        var height=parseFloat($(panel).find('.height').val());
        $(this.point).attr('section-title',$(panel).find('.title').val());
        this.point.indexEdit.resetCan(color,opacity);
        this.point.indexEdit.resetBackground(background);
        this.point.indexEdit.resetSize(height);
        $('#edit-modal').modal('hide');
    }
};

indexEditor.disModal=function(type,dom){
    var m=indexEditor.modal[type];
    if(indexEditor.modal[type]){
        this.deleteModalContent();
        this.createModalContent(m,dom);
        if (m.setValue) m.setValue(dom);
        $('#edit-modal').modal({'backdrop':'static'});
    }
};

indexEditor.createModalContent=function(m,dom){
    var root=document.getElementById('edit-panel');
    var data= m.con.data? m.con.data(dom):{};
    // Define con.id. Get that element by this id and render template inside this element to modal panel
    if(m.con && m.con.id) {
        $(root).html(tmpl(m.con.id, data));
    }
    if(m.title){
        $('#edit-panel-title').html(m.title);
    }
    var button=document.getElementById('edit-panel-save');
    button.point=dom;
    button.onclick=m.callback;
};
indexEditor.deleteModalContent=function(){
    var root=document.getElementById('edit-panel');
    root.innerHTML="";
};

//Content Control
indexEditor.content={};
indexEditor.content.subModal=function(type,dom,opt){
    var $panel=$('#sub-panel');
    var $modal=$('#sub-content-modal');
    var data={};
    opt=opt?opt:{};
    switch (type){
        case 'text':
            var $textNode=$(dom);
            data.panelWidth=indexEditor.panelWidth;
            data.content=$textNode.html();
            data.style=$textNode.attr('style');
            data.color=$textNode.css('color');
            data.size=$textNode.css('font-size');

            $($panel).html(tmpl('textSub',data));

            $panel.find('.content').val(data.content);
            $panel.find('.textColor').val(data.color);
            $panel.find('.textSize').val(data.size);
            $panel.find('.textStyle').val(data.style);
            $panel.find('.demo').css({'color':data.color,'font-size':data.size}).attr('attr',data.style);

            if (opt.disabled) {

                for (var item in opt.disabled){
                    if ($panel.find('.'+item).length>0){
                        $panel.find('.'+item).attr('disabled','');
                    }
                }
            }

            $('#sub-panel-save')[0].onclick=function(){
                $('#sub-content-modal').modal('hide');
                $textNode.html($panel.find('.content').val())
                         .attr('style',$panel.find('.textStyle').val())
                         .css({'color':$panel.find('.textColor').val(),'font-size':$panel.find('.textSize').val()});
            };

            $modal.modal('show');
            break;

        case 'img':
            $panel.html(tmpl('imageSubInit',data));
            $modal.modal('show');
            $.get('/ajax/upload/pic',function(data){
                var last=null;
                data=JSON.parse(data);
                var picList=[];
                for (var i=0; i<data.files.length; i++){
                    picList.push([data.files[i].thumbnailUrl,data.files[i].url]);
                }
                $panel.html(tmpl('imageSub',{'total':data.files.length,'data':picList}));
                $panel.find('.thumbnail').click(function(){
                    if(last!=null) {
                        $(last).removeAttr('style');
                    }
                    $(this).css({'border-width':'2px','border-color':'#428bca'});
                    last=this;
                });
                $('#sub-panel-save').click(function(){
                    if (last){
                        $modal.modal('hide');
                        if(opt.thumbnail) {
                            $(dom).attr({'src':$(last).children('img').attr('src'),'src-data':$(last).attr('src-data')})
                        }
                        else $(dom).attr('src',$(last).attr('src-data'));
                    }
                });
            });
            break;
    }
};
indexEditor.content.disEditModal=function(type,dom){
    var data={};
    data.panelWidth=indexEditor.panelWidth;
    var tmplId=type+'Content';
    var panel=$('#edit-panel')[0];
    switch (type){
        case 'text':
            var $textNode=$(dom).children().first();
            data.content=$textNode.html();
            data.style=$textNode.attr('style');
            //Render template
            $(panel).html(tmpl(tmplId,data));
            //Set edit handler
            $(panel).find('.edit')[0].onclick=function(){
                indexEditor.content.subModal('text',$(panel).find('.content')[0],{'disabled':{'textSize':true}});
            };
            break;
        case 'img':
            var $imgNode=$(dom).children().first();
            data.imgSrc=$imgNode.attr('src');
            //Render template
            $(panel).html(tmpl(tmplId,data));
            //Set edit handler
            $(panel).find('.edit')[0].onclick=function(){
                indexEditor.content.subModal('img',$(panel).find('.image')[0],undefined);
            };
            break;
        case 'picture-wall':
            //Get existing pictures
            data.img=[];
            var $gallery=$(dom).find('.least-gallery');
            $gallery.find('li>a').each(function(){
                var pic={title:$(this).attr('title'),src:$(this).attr('href'),thumbnail:$(this).children('img').attr('src')};
                data.img.push(pic);
            });
            //Render template
            $(panel).html(tmpl(tmplId,data));
            //Set remove handler
            $(panel).find('.remove').click(function(){
                $(this.parentNode.parentNode).remove();
            });
            //Set edit handler
            $(panel).find('.edit').click(function(){
                indexEditor.content.subModal('img',$(this.parentNode.parentNode).find('img')[0],{thumbnail:true});
            });
            //Set add handler
            $(panel).find('.add').click(function(){
                var newItem=document.createElement('div');
                $(newItem).html(tmpl(type+'Item'));
                $(newItem).find('.remove').click(function(){
                    var item=this.parent.parent;
                    $(item).remove();
                });
                $(newItem).find('.edit').click(function(){
                    indexEditor.content.subModal('img',$(this.parentNode.parentNode).find('img')[0],{thumbnail:true});
                });
                $(newItem).attr({'class':'row content','style':'margin:5px'});
                document.getElementById('main-area-for').appendChild(newItem);
            });
            break;
        case 'bootstrapCarousel':
            //Get existing picture
            var $container=$(dom).find('.carousel');
            data.id=$container.attr('id');
            data.img=[];
            $container.find('.item').each(function(){
                var image={};
                image.src=$(this).children('img').attr('src');
                var $caption=$(this).children('.carousel-caption');
                image.title=$caption.children('h3').html();
                image.desc=$caption.children('p').html();
                data.img.push(image);
            });
            // Render tmpl
            $(panel).html(tmpl(tmplId,data));
            // Set remove handler
            $(panel).find('.remove').click(function(){
                $(this.parentNode.parentNode.parentNode).remove();
            });
            // Set edit handler
            $(panel).find('.edit').click(function(){
                indexEditor.content.subModal('img',$(this.parentNode.parentNode).find('img')[0]);
            });
            // Set add handler
            //<div class="inf-group" style="margin:5px">
            $(panel).find('.add').click(function(){
                var item=document.createElement('div');
                $(item).attr({'class':'inf-group','style':'margin:5px'}).html(tmpl(type+'Item'));
                $(item).find('.remove').click(function(){
                    $(this.parentNode.parentNode.parentNode).remove();
                });
                $(item).find('.edit').click(function(){
                    indexEditor.content.subModal('img',$(this.parentNode.parentNode).find('img')[0]);
                });
                document.getElementById('carousel_for').appendChild(item);
            });
            break;
        case 'bootstrapJumbotron':
            // Get existing style
            data.btnTypes=['btn-default','btn-primary','btn-success','btn-info','btn-warning','btn-danger','btn-link'];
            data.title=$(dom).find('.title').html();
            data.content=$(dom).find('.content').html();
            data.button=thmTools.bootstrapButtonDetect($(dom).find('.btn')[0]);
            data.link=$(dom).find('.btn').attr('href');
            data.color=$(dom).find('.jumbotron').css('background-color');
            data.textColor=$(dom).find('.title').css('color');
            data.btnText=$(dom).find('.btn').html();
            // Render panel template
            $(panel).html(tmpl(tmplId,data));
            $(panel).find('.pick-a-color').pickAColor({'showHexInput':false});
            break;
    }
};

indexEditor.content.saveHandle=function(type,dom){
    var panel=document.getElementById('edit-panel');
    switch (type){
        case 'text':
            var $textNode=$(dom).children().first();
            $textNode.html($(panel).find('.content').html())
                     .attr('style',$(panel).find('.content').attr('style'));
            break;
        case 'img':
            var $imgNode=$(dom).children().first();
            $imgNode.attr('src',$(panel).find('.image').attr('src'));
            break;
        case 'picture-wall':
            //Get changed list
            var imgList=[];
            $(panel).find('.content').each(function(){
                var img={};
                var $imgDom=$(this).find('img');
                img.thumbnail=$imgDom.attr('src');
                img.src=$imgDom.attr('src-data');
                img.title=$(this).find('input').val();
                imgList.push(img);
            });
            //Render to page
            $(dom).html(tmpl(type+"Create",imgList));
            break;
        case 'bootstrapCarousel':
            //Get changed list
            var data={};
            data.img=[];
            data.id=thmTools.genRandomStr(6);
            $(panel).find('.inf-group').each(function(){
                var img={};
                img.src=$(this).find('.img-responsive').attr('src');
                img.title=$(this).find('input').val();
                img.desc=$(this).find('textarea').val();
                data.img.push(img);
            });
            //Render to page
            $(dom).html(tmpl(type+"Create",data));
            break;
        case 'bootstrapJumbotron':
            //Get changed list
            var textColor='#'+$(panel).find('.textColor').val();
            var color='#'+$(panel).find('.color').val();

            $(dom).find('.title').html($(panel).find('.title').val()).css('color',textColor);
            $(dom).find('.content').html($(panel).find('.content').val()).css('color',textColor);
            $(dom).find('.jumbotron').css('background-color',color);
            $(dom).find('.btn').attr({'class':'btn btn-lg '+$(panel).find('.button').val(),
                                      'href':$(panel).find('.link').val()})
                               .html($(panel).find('.btnText').val());
            break;
    }
    $('#edit-modal').modal('hide');
};

indexEditor.content.add=function(type){
    var divDom=document.createElement('div');
    var no_pic='/static/resource/icon/no-pic.jpg';
    var data=undefined;
    switch (type){
        case 'text':
            $(divDom).attr({'left':0,'top':0,'right':0.4,'bot':0.2,layer:20,'type':type})
                     .html('<p>some text here</p>');
            break;
        case 'img':
            $(divDom).attr({'left':0,'top':0,'right':0.2,'bot':0.3,layer:20,'type':type})
                     .html("<img src="+no_pic+")></img>");
            break;
        case 'picture-wall':
            data=[{'title':'title','src':no_pic,'thumbnail':no_pic}];
            $(divDom).attr({'left':0,'top':0,'right':1,'bot':0.2,'type':type})
                     .html(tmpl(type+'Create',data));
            break;
        case 'bootstrapCarousel':
            data={img:[{'src':no_pic,'title':'title','desc':'description'}]};
            $(divDom).attr({'left':0,'top':0,'right':1,'bot':0.5,'type':type})
                     .html(tmpl(type+'Create',data));
            break;
        case 'bootstrapJumbotron':
            data={'title':'title','color':'#FFFFFF','textColor':'#000000','content':'content here','btnType':'btn-primary','btnText':'button','link':""};
            $(divDom).attr({'left':0,'top':0,'right':0.4,'bot':0.4,'type':type})
                     .html(tmpl(type+'Create',data));
            break;
    }
    $(divDom).attr('touch-action','none').addClass('div-context');
    indexEditor.sectionDom.appendChild(divDom);
    indexEditor.section.addNewDiv(divDom,indexEditor.section);
    indexEditor.setDrag.call(divDom.indexEdit);
};


//Extend Index Board
section.prototype.getCalPosReverse=function(absPos){
    var rtVal={};
    rtVal.left=absPos.left/this.parent.globalWidth;
    rtVal.right=absPos.right/this.parent.globalWidth;
    rtVal.top=(absPos.top-this.top)/(this.bot-this.top);
    rtVal.bot=(absPos.bot-this.top)/(this.bot-this.top);
    return rtVal;
};

section.prototype.resetSize=function(size){
    if(size==undefined) return;
    $(this.dom).attr('height',size);
    this.setSize();
    this.reCorrectHeight();
};

section.prototype.resetBackground=function(background){
    if (background==undefined) return;
    $(this.dom).attr('background',background);
    this.backgroundImg=this.setBackground();
    this.parent.setBackground(true);
};

section.prototype.resetCan=function(color,opacity){
    if(color==undefined || opacity==undefined) return;
    $(this.canDom).attr({'color':color,'opacity':opacity});
    this.setCan();
};

section.prototype.reGetSize=function(){
    this.top=this.dom.offsetTop;
    this.bot=this.dom.offsetHeight+this.dom.offsetTop;
};
section.prototype.reCorrectHeight=function(){
    var _actBot=this.actBot;
    this.correctHeight();
    var pos;
    if(_actBot!=this.actBot){
        for(var i=0; i<this.parent.con.length; i++){
            if(this.parent.con[i]==this){
                pos=i;
                break;
            }
        }
        for(i=pos+1; i<this.parent.con.length; i++){
            this.parent.con[i].reGetSize();
            for(var j=0; j<this.parent.con[i].con.length; j++){
                this.parent.con[i].con[j].setTop();
                this.parent.con[i].con[j].dom.drag.reHandlePos();
            }
        }
    }
};
section.prototype.addNewDiv=function(dom,parent){
    var thisDiv=new div(dom,parent);
    dom.indexEdit=thisDiv;
    this.con.push(thisDiv);
    this.reCorrectHeight();
};
div.prototype.resetWidthLeft=function(left,right){
    if (left==undefined || right==undefined) return;
    $(this.dom).attr({'left':left,'right':right});
    this.setLeft();
    this.setWidth();
};
div.prototype.resetHeightTop=function(top,bot){
    if (top==undefined || bot==undefined) return;
    $(this.dom).attr({'top':top,'bot':bot});
    this.setTop();
    this.setHeight();
};
div.prototype.resetLayer=function(layer){
    if (layer==undefined) return;
    $(this.dom).attr({'layer':layer});
    this.setLayer();
};
div.prototype.resetAnimation=function(){
    this.setAnimation();
};
div.prototype.resetAll=function(){
    var dom=this.dom;
    var parent=this.parent;
    this.removeSelf();
    parent.addNewDiv(dom,parent);
};
div.prototype.removeSelf=function(){
    for(var i=0; i<this.parent.con.length; i++){
        if(this.parent.con[i]==this){
            this.parent.con.splice(i,1);
            break;
        }
    }
    this.parent.reCorrectHeight();
};