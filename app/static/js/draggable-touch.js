var drag=function(opt){
    var p,cur=this;
    if(!thmTools.propertyRequire(opt,['dom'])) return;
    this.container=opt.dom.offsetParent;
    this.dom=opt.dom;
    if(opt.topBar){

    }
    //Handle Position
    p=thmTools.absPos(this.dom);
    this.left= p.left;
    this.right= p.left+this.dom.offsetWidth;
    this.top= p.top;
    this.bot= p.top+this.dom.offsetHeight;
    this.boundary={};
    this.boundarySize=opt.size;
    this.initBoundary(opt.size);
    //Set status
    this.cssLeft=this.dom.offsetLeft;
    this.cssTop=this.dom.offsetTop;
    this.drag=false;
    this.lastX=NaN;
    this.lastY=NaN;
    //Bind action
    $(this.dom).on('pointerdown',function(e){cur.down(e);});
    $(this.dom).on('pointermove',function(e){cur.move(e);});
    $(this.dom).on('pointerup',function(e){cur.up(e);});
    $(this.dom).on('pointerout',function(e){cur.out(e);});
    //Create custom event
    this.event={};
    this.event.thmDragEnd=document.createEvent('HTMLEvents');
    this.event.thmDragEnd.initEvent('thmdragend',false,true);
    //Add attributes and functions for dom
    this.dom.thmDrag={};
    this.dom.thmDrag.boundLeft=this.left-this.boundary.left;
    this.dom.thmDrag.boundTop=this.top-this.boundary.top;
};

drag.prototype={
    initBoundary:function(opt){
        var pPos,cur=this;
        if(!opt){
            if(this.container) opt=this.container;
            else {
                console.log('Failed:element should has a parent');
                return;
            }
        }
        if(opt.type=='absolute'){
            this.boundary.left=opt.left;
            this.boundary.right=opt.right;
            this.boundary.top=opt.top;
            this.boundary.bot=opt.bot;
        }
        else if(opt.type=='relative'){
            pPos=thmTools.absPos(this.container);
            this.boundary.left=pPos.left+opt.left;
            this.boundary.right=pPos.left+opt.right;
            this.boundary.top=pPos.top+opt.top;
            this.boundary.bot=pPos.top+opt.bot;
        }
        else if(typeof (opt) =='object'){
            this.bind=opt;
            pPos=thmTools.absPos(opt);
            this.boundary.left=pPos.left;
            this.boundary.right=pPos.left+opt.offsetWidth;
            this.boundary.top=pPos.top;
            this.boundary.bot=pPos.top+opt.offsetHeight;
        }
    },
    updateSize:function(){
        var p=thmTools.absPos(this.dom);
        this.left= p.left;
        this.right= p.left+this.dom.offsetWidth;
        this.top= p.top;
        this.bot= p.top+this.dom.offsetHeight;
        this.cssLeft=this.dom.offsetLeft;
        this.cssTop=this.dom.offsetTop;
    },
    updateBoundarySize:function(){
        if(this.bind){
            this.initBoundary(this.bind);
        }
    },
    //Setting functions
    down:function(e){
        e.preventDefault();
        var x= e.pageX;
        var y= e.pageY;
        this.lastX= x;
        this.lastY=y;
        this.drag=true;
    },
    move:function(e){
        if(!this.drag) return;
        e.preventDefault();
        var x= e.pageX;
        var y= e.pageY;
        var offX=x-this.lastX;
        var offY=y-this.lastY;
        this.lastX=x;
        this.lastY=y;
        this.domMove(this.correctInterval({x:offX,y:offY}));
    },
    up:function(e){
        if(!this.drag) return;
        e.preventDefault();
        this.drag=false;
        var x= e.pageX;
        var y= e.pageY;
        var offX=x-this.lastX;
        var offY=y-this.lastY;
        this.lastX=NaN;
        this.lastY=NaN;
        this.domMove(this.correctInterval({x:offX,y:offY}));
        this.dom.dispatchEvent(this.event.thmDragEnd);
    },
    out:function(e){
        if(!this.drag) return;
        e.preventDefault();
        var x= e.pageX;
        var y= e.pageY;
        var offX=x-this.lastX;
        var offY=y-this.lastY;
        this.lastX=x;
        this.lastY=y;
        var corSet=this.correctInterval({x:offX,y:offY});
        this.domMove(corSet);
        if(offX!=corSet.x || offY==corSet.y){
            this.lastX=NaN;
            this.lastY=NaN;
            this.drag=false;
            this.dom.dispatchEvent(this.event.thmDragEnd);
        }
    },
    //Action functions
    domMove:function(off){
        var ix=off.x, iy=off.y;
        $(this.dom).css({'left':(this.cssLeft += ix) + 'px','top':(this.cssTop+=iy)+'px'});
        this.left+=ix;
        this.right+=ix;
        this.top+=iy;
        this.bot+=iy;
        //Change dom attrbutes
        this.dom.thmDrag.boundLeft+=ix;
        this.dom.thmDrag.boundTop+=iy;
    },
    //Dom operation functions
    inArea:function(ix,iy){
        return(
            [this.left+ix>=this.boundary.left && this.right+ix<=this.boundary.right,
                    this.top+iy>=this.boundary.top && this.bot+iy<=this.boundary.bot]
            );
    },
    correctInterval:function(off){
        var ix=off.x, iy=off.y;
        if(this.left+ix<this.boundary.left) ix=this.boundary.left-this.left;
        else if(this.right+ix>this.boundary.right) ix=this.boundary.right-this.right;

        if(this.top+iy<this.boundary.top) iy=this.boundary.top-this.top;
        else if(this.bot+iy>this.boundary.bot) iy=this.boundary.bot-this.bot;
        return {x:ix,y:iy};
    },
    reHandlePos:function(){
        this.initBoundary(this.boundarySize);
        var p=thmTools.absPos(this.dom);
        this.left= p.left;
        this.right= p.left+this.dom.offsetWidth;
        this.top= p.top;
        this.bot= p.top+this.dom.offsetHeight;
        //Set status
        this.cssLeft=this.dom.offsetLeft;
        this.cssTop=this.dom.offsetTop;
        this.dom.thmDrag.boundLeft=this.left-this.boundary.left;
        this.dom.thmDrag.boundTop=this.top-this.boundary.top;
    }
};