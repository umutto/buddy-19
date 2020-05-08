function pug_attr(t,e,n,r){if(!1===e||null==e||!e&&("class"===t||"style"===t))return"";if(!0===e)return" "+(r?t:t+'="'+t+'"');var f=typeof e;return"object"!==f&&"function"!==f||"function"!=typeof e.toJSON||(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;function listUserTemplate(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (Host, Participant, UserAlias) {pug_html = pug_html + "\u003Ctr" + (" class=\"participant-row\""+pug_attr("data-userid", Participant.Id, true, false)) + "\u003E\u003Ctd class=\"border-top-0 align-middle\"\u003E\u003Cdiv class=\"row\"\u003E\u003Cdiv class=\"col-12 col-sm p-0 d-flex\"\u003E\u003Cimg" + (" class=\"user-avatar m-auto\""+pug_attr("src", Participant.Avatar, true, false)+pug_attr("alt", Participant.Name, true, false)) + "\u002F\u003E\u003C\u002Fdiv\u003E\u003Cdiv class=\"d-flex align-items-center col-12 col-sm p-0 pl-1 pl-sm-0\"\u003E\u003Cspan" + (" class=\"d-block text-truncate m-auto\""+" style=\"max-width:100px;\""+pug_attr("title", Participant.Name, true, false)) + "\u003EParticipant.Name\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Ftd\u003E\u003Ctd class=\"border-top-0 align-middle\"\u003EParticipant.EnterDate\u003C\u002Ftd\u003E\u003Ctd class=\"border-top-0 align-middle\"\u003E";
if (Participant.IsActive === 0) {
pug_html = pug_html + "\u003Cspan class=\"badge badge-success\"\u003EActive\u003C\u002Fspan\u003E";
}
else
if (Participant.IsActive === 1) {
pug_html = pug_html + "\u003Cspan class=\"badge badge-dark\"\u003EInactive\u003C\u002Fspan\u003E";
}
else
if (Participant.IsActive === 2) {
pug_html = pug_html + "\u003Cspan class=\"badge badge-warning\"\u003EBanned\u003C\u002Fspan\u003E";
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd class=\"border-top-0 align-middle pr-0\"\u003E";
if (Participant.IsMuted) {
pug_html = pug_html + "\u003Ca class=\"d-inline-block btn-info rounded-10 mb-1 mr-1\" href=\"#\" alt=\"Unmute\"\u003E\u003Cspan class=\"material-icons align-middle p-1\"\u003Evolume_off\u003C\u002Fspan\u003E\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + "\u003Ca class=\"d-inline-block btn-info rounded-10 mb-1 mr-1\" href=\"#\" alt=\"Mute\"\u003E\u003Cspan class=\"material-icons btn-info rounded-10 p-1\"\u003Evolume_up\u003C\u002Fspan\u003E\u003C\u002Fa\u003E";
}
if (UserAlias === Host) {
pug_html = pug_html + "\u003Ca class=\"d-inline-block btn-danger rounded-10\" href=\"#\" alt=\"Remove Participant\"\u003E\u003Cspan class=\"material-icons align-middle p-1\"\u003Eremove_circle_outline\u003C\u002Fspan\u003E\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + "\u003Ca class=\"d-inline-block btn-danger rounded-10\" href=\"#\" alt=\"Request for Removal\"\u003E\u003Cspan class=\"material-icons btn-danger rounded-10 p-1\"\u003Eoutlined_flag\u003C\u002Fspan\u003E\u003C\u002Fa\u003E";
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";}.call(this,"Host" in locals_for_with?locals_for_with.Host:typeof Host!=="undefined"?Host:undefined,"Participant" in locals_for_with?locals_for_with.Participant:typeof Participant!=="undefined"?Participant:undefined,"UserAlias" in locals_for_with?locals_for_with.UserAlias:typeof UserAlias!=="undefined"?UserAlias:undefined));;return pug_html;}