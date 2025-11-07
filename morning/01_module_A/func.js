//const log=console.log;
const doc=document;
const body=document.body;
//const $=(e)=>{return document.querySelector(e)}; // please comment it after you recieve the js
const courses=[];
const course_dict={};
function toTitleCase(str) {
    return str
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
String.prototype.title = function() {
    return toTitleCase(this);
};
const nl2br=function(text){
    return text.replaceAll("\n","<br />");
}
let temp=doc.createElement("script");
temp.src="setup.js";
temp.defer=true;
body.appendChild(temp);