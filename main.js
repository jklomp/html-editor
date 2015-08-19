"use strict";

var leftpanewidth = 300;

var debug=false;

function writeerror(object) {
	if (object.err)
		alert('error writing file ' + object.filename + ', error '
				+ object.err.errno);
};

function readfile1(fname,callback,param){  // using GET, param for callback function
    var http=new XMLHttpRequest();
    http.onreadystatechange=function() {
        if (http.readyState==4 && http.status==200) {
            callback(http.responseText,param);
        }
    }
    http.open("GET",fname,true);
    http.send();
}

function readfile(fname,callback){   // using POST
    var http = new XMLHttpRequest();
    http.open("POST","", true);
    http.onreadystatechange = function() {
        if (http.readyState == 4 && http.status == 200) {
            callback(http.responseText);
        }
    }
    http.send(JSON.stringify({func:'readfile',filename:fname}));
}

function writefile(fname,data,callback){
    var http = new XMLHttpRequest();
    http.open("POST","", true);
    http.onreadystatechange = function() {
        if (http.readyState == 4 && http.status == 200) {
            callback(http.responseText);
        }
    }
    http.send(JSON.stringify({func:'writefile',filename:fname,data:data}));
}

function fileexists(fname,callback){
    var http = new XMLHttpRequest();
    http.open("POST","", true);
    http.onreadystatechange = function() {
        if (http.readyState == 4 && http.status == 200) {
            callback(JSON.parse(http.responseText));
        }
    }
    http.send(JSON.stringify({func:'fileexists',filename:fname}));
}

function readdir(dir,callback){
    var http = new XMLHttpRequest();
    http.open("POST","", true);
    http.onreadystatechange = function() {
        if (http.readyState == 4 && http.status == 200) {
            callback(JSON.parse(http.responseText));
        }
    }
    http.send(JSON.stringify({func:'readdir',dirname:dir}));
}

window.onload = function() {

	importHtml('dialog.html', 'dialoghtml');
	window.addEventListener("resize", adjustsize, false);
	document.addEventListener("mousemove", mousemove, true);
	var content=document.getElementById('contentpane'); 
	window.addEventListener("keydown", keydown, false); // bubble from inner to outer
	adjustsize();
	leftPaneSetup();
	initMenu();
	initToolBar();
	loadSettings();
	document.addEventListener("mousedown", mousedown, true);
	if (!debug) { // hide infopane with debug info
		var infopane=document.getElementById('infopane');
		infopane.style.display='none';
	}
};

function importHtml(html, param) {
	var elem = document.getElementById(param);
	if (elem)
		readfile1(html, importHtmlCallBack, param);
}

function importHtmlCallBack(data,param) {
	var elem = document.getElementById(param);
	elem.innerHTML = data;
}

function adjustsize() {
	// -------------------------
	// menu
	// -------------------------
	// toolbar
	// -------------------------
	// leftpane | contentpane
	// 			|
	// 			|
	// -------------------------
	// statusbar
	// -------------------------
	var w = window.innerWidth;
	var h = window.innerHeight;
	var menu = document.getElementById("menu");
	var toolbar = document.getElementById("toolbar");
	var leftpane = document.getElementById("leftpane");
	var contentpane = document.getElementById("contentpane");
	var statusbar = document.getElementById("statusbar");
	var headerheight = menu.offsetHeight + toolbar.offsetHeight;
	h = h - headerheight - statusbar.offsetHeight;

	contentpane.style.height = h - 2; // subtract borderwidth
	contentpane.style.width = w - leftpanewidth - 2; // subtract borderwidth
	contentpane.style.left = leftpanewidth;
	contentpane.style.top = headerheight;

	leftpane.style.height = h - 2;
	leftpane.style.width = leftpanewidth - 2;
	leftpane.style.top = headerheight;
	leftpane.style.left = 0;

	statusbar.style.top = headerheight + contentpane.offsetHeight;

	// var clock=document.getElementById("clocktime");
	// clock.style.left = w-66;

}

var copybuffer=null;
var pasteshift=0;

function keydown(event) {
	// Disable shortcut keys in Input, Textarea fields
	var element=event.target;
	if(element.nodeType==3) element=element.parentNode;
	if (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;

    var code = event.keyCode ? event.keyCode : event.which;
    
    if (event.ctrlKey) {
    	if (code==67) { //ctrl-c
    		if (dragInfo.leftPaneElement!=null)	copybuffer=dragInfo.leftPaneElement;
    		pasteshift=0;
     	}
    	if (code==88) { //ctrl-x
    		if (dragInfo.leftPaneElement!=null)	copybuffer=dragInfo.leftPaneElement;
    		pasteshift=0;
    		dragInfo.leftPaneElement.parentNode.removeChild(dragInfo.leftPaneElement);
    	}
    	if (code==86) { //ctrl-v
    		var dest=dragInfo.leftPaneElement;
    		if (dest==null) dest=document.getElementById("contentpane");
    		if (copybuffer!=null && dest.className=='box') {
    			pasteshift+=10;
    			var newnode=copybuffer.cloneNode(true);
    			moveElement(newnode,pasteshift,pasteshift);
    			var idnames=['div','label','edit','button','checkbox','combo'];
    			for (var i=0; i<idnames.length;i++) if (newnode.id.indexOf(idnames[i])==0) newnode.id=getNewId(idnames[i]);
    			dest.appendChild(newnode);
    		}
     	}
    }
    else {
    	
    	if (code==46 && dragInfo.leftPaneElement!=null) { // del-key
    			dragInfo.leftPaneElement.parentNode.removeChild(dragInfo.leftPaneElement);
    	}
    	leftPaneKeyDown(code);
    	toolBarKeyDown(code);
    }
};


///////////////////////////////// help ///////////////////
function openhelp(){
    window.open('help.html')
}
//////////////////////////////////////////////////////////

///////////////////////// new file ///////////////////////
function newFile(){
    var content=document.getElementById("contentpane");
    content.innerHTML="";
}
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
// 														//
//					 load/save settings 				//
// 														//
//////////////////////////////////////////////////////////

function saveSettings() {
	var settings = {};
	// settings.params=settingParams;
	// settings.layerlist=layerStatusList;
	settings.files = fileNames;
	var str = JSON.stringify(settings, null, "\t");
//	socketWriteFile('editor.cfg', str, 'socketWriteError');
	writefile('editor.cfg', str, writeerror);
	var info1=document.getElementById("infobar1");
	info1.innerHTML=' file: '+fileNames.sourceDirName+'/'+fileNames.sourceFileName;
}

function loadSettings() {
	//socketReadFile('editor.cfg', 'loadSettingsCallback');
	readfile('editor.cfg', loadSettingsCallback);
}

function loadSettingsCallback(data) {
	var settings = {};
	try {
		settings = JSON.parse(data);
		fileNames = settings.files;
	} catch (e) { }
}

function paramToHtml(tags,param){
	var html='';
	if (tags[param]){
		var param=tags[param].split('=');
		if (param.length==2){
			var value=param[1];
			value=value.replace(/&alpha;/g, ':');
			value=value.replace(/&beta;/g, ',');
			value=value.replace(/&quot;/g, '"');
			html+=' '+param[0]+'='+value;
		}
	}
	return(html);
}

function elementToHtml(element){
	var tags=getTags(element);
	var html='';
	var paramHtml='';
    if (tags.param1) paramHtml+=paramToHtml(tags,'param1');
    if (tags.param2) paramHtml+=paramToHtml(tags,'param2');
    if (tags.param3) paramHtml+=paramToHtml(tags,'param3');
    if (tags.param4) paramHtml+=paramToHtml(tags,'param4');
    var left=parseInt(element.style.left,10);
    var top=parseInt(element.style.top,10);
    var width=parseInt(element.style.width,10);
    var height=parseInt(element.style.height,10);
    var styleHtml=' style="left:'+left+'px;top:'+top+'px;width:'+width+'px;height:'+height+'px"';
    var idHtml=' id="'+tags.id+'"';
    var classHtml=' class="'+tags.class+'"';
    var valueHtml=' value="'+element.value+'"';
    if (tags.text) var boxtext=tags.text; else boxtext='';
    
    if (element.className=='box'){
		html+='<div'+idHtml+classHtml+styleHtml+paramHtml+'>'+boxtext;	
		for (var i=0;i<element.children.length;i++) html+=elementToHtml(element.children[i]);
		html+='</div>';
    }
    if (element.className=='button'){
   		html+='<input type="button"'+idHtml+classHtml+styleHtml+paramHtml+valueHtml+'>';	
    }
    if (element.className=='edit'){
    	html+='<input type="text"'+idHtml+classHtml+styleHtml+paramHtml+valueHtml+'>';	
    }
    if (element.className=='prjlabel'){
      	html+='<div'+idHtml+classHtml+styleHtml+paramHtml+'>'+element.innerHTML+'</div>';	
    }
    if (element.className=='checkbox'){
      	html+='<input type="checkbox"'+idHtml+classHtml+styleHtml+paramHtml+'>';	
    }
    if (element.className=='combo'){
      	html+='<select'+idHtml+classHtml+styleHtml+paramHtml+'></select>';	
    }
    if (element.className=='image'){
        if (element.src) var source=element.src.split('/').pop(); else source='';
        var src=' src="'+source+'"';
      	html+='<img'+idHtml+classHtml+src+styleHtml+paramHtml+'></img>';	
    }

    return html;
}

function contentPaneToHtml(){
	var contentpane=document.getElementById("contentpane");
	var html='';
	for (var i=0; i<contentpane.children.length;i++) html+=elementToHtml(contentpane.children[i]);
	return html;
}