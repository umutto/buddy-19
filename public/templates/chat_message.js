function pug_attr(t,e,n,r){if(!1===e||null==e||!e&&("class"===t||"style"===t))return"";if(!0===e)return" "+(r?t:t+'="'+t+'"');var f=typeof e;return"object"!==f&&"function"!==f||"function"!=typeof e.toJSON||(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;function chatMessageTemplate(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (MessageText, MessageTime, MessageType, MessageUser, TextHint, UserAlias) {var is_self = UserAlias === MessageUser.Id
var is_title = MessageType === 2
pug_html = pug_html + "\u003Cdiv" + (pug_attr("class", pug_classes(["chat-message","d-flex","pb-1",(is_self ? "justify-content-end" : "justify-content-start")], [false,false,false,true]), false, false)+pug_attr("data-userid", MessageUser.Id, true, false)+pug_attr("data-type", MessageType, true, false)) + "\u003E\u003Cdiv" + (pug_attr("class", pug_classes(["d-flex",(is_title ? "w-80" : "w-100")], [false,true]), false, false)) + "\u003E";
if ((is_title)) {
pug_html = pug_html + "\u003Cdiv" + (pug_attr("class", pug_classes(["pr-1","d-flex","align-items-end",(is_self ? "order-2" : "order-1")], [false,false,false,true]), false, false)) + "\u003E\u003Cimg" + (" class=\"mb-1 user-avatar\""+pug_attr("src", "/images/user_icons/" + (MessageUser.Avatar || "user.png"), true, false)+pug_attr("alt", MessageUser.Name, true, false)) + "\u002F\u003E\u003C\u002Fdiv\u003E";
}
pug_html = pug_html + "\u003Cdiv" + (pug_attr("class", pug_classes(["flex-grow-1","px-1",(is_title ? is_self ? "speech-bubble sb-right order-1" : "speech-bubble sb-left order-2": "bg-light border")], [false,false,true]), false, false)) + "\u003E\u003Cdiv" + (pug_attr("class", pug_classes(["chat-header",(is_title ? "border-bottom" : "")], [false,true]), false, false)) + "\u003E";
if ((is_title)) {
pug_html = pug_html + "\u003Cspan class=\"h5 user-name\"\u003E" + (pug_escape(null == (pug_interp = MessageUser.Name) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
}
pug_html = pug_html + "\u003Cdiv" + (pug_attr("class", pug_classes(["chat-time","small","d-flex","align-items-center",(is_title ? "position-absolute" : "float-right")], [false,false,false,false,true]), false, false)) + "\u003E\u003Cspan class=\"material-icons ms-16 mx-1\"\u003Eaccess_time\u003C\u002Fspan\u003E\u003Cspan\u003E" + (pug_escape(null == (pug_interp = MessageTime) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Cdiv class=\"chat-text px-1\"\u003E\u003Cp" + (" class=\"p-wrap mb-0\""+pug_attr("title", TextHint, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = MessageText) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";}.call(this,"MessageText" in locals_for_with?locals_for_with.MessageText:typeof MessageText!=="undefined"?MessageText:undefined,"MessageTime" in locals_for_with?locals_for_with.MessageTime:typeof MessageTime!=="undefined"?MessageTime:undefined,"MessageType" in locals_for_with?locals_for_with.MessageType:typeof MessageType!=="undefined"?MessageType:undefined,"MessageUser" in locals_for_with?locals_for_with.MessageUser:typeof MessageUser!=="undefined"?MessageUser:undefined,"TextHint" in locals_for_with?locals_for_with.TextHint:typeof TextHint!=="undefined"?TextHint:undefined,"UserAlias" in locals_for_with?locals_for_with.UserAlias:typeof UserAlias!=="undefined"?UserAlias:undefined));;return pug_html;}