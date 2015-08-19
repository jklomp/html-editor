"use strict";

var fileNames ={
		sourceFileName		:'',
		sourceDirName		:'',
		htmlFileName		:'',
		htmlDirName			:''
	};

////////////////////////////////////////////////////////////////////////////
////
////                             file open                                //
////
////////////////////////////////////////////////////////////////////////////

function openFile() {
	var file=fileNames.sourceFileName;
	var dir=fileNames.sourceDirName;
	if (!dir) dir = 'c:/';
	openDialogShow(file,dir,openDlgRdy);
}

function openDlgRdy(file,dir,ok){
	if (ok){
		readfile(dir+'/'+file,openDlgRdyCallBack);
		fileNames.sourceFileName=file;
		fileNames.sourceDirName=dir;
		saveSettings();
	}
}

function openDlgRdyCallBack(data) {
    var content=document.getElementById('contentpane');
	content.innerHTML=data;
}

////////////////////////////////////////////////////////////////////////////
////
////                           file save                                  //
////
////////////////////////////////////////////////////////////////////////////
function saveAsHtml() {
	leftPaneClear();
	var file=fileNames.htmlFileName;
	var dir=fileNames.htmlDirName;
	var ext='.html';
	var mode='html';
	if (!dir)dir = 'c:/'; 
	saveDialogShow(file,dir,ext,mode,saveAsHtmlRdy);

}

function saveAsHtmlRdy(object,ok){
	if (ok){
		var fname=object.dir+'/'+object.file;
		fileNames.htmlFileName=object.file;
		fileNames.htmlDirName=object.dir;
		var content=contentPaneToHtml();
		content=content.replace(/></g,">\n<");  // add new line after '>' followed by '<'
		writefile(fname,content,writeerror);
		saveSettings();
	}
}

function saveFileAs() { 
	leftPaneClear();
	var file=fileNames.sourceFileName;
	var dir=fileNames.sourceDirName;
	var ext='.html';
	var mode='html';
	if (!dir)dir = 'c:/'; 
	saveDialogShow(file,dir,ext,mode,saveDlgRdy);
}

function saveDlgRdy(object,ok){
	if (ok){
		var fname=object.dir+'/'+object.file;
		fileNames.sourceFileName=object.file;
		fileNames.sourceDirName=object.dir;
		var contentpane=document.getElementById('contentpane');
		var content=contentpane.innerHTML.toString();
		content=content.replace(/></g,">\n<");
		writefile(fname,content,writeerror);
		saveSettings();
	}
}

////////////////////////////////////////////////////////////////////////////
////
////                               z-order                                //
////
////////////////////////////////////////////////////////////////////////////

var zlist=[];

function z_order(id){ // id = window name
	// remove id from list
	for (var i=0;i<zlist.length;i++){
		if (zlist[i]==id){
			zlist.splice(i,1); // remove the element
			break;
		}
	}
	zlist.push(id); // last element on top
	// set the z-order levels
	var value=110;
	for (var i=0;i<zlist.length;i++){
		var window=document.getElementById(zlist[i]);
		window.style.zIndex=value;
		value++;
	}
}



////////////////////////////////////////////////////////////////////////////
////
////                         file open window                             //
////
////////////////////////////////////////////////////////////////////////////

var openDialogObject={};

function openDialogShow(file,dir,callback){
	var window=document.getElementById('opendialogwindow');
	window.style.display = 'block'; // show window	
	z_order('opendialogwindow');
	addCloseButton('opendialogwindow',opendialogcancel);
	openDialogObject.dir=dir;  
	openDialogObject.file=file;  
	openDialogObject.callback=callback;  
	var edit=document.getElementById('opendialogfile');
	edit.value=openDialogObject.file;
	openDialogReadFiles(openDialogObject.dir);
	var header=document.getElementById('opendialogwindowheader');
	header.innerHTML='file open';
	
}


function selectparentdir(e){ // called from the dialog window 
	var dir=openDialogObject.dir;
	var backslash = dir.lastIndexOf('/');
	if (backslash > 0) dir=dir.slice(0,backslash);
	openDialogReadFiles(dir);
}

function opendialogopen(){ // // called from the dialog window open button 
	var window=document.getElementById('opendialogwindow');
	window.style.display = 'none'; // hide window
	openDialogObject.file=document.getElementById('opendialogfile').value;
	openDialogObject.callback(openDialogObject.file,openDialogObject.dir,true);
};

function openDialogBlur(origin){
	if (origin=='dir'){
		openDialogReadFiles(document.getElementById('opendialogdir').value);
	}
}

function openDialogKeyUp(event,origin){
	if (origin=='dir'){
		if (event.keyCode==13) openDialogReadFiles(document.getElementById('opendialogdir').value);
	}
}

function opendialogcancel(){ // // called from the dialog window cancel button
	var window=document.getElementById('opendialogwindow');
	window.style.display = 'none'; // hide window
	openDialogObject.callback(openDialogObject.file,openDialogObject.dir,false);
};

function formatDate(datestring){
	var date=new Date(datestring);
	var day=date.getDate(); if (day < 10) day='0'+day;
	var month=date.getMonth()+1; if (month < 10) month='0'+month;
	var hours=date.getHours(); if (hours < 10) hours='0'+hours;
	var minutes=date.getMinutes(); if (minutes < 10) minutes='0'+minutes;
    return(day+'-'+month+'-'+date.getFullYear()+'&nbsp;&nbsp;'+hours+':'+minutes);
}

function dialogAddRow(params){
	var dirimg='<img src="data:image/gif;base64,R0lGODlhEAAOALMAAOazToeHh0tLS/7LZv/0jvb29t/f3//Ub/'+
	'/ge8WSLf/rhf/3kdbW1mxsbP//mf///yH5BAAAAAAALAAAAAAQAA4AAARe8L1Ekyky67QZ1hLnjM5UUde0ECwLJoExKcpp'+
	'V0aCcGCmTIHEIUEqjgaORCMxIC6e0CcguWw6aFjsVMkkIr7g77ZKPJjPZqIyd7sJAgVGoEGv2xsBxqNgYPj/gAwXEQA7"'+ 
	'width="16" height="14" alt="embedded folder icon">';
	var img='';
	if (params.image=='dir') img=dirimg;
	if (params.mousedown=='') var mousedown=''; else mousedown='onmousedown="'+params.mousedown+'"';
	if (params.mousedown=='') var classid='row'; else classid='tabrow';
	var row='<div class="'+classid+'" style="top:'+params.top+'px" '+mousedown+'>'+
	  '<div class="tabcel1">'+img+'</div>'+
	  '<div class="tabcel2">'+params.name+'</div>'+
	  '<div class="tabcel3">'+params.size+'</div>'+
	  '<div class="tabcel4">'+params.date+'</div>'+
	  '</div>';
	return row;
}
function openDialogReadFiles(dirname){
	var edit=document.getElementById('opendialogdir');
	edit.value=dirname;
	openDialogObject.dir=dirname;
    readdir(dirname+'/',openDialogUpdateItems);

}

function openDialogUpdateItems(list){
	var html='';
	var top=0;
	html='<div id="opendialogtable">';
	html+=dialogAddRow({mousedown:"",top:top,image:'',name:'name',size:'size',date:'date'});
	for (var i in list){
		var item=list[i];
		if (item.isdir){
			top+=18;
			html+=dialogAddRow({mousedown:"openDialogMouseDown(event)",top:top,image:'dir',name:list[i].name,size:'',date:formatDate(list[i].time)});
		}
	}
	for (var i in list){
		var item=list[i];
		if (item.isfile){
			top+=18;
			var s='file';
			html+=dialogAddRow({mousedown:"openDialogMouseDown(event)",top:top,image:'',name:list[i].name,size:list[i].size,date:formatDate(list[i].time)});
		}
	}
	html+='</div>'; //
    var filelist=document.getElementById('opendialogfilelist');
    filelist.innerHTML=html;
}


function openDialogMouseDown(event){
	var table=document.getElementById('opendialogtable');
    var rows=table.querySelectorAll('.tabrow');
    for (var i=1;i < rows.length;i++) { // remove background and border style: 
    	rows[i].style.background="";
    	rows[i].style.border="";
    }
	event.currentTarget.style.background='#d1e8ff'; //selection color
	event.currentTarget.style.border='1px solid #66a7e8'; // selection border
	var tabeldata=event.currentTarget.querySelectorAll('div');
	var type=tabeldata[0].innerHTML;
    var name=tabeldata[1].innerHTML;
	if (type!=''){
		var dir=openDialogObject.dir+'/'+name;
		openDialogReadFiles(dir);
	}
	if (type==''){
		var edit=document.getElementById('opendialogfile');
		edit.value=name;
		openDialogObject.file=name;
	}
}

////////////////////////////////////////////////////////////////////////////
////
////                       file save window                             //
////
////////////////////////////////////////////////////////////////////////////

var saveDialogObject={};

function addCloseButton(windowname,closefunc){
	// The close button is a transparent picture with an X; the background color is set with css
	var close=document.getElementById(windowname+'close');
	if (!close){
		var win=document.getElementById(windowname);
		var img=document.createElement("img");
		img.src='close.gif';
		img.id=windowname+'close';
		img.style.left=win.clientWidth-43;
		img.className='closegif';
		img.addEventListener("mousedown", closefunc, false);
		win.appendChild(img);
	}
}

function saveDialogShow(file,dir,ext,param,callback){
	var window=document.getElementById('savedialogwindow');
	window.style.display = 'block'; // show window
	z_order('savedialogwindow');
	addCloseButton('savedialogwindow',savedialogcancel);
	saveDialogObject.dir=dir;  
	saveDialogObject.file=file;  
	saveDialogObject.callback=callback; 
	saveDialogObject.extension=ext; // file extension: used for filtering the directory list and added to the file when no other extension is defined
	saveDialogObject.param=param;   // additional parameter, returned with the callback
	var edit=document.getElementById('savedialogfile');
	edit.value=saveDialogObject.file;
	var edit=document.getElementById('savedialogtype');
	edit.value=saveDialogObject.extension;
	saveDialogReadFiles(saveDialogObject.dir);
	var header=document.getElementById('savedialogwindowheader');
	header.innerHTML='file save';
}

function savedialogparentdir(e){ // called from the dialog window 
	var dir=saveDialogObject.dir;
	var backslash = dir.lastIndexOf('/');
	if (backslash > 0) dir=dir.slice(0,backslash);
	saveDialogReadFiles(dir);
}

function savedialogsave(){ // user has pressed the save dialog save button 
	var file=document.getElementById('savedialogfile').value;
    fileexists(saveDialogObject.dir+'/'+file,saveDialogFileExistsCallback);

};

function saveDialogFileExistsCallback(object){
	if (object.existing==true) {
		var window=document.getElementById('savedialogwindow');
		var y=parseInt(window.style.top, 10);		
		var x=parseInt(window.style.left, 10);		
		var file=document.getElementById('savedialogfile').value;
		var str='<br>'+file+' already exists. <br><br> Do you want to replace it?';
		yesnowinShow(x+50,y+50,str,function(result){
			if (result=='yes') saveDialogCloseTrue();
		});
	}
	else saveDialogCloseTrue();
}


function saveDialogCloseTrue(){
	var window=document.getElementById('savedialogwindow');
	window.style.display = 'none'; // hide window
	var file=document.getElementById('savedialogfile').value;
	var pattern=/\.[0-9a-z]+$/i;
	var pos=file.search(pattern);
	if (pos<0) file=file+saveDialogObject.extension;
	saveDialogObject.file=file;
	saveDialogObject.callback(saveDialogObject,true);
}

function saveDialogBlur(origin){
	if (origin=='dir'){
		saveDialogReadFiles(document.getElementById('savedialogdir').value);
	}
}

function saveDialogKeyUp(event,origin){
	if (origin=='dir'){
		if (event.keyCode==13) saveDialogReadFiles(document.getElementById('savedialogdir').value);
	}
}

function savedialogcancel(){ // // called from the dialog window cancel button
	var window=document.getElementById('savedialogwindow');
	window.style.display = 'none'; // hide window
	saveDialogObject.callback(saveDialogObject,false);
};

function saveDialogExtInput(){ // called when the user has changed the file extension field
	var ext=document.getElementById('savedialogtype').value;
	saveDialogObject.extension=ext;
	saveDialogReadFiles(saveDialogObject.dir);
}

function formatdir(dir){
//	dir=str.replace(/[\/]/g, "] [");
	return(dir);
}

function saveDialogReadFiles(dirname){
	var edit=document.getElementById('savedialogdir');
	edit.value=formatdir(dirname);
	saveDialogObject.dir=dirname;
    readdir(dirname+'/',saveDialogUpdateItems);
}

function saveDialogUpdateItems(list){
	var html='';
	var top=0;
	html='<div id="savedialogtable">';
	html+=dialogAddRow({mousedown:"",top:top,image:'',name:'name',size:'size',date:'date'});
	for (var i in list){
		var item=list[i];
		if (item.isdir){
			top+=18;
			html+=dialogAddRow({mousedown:"saveDialogMouseDown(event)",top:top,image:'dir',name:list[i].name,size:'',date:formatDate(list[i].time)});
		}
	}
	for (var i in list){
		var item=list[i];
		if (item.isfile){
			top+=18;
			var s='file';
			html+=dialogAddRow({mousedown:"saveDialogMouseDown(event)",top:top,image:'',name:list[i].name,size:list[i].size,date:formatDate(list[i].time)});
		}
	}
	html+='</div>'; //
    var filelist=document.getElementById('savedialogfilelist');
    filelist.innerHTML=html;
}


function saveDialogMouseDown(event){
	var table=document.getElementById('savedialogtable');
    var rows=table.querySelectorAll('.tabrow');
    for (var i=1;i < rows.length;i++) { // remove background and border style 
    	rows[i].style.background="";
    	rows[i].style.border="";
    }
	event.currentTarget.style.background='#d1e8ff'; //selection color
	event.currentTarget.style.border='1px solid #66a7e8'; // selection border
	var tabeldata=event.currentTarget.querySelectorAll('div');
	var type=tabeldata[0].innerHTML;
    var name=tabeldata[1].innerHTML;
	if (type!=''){
		var dir=saveDialogObject.dir+'/'+name;
		saveDialogReadFiles(dir);
	}
	if (type==''){
		var edit=document.getElementById('savedialogfile');
		edit.value=name;
		saveDialogObject.file=name;
	}
}

////////////////////////////////////////////////////////////////////////////
////
////                     yes-no messagewindow                             //
////
////////////////////////////////////////////////////////////////////////////


var yesnowinObject={};

function yesnowinShow(x,y,message,callback){
	var window=document.getElementById('yesnowindow');
	window.style.left=x+'px';
	window.style.top=y+'px';
	window.style.display = 'block'; // show window
	z_order('yesnowindow');
	addCloseButton('yesnowindow',yesnowinno);
	yesnowinObject.callback=callback;
	var msg=document.getElementById('yesnowinmessage');
	msg.innerHTML=message;
}

function yesnowinno(){
	var window=document.getElementById('yesnowindow');
	window.style.display = 'none'; // hide window
	if (yesnowinObject.callback) yesnowinObject.callback('no');
}

function yesnowinyes(){
	var window=document.getElementById('yesnowindow');
	window.style.display = 'none'; // hide window
	if (yesnowinObject.callback) yesnowinObject.callback('yes');
}

////////////////////////////////////////////////////////////////////////////
////
////                   yes-no-cancel messagewindow                        //
////
////////////////////////////////////////////////////////////////////////////


var yesnocancelwinObject={};

function yesnocancelwinShow(x,y,message,callback){
	window.style.left=x+'px';
	window.style.top=y+'px';
	var window=document.getElementById('yesnocancelwindow');
	window.style.display = 'block'; // show window
	z_order('yesnocancelwindow');
	addCloseButton('yesnocancelwindow',yesnocancelwincancel);
	yesnocancelwinObject.callback=callback;
	var msg=document.getElementById('yesnocancelwinmessage');
	var w1=msg.clientWidth;
	msg.innerHTML='<span id="messagetext"></span>';
	var msgtxt=document.getElementById('messagetext');
	msgtxt.innerHTML=message;
	var w2=msgtxt.offsetWidth;
	// center the message
	msgtxt.style.left=(w1-w2)/2;
	msgtxt.style.position='absolute';
}

function yesnocancelwinno(){
	var window=document.getElementById('yesnocancelwindow');
	window.style.display = 'none'; // hide window
	if (yesnocancelwinObject.callback) yesnocancelwinObject.callback('no');
}

function yesnocancelwinyes(){
	var window=document.getElementById('yesnocancelwindow');
	window.style.display = 'none'; // hide window
	if (yesnocancelwinObject.callback) yesnocancelwinObject.callback('yes');
}

function yesnocancelwincancel(){
	var window=document.getElementById('yesnocancelwindow');
	window.style.display = 'none'; // hide window
	if (yesnocancelwinObject.callback) yesnocancelwinObject.callback('cancel');
}
