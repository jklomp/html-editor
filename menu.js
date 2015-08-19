"use strict";

//////////////////////////////////////////////////////////////////////
//																	//
//                           tool bar								//
//																	//
//////////////////////////////////////////////////////////////////////

var img = new Image();
var context;

var toolBar=[];

var mode          = 0; // global mode variable
var mode_button   = 1;
var mode_div      = 2;
var mode_label    = 3;
var mode_combo    = 4;
var mode_checkbox = 5;
var mode_input    = 6;
var mode_drag     = 7;
var mode_sel      = 8;
var mode_image    = 9;

function initMouseHandlers1(canvas, handler) {
	if (canvas.addEventListener) {
		canvas.addEventListener("mousewheel", handler.scroll, false);
        canvas.addEventListener("mousedown", handler.down, false);
        canvas.addEventListener("mousemove", handler.move, false);
        canvas.addEventListener("mouseup", handler.up, false);
		canvas.addEventListener("mouseout", handler.out, false);
	}
}

function toolbarFindItemAt(xpos)
{
    var x1=0;
	var x2=0;
	for (var i in toolBar)
	{
	    var item=toolBar[i];
		if (item.type=="img") x2+=item.dw+7;
		if (item.type=="sep") x2+=6;
		if (xpos >= x1 && xpos <= x2 && item.type=="img") return(i);
	}
	return(-1);
}

function deselectGroup(group){
	for (var i in toolBar) {
		if (toolBar[i].group==group) toolBar[i].selected=false;
	}	
}

function toolbarMouseDown(e) {
	var pos=mousePosition(e);
    var index=toolbarFindItemAt(pos.x);
	if (index >=0)
	{
		if (toolBar[index].group > 0)
		{
			deselectGroup(toolBar[index].group);
			toolBar[index].selected=true;
		}
		if (toolBar[index].func!=null) toolBar[index].func();
	}
}

function toolbarMouseMove(e) {
	var pos=mousePosition(e);
    var index=toolbarFindItemAt(pos.x);
	if (index >=0) 
	{
		for (var i in toolBar)	toolBar[i].hover=false;
		toolBar[index].hover=true;
		document.getElementById('toolbar').title=toolBar[index].tooltip;
		toolbarPaint();
	}
}

function toolbarMouseOut(e) {
    for (var i in toolBar)	toolBar[i].hover=false;
	document.getElementById('toolbar').title='';
	toolbarPaint();
}

var toolbarMouseHandlers = {
	scroll : null,
	down   : toolbarMouseDown,
	move   : toolbarMouseMove,
	up     : null,
	out    : toolbarMouseOut
};

function toolBarItem(data) {
    var item={};
	var col=data.img % 6;
	var row=(data.img-col)/ 6;
	item.sx=col*data.size;
	item.sy=row*data.size;
	item.dw=data.size;
	item.type=data.type;
	item.group=data.group;
	item.func=data.func;
	item.id=data.id;
	item.tooltip=data.tooltip;
	item.hover=false;
	item.selected=false;
    return item;
}

toolBar.push(toolBarItem({id:'open',   img:10,size:22,type:'img',group:0,func:openFile,tooltip:'open file'}));           // open
toolBar.push(toolBarItem({id:'save',   img:11,size:22,type:'img',group:0,func:saveFileAs,tooltip:'save file'}));         // save
toolBar.push(toolBarItem({id:'sep',    img:-1,size:0, type:'sep',group:0,func:null,tooltip:'test'}));
toolBar.push(toolBarItem({id:'sep',    img:-1,size:0, type:'sep',group:0,func:null,tooltip:'test'}));
toolBar.push(toolBarItem({id:'sel',    img:0, size:22,type:'img',group:1,func:setmode,tooltip:'select mode [esc]'}));    // select
toolBar.push(toolBarItem({id:'div',    img:19,size:22,type:'img',group:1,func:setmode,tooltip:'place div [d]'}));        // div
toolBar.push(toolBarItem({id:'label',  img:20,size:22,type:'img',group:1,func:setmode,tooltip:'place label [l]'}));      // label
toolBar.push(toolBarItem({id:'input',  img:21,size:22,type:'img',group:1,func:setmode,tooltip:'place input [i]'}));      // input
toolBar.push(toolBarItem({id:'button', img:22,size:22,type:'img',group:1,func:setmode,tooltip:'place button [b]'}));     // button
toolBar.push(toolBarItem({id:'checkbox',img:23,size:22,type:'img',group:1,func:setmode,tooltip:'place checkbox [c]'}));  // checkbox
toolBar.push(toolBarItem({id:'combo',  img:24,size:22,type:'img',group:1,func:setmode,tooltip:'place select element [s]'}));  // select-combobox  
toolBar.push(toolBarItem({id:'image',  img: 4,size:22,type:'img',group:1,func:setmode,tooltip:'place image [m]'}));      // image  
toolBar.push(toolBarItem({id:'sep',    img:-1,size:0, type:'sep',group:0,func:null,tooltip:'test'}));
toolBar.push(toolBarItem({id:'sep',    img:-1,size:0, type:'sep',group:0,func:null,tooltip:'test'}));

function toolbarPaint() { 
	var destx=0;

	for (var i=0; i < toolBar.length; i++) {
	    var item=toolBar[i];
		context.beginPath();
	    if (item.hover || item.selected)
		{	
			context.fillStyle='#d1e2f2';
			if (item.selected) context.fillStyle='#b4d4f4';
			context.strokeStyle="#60a1e2";
		}
		else
		{
			context.fillStyle='white';
			context.strokeStyle="white";
		}
		if (item.type=="img")
		{
			context.fillRect(destx+0.5,1.5,28,28);
			context.rect(destx+0.5,1.5,28,28);
			context.drawImage(img,item.sx,item.sy,22,22,destx+4,4,item.dw,22);
			destx+=item.dw+7;
		}
		if (item.type=="sep")
		{	
		    context.strokeStyle="gray";
			context.moveTo(destx+2.5,2.5);
			context.lineTo(destx+2.5,26);
			destx+=6;
		}
		context.stroke();
	}
}

img.onload = function () { // Triggered when image has finished loading.
	toolbarPaint();
};

function testbuttonmousedown(e){
	context.fillStyle = "green";
	context.fillRect(0,0,canvas.width,canvas.height);
}

function findToolbarItem(id){
	for (var i in toolBar) {
		if (toolBar[i].id==id) return(i);
	}
	return(-1);
}
 
function initToolBar(){
	var div = document.getElementById("toolbar");
	var canvas = document.createElement("canvas");
	canvas.id='toolbarcanvas';
	canvas.width=div.clientWidth;
	canvas.height=div.clientHeight;
	div.appendChild(canvas);
	context=canvas.getContext("2d");
	context.globalAlpha = 1;
	img.src = 'icons.gif'; 
	initMouseHandlers1(canvas, toolbarMouseHandlers);
	toolBar[findToolbarItem('sel')].selected=true;
	setmode();
}

function setToolBarWidth(w){
	var canvas = document.getElementById("toolbarcanvas");
    if (canvas) { 
		canvas.width=w-5;
		toolbarPaint();
	}
}


function setmode() {
	var content=document.getElementById("contentpane");
	content.style.cursor="default";
    mode=0;
	if (toolBar[findToolbarItem('div')].selected)    	mode=mode_div;
	if (toolBar[findToolbarItem('label')].selected) 	mode=mode_label;
	if (toolBar[findToolbarItem('input')].selected)  	mode=mode_input;
	if (toolBar[findToolbarItem('sel')].selected)    	mode=mode_sel;
	if (toolBar[findToolbarItem('button')].selected) 	mode=mode_button;
	if (toolBar[findToolbarItem('combo')].selected) 	mode=mode_combo;
	if (toolBar[findToolbarItem('checkbox')].selected)  mode=mode_checkbox;
	if (toolBar[findToolbarItem('image')].selected)     mode=mode_image;
}

function setToolbarMode(name){
	deselectGroup(1);
	toolBar[findToolbarItem(name)].selected=true;
	setmode();
	toolbarPaint();
}

function toolBarKeyDown(code){
	if (code==68) setToolbarMode('div');    	//d
	if (code==76) setToolbarMode('label');  	//l
	if (code==73) setToolbarMode('input');  	//i
	if (code==66) setToolbarMode('button'); 	//b
	if (code==67) setToolbarMode('checkbox'); 	//c
	if (code==83) setToolbarMode('combo');    	//s
	if (code==27) setToolbarMode('sel');    	//esc
	if (code==77) setToolbarMode('image');  	//m
}

//////////////////////////////////////////////////////////////////////
//																	//
//                             menu								    //
//																	//
//////////////////////////////////////////////////////////////////////

var menudef=[
     		{
     			name 	: 'filemenu',
     			caption : 'file',
     			items 	: [
     			      	   	{text:'new',          	shortcut:'',	func:newFile,		index:0},
     			      	   	{text:'open',			shortcut:'',	func:openFile,      index:0},
     			      	   	{text:'save',			shortcut:'',	func:saveFileAs,	index:0},
     			      	   	{text:'html output',	shortcut:'',	func:saveAsHtml,	index:0},
     			      	   	{text:'exit',			shortcut:'',	func:null,          index:0}
     			         ]
     		},
     		{
     			name 	: 'helpmenu',
     			caption : 'help',
     			items 	: [
     			      		{text:'help',   		shortcut:'F9',	func:openhelp,			index:0}
     				   	]
     		}

     ];

function initMenu(){
	//	<a id="filemenu"    onmouseover="filemenu()"    onmouseleave="leavepopup()" onclick="menuclick(filemenu)">file</a>  
	var html='';
	for (var i=0; i< menudef.length;i++) html+=
		'<a id="menuitem_'+i+'" onmouseover="menuover(event)"  onmouseleave="leavepopup()" onclick="menuclick(event)">'+menudef[i].caption+'</a>';  
	var menu=document.getElementById('menu');
	menu.innerHTML=html;
}

var popupvisible =false;

function menuclick(event) {
	popupvisible=true;
	menuover(event);
}

function showpopup(){
	enterpopup();
	return(popupvisible);
}

function menuover(event){
	if (!showpopup()) return;
	var index=event.target.id.split('_')[1];
	var rect = event.target.getBoundingClientRect();
	popup({ x:rect.left,
			y:rect.bottom,
			width:170,
			items:menudef[index].items
		  });

}

//////////////////////////////////////////////////////////////////////
//																	//
//							popup submenu   						//
//																	//
//////////////////////////////////////////////////////////////////////


var menuinfo;
var timeout;

function popup(data){
	menuinfo=data;
	if (menuinfo.items.length==0) return;
	var html='';
	var left=0;
	var top=0;
	var height=19;
	var width=menuinfo.width;
	var id=0;
	var acckey ='';
	if (menuinfo.items){
	    var items=menuinfo.items;
		for (var i in items) {
			if (items[i].text=='separator') {
				html+='<div class="popupseparator" style="left:'+left+'+px;top:'+top+'px;height:5px;width:'+(width+1)+'px" id="popupverticalspace" ></div>';
				top+=3;
				html+='<div class="popupseparator" style="left:'+left+'+px;top:'+top+'px;height:5px;width:'+(width+1)+'px" id="popupseparator" ></div>';
				top+=3;
			}
			else
			{
				if (items[i].disabled) var color='gray'; else color='black';
				html+='<div class="popupitem" style="color:'+color+';left:'+left+'+px;top:'+top+'px;height:'+height+'px;width:'+width+'px" id="popupitem'+id+'" onclick="popupclick('+id+')">';
				html+='<div>'+items[i].text+'</div><div style="position:absolute; left:'+(width-35)+'px; top: 0px;">'+items[i].shortcut+'</div>';
				html+='</div>';
				top+=20;
			}
			id+=1;
		}
	}
	else
	for (var i in menuinfo.text) {
		html+='<div class="popupitem" style="left:'+left+'+px;top:'+top+'px;height:'+height+'px;width:'+width+'px" id="popupitem'+id+'" onclick="popupclick('+id+')">';
//		html+=menuinfo.text[i];
		if (menuinfo.shortcut) acckey=menuinfo.shortcut[i]; else acckey='';
		html+='<div>'+menuinfo.text[i]+'</div><div style="position:absolute; left:'+(width-35)+'px; top: 0px;">'+acckey+'</div>';
		html+='</div>';
		top+=20;
		id+=1;
	}
	var popupmenu=document.getElementById('popupmenu');
	popupmenu.innerHTML=html;
	popupmenu.style.left=menuinfo.x+2;
	popupmenu.style.top=menuinfo.y;
	popupmenu.style.width=width+7;
	popupmenu.style.height=top+1;
	popupmenu.style.display = 'block';
	popupmenu.addEventListener('mouseenter', enterpopup, false);
	popupmenu.addEventListener('mouseleave', leavepopup, false);
}

	
function enterpopup(){
	if (timeout) clearTimeout(timeout);
}

function leavepopup(){
	timeout=setTimeout(function () {hidepopup();}, 400);	
}

function hidepopup(){
	var popupmenu=document.getElementById('popupmenu');
	popupmenu.innerHTML="";
	popupmenu.style.display = 'none'; // hide popupmenu
	popupvisible =false;	
}

function popupclick(id){
	hidepopup();
	if (menuinfo.items){menuinfo.items[id].func(menuinfo.items[id].index);}
	else menuinfo.func[id](menuinfo.index[id]);
}


