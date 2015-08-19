"use strict";

var mouseElement=null;

function getTop(obj){
	return parseInt(obj.style.top, 10);
}

function getLeft(obj){
	return parseInt(obj.style.left, 10);
}

function getWidth(obj){
	return parseInt(obj.style.width, 10);
}

function getHeight(obj){
	return parseInt(obj.style.height, 10);
}


function getTags(obj){
	var result={};
	var tags=obj.getAttribute('data-tags');
	if (tags){
		var pairs=tags.split(',');
		for (var i=0; i< pairs.length;i++){
			var pair=pairs[i].split(':');
			if (pair.length==2)	result[pair[0]]=pair[1];
		}
	}
//	console.log(result);
	return(result);
}

function getCursor(obj,x,y){
	var tags=getTags(obj);
	var hasgrips=tags.grip;
	if (!hasgrips) return('default');
	var w=parseInt(obj.style.width,10);
	var h=parseInt(obj.style.height,10);
	var corner=6; // corner 
	var edge=4;   // edge
	var cursor='';
	if (hasgrips.indexOf('s')>=0 && hasgrips.indexOf('e')>=0 && x > (w-corner) && y > (h-corner)) cursor='se-resize';
	else
		if (hasgrips.indexOf('w')>=0 && x < edge) cursor='w-resize';
		else
			if (hasgrips.indexOf('e')>=0 && x > (w-edge)) cursor='e-resize';
			else
				if (hasgrips.indexOf('n')>=0 && y < edge) cursor='n-resize';
				else
					if (hasgrips.indexOf('s')>=0 && y > (h-edge)) cursor='s-resize';
					else cursor='default';
	obj.style.cursor=cursor;
	return(cursor);
}

function mousePosition(e){
    var pos = {x:0,y:0};
	if(!e.hasOwnProperty('offsetX')){
	    pos.x = e.layerX;
	    pos.y = e.layerY;
	}
	else
	{
	    pos.x = e.offsetX;
	    pos.y = e.offsetY;
	}
    return(pos);	
}

function mousemove(event) {
	var x=event.offsetX;
	var y=event.offsetY;
	if (dragInfo.dragging==false){
		var cursor=getCursor(event.target,x,y);
		dragInfo.cursor=cursor;
	}
	if (debug){
		var info = document.getElementById("info");
		info.innerHTML=event.target.id+' position: '+x+','+y+'; cursor='+cursor+'; dragging='+dragInfo.dragging;
	}
	mouseElement=event.target;
}

function getNewId(name){
	var elements = document.querySelectorAll("[id^='"+name+"']");
	var arr=[];
	for (var i = 0; i < elements.length; i++) {
		var n=Number(elements[i].id.slice(name.length));
		if (n) arr.push(n);
	}
	arr.sort(function(a, b){return a-b;});
	if (arr.length==0) var num=1;
	else num=arr[arr.length - 1]+1;
	return name+num;
}

function elemLineage(elem,id){
	// check if elem id=id or has ancester with id=id
    if (elem==undefined) return false;
	if (elem.id==id) return true;
	while (elem.parentNode && elem.parentNode.id!=id) {elem=elem.parentNode;}
	if (elem.parentNode==null) return false;
	return elem.parentNode.id==id;
}

function mousedown(event) {
	var x=event.offsetX;
	var y=event.offsetY;
	var info = document.getElementById("infobar1");
	info.innerHTML=event.target.id+'.'+event.target.className+', x:'+x+', y:'+y;
	var elem=document.getElementById(event.target.id);
	if (elem) if (mode==mode_sel && elem.id=='contentpane') leftPaneClear();
	if (!elemLineage(elem,'contentpane')) return; 
	
	if (mode==mode_div){ // insert div
		var div = document.createElement('div');
		div.id=getNewId('div');
		div.style.left=x+'px';
		div.style.top=y+'px';
		div.style.width='100px';
		div.style.height='100px';
		div.setAttribute('data-tags',"type:project,grip:nsew,id:idx,class:box"); 
		div.setAttribute('class', 'box'); 
		div.setAttribute('onmousedown', "dragStart(event)"); 
		elem.appendChild(div);		
	}
	if (mode==mode_label){ // insert label
		var div = document.createElement('div');
		div.id=getNewId('label');
		div.style.left=x+'px';
		div.style.top=y+'px';
		div.style.width='100px';
		div.style.height='20px';
		div.setAttribute('data-tags',"type:project,grip:nsew,id:idx,class:label"); 
		div.setAttribute('class', 'prjlabel'); 
		div.setAttribute('onmousedown', "dragStart(event)");
		div.innerHTML=div.id;
		elem.appendChild(div);		
	}
	if (mode==mode_input){ // insert input
		var div = document.createElement('input');
		div.id=getNewId('edit');
		div.style.left=x+'px';
		div.style.top=y+'px';
		div.style.width='50px';
		div.style.height='20px';
		div.setAttribute('data-tags',"type:project,grip:nsew,id:idx,class:input"); 
		div.setAttribute('class', 'edit'); 
		div.setAttribute('onmousedown', "dragStart(event)");
		div.setAttribute('type','text');
		div.innerHTML=div.id;
		elem.appendChild(div);		
	}
	if (mode==mode_button){ // insert button
		var div = document.createElement('input');
		div.id=getNewId('button');
		div.style.left=x+'px';
		div.style.top=y+'px';
		div.style.width='40px';
		div.style.height='20px';
		div.setAttribute('data-tags',"type:project,grip:nsew,id:idx,class:button"); 
		div.setAttribute('class', 'button'); 
		div.setAttribute('onmousedown', "dragStart(event)");
		div.setAttribute('type','button');
		div.innerHTML=div.id;
		elem.appendChild(div);		
	}
	if (mode==mode_checkbox){ // insert checkbox
		var div = document.createElement('input');
		div.id=getNewId('checkbox');
		div.style.left=x+'px';
		div.style.top=y+'px';
		div.style.width='20px';
		div.style.height='20px';
		div.setAttribute('data-tags',"type:project,grip:nsew,id:idx,class:checkbox"); 
		div.setAttribute('class', 'checkbox'); 
		div.setAttribute('onmousedown', "dragStart(event)");
		div.setAttribute('type','text');
		div.innerHTML=div.id;
		elem.appendChild(div);		
	}
	if (mode==mode_combo){ // insert select-combobox
		var div = document.createElement('select');
		div.id=getNewId('combo');
		div.style.left=x+'px';
		div.style.top=y+'px';
		div.style.width='100px';
		div.style.height='20px';
		div.setAttribute('data-tags',"type:project,grip:nsew,id:idx,class:select"); 
		div.setAttribute('class', 'combo'); 
		div.setAttribute('onmousedown', "dragStart(event)");
		div.innerHTML=div.id;
		elem.appendChild(div);		
	}
	if (mode==mode_image){ // insert iamge
        //<img src="pic_mountain.jpg" alt="Mountain View" style="width:304px;height:228px;">
		var div = document.createElement('img');
        div.src="";
		div.id=getNewId('img');
		div.style.left=x+'px';
		div.style.top=y+'px';
		div.style.width='40px';
		div.style.height='20px';
		div.setAttribute('data-tags',"type:project,grip:nsew,id:idx,class:image"); 
		div.setAttribute('class', 'image'); 
		div.setAttribute('onmousedown', "dragStart(event)");
		div.setAttribute('type','image');
		div.innerHTML=div.id;
		elem.appendChild(div);		
	}

	setToolbarMode('sel');
}

//////////////////////////////////////////////////////////
// 														//
// 						dragging 						//
// 														//
//////////////////////////////////////////////////////////

// Global object to hold drag information.
var dragInfo = {
	cursorStartX : 0,
	cursorStartY : 0,
	elStartLeft : 0,
	elStartTop : 0,
	elStartHeight : 0,
	elStartWidth : 0,
	dragElement : null,
	leftPaneElement : null, 
	dragging: false,
	moveParent: false,
	parentLeft: 0,
	parentTop: 0,
	cursor : 'default' 
};

function getDragPos(event) {
	var x, y;
	x = event.clientX + window.scrollX;
	y = event.clientY + window.scrollY;
	return ( {
		x : x,
		y : y
	});
}

function dragStart(event) {  // mousedown on html element
	if (mode!=mode_sel) return;
	var obj = event.target;
	var tags=getTags(obj);
	if (!tags) return;
	var hasgrips=tags.grip;
	if (!hasgrips) return;
	var startmove=false;
	event.preventDefault();
	event.stopPropagation();

	if (tags.type=='project'){
		leftPaneSetup(obj);

		if (dragInfo.leftPaneElement) {
			dragInfo.leftPaneElement.style.borderColor=null;
			if (dragInfo.leftPaneElement.id==obj.id) startmove=true; // move starts when mouse down on selected element
		}
		obj.style.borderColor='blue';
		dragInfo.leftPaneElement=obj;
	}
	if (!startmove && tags.type=='project' ) return;
	dragInfo.moveParent=false;
	if (tags.moveparent) dragInfo.moveParent = tags.moveparent; 
	dragInfo.parentLeft=obj.offsetParent.offsetLeft;//getLeft(obj.offsetParent);
	dragInfo.parentTop=obj.offsetParent.offsetTop;//getTop(obj.offsetParent);
	dragInfo.dragElement = obj;
	dragInfo.dragging = true;
	var pos = getDragPos(event);
	// Save starting positions of cursor and element.
	dragInfo.cursorStartX = pos.x;
	dragInfo.cursorStartY = pos.y;
	dragInfo.elStartLeft = getLeft(obj); //obj.offsetLeft;//
	dragInfo.elStartTop = getTop(obj); //obj.offsetTop;//
	dragInfo.elStartWidth = getWidth(obj);
	dragInfo.elStartHeight = getHeight(obj);
	// Capture mousemove and mouseup events on the page.
	document.addEventListener("mousemove", dragGo, true);
	document.addEventListener("mouseup", dragStop, true);
	event.preventDefault();
	event.stopPropagation();
	if (debug){
		var info = document.getElementById("info1");
		info.innerHTML = dragInfo.elStartLeft + ' ' + dragInfo.elStartTop;
	}
}

function dragGo(event) {
	var grid=4;
	var pos = getDragPos(event);
	var drLeft = Math.round((dragInfo.elStartLeft + pos.x - dragInfo.cursorStartX)/grid)*grid;
	var drTop =  Math.round((dragInfo.elStartTop + pos.y - dragInfo.cursorStartY)/grid)*grid;
	var drHeightSouth = (dragInfo.elStartHeight + pos.y - dragInfo.cursorStartY);
	var drHeightNorth = (dragInfo.elStartHeight - pos.y + dragInfo.cursorStartY);
	var drWidthEast = (dragInfo.elStartWidth + pos.x - dragInfo.cursorStartX);
	var drWidthWest = (dragInfo.elStartWidth - pos.x + dragInfo.cursorStartX);
	var target=dragInfo.dragElement;
	if (target.id=='leftpane') {
		if (dragInfo.cursor == 'e-resize') {
			leftpanewidth=drWidthEast;
			adjustsize();
		}
	}
	else
	if (dragInfo.cursor == 'default') {
		if (dragInfo.moveParent){
			target.offsetParent.style.left=dragInfo.parentLeft + pos.x - dragInfo.cursorStartX+'px';
			target.offsetParent.style.top=dragInfo.parentTop + pos.y - dragInfo.cursorStartY + 'px';
		}
		else{
			target.style.left = drLeft + "px";
			target.style.top = drTop + "px";
		}
		
	} else if (dragInfo.cursor == 's-resize') {
		target.style.height = drHeightSouth + "px";
	} else if (dragInfo.cursor == 'n-resize') {
		target.style.height = drHeightNorth + "px";
		target.style.top = drTop + "px";
	} else if (dragInfo.cursor == 'e-resize') {
		target.style.width = drWidthEast + "px";
	} else if (dragInfo.cursor == 'w-resize') {
		target.style.width = drWidthWest + "px";
		target.style.left = drLeft + "px";
	} else if (dragInfo.cursor == 'se-resize') {
		target.style.width = drWidthEast + "px";
		target.style.height = drHeightSouth + "px";
	}
	event.preventDefault();
	event.stopPropagation();
	var dx = pos.x - dragInfo.cursorStartX;
	var dy = pos.y - dragInfo.cursorStartY;
	if (debug){
		var info = document.getElementById("info2");
		info.innerHTML = drLeft + ' ' + drTop;
	}
	leftPaneSetup(dragInfo.leftPaneElement);
}

function dragStop(event) {
	dragInfo.dragging = false;
	document.removeEventListener("mousemove", dragGo, true);
	document.removeEventListener("mouseup", dragStop, true);
	var pos = getDragPos(event);
	var dx = pos.x - dragInfo.cursorStartX;
	var dy = pos.y - dragInfo.cursorStartY;
//	if (dragInfo.params && dragInfo.params.upfunc)
//		dragInfo.params.upfunc(dx, dy);
}

function dragDummy(event) {
	event.stopPropagation();
}


