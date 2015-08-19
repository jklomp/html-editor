"use strict";

function labelToHtml(html,left,top,width,height,id,text){
	html+='<div class="label" style="left:'+left+'px;top:'+top+'px;height:'+height+'px;width:'+width+'px;" id="'+id+'">'+text+'</div>';
	return html;
}

function editToHtml(html,left,top,width,height,id,text){
	html+='<input class="edit" type="text" style="left:'+left+'px;top:'+top+'px;height:'+height+'px;width:'+
	width+'px;" id="'+id+'" onblur="inputblur(event)" onfocus="inputfocus(event)" value="'+text+'">';
	return html;
}

var leftPaneObject=null;
var leftPaneEditObject=null;

var editId=['sysid','sysclass','id','class','left','top','width','height','text','source','param1','param2','param3','param4'];

function paramToValue(tags,param){
	var value='';
	if (tags[param]){
		value=tags[param];
		value=value.replace(/&alpha;/g, ':');
		value=value.replace(/&beta;/g, ',');
	}
	return value;
}

function leftPaneSetup(obj){
	leftPaneObject=obj;
	var html='';
	var labelleft=5;
	var labeltop=100;
	var editleft=labelleft+80;
	var edittop=labeltop-4;
	var vdist=24;
	var labels=['sysid','sysclass','id','class','left','top','width','height','text','image src','attrib 1','attrib 2','attrib 3','attrib 4'];
	if (debug) var start=0; else start=2;
	for (var i=start;i<labels.length;i++){
		html=labelToHtml(html,labelleft,labeltop,100,15,'leftPanelLabel'+i,labels[i]);
		labeltop+=vdist;
	}
	if (obj){
		var tags=getTags(obj);
		if (obj.className=='prjlabel') var text=obj.innerHTML; 
		else if (obj.className=='edit' || obj.className=='button') text=obj.value; 
		else if (obj.className=='box' && tags.text) text=tags.text; 
		else text='';
        if (obj.src) var source=obj.src.split('/').pop(); else source='';
		var editValue=[obj.id, obj.className,tags.id,tags.class,
		               parseInt(obj.style.left,10),
		               parseInt(obj.style.top,10),
		               parseInt(obj.style.width,10),
		               parseInt(obj.style.height,10),
		               text,
                       source,
		               paramToValue(tags,'param1'),
		               paramToValue(tags,'param2'),
		               paramToValue(tags,'param3'),
		               paramToValue(tags,'param4')];
	}
	else var editValue=['','','','','','','','','','','','','',''];
	for (var i=start;i<editValue.length;i++){
		html=editToHtml(html,editleft,edittop,leftpanewidth-95,21,'leftpane_'+editId[i],editValue[i]);
		edittop+=vdist;
	}
	var leftpane=document.getElementById("leftpane");
	leftpane.innerHTML=html;
}

function tagsToObj(tags,obj){
	var str=JSON.stringify(tags).replace(/"/g,'').replace(/{/,'').replace(/}/,'');
	obj.setAttribute('data-tags',str);
	if (debug){
		var info3=document.getElementById("info3");
		info3.innerHTML+=', data-tags="'+str+'"';
	}
}

function inputfocus(event){
	leftPaneEditObject=leftPaneObject;
}

function inputblur(event){
	if (!dragInfo.leftPaneElement) return;
	var target=event.target;
	var value=target.value;
	    value=value.replace(/:/g,'&alpha;');    // : --> alpha
	    value=value.replace(/,/g,'&beta;');     // , --> beta
	    value=value.replace(/"/g,'&quot;');     // " --> "
	if (debug){
		var info3=document.getElementById("info3");
		info3.innerHTML='target='+target.id+'; value='+value;
	}
	var obj=leftPaneEditObject;
	var tags=getTags(obj);
	if (obj){
		var field=target.id.split('_')[1];
		if (field=='left') obj.style.left=value+'px'; 
		if (field=='top') obj.style.top=value+'px'; 
		if (field=='width') obj.style.width=value+'px'; 
		if (field=='height') obj.style.height=value+'px'; 
		if (field=='id') {tags.id=value; tagsToObj(tags,obj);}
		if (field=='class') {tags.class=value;tagsToObj(tags,obj);}
		if (field=='text') {
			if (obj.className=='prjlabel') obj.innerHTML=target.value; 
			else if (obj.className=='edit' || obj.className=='button') obj.value=value;
			else if (obj.className=='box') {tags.text=value; tagsToObj(tags,obj);}
		}
		if (field=='source') {obj.src=value;}
		if (field=='param1' || field=='param2' || field=='param3' || field=='param4'){
			if (value =='' && tags[field]!=null) delete tags[field]; 
			else if (value !='') tags[field]=value;
			tagsToObj(tags,obj);	
		}
	}
}

function leftPaneClear(){
	if (dragInfo.leftPaneElement) dragInfo.leftPaneElement.style.borderColor=null;
	dragInfo.leftPaneElement=null;
	leftPaneSetup(null);
}

function moveElement(element,dx,dy){
	if (element!=null){
		var left=parseInt(element.style.left,10);
		var top=parseInt(element.style.top,10);
		element.style.left=left+dx+'px';
		element.style.top=top+dy+'px';
	}
}

function leftPaneKeyDown(code){
	var obj=dragInfo.leftPaneElement;
	if (code==37){ //left
		moveElement(obj,-1,0);
		leftPaneSetup(obj);
	}
	if (code==39){ //right
		moveElement(obj,1,0);
		leftPaneSetup(obj);
	}
	if (code==38){ //up
		moveElement(obj,0,-1);
		leftPaneSetup(obj);
	}
	if (code==40){ //down
		moveElement(obj,0,1);
		leftPaneSetup(obj);

	}
}
