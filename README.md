# html-editor
tool for creating HTML with absolute positioned elements.

The "html window editor" is a lay-out tool for designing HTML pages and windows. The generated HTML output has absolute positioned elements. With this approach, windows with a fixed lay-out can be embedded in your application. An example are the file open and file save windows, used in this program. The source file for this is dialoghtml.src.

This application is build with HTML, CSS and JavaScript. Because writing to files is not supported in standard browsers, a Node.js server is used for file i/o. 

In the editor, the following elements can be selected, placed an resized: 

box: A box is a HTML DIV element. It forms the base element where other elements, including the box element, can be placed upon.
label: A label is also a HTML DIV element. It is intended for displaying text. It is not possible to add child elements.
input field: HTML INPUT element with type="text".
button:	HTML INPUT element with type="button".
checkbox:	HTML INPUT element with type="checkbox".
select element:	A HTML SELECT element. Select <OPTION> elements must be added with user defined JavaScript.
image element:	A HTML IMG element.

The output of the editor is a HTML file. Elements have an id and class attribute. A style attribute defines position and size. Up to four additional attributes can be defined.
