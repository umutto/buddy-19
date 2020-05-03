function pug_attr(t, e, n, r) {
  if (!1 === e || null == e || (!e && ("class" === t || "style" === t))) return "";
  if (!0 === e) return " " + (r ? t : t + '="' + t + '"');
  var f = typeof e;
  return (
    ("object" !== f && "function" !== f) ||
      "function" != typeof e.toJSON ||
      (e = e.toJSON()),
    "string" == typeof e || ((e = JSON.stringify(e)), n || -1 === e.indexOf('"'))
      ? (n && (e = pug_escape(e)), " " + t + '="' + e + '"')
      : " " + t + "='" + e.replace(/'/g, "&#39;") + "'"
  );
}
function pug_classes(s, r) {
  return Array.isArray(s)
    ? pug_classes_array(s, r)
    : s && "object" == typeof s
    ? pug_classes_object(s)
    : s || "";
}
function pug_classes_array(r, a) {
  for (var s, e = "", u = "", c = Array.isArray(a), g = 0; g < r.length; g++)
    (s = pug_classes(r[g])) &&
      (c && a[g] && (s = pug_escape(s)), (e = e + u + s), (u = " "));
  return e;
}
function pug_classes_object(r) {
  var a = "",
    n = "";
  for (var o in r)
    o && r[o] && pug_has_own_property.call(r, o) && ((a = a + n + o), (n = " "));
  return a;
}
function pug_escape(e) {
  var a = "" + e,
    t = pug_match_html.exec(a);
  if (!t) return e;
  var r,
    c,
    n,
    s = "";
  for (r = t.index, c = 0; r < a.length; r++) {
    switch (a.charCodeAt(r)) {
      case 34:
        n = "&quot;";
        break;
      case 38:
        n = "&amp;";
        break;
      case 60:
        n = "&lt;";
        break;
      case 62:
        n = "&gt;";
        break;
      default:
        continue;
    }
    c !== r && (s += a.substring(c, r)), (c = r + 1), (s += n);
  }
  return c !== r ? s + a.substring(c, r) : s;
}
var pug_has_own_property = Object.prototype.hasOwnProperty;
var pug_match_html = /["&<>]/;
function chatMessageTemplate(locals) {
  var pug_html = "",
    pug_mixins = {},
    pug_interp;
  var locals_for_with = locals || {};
  (function (
    MessageText,
    MessageTime,
    MessageUserAvatar,
    MessageUserId,
    MessageUserName
  ) {
    pug_html =
      pug_html +
      "\u003Cdiv" +
      (' class="chat-message d-flex pb-1"' +
        pug_attr("data-userid", MessageUserId, true, false)) +
      "\u003E";
    if (MessageUserAvatar && MessageUserName) {
      pug_html =
        pug_html +
        '\u003Cdiv class="pr-1 d-flex align-items-end" style="max-width: 48px;"\u003E\u003Cimg' +
        (' class="img-fluid mb-1"' +
          pug_attr("src", MessageUserAvatar, true, false) +
          pug_attr("alt", MessageUserName, true, false)) +
        "\u002F\u003E\u003C\u002Fdiv\u003E";
    }
    pug_html =
      pug_html +
      "\u003Cdiv" +
      pug_attr(
        "class",
        pug_classes(
          [
            "flex-grow-1",
            "px-1",
            MessageUserAvatar && MessageUserName ? "speech-bubble" : "bg-light border",
          ],
          [false, false, true]
        ),
        false,
        false
      ) +
      "\u003E\u003Cdiv" +
      pug_attr(
        "class",
        pug_classes(
          ["chat-header", MessageUserAvatar && MessageUserName ? "border-bottom" : ""],
          [false, true]
        ),
        false,
        false
      ) +
      "\u003E";
    if (MessageUserName) {
      pug_html =
        pug_html +
        '\u003Cspan class="h5"\u003E' +
        pug_escape(null == (pug_interp = MessageUserName) ? "" : pug_interp) +
        "\u003C\u002Fspan\u003E";
    }
    pug_html =
      pug_html +
      "\u003Cdiv" +
      pug_attr(
        "class",
        pug_classes(
          [
            "chat-time",
            "small",
            "d-flex",
            "align-items-center",
            MessageUserAvatar && MessageUserName ? "position-absolute" : "float-right",
          ],
          [false, false, false, false, true]
        ),
        false,
        false
      ) +
      '\u003E\u003Cspan class="material-icons ms-16 mx-1"\u003Eaccess_time\u003C\u002Fspan\u003E\u003Cspan\u003E' +
      pug_escape(null == (pug_interp = MessageTime) ? "" : pug_interp) +
      '\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Cdiv class="chat-text"\u003E\u003Cp class="p-line mb-0"\u003E' +
      pug_escape(null == (pug_interp = MessageText) ? "" : pug_interp) +
      "\u003C\u002Fp\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
  }.call(
    this,
    "MessageText" in locals_for_with
      ? locals_for_with.MessageText
      : typeof MessageText !== "undefined"
      ? MessageText
      : undefined,
    "MessageTime" in locals_for_with
      ? locals_for_with.MessageTime
      : typeof MessageTime !== "undefined"
      ? MessageTime
      : undefined,
    "MessageUserAvatar" in locals_for_with
      ? locals_for_with.MessageUserAvatar
      : typeof MessageUserAvatar !== "undefined"
      ? MessageUserAvatar
      : undefined,
    "MessageUserId" in locals_for_with
      ? locals_for_with.MessageUserId
      : typeof MessageUserId !== "undefined"
      ? MessageUserId
      : undefined,
    "MessageUserName" in locals_for_with
      ? locals_for_with.MessageUserName
      : typeof MessageUserName !== "undefined"
      ? MessageUserName
      : undefined
  ));
  return pug_html;
}
