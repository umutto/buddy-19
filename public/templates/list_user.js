function pug_attr(t,e,n,r){if(!1===e||null==e||!e&&("class"===t||"style"===t))return"";if(!0===e)return" "+(r?t:t+'="'+t+'"');var f=typeof e;return"object"!==f&&"function"!==f||"function"!=typeof e.toJSON||(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;function listUserTemplate(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (Participant) {var participant_status = Participant.Status || 0
var participant_muted = Participant.IsMuted || false
pug_html = pug_html + "\u003Ctr" + (" class=\"participant-row\""+pug_attr("data-userid", Participant.Id, true, false)) + "\u003E\u003Ctd class=\"border-top-0 align-middle\"\u003E\u003Cdiv class=\"row\"\u003E\u003Cdiv class=\"col-12 col-sm p-0 d-flex\"\u003E\u003Cimg" + (" class=\"user-avatar m-auto\""+pug_attr("src", "/images/user_icons/" + (Participant.Avatar || "user.png"), true, false)+pug_attr("alt", Participant.Name, true, false)) + "\u002F\u003E\u003C\u002Fdiv\u003E\u003Cdiv class=\"d-flex align-items-center col-12 col-sm p-0 pl-1 pl-sm-0\"\u003E\u003Cspan" + (" class=\"user-name d-block text-truncate m-auto\""+" style=\"max-width:100px;\""+pug_attr("title", Participant.Name, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = Participant.Name) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Ftd\u003E\u003Ctd class=\"border-top-0 align-middle\"\u003E" + (pug_escape(null == (pug_interp = Participant.EnterDate) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd class=\"border-top-0 align-middle\"\u003E";
if (participant_status === 0) {
pug_html = pug_html + "\u003Cspan class=\"status-badge badge badge-success\" data-sessions=\"1\"\u003EActive\u003C\u002Fspan\u003E";
}
if (participant_status === 1) {
pug_html = pug_html + "\u003Cspan class=\"status-badge badge badge-dark\" data-sessions=\"1\"\u003EInactive\u003C\u002Fspan\u003E";
}
if (participant_status === 2) {
pug_html = pug_html + "\u003Cspan class=\"status-badge badge badge-danger\" data-sessions=\"1\"\u003EBanned\u003C\u002Fspan\u003E";
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd class=\"border-top-0 align-middle pr-0\"\u003E\u003Ca" + (pug_attr("class", pug_classes(["btn-info","rounded-10","mb-1","mr-1",(participant_muted ? "d-inline-block" : "d-none")], [false,false,false,false,true]), false, false)+" href=\"#\" alt=\"Unmute\"") + "\u003E\u003Cspan class=\"btn-user-unmute material-icons align-middle p-1\"\u003Evolume_off\u003C\u002Fspan\u003E\u003C\u002Fa\u003E\u003Ca" + (pug_attr("class", pug_classes(["btn-info","rounded-10","mb-1","mr-1",(participant_muted ? "d-none" : "d-inline-block")], [false,false,false,false,true]), false, false)+" href=\"#\" alt=\"Mute\"") + "\u003E\u003Cspan class=\"btn-user-mute material-icons align-middle p-1\"\u003Evolume_up\u003C\u002Fspan\u003E\u003C\u002Fa\u003E\u003Ca class=\"d-inline-block btn-danger rounded-10\" href=\"#\" alt=\"Remove Participant\"\u003E\u003Cspan class=\"btn-user-remove material-icons align-middle p-1\"\u003Eremove_circle_outline\u003C\u002Fspan\u003E\u003C\u002Fa\u003E\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";}.call(this,"Participant" in locals_for_with?locals_for_with.Participant:typeof Participant!=="undefined"?Participant:undefined));;return pug_html;}