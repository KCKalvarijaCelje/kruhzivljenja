var Lr$1 = Object.defineProperty;
var Pr$1 = (e) => {
  throw TypeError(e);
};
var Zi = (e, t, r) => t in e ? Lr$1(e, t, { enumerable: true, configurable: true, writable: true, value: r }) : e[t] = r;
var Or$1 = (e, t) => {
  for (var r in t) Lr$1(e, r, { get: t[r], enumerable: true });
};
var Ut$1 = (e, t, r) => Zi(e, typeof t != "symbol" ? t + "" : t, r), es = (e, t, r) => t.has(e) || Pr$1("Cannot " + r);
var Fe$1 = (e, t, r) => (es(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Dr$1 = (e, t, r) => t.has(e) ? Pr$1("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r);
var Ji = {};
Or$1(Ji, { languages: () => Vi, options: () => Wi, parsers: () => Nr, printers: () => qo$1 });
var ve$1 = (e, t) => (r, n, ...i) => r | 1 && n == null ? void 0 : (t.call(n) ?? n[e]).apply(n, i);
var ts = String.prototype.replaceAll ?? function(e, t) {
  return e.global ? this.replace(e, t) : this.split(e).join(t);
}, rs = ve$1("replaceAll", function() {
  if (typeof this == "string") return ts;
}), w$1 = rs;
function ns(e) {
  return this[e < 0 ? this.length + e : e];
}
var is = ve$1("at", function() {
  if (Array.isArray(this) || typeof this == "string") return ns;
}), M$1 = is;
var ss = () => {
}, He$1 = ss;
var Ve = "string", Ue$1 = "array", lt$1 = "cursor", Te = "indent", be$1 = "align", ct$1 = "trim", we$1 = "group", ke$1 = "fill", xe$1 = "if-break", ye$1 = "indent-if-break", ut$1 = "line-suffix", pt$1 = "line-suffix-boundary", $$1 = "line", ht$1 = "label", Ae$1 = "break-parent", mt$1 = /* @__PURE__ */ new Set([lt$1, Te, be$1, ct$1, we$1, ke$1, xe$1, ye$1, ut$1, pt$1, $$1, ht$1, Ae$1]);
function as(e) {
  if (typeof e == "string") return Ve;
  if (Array.isArray(e)) return Ue$1;
  if (!e) return;
  let { type: t } = e;
  if (mt$1.has(t)) return t;
}
var ft$1 = as;
var os = (e) => new Intl.ListFormat("en-US", { type: "disjunction" }).format(e);
function ls(e) {
  let t = e === null ? "null" : typeof e;
  if (t !== "string" && t !== "object") return `Unexpected doc '${t}', 
Expected it to be 'string' or 'object'.`;
  if (ft$1(e)) throw new Error("doc is valid.");
  let r = Object.prototype.toString.call(e);
  if (r !== "[object Object]") return `Unexpected doc '${r}'.`;
  let n = os([...mt$1].map((i) => `'${i}'`));
  return `Unexpected doc.type '${e.type}'.
Expected it to be ${n}.`;
}
var Wt$1 = class Wt extends Error {
  name = "InvalidDocError";
  constructor(t) {
    super(ls(t)), this.doc = t;
  }
}, Ir$1 = Wt$1;
function Gt$1(e, t) {
  if (typeof e == "string") return t(e);
  let r = /* @__PURE__ */ new Map();
  return n(e);
  function n(s) {
    if (r.has(s)) return r.get(s);
    let a = i(s);
    return r.set(s, a), a;
  }
  function i(s) {
    switch (ft$1(s)) {
      case Ue$1:
        return t(s.map(n));
      case ke$1:
        return t({ ...s, parts: s.parts.map(n) });
      case xe$1:
        return t({ ...s, breakContents: n(s.breakContents), flatContents: n(s.flatContents) });
      case we$1: {
        let { expandedStates: a, contents: o } = s;
        return a ? (a = a.map(n), o = a[0]) : o = n(o), t({ ...s, contents: o, expandedStates: a });
      }
      case be$1:
      case Te:
      case ye$1:
      case ht$1:
      case ut$1:
        return t({ ...s, contents: n(s.contents) });
      case Ve:
      case lt$1:
      case ct$1:
      case pt$1:
      case $$1:
      case Ae$1:
        return t(s);
      default:
        throw new Ir$1(s);
    }
  }
}
function L$1(e, t = Rr$1) {
  return Gt$1(e, (r) => typeof r == "string" ? B$1(t, r.split(`
`)) : r);
}
var dt$1 = He$1;
function A(e) {
  return { type: Te, contents: e };
}
function cs(e, t) {
  return { type: be$1, contents: t, n: e };
}
function qr$1(e) {
  return cs(Number.NEGATIVE_INFINITY, e);
}
var Y$1 = { type: Ae$1 };
function gt$1(e) {
  return { type: ke$1, parts: e };
}
function E(e, t = {}) {
  return dt$1(t.expandedStates), { type: we$1, id: t.id, contents: e, break: !!t.shouldBreak, expandedStates: t.expandedStates };
}
function j$1(e, t = "", r = {}) {
  return { type: xe$1, breakContents: e, flatContents: t, groupId: r.groupId };
}
function Fr$1(e, t) {
  return { type: ye$1, contents: e, groupId: t.groupId, negate: t.negate };
}
function B$1(e, t) {
  let r = [];
  for (let n = 0; n < t.length; n++) n !== 0 && r.push(e), r.push(t[n]);
  return r;
}
var S$1 = { type: $$1 }, k$1 = { type: $$1, soft: true }, us = { type: $$1, hard: true }, C = [us, Y$1], ps = { type: $$1, hard: true, literal: true }, Rr$1 = [ps, Y$1];
var Hr$1 = Object.freeze({ character: "'", codePoint: 39 }), Vr$1 = Object.freeze({ character: '"', codePoint: 34 }), hs = Object.freeze({ preferred: Hr$1, alternate: Vr$1 }), ms = Object.freeze({ preferred: Vr$1, alternate: Hr$1 });
function fs(e, t) {
  let { preferred: r, alternate: n } = t === true || t === "'" ? hs : ms, { length: i } = e, s = 0, a = 0;
  for (let o = 0; o < i; o++) {
    let c = e.charCodeAt(o);
    c === r.codePoint ? s++ : c === n.codePoint && a++;
  }
  return (s > a ? n : r).character;
}
var Ur$1 = fs;
function zt$1(e) {
  if (typeof e != "string") throw new TypeError("Expected a string");
  return e.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
var $t$1 = class $t {
  #e;
  constructor(t) {
    this.#e = new Set(t);
  }
  getLeadingWhitespaceCount(t) {
    let r = this.#e, n = 0;
    for (let i = 0; i < t.length && r.has(t.charAt(i)); i++) n++;
    return n;
  }
  getTrailingWhitespaceCount(t) {
    let r = this.#e, n = 0;
    for (let i = t.length - 1; i >= 0 && r.has(t.charAt(i)); i--) n++;
    return n;
  }
  getLeadingWhitespace(t) {
    let r = this.getLeadingWhitespaceCount(t);
    return t.slice(0, r);
  }
  getTrailingWhitespace(t) {
    let r = this.getTrailingWhitespaceCount(t);
    return t.slice(t.length - r);
  }
  hasLeadingWhitespace(t) {
    return this.#e.has(t.charAt(0));
  }
  hasTrailingWhitespace(t) {
    return this.#e.has(M$1(0, t, -1));
  }
  trimStart(t) {
    let r = this.getLeadingWhitespaceCount(t);
    return t.slice(r);
  }
  trimEnd(t) {
    let r = this.getTrailingWhitespaceCount(t);
    return t.slice(0, t.length - r);
  }
  trim(t) {
    return this.trimEnd(this.trimStart(t));
  }
  split(t, r = false) {
    let n = `[${zt$1([...this.#e].join(""))}]+`, i = new RegExp(r ? `(${n})` : n, "u");
    return t.split(i);
  }
  hasWhitespaceCharacter(t) {
    let r = this.#e;
    return Array.prototype.some.call(t, (n) => r.has(n));
  }
  hasNonWhitespaceCharacter(t) {
    let r = this.#e;
    return Array.prototype.some.call(t, (n) => !r.has(n));
  }
  isWhitespaceOnly(t) {
    let r = this.#e;
    return Array.prototype.every.call(t, (n) => r.has(n));
  }
  #t(t) {
    let r = Number.POSITIVE_INFINITY;
    for (let n of t.split(`
`)) {
      if (n.length === 0) continue;
      let i = this.getLeadingWhitespaceCount(n);
      if (i === 0) return 0;
      n.length !== i && i < r && (r = i);
    }
    return r === Number.POSITIVE_INFINITY ? 0 : r;
  }
  dedentString(t) {
    let r = this.#t(t);
    return r === 0 ? t : t.split(`
`).map((n) => n.slice(r)).join(`
`);
  }
}, Wr$1 = $t$1;
var ds = ["	", `
`, "\f", "\r", " "], gs = new Wr$1(ds), N = gs;
var Yt$1 = class Yt extends Error {
  name = "UnexpectedNodeError";
  constructor(t, r, n = "type") {
    super(`Unexpected ${r} node ${n}: ${JSON.stringify(t[n])}.`), this.node = t;
  }
}, Gr$1 = Yt$1;
var _s = /* @__PURE__ */ new Set(["sourceSpan", "startSourceSpan", "endSourceSpan", "nameSpan", "valueSpan", "keySpan", "tagDefinition", "tokens", "valueTokens", "switchValueSourceSpan", "expSourceSpan", "valueSourceSpan"]), Ss = /* @__PURE__ */ new Set(["if", "else if", "for", "switch", "case"]);
function zr$1(e, t, r) {
  if (e.kind === "text" || e.kind === "comment") return null;
  if (e.kind === "yaml" && delete t.value, e.kind === "attribute") {
    let { fullName: n, value: i } = e;
    n === "style" || n === "class" || n === "srcset" && (r.fullName === "img" || r.fullName === "source") || n === "allow" && r.fullName === "iframe" || n.startsWith("on") || n.startsWith("@") || n.startsWith(":") || n.startsWith(".") || n.startsWith("#") || n.startsWith("v-") || n === "vars" && r.fullName === "style" || (n === "setup" || n === "generic") && r.fullName === "script" || n === "slot-scope" || n.startsWith("(") || n.startsWith("[") || n.startsWith("*") || n.startsWith("bind") || n.startsWith("i18n") || n.startsWith("on-") || n.startsWith("ng-") || i?.includes("{{") ? delete t.value : i && (t.value = w$1(0, i, /'|&quot;|&apos;/gu, '"'));
  }
  if (e.kind === "docType" && (t.value = w$1(0, e.value.toLowerCase(), /\s+/gu, " ")), e.kind === "angularControlFlowBlock" && e.parameters?.children) for (let n of t.parameters.children) Ss.has(e.name) ? delete n.expression : n.expression = n.expression.trim();
  e.kind === "angularIcuExpression" && (t.switchValue = e.switchValue.trim()), e.kind === "angularLetDeclarationInitializer" && delete t.value, e.kind === "element" && e.isVoid && !e.isSelfClosing && (t.isSelfClosing = true);
}
zr$1.ignoredProperties = _s;
var $r$1 = zr$1;
function X$1(e, t = true) {
  return [A([k$1, e]), t ? k$1 : ""];
}
function V$1(e, t) {
  let r = e.type === "NGRoot" ? e.node.type === "NGMicrosyntax" && e.node.body.length === 1 && e.node.body[0].type === "NGMicrosyntaxExpression" ? e.node.body[0].expression : e.node : e.type === "JsExpressionRoot" ? e.node : e;
  return r && (r.type === "ObjectExpression" || r.type === "ArrayExpression" || (t.parser === "__vue_expression" || t.parser === "__vue_ts_expression" || t.parser === "__ng_binding" || t.parser === "__ng_directive") && (r.type === "TemplateLiteral" || r.type === "StringLiteral"));
}
async function x$1(e, t, r, n) {
  r = { __isInHtmlAttribute: true, __embeddedInHtml: true, ...r };
  let i = true;
  n && (r.__onHtmlBindingRoot = (a, o) => {
    i = n(a, o);
  });
  let s = await t(e, r, t);
  return i ? E(s) : X$1(s);
}
function Es(e, t, r, n) {
  let { node: i } = r, s = n.originalText.slice(i.sourceSpan.start.offset, i.sourceSpan.end.offset);
  return /^\s*$/u.test(s) ? "" : x$1(s, e, { parser: "__ng_directive", __isInHtmlAttribute: false }, V$1);
}
var Yr$1 = Es;
var Cs = Array.prototype.toReversed ?? function() {
  return [...this].reverse();
}, vs = ve$1("toReversed", function() {
  if (Array.isArray(this)) return Cs;
}), jr$1 = vs;
function Ts() {
  let e = globalThis, t = e.Deno?.build?.os;
  return typeof t == "string" ? t === "windows" : e.navigator?.platform?.startsWith("Win") ?? e.process?.platform?.startsWith("win") ?? false;
}
var bs = Ts();
function Xr$1(e) {
  if (e = e instanceof URL ? e : new URL(e), e.protocol !== "file:") throw new TypeError(`URL must be a file URL: received "${e.protocol}"`);
  return e;
}
function ws(e) {
  return e = Xr$1(e), decodeURIComponent(e.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function ks(e) {
  e = Xr$1(e);
  let t = decodeURIComponent(e.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
  return e.hostname !== "" && (t = `\\\\${e.hostname}${t}`), t;
}
function jt$1(e) {
  return bs ? ks(e) : ws(e);
}
var Kr$1 = (e) => String(e).split(/[/\\]/u).pop(), Qr$1 = (e) => String(e).startsWith("file:");
function xs(e) {
  return Array.isArray(e) && e.length > 0;
}
var Ne$1 = xs;
function Jr$1(e, t) {
  if (!t) return;
  let r = Kr$1(t).toLowerCase();
  return e.find(({ filenames: n }) => n?.some((i) => i.toLowerCase() === r)) ?? e.find(({ extensions: n }) => n?.some((i) => r.endsWith(i)));
}
function ys(e, t) {
  if (t) return e.find(({ name: r }) => r.toLowerCase() === t) ?? e.find(({ aliases: r }) => r?.includes(t)) ?? e.find(({ extensions: r }) => r?.includes(`.${t}`));
}
var As = void 0;
function Zr$1(e, t) {
  if (t) {
    if (Qr$1(t)) try {
      t = jt$1(t);
    } catch {
      return;
    }
    if (typeof t == "string") return e.find(({ isSupported: r }) => r?.({ filepath: t }));
  }
}
function Ns(e, t) {
  let r = jr$1(0, e.plugins).flatMap((i) => i.languages ?? []);
  return (ys(r, t.language) ?? Jr$1(r, t.physicalFile) ?? Jr$1(r, t.file) ?? Zr$1(r, t.physicalFile) ?? Zr$1(r, t.file) ?? As?.(r, t.physicalFile))?.parsers[0];
}
var _t = Ns;
var St = /* @__PURE__ */ Symbol.for("PRETTIER_IS_FRONT_MATTER");
function Ls(e) {
  return !!e?.[St];
}
var ie$1 = Ls;
var We$1 = 3;
function Ps(e) {
  let t = e.slice(0, We$1);
  if (t !== "---" && t !== "+++") return;
  let r = e.indexOf(`
`, We$1);
  if (r === -1) return;
  let n = e.slice(We$1, r).trim(), i = e.indexOf(`
${t}`, r), s = n;
  if (s || (s = t === "+++" ? "toml" : "yaml"), i === -1 && t === "---" && s === "yaml" && (i = e.indexOf(`
...`, r)), i === -1) return;
  let a = i + 1 + We$1, o = e.charAt(a + 1);
  if (!/\s?/u.test(o)) return;
  let c = e.slice(0, a), u;
  return { language: s, explicitLanguage: n || null, value: e.slice(r + 1, i), startDelimiter: t, endDelimiter: c.slice(-We$1), raw: c, start: { line: 1, column: 0, index: 0 }, end: { index: c.length, get line() {
    return u ?? (u = c.split(`
`)), u.length;
  }, get column() {
    return u ?? (u = c.split(`
`)), M$1(0, u, -1).length;
  } }, [St]: true };
}
function Os(e) {
  let t = Ps(e);
  return t ? { frontMatter: t, get content() {
    let { raw: r } = t;
    return w$1(0, r, /[^\n]/gu, " ") + e.slice(r.length);
  } } : { content: e };
}
var Xt$1 = Os;
var en$1 = "inline", Kt$1 = { area: "none", base: "none", basefont: "none", datalist: "none", head: "none", link: "none", meta: "none", noembed: "none", noframes: "none", param: "block", rp: "none", script: "block", style: "none", template: "inline", title: "none", html: "block", body: "block", address: "block", blockquote: "block", center: "block", dialog: "block", div: "block", figure: "block", figcaption: "block", footer: "block", form: "block", header: "block", hr: "block", legend: "block", listing: "block", main: "block", p: "block", plaintext: "block", pre: "block", search: "block", xmp: "block", slot: "contents", ruby: "ruby", rt: "ruby-text", article: "block", aside: "block", h1: "block", h2: "block", h3: "block", h4: "block", h5: "block", h6: "block", hgroup: "block", nav: "block", section: "block", dir: "block", dd: "block", dl: "block", dt: "block", menu: "block", ol: "block", ul: "block", li: "list-item", table: "table", caption: "table-caption", colgroup: "table-column-group", col: "table-column", thead: "table-header-group", tbody: "table-row-group", tfoot: "table-footer-group", tr: "table-row", td: "table-cell", th: "table-cell", input: "inline-block", button: "inline-block", fieldset: "block", details: "block", summary: "block", marquee: "inline-block", select: "inline-block", source: "block", track: "block", meter: "inline-block", progress: "inline-block", object: "inline-block", video: "inline-block", audio: "inline-block", option: "block", optgroup: "block" }, tn$1 = "normal", Qt$1 = { listing: "pre", plaintext: "pre", pre: "pre", xmp: "pre", nobr: "nowrap", table: "initial", textarea: "pre-wrap" };
function Ds(e) {
  return e.kind === "element" && !e.hasExplicitNamespace && !["html", "svg"].includes(e.namespace);
}
var se$1 = Ds;
var Is = (e) => w$1(0, e, /^[\t\f\r ]*\n/gu, ""), Jt$1 = (e) => Is(N.trimEnd(e)), rn$1 = (e) => {
  let t = e, r = N.getLeadingWhitespace(t);
  r && (t = t.slice(r.length));
  let n = N.getTrailingWhitespace(t);
  return n && (t = t.slice(0, -n.length)), { leadingWhitespace: r, trailingWhitespace: n, text: t };
};
function Et$1(e, t) {
  return !!(e.kind === "ieConditionalComment" && e.lastChild && !e.lastChild.isSelfClosing && !e.lastChild.endSourceSpan || e.kind === "ieConditionalComment" && !e.complete || ae$1(e) && e.children.some((r) => r.kind !== "text" && r.kind !== "interpolation") || Tt(e, t) && !q$1(e, t) && e.kind !== "interpolation");
}
function oe$1(e) {
  return e.kind === "attribute" || !e.parent || !e.prev ? false : Rs(e.prev);
}
function Rs(e) {
  return e.kind === "comment" && e.value.trim() === "prettier-ignore";
}
function O$1(e) {
  return e.kind === "text" || e.kind === "comment";
}
function q$1(e, t) {
  return e.kind === "element" && (e.fullName === "script" || e.fullName === "style" || e.fullName === "svg:style" || e.fullName === "svg:script" || e.fullName === "mj-style" && t.parser === "mjml" || se$1(e) && (e.name === "script" || e.name === "style"));
}
function nn$1(e, t) {
  return e.children && !q$1(e, t);
}
function sn$1(e, t) {
  return q$1(e, t) || e.kind === "interpolation" || Zt$1(e);
}
function Zt$1(e) {
  return gn$1(e).startsWith("pre");
}
function an$1(e, t) {
  let r = n();
  if (r && !e.prev && e.parent?.tagDefinition?.ignoreFirstLf) return e.kind === "interpolation";
  return r;
  function n() {
    return ie$1(e) || e.kind === "angularControlFlowBlock" ? false : (e.kind === "text" || e.kind === "interpolation") && e.prev && (e.prev.kind === "text" || e.prev.kind === "interpolation") ? true : !e.parent || e.parent.cssDisplay === "none" ? false : ae$1(e.parent) ? true : !(!e.prev && (e.parent.kind === "root" || ae$1(e) && e.parent || q$1(e.parent, t) || $e(e.parent, t) || !Vs(e.parent.cssDisplay)) || e.prev && !Gs(e.prev.cssDisplay));
  }
}
function on$1(e, t) {
  return ie$1(e) || e.kind === "angularControlFlowBlock" ? false : (e.kind === "text" || e.kind === "interpolation") && e.next && (e.next.kind === "text" || e.next.kind === "interpolation") ? true : !e.parent || e.parent.cssDisplay === "none" ? false : ae$1(e.parent) ? true : !(!e.next && (e.parent.kind === "root" || ae$1(e) && e.parent || q$1(e.parent, t) || $e(e.parent, t) || !Us(e.parent.cssDisplay)) || e.next && !Ws(e.next.cssDisplay));
}
function ln(e, t) {
  return zs(e.cssDisplay) && !q$1(e, t);
}
function Ge$1(e) {
  return ie$1(e) || e.next && e.sourceSpan.end && e.sourceSpan.end.line + 1 < e.next.sourceSpan.start.line;
}
function cn(e) {
  return er$1(e) || e.kind === "element" && e.children.length > 0 && (["body", "script", "style"].includes(e.name) || e.children.some((t) => Bs(t))) || e.firstChild && e.firstChild === e.lastChild && e.firstChild.kind !== "text" && pn(e.firstChild) && (!e.lastChild.isTrailingSpaceSensitive || hn$1(e.lastChild));
}
function er$1(e) {
  return e.kind === "element" && e.children.length > 0 && (["html", "head", "ul", "ol", "select"].includes(e.name) || e.cssDisplay.startsWith("table") && e.cssDisplay !== "table-cell");
}
function Ct$1(e) {
  return mn$1(e) || e.prev && Ms(e.prev) || un$1(e);
}
function Ms(e) {
  return mn$1(e) || e.kind === "element" && e.fullName === "br" || un$1(e);
}
function un$1(e) {
  return pn(e) && hn$1(e);
}
function pn(e) {
  return e.hasLeadingSpaces && (e.prev ? e.prev.sourceSpan.end.line < e.sourceSpan.start.line : e.parent.kind === "root" || e.parent.startSourceSpan.end.line < e.sourceSpan.start.line);
}
function hn$1(e) {
  return e.hasTrailingSpaces && (e.next ? e.next.sourceSpan.start.line > e.sourceSpan.end.line : e.parent.kind === "root" || e.parent.endSourceSpan && e.parent.endSourceSpan.start.line > e.sourceSpan.end.line);
}
function mn$1(e) {
  switch (e.kind) {
    case "ieConditionalComment":
    case "comment":
    case "directive":
      return true;
    case "element":
      return ["script", "select"].includes(e.name);
  }
  return false;
}
function vt(e) {
  return e.lastChild ? vt(e.lastChild) : e;
}
function Bs(e) {
  return e.children?.some((t) => t.kind !== "text");
}
function fn(e) {
  if (e) switch (e) {
    case "module":
    case "text/javascript":
    case "text/babel":
    case "text/jsx":
    case "application/javascript":
      return "babel";
    case "application/x-typescript":
      return "typescript";
    case "text/markdown":
      return "markdown";
    case "text/html":
      return "html";
    case "text/x-handlebars-template":
      return "glimmer";
    default:
      if (e.endsWith("json") || e.endsWith("importmap") || e === "speculationrules") return "json";
  }
}
function qs(e, t) {
  let { name: r, attrMap: n } = e;
  if (r !== "script" || Object.prototype.hasOwnProperty.call(n, "src")) return;
  let { type: i, lang: s } = e.attrMap;
  return !s && !i ? "babel" : _t(t, { language: s }) ?? fn(i);
}
function Fs(e, t) {
  if (!Tt(e, t)) return;
  let { attrMap: r } = e;
  if (Object.prototype.hasOwnProperty.call(r, "src")) return;
  let { type: n, lang: i } = r;
  return _t(t, { language: i }) ?? fn(n);
}
function Hs(e, t) {
  if (e.name === "style") {
    let { lang: r } = e.attrMap;
    return r ? _t(t, { language: r }) : "css";
  }
  if (e.name === "mj-style" && t.parser === "mjml") return "css";
}
function tr$1(e, t) {
  return qs(e, t) ?? Hs(e, t) ?? Fs(e, t);
}
function ze$1(e) {
  return e === "block" || e === "list-item" || e.startsWith("table");
}
function Vs(e) {
  return !ze$1(e) && e !== "inline-block";
}
function Us(e) {
  return !ze$1(e) && e !== "inline-block";
}
function Ws(e) {
  return !ze$1(e);
}
function Gs(e) {
  return !ze$1(e);
}
function zs(e) {
  return !ze$1(e) && e !== "inline-block";
}
function ae$1(e) {
  return gn$1(e).startsWith("pre");
}
function $s(e, t) {
  let r = e;
  for (; r; ) {
    if (t(r)) return true;
    r = r.parent;
  }
  return false;
}
function dn$1(e, t) {
  if (le$1(e, t)) return "block";
  if (e.prev?.kind === "comment") {
    let n = e.prev.value.match(/^\s*display:\s*([a-z]+)\s*$/u);
    if (n) return n[1];
  }
  let r = false;
  if (e.kind === "element" && e.namespace === "svg") if ($s(e, (n) => n.fullName === "svg:foreignObject")) r = true;
  else return e.name === "svg" ? "inline-block" : "block";
  switch (t.htmlWhitespaceSensitivity) {
    case "strict":
      return "inline";
    case "ignore":
      return "block";
    default:
      if (e.kind === "element" && (!e.namespace || r || se$1(e)) && Object.prototype.hasOwnProperty.call(Kt$1, e.name)) return Kt$1[e.name];
  }
  return en$1;
}
function gn$1(e) {
  return e.kind === "element" && (!e.namespace || se$1(e)) && Object.prototype.hasOwnProperty.call(Qt$1, e.name) ? Qt$1[e.name] : tn$1;
}
function rr$1(e) {
  return w$1(0, w$1(0, e, "&apos;", "'"), "&quot;", '"');
}
function b$1(e) {
  return rr$1(e.value);
}
var Ys = /* @__PURE__ */ new Set(["template", "style", "script"]);
function $e(e, t) {
  return le$1(e, t) && !Ys.has(e.fullName);
}
function le$1(e, t) {
  return t.parser === "vue" && e.kind === "element" && e.parent.kind === "root" && e.fullName.toLowerCase() !== "html";
}
function Tt(e, t) {
  return le$1(e, t) && ($e(e, t) || e.attrMap.lang && e.attrMap.lang !== "html");
}
function _n$1(e) {
  let t = e.fullName;
  return t.charAt(0) === "#" || t === "slot-scope" || t === "v-slot" || t.startsWith("v-slot:");
}
function Sn$1(e, t) {
  let r = e.parent;
  if (!le$1(r, t)) return false;
  let n = r.fullName, i = e.fullName;
  return n === "script" && i === "setup" || n === "style" && i === "vars";
}
function bt(e, t = e.value) {
  return e.parent.isWhitespaceSensitive ? e.parent.isIndentationSensitive ? L$1(t) : L$1(N.dedentString(Jt$1(t)), C) : B$1(S$1, N.split(t));
}
function wt(e, t) {
  return le$1(e, t) && e.name === "script";
}
function js(e) {
  let { valueSpan: t, value: r } = e;
  return t.end.offset - t.start.offset === r.length + 2;
}
function kt$1(e, t) {
  if (js(e)) return false;
  let { value: r } = e;
  return /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/u.test(r) || t.parser === "lwc" && r.startsWith("{") && r.endsWith("}");
}
var En$1 = /\{\{(.+?)\}\}/su, Cn$1 = ({ node: { value: e } }) => En$1.test(e);
async function vn$1(e, t, r) {
  let n = b$1(r.node), i = [];
  for (let [s, a] of n.split(En$1).entries()) if (s % 2 === 0) i.push(L$1(a));
  else try {
    i.push(E(["{{", A([S$1, await x$1(a, e, { parser: "__ng_interpolation", __isInHtmlInterpolation: true })]), S$1, "}}"]));
  } catch {
    i.push("{{", L$1(a), "}}");
  }
  return i;
}
var nr$1 = (e) => (t, r, n) => x$1(b$1(n.node), t, { parser: e }, V$1), Xs = [{ test(e) {
  let t = e.node.fullName;
  return t.startsWith("(") && t.endsWith(")") || t.startsWith("on-");
}, print: nr$1("__ng_action") }, { test(e) {
  let t = e.node.fullName;
  return t.startsWith("[") && t.endsWith("]") || /^bind(?:on)?-/u.test(t) || /^ng-(?:if|show|hide|class|style)$/u.test(t);
}, print: nr$1("__ng_binding") }, { test: (e) => e.node.fullName.startsWith("*"), print: nr$1("__ng_directive") }, { test: (e) => /^i18n(?:-.+)?$/u.test(e.node.fullName), print: Ks }, { test: Cn$1, print: vn$1 }].map(({ test: e, print: t }) => ({ test: (r, n) => n.parser === "angular" && e(r), print: t }));
function Ks(e, t, { node: r }) {
  let n = b$1(r);
  return X$1(gt$1(bt(r, n.trim())), !n.includes("@@"));
}
var Tn$1 = Xs;
var bn$1 = ({ node: e }, t) => !t.parentParser && e.fullName === "class" && !e.value.includes("{{"), wn$1 = (e, t, r) => b$1(r.node).trim().split(/\s+/u).join(" ");
var ir$1 = ["onabort", "onafterprint", "onauxclick", "onbeforeinput", "onbeforematch", "onbeforeprint", "onbeforetoggle", "onbeforeunload", "onblur", "oncancel", "oncanplay", "oncanplaythrough", "onchange", "onclick", "onclose", "oncommand", "oncontextlost", "oncontextmenu", "oncontextrestored", "oncopy", "oncuechange", "oncut", "ondblclick", "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange", "onemptied", "onended", "onerror", "onfocus", "onformdata", "onhashchange", "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onlanguagechange", "onload", "onloadeddata", "onloadedmetadata", "onloadstart", "onmessage", "onmessageerror", "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onoffline", "ononline", "onpagehide", "onpagereveal", "onpageshow", "onpageswap", "onpaste", "onpause", "onplay", "onplaying", "onpopstate", "onprogress", "onratechange", "onrejectionhandled", "onreset", "onresize", "onscroll", "onscrollend", "onsecuritypolicyviolation", "onseeked", "onseeking", "onselect", "onslotchange", "onstalled", "onstorage", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle", "onunhandledrejection", "onunload", "onvolumechange", "onwaiting", "onwheel"];
var Js = new Set(ir$1), kn$1 = ({ node: e }, t) => Js.has(e.fullName) && !t.parentParser && !e.value.includes("{{"), xn$1 = (e, t, r) => x$1(b$1(r.node), e, { parser: "babel", __isHtmlInlineEventHandler: true }, () => false);
function Zs(e) {
  let t = [];
  for (let r of e.split(";")) {
    if (r = N.trim(r), !r) continue;
    let [n, ...i] = N.split(r);
    t.push({ name: n, value: i });
  }
  return t;
}
var yn$1 = Zs;
var An$1 = ({ node: e }, t) => e.fullName === "allow" && !t.parentParser && e.parent.fullName === "iframe" && !e.value.includes("{{");
function Nn$1(e, t, r) {
  let { node: n } = r, i = yn$1(b$1(n));
  return i.length === 0 ? [""] : X$1(i.map(({ name: s, value: a }, o) => [[s, ...a].join(" "), o === i.length - 1 ? j$1(";") : [";", S$1]]));
}
function Ln$1(e) {
  return e === "	" || e === `
` || e === "\f" || e === "\r" || e === " ";
}
var ea$1 = /^[ \t\n\r\u000c]+/, ta$1 = /^[, \t\n\r\u000c]+/, ra$1 = /^[^ \t\n\r\u000c]+/, na$1 = /[,]+$/, Pn$1 = /^\d+$/, ia$1 = /^-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/;
function sa$1(e) {
  let t = e.length, r, n, i, s, a, o = 0, c;
  function u(m) {
    let _2, T2 = m.exec(e.substring(o));
    if (T2) return [_2] = T2, o += _2.length, _2;
  }
  let p = [];
  for (; ; ) {
    if (u(ta$1), o >= t) {
      if (p.length === 0) throw new Error("Must contain one or more image candidate strings.");
      return p;
    }
    c = o, r = u(ra$1), n = [], r.slice(-1) === "," ? (r = r.replace(na$1, ""), g()) : d();
  }
  function d() {
    for (u(ea$1), i = "", s = "in descriptor"; ; ) {
      if (a = e.charAt(o), s === "in descriptor") if (Ln$1(a)) i && (n.push(i), i = "", s = "after descriptor");
      else if (a === ",") {
        o += 1, i && n.push(i), g();
        return;
      } else if (a === "(") i += a, s = "in parens";
      else if (a === "") {
        i && n.push(i), g();
        return;
      } else i += a;
      else if (s === "in parens") if (a === ")") i += a, s = "in descriptor";
      else if (a === "") {
        n.push(i), g();
        return;
      } else i += a;
      else if (s === "after descriptor" && !Ln$1(a)) if (a === "") {
        g();
        return;
      } else s = "in descriptor", o -= 1;
      o += 1;
    }
  }
  function g() {
    let m = false, _2, T2, P2, z2, ne = {}, Q, ot2, Ce2, qe2, Vt2;
    for (z2 = 0; z2 < n.length; z2++) Q = n[z2], ot2 = Q[Q.length - 1], Ce2 = Q.substring(0, Q.length - 1), qe2 = parseInt(Ce2, 10), Vt2 = parseFloat(Ce2), Pn$1.test(Ce2) && ot2 === "w" ? ((_2 || T2) && (m = true), qe2 === 0 ? m = true : _2 = qe2) : ia$1.test(Ce2) && ot2 === "x" ? ((_2 || T2 || P2) && (m = true), Vt2 < 0 ? m = true : T2 = Vt2) : Pn$1.test(Ce2) && ot2 === "h" ? ((P2 || T2) && (m = true), qe2 === 0 ? m = true : P2 = qe2) : m = true;
    if (!m) ne.source = { value: r, startOffset: c }, _2 && (ne.width = { value: _2 }), T2 && (ne.density = { value: T2 }), P2 && (ne.height = { value: P2 }), p.push(ne);
    else throw new Error(`Invalid srcset descriptor found in "${e}" at "${Q}".`);
  }
}
var On$1 = sa$1;
var Dn$1 = (e) => e.node.fullName === "srcset" && (e.parent.fullName === "img" || e.parent.fullName === "source"), In$1 = { width: "w", height: "h", density: "x" }, aa = Object.keys(In$1);
function Rn$1(e, t, r) {
  let n = b$1(r.node), i = On$1(n), s = aa.filter((m) => i.some((_2) => Object.prototype.hasOwnProperty.call(_2, m)));
  if (s.length > 1) throw new Error("Mixed descriptor in srcset is not supported");
  let [a] = s, o = In$1[a], c = i.map((m) => m.source.value), u = Math.max(...c.map((m) => m.length)), p = i.map((m) => m[a] ? String(m[a].value) : ""), d = p.map((m) => {
    let _2 = m.indexOf(".");
    return _2 === -1 ? m.length : _2;
  }), g = Math.max(...d);
  return X$1(B$1([",", S$1], c.map((m, _2) => {
    let T2 = [m], P2 = p[_2];
    if (P2) {
      let z2 = u - m.length + 1, ne = g - d[_2], Q = " ".repeat(z2 + ne);
      T2.push(j$1(Q, " "), P2 + o);
    }
    return T2;
  })));
}
var Mn$1 = ({ node: e }, t) => e.fullName === "style" && !t.parentParser && !e.value.includes("{{"), Bn$1 = async (e, t, r) => X$1(await e(b$1(r.node), { parser: "css", __isHTMLStyleAttribute: true }));
var sr$1 = /* @__PURE__ */ new WeakMap();
function oa$1(e, t) {
  let { root: r } = e;
  return sr$1.has(r) || sr$1.set(r, r.children.some((n) => wt(n, t) && ["ts", "typescript"].includes(n.attrMap.lang))), sr$1.get(r);
}
var U$1 = oa$1;
function qn(e, t, r) {
  let n = b$1(r.node);
  return x$1(`type T<${n}> = any`, e, { parser: "babel-ts", __isEmbeddedTypescriptGenericParameters: true }, V$1);
}
function Fn$1(e, t, r, n) {
  let i = b$1(r.node), s = U$1(r, n) ? "babel-ts" : "babel";
  return x$1(`function _(${i}) {}`, e, { parser: s, __isVueBindings: true });
}
async function Hn$1(e, t, r, n) {
  let i = b$1(r.node), { left: s, operator: a, right: o } = la$1(i), c = U$1(r, n);
  return [E(await x$1(`function _(${s}) {}`, e, { parser: c ? "babel-ts" : "babel", __isVueForBindingLeft: true })), " ", a, " ", await x$1(o, e, { parser: c ? "__ts_expression" : "__js_expression" })];
}
function la$1(e) {
  let t = /(.*?)\s+(in|of)\s+(.*)/su, r = /,([^,\]}]*)(?:,([^,\]}]*))?$/u, n = /^\(|\)$/gu, i = e.match(t);
  if (!i) return;
  let s = { for: i[3].trim() };
  if (!s.for) return;
  let a = w$1(0, i[1].trim(), n, ""), o = a.match(r);
  o ? (s.alias = a.replace(r, ""), s.iterator1 = o[1].trim(), o[2] && (s.iterator2 = o[2].trim())) : s.alias = a;
  let c = [s.alias, s.iterator1, s.iterator2];
  if (!c.some((u, p) => !u && (p === 0 || c.slice(p + 1).some(Boolean)))) return { left: c.filter(Boolean).join(","), operator: i[2], right: s.for };
}
var ca$1 = [{ test: (e) => e.node.fullName === "v-for", print: Hn$1 }, { test: (e, t) => e.node.fullName === "generic" && wt(e.parent, t), print: qn }, { test: ({ node: e }, t) => _n$1(e) || Sn$1(e, t), print: Fn$1 }, { test(e) {
  let t = e.node.fullName;
  return t.startsWith("@") || t.startsWith("v-on:");
}, print: ua$1 }, { test(e) {
  let t = e.node.fullName;
  return t.startsWith(":") || t.startsWith(".") || t.startsWith("v-bind:");
}, print: pa$1 }, { test: (e) => e.node.fullName.startsWith("v-"), print: Vn$1 }].map(({ test: e, print: t }) => ({ test: (r, n) => n.parser === "vue" && e(r, n), print: t }));
async function ua$1(e, t, r, n) {
  try {
    return await Vn$1(e, t, r, n);
  } catch (a) {
    if (a.cause?.code !== "BABEL_PARSER_SYNTAX_ERROR") throw a;
  }
  let i = b$1(r.node), s = U$1(r, n) ? "__vue_ts_event_binding" : "__vue_event_binding";
  return x$1(i, e, { parser: s }, V$1);
}
function pa$1(e, t, r, n) {
  let i = b$1(r.node), s = U$1(r, n) ? "__vue_ts_expression" : "__vue_expression";
  return x$1(i, e, { parser: s }, V$1);
}
function Vn$1(e, t, r, n) {
  let i = b$1(r.node), s = U$1(r, n) ? "__ts_expression" : "__js_expression";
  return x$1(i, e, { parser: s }, V$1);
}
var Un$1 = ca$1;
var ha$1 = [{ test: Dn$1, print: Rn$1 }, { test: Mn$1, print: Bn$1 }, { test: kn$1, print: xn$1 }, { test: bn$1, print: wn$1 }, { test: An$1, print: Nn$1 }, ...Un$1, ...Tn$1].map(({ test: e, print: t }) => ({ test: e, print: fa$1(t) }));
function ma$1(e, t) {
  let { node: r } = e, { value: n } = r;
  if (n) return kt$1(r, t) ? [r.rawName, "=", n] : ha$1.find(({ test: i }) => i(e, t))?.print;
}
function fa$1(e) {
  return async (t, r, n, i) => {
    let s = await e(t, r, n, i);
    if (s) return s = Gt$1(s, (a) => typeof a == "string" ? w$1(0, a, '"', "&quot;") : a), [n.node.rawName, '="', E(s), '"'];
  };
}
var Wn$1 = ma$1;
var K$1 = (e) => e.sourceSpan.start.offset, J = (e) => e.sourceSpan.end.offset;
function Ye$1(e, t) {
  return [e.isSelfClosing ? "" : da$1(e, t), ce$1(e, t)];
}
function da$1(e, t) {
  return e.lastChild && he$1(e.lastChild) ? "" : [ga$1(e, t), xt(e, t)];
}
function ce$1(e, t) {
  return (e.next ? W$1(e.next) : pe(e.parent)) ? "" : [ue$1(e, t), F(e, t)];
}
function ga$1(e, t) {
  return pe(e) ? ue$1(e.lastChild, t) : "";
}
function F(e, t) {
  return he$1(e) ? xt(e.parent, t) : je$1(e) ? yt(e.next, t) : "";
}
function xt(e, t) {
  if (zn$1(e, t)) return "";
  switch (e.kind) {
    case "ieConditionalComment":
      return "<!";
    case "element":
      if (e.hasHtmComponentClosingTag) return "<//";
    default:
      return `</${e.rawName}`;
  }
}
function ue$1(e, t) {
  if (zn$1(e, t)) return "";
  switch (e.kind) {
    case "ieConditionalComment":
    case "ieConditionalEndComment":
      return "[endif]-->";
    case "ieConditionalStartComment":
      return "]><!-->";
    case "interpolation":
      return "}}";
    case "angularIcuExpression":
      return "}";
    case "element":
      if (e.isSelfClosing) return "/>";
    default:
      return ">";
  }
}
function zn$1(e, t) {
  return !e.isSelfClosing && !e.endSourceSpan && (oe$1(e) || Et$1(e.parent, t));
}
function W$1(e) {
  return e.prev && e.prev.kind !== "docType" && e.kind !== "angularControlFlowBlock" && !O$1(e.prev) && e.isLeadingSpaceSensitive && !e.hasLeadingSpaces;
}
function pe(e) {
  return e.lastChild?.isTrailingSpaceSensitive && !e.lastChild.hasTrailingSpaces && !O$1(vt(e.lastChild)) && !ae$1(e);
}
function he$1(e) {
  return !e.next && !e.hasTrailingSpaces && e.isTrailingSpaceSensitive && O$1(vt(e));
}
function je$1(e) {
  return e.next && !O$1(e.next) && O$1(e) && e.isTrailingSpaceSensitive && !e.hasTrailingSpaces;
}
function _a$1(e) {
  let t = e.trim().match(/^prettier-ignore-attribute(?:\s+(.+))?$/su);
  return t ? t[1] ? t[1].split(/\s+/u) : true : false;
}
function Xe$1(e) {
  return !e.prev && e.isLeadingSpaceSensitive && !e.hasLeadingSpaces;
}
function Sa$1(e, t, r) {
  let { node: n } = e;
  if (!Ne$1(n.attrs)) return n.isSelfClosing ? " " : "";
  let i = n.prev?.kind === "comment" && _a$1(n.prev.value), s = typeof i == "boolean" ? () => i : Array.isArray(i) ? (d) => i.includes(d.rawName) : () => false, a = e.map(({ node: d }) => s(d) ? L$1(t.originalText.slice(K$1(d), J(d))) : r(), "attrs"), o = n.kind === "element" && n.fullName === "script" && n.attrs.length === 1 && n.attrs[0].fullName === "src" && n.children.length === 0, u = t.singleAttributePerLine && n.attrs.length > 1 && !le$1(n, t) ? C : S$1, p = [A([o ? " " : S$1, B$1(u, a)])];
  return n.firstChild && Xe$1(n.firstChild) || n.isSelfClosing && pe(n.parent) || o ? p.push(n.isSelfClosing ? " " : "") : p.push(t.bracketSameLine ? n.isSelfClosing ? " " : "" : n.isSelfClosing ? S$1 : k$1), p;
}
function Ea$1(e) {
  return e.firstChild && Xe$1(e.firstChild) ? "" : At(e);
}
function Ke(e, t, r) {
  let { node: n } = e;
  return [me$1(n, t), Sa$1(e, t, r), n.isSelfClosing ? "" : Ea$1(n)];
}
function me$1(e, t) {
  return e.prev && je$1(e.prev) ? "" : [H$1(e, t), yt(e, t)];
}
function H$1(e, t) {
  return Xe$1(e) ? At(e.parent) : W$1(e) ? ue$1(e.prev, t) : "";
}
var Gn$1 = "<!doctype";
function yt(e, t) {
  switch (e.kind) {
    case "ieConditionalComment":
    case "ieConditionalStartComment":
      return `<!--[if ${e.condition}`;
    case "ieConditionalEndComment":
      return "<!--<!";
    case "interpolation":
      return "{{";
    case "docType": {
      if (e.value === "html") {
        let { filepath: n } = t;
        if (n && /\.html?$/u.test(n)) return Gn$1;
      }
      let r = K$1(e);
      return t.originalText.slice(r, r + Gn$1.length);
    }
    case "angularIcuExpression":
      return "{";
    case "element":
      if (e.condition) return `<!--[if ${e.condition}]><!--><${e.rawName}`;
    default:
      return `<${e.rawName}`;
  }
}
function At(e) {
  switch (e.kind) {
    case "ieConditionalComment":
      return "]>";
    case "element":
      if (e.condition) return "><!--<![endif]-->";
    default:
      return ">";
  }
}
function Ca$1(e, t) {
  if (!e.endSourceSpan) return "";
  let r = e.startSourceSpan.end.offset;
  e.firstChild && Xe$1(e.firstChild) && (r -= At(e).length);
  let n = e.endSourceSpan.start.offset;
  return e.lastChild && he$1(e.lastChild) ? n += xt(e, t).length : pe(e) && (n -= ue$1(e.lastChild, t).length), t.originalText.slice(r, n);
}
var Nt = Ca$1;
var va$1 = /* @__PURE__ */ new Set(["if", "else if", "for", "switch", "case"]);
function Ta$1(e, t) {
  let { node: r } = e;
  switch (r.kind) {
    case "element":
      if (q$1(r, t) || r.kind === "interpolation") return;
      if (!r.isSelfClosing && Tt(r, t)) {
        let n = tr$1(r, t);
        return n ? async (i, s) => {
          let a = Nt(r, t), o = /^\s*$/u.test(a), c = "";
          return o || (c = await i(Jt$1(a), { parser: n, __embeddedInHtml: true }), o = c === ""), [H$1(r, t), E(Ke(e, t, s)), o ? "" : C, c, o ? "" : C, Ye$1(r, t), F(r, t)];
        } : void 0;
      }
      break;
    case "text":
      if (q$1(r.parent, t)) {
        let n = tr$1(r.parent, t);
        if (n) return async (i) => {
          let s = n === "markdown" ? N.dedentString(r.value.replace(/^[^\S\n]*\n/u, "")) : r.value, a = { parser: n, __embeddedInHtml: true };
          if (t.parser === "html" && n === "babel") {
            let o = "script", { attrMap: c } = r.parent;
            c && (c.type === "module" || (c.type === "text/babel" || c.type === "text/jsx") && c["data-type"] === "module") && (o = "module"), a.__babelSourceType = o;
          }
          return [Y$1, H$1(r, t), await i(s, a), F(r, t)];
        };
      } else if (r.parent.kind === "interpolation") return async (n) => {
        let i = { __isInHtmlInterpolation: true, __embeddedInHtml: true };
        return t.parser === "angular" ? i.parser = "__ng_interpolation" : t.parser === "vue" ? i.parser = U$1(e, t) ? "__vue_ts_expression" : "__vue_expression" : i.parser = "__js_expression", [A([S$1, await n(r.value, i)]), r.parent.next && W$1(r.parent.next) ? " " : S$1];
      };
      break;
    case "attribute":
      return Wn$1(e, t);
    case "angularControlFlowBlockParameters":
      return va$1.has(e.parent.name) ? Yr$1 : void 0;
    case "angularLetDeclarationInitializer":
      return (n) => x$1(r.value, n, { parser: "__ng_binding", __isInHtmlAttribute: false });
  }
}
var $n$1 = Ta$1;
var Qe$1 = null;
function Je$1(e) {
  if (Qe$1 !== null && typeof Qe$1.property) {
    let t = Qe$1;
    return Qe$1 = Je$1.prototype = null, t;
  }
  return Qe$1 = Je$1.prototype = e ?? /* @__PURE__ */ Object.create(null), new Je$1();
}
var ba$1 = 10;
for (let e = 0; e <= ba$1; e++) Je$1();
function ar$1(e) {
  return Je$1(e);
}
function wa$1(e, t = "type") {
  ar$1(e);
  function r(n) {
    let i = n[t], s = e[i];
    if (!Array.isArray(s)) throw Object.assign(new Error(`Missing visitor keys for '${i}'.`), { node: n });
    return s;
  }
  return r;
}
var Yn$1 = wa$1;
var I$1 = [["children"], []], jn$1 = { root: I$1[0], element: ["attrs", "children"], ieConditionalComment: I$1[0], ieConditionalStartComment: I$1[1], ieConditionalEndComment: I$1[1], interpolation: I$1[0], text: I$1[0], docType: I$1[1], comment: I$1[1], attribute: I$1[1], cdata: I$1[1], angularControlFlowBlock: ["children", "parameters"], angularControlFlowBlockParameters: I$1[0], angularControlFlowBlockParameter: I$1[1], angularLetDeclaration: ["init"], angularLetDeclarationInitializer: I$1[1], angularIcuExpression: ["cases"], angularIcuCase: ["expression"] };
var ka$1 = Yn$1(jn$1, "kind"), Xn = ka$1;
var Kn$1 = "format";
var Qn = /^\s*<!--\s*@(?:noformat|noprettier)\s*-->/u, Jn$1 = /^\s*<!--\s*@(?:format|prettier)\s*-->/u;
var Zn$1 = (e) => Jn$1.test(e), ei$1 = (e) => Qn.test(e), ti$1 = (e) => `<!-- @${Kn$1} -->

${e}`;
var ri$1 = /* @__PURE__ */ new Map([["if", /* @__PURE__ */ new Set(["else if", "else"])], ["else if", /* @__PURE__ */ new Set(["else if", "else"])], ["for", /* @__PURE__ */ new Set(["empty"])], ["defer", /* @__PURE__ */ new Set(["placeholder", "error", "loading"])], ["placeholder", /* @__PURE__ */ new Set(["placeholder", "error", "loading"])], ["error", /* @__PURE__ */ new Set(["placeholder", "error", "loading"])], ["loading", /* @__PURE__ */ new Set(["placeholder", "error", "loading"])]]);
function ni$1(e) {
  let t = J(e);
  return e.kind === "element" && !e.endSourceSpan && Ne$1(e.children) ? Math.max(t, ni$1(M$1(0, e.children, -1))) : t;
}
function Ze$1(e, t, r) {
  let n = e.node;
  if (oe$1(n)) {
    let i = ni$1(n);
    return [H$1(n, t), L$1(N.trimEnd(t.originalText.slice(K$1(n) + (n.prev && je$1(n.prev) ? yt(n).length : 0), i - (n.next && W$1(n.next) ? ue$1(n, t).length : 0)))), F(n, t)];
  }
  return r();
}
function Lt(e, t) {
  return O$1(e) && O$1(t) ? e.isTrailingSpaceSensitive ? e.hasTrailingSpaces ? Ct$1(t) ? C : S$1 : "" : Ct$1(t) ? C : k$1 : je$1(e) && (oe$1(t) || t.firstChild || t.isSelfClosing || t.kind === "element" && t.attrs.length > 0) || e.kind === "element" && e.isSelfClosing && W$1(t) ? "" : !t.isLeadingSpaceSensitive || Ct$1(t) || W$1(t) && e.lastChild && he$1(e.lastChild) && e.lastChild.lastChild && he$1(e.lastChild.lastChild) ? C : t.hasLeadingSpaces ? S$1 : k$1;
}
function Le$1(e, t, r) {
  let { node: n } = e;
  if (er$1(n)) return [Y$1, ...e.map(() => {
    let s = e.node, a = s.prev ? Lt(s.prev, s) : "";
    return [a ? [a, Ge$1(s.prev) ? C : ""] : "", Ze$1(e, t, r)];
  }, "children")];
  let i = n.children.map(() => /* @__PURE__ */ Symbol(""));
  return e.map(({ node: s, index: a }) => {
    if (O$1(s)) {
      if (s.prev && O$1(s.prev)) {
        let m = Lt(s.prev, s);
        if (m) return Ge$1(s.prev) ? [C, C, Ze$1(e, t, r)] : [m, Ze$1(e, t, r)];
      }
      return Ze$1(e, t, r);
    }
    let o = [], c = [], u = [], p = [], d = s.prev ? Lt(s.prev, s) : "", g = s.next ? Lt(s, s.next) : "";
    return d && (Ge$1(s.prev) ? o.push(C, C) : d === C ? o.push(C) : O$1(s.prev) ? c.push(d) : c.push(j$1("", k$1, { groupId: i[a - 1] }))), g && (Ge$1(s) ? O$1(s.next) && p.push(C, C) : g === C ? O$1(s.next) && p.push(C) : u.push(g)), [...o, E([...c, E([Ze$1(e, t, r), ...u], { id: i[a] })]), ...p];
  }, "children");
}
function ii$1(e, t, r) {
  let { node: n } = e, i = [];
  if (Na$1(e) && i.push("} "), i.push("@", n.name), ya$1(n)) return i.push(";"), i;
  if (n.parameters && i.push(" (", E(r("parameters")), ")"), !Aa(n)) {
    i.push(" {");
    let s = si$1(n);
    n.children.length > 0 ? (n.firstChild.hasLeadingSpaces = true, n.lastChild.hasTrailingSpaces = true, i.push(A([C, Le$1(e, t, r)])), s && i.push(C, "}")) : s && i.push("}");
  }
  return E(i, { shouldBreak: true });
}
function si$1(e) {
  return !(e.next?.kind === "angularControlFlowBlock" && ri$1.get(e.name)?.has(e.next.name));
}
var xa$1 = (e) => e?.kind === "angularControlFlowBlock" && (e.name === "case" || e.name === "default"), ya$1 = (e) => e?.kind === "angularControlFlowBlock" && e.name === "default never";
function Aa(e) {
  return xa$1(e) && e.endSourceSpan && e.endSourceSpan.start.offset === e.endSourceSpan.end.offset;
}
function Na$1(e) {
  let { previous: t } = e;
  return t?.kind === "angularControlFlowBlock" && !oe$1(t) && !si$1(t);
}
function ai$1(e, t, r) {
  return [A([k$1, B$1([";", S$1], e.map(r, "children"))]), k$1];
}
function oi$1(e, t, r) {
  let { node: n } = e;
  return [me$1(n, t), E([n.switchValue.trim(), ", ", n.type, n.cases.length > 0 ? [",", A([S$1, B$1(S$1, e.map(r, "cases"))])] : "", k$1]), ce$1(n, t)];
}
function li$1(e, t, r) {
  let { node: n } = e;
  return [n.value, " {", E([A([k$1, e.map(({ node: i, isLast: s }) => {
    let a = [r()];
    return i.kind === "text" && (i.hasLeadingSpaces && a.unshift(S$1), i.hasTrailingSpaces && !s && a.push(S$1)), a;
  }, "expression")]), k$1]), "}"];
}
function ci$1(e, t, r) {
  let { node: n } = e;
  if (Et$1(n, t)) return [H$1(n, t), E(Ke(e, t, r)), L$1(Nt(n, t)), ...Ye$1(n, t), F(n, t)];
  let i = n.children.length === 1 && (n.firstChild.kind === "interpolation" || n.firstChild.kind === "angularIcuExpression") && n.firstChild.isLeadingSpaceSensitive && !n.firstChild.hasLeadingSpaces && n.lastChild.isTrailingSpaceSensitive && !n.lastChild.hasTrailingSpaces, s = /* @__PURE__ */ Symbol("element-attr-group-id"), a = (p) => E([E(Ke(e, t, r), { id: s }), p, Ye$1(n, t)]), o = (p) => i ? Fr$1(p, { groupId: s }) : (q$1(n, t) || $e(n, t)) && n.parent.kind === "root" && t.parser === "vue" && !t.vueIndentScriptAndStyle ? p : A(p), c = () => i ? j$1(k$1, "", { groupId: s }) : n.firstChild.hasLeadingSpaces && n.firstChild.isLeadingSpaceSensitive ? S$1 : n.firstChild.kind === "text" && n.isWhitespaceSensitive && n.isIndentationSensitive ? qr$1(k$1) : k$1, u = () => (n.next ? W$1(n.next) : pe(n.parent)) ? n.lastChild.hasTrailingSpaces && n.lastChild.isTrailingSpaceSensitive ? " " : "" : i ? j$1(k$1, "", { groupId: s }) : n.lastChild.hasTrailingSpaces && n.lastChild.isTrailingSpaceSensitive ? S$1 : (n.lastChild.kind === "comment" || n.lastChild.kind === "text" && n.isWhitespaceSensitive && n.isIndentationSensitive) && new RegExp(`\\n[\\t ]{${t.tabWidth * (e.ancestors.length - 1)}}$`, "u").test(n.lastChild.value) ? "" : k$1;
  return n.children.length === 0 ? a(n.hasDanglingSpaces && n.isDanglingSpaceSensitive ? S$1 : "") : a([cn(n) ? Y$1 : "", o([c(), Le$1(e, t, r)]), u()]);
}
var R$1 = (function(e) {
  return e[e.RAW_TEXT = 0] = "RAW_TEXT", e[e.ESCAPABLE_RAW_TEXT = 1] = "ESCAPABLE_RAW_TEXT", e[e.PARSABLE_DATA = 2] = "PARSABLE_DATA", e;
})({});
function et$1(e, t = true) {
  if (e[0] != ":") return [null, e];
  let r = e.indexOf(":", 1);
  if (r === -1) {
    if (t) throw new Error(`Unsupported format "${e}" expecting ":namespace:name"`);
    return [null, e];
  }
  return [e.slice(1, r), e.slice(r + 1)];
}
function or$1(e) {
  return et$1(e)[1] === "ng-container";
}
function lr$1(e) {
  return et$1(e)[1] === "ng-content";
}
function Pe$1(e) {
  return e === null ? null : et$1(e)[0];
}
function fe$1(e, t) {
  return e ? `:${e}:${t}` : t;
}
var cr$1 = { name: "custom-elements" }, ur$1 = { name: "no-errors-schema" }, Z$1 = (function(e) {
  return e[e.NONE = 0] = "NONE", e[e.HTML = 1] = "HTML", e[e.STYLE = 2] = "STYLE", e[e.SCRIPT = 3] = "SCRIPT", e[e.URL = 4] = "URL", e[e.RESOURCE_URL = 5] = "RESOURCE_URL", e[e.ATTRIBUTE_NO_BINDING = 6] = "ATTRIBUTE_NO_BINDING", e;
})({});
var La$1 = /-+([a-z0-9])/g;
function ui$1(e) {
  return e.replace(La$1, (...t) => t[1].toUpperCase());
}
var Pt;
function pr$1() {
  return Pt || (Pt = {}, tt$1(Z$1.HTML, ["iframe|srcdoc", "*|innerHTML", "*|outerHTML"]), tt$1(Z$1.STYLE, ["*|style"]), tt$1(Z$1.URL, ["*|formAction", "area|href", "a|href", "a|xlink:href", "form|action", "annotation|href", "annotation|xlink:href", "annotation-xml|href", "annotation-xml|xlink:href", "maction|href", "maction|xlink:href", "malignmark|href", "malignmark|xlink:href", "math|href", "math|xlink:href", "mroot|href", "mroot|xlink:href", "msqrt|href", "msqrt|xlink:href", "merror|href", "merror|xlink:href", "mfrac|href", "mfrac|xlink:href", "mglyph|href", "mglyph|xlink:href", "msub|href", "msub|xlink:href", "msup|href", "msup|xlink:href", "msubsup|href", "msubsup|xlink:href", "mmultiscripts|href", "mmultiscripts|xlink:href", "mprescripts|href", "mprescripts|xlink:href", "mi|href", "mi|xlink:href", "mn|href", "mn|xlink:href", "mo|href", "mo|xlink:href", "mpadded|href", "mpadded|xlink:href", "mphantom|href", "mphantom|xlink:href", "mrow|href", "mrow|xlink:href", "ms|href", "ms|xlink:href", "mspace|href", "mspace|xlink:href", "mstyle|href", "mstyle|xlink:href", "mtable|href", "mtable|xlink:href", "mtd|href", "mtd|xlink:href", "mtr|href", "mtr|xlink:href", "mtext|href", "mtext|xlink:href", "mover|href", "mover|xlink:href", "munder|href", "munder|xlink:href", "munderover|href", "munderover|xlink:href", "semantics|href", "semantics|xlink:href", "none|href", "none|xlink:href", "img|src", "video|src"]), tt$1(Z$1.RESOURCE_URL, ["base|href", "embed|src", "frame|src", "iframe|src", "link|href", "object|codebase", "object|data", "script|src", "script|href", "script|xlink:href"]), tt$1(Z$1.ATTRIBUTE_NO_BINDING, ["animate|attributeName", "animate|values", "animate|to", "animate|from", "set|to", "set|attributeName", "animateMotion|attributeName", "animateTransform|attributeName", "unknown|attributeName", "unknown|values", "unknown|to", "unknown|from", "iframe|sandbox", "iframe|allow", "iframe|allowFullscreen", "iframe|referrerPolicy", "iframe|csp", "iframe|fetchPriority", "unknown|sandbox", "unknown|allow", "unknown|allowFullscreen", "unknown|referrerPolicy", "unknown|csp", "unknown|fetchPriority"])), Pt;
}
function tt$1(e, t) {
  for (let r of t) Pt[r.toLowerCase()] = e;
}
var pi = class {
};
var Pa$1 = "boolean", Oa$1 = "number", Da$1 = "string", Ia$1 = "object", Ra$1 = ["[Element]|textContent,%ariaActiveDescendantElement,%ariaAtomic,%ariaAutoComplete,%ariaBusy,%ariaChecked,%ariaColCount,%ariaColIndex,%ariaColIndexText,%ariaColSpan,%ariaControlsElements,%ariaCurrent,%ariaDescribedByElements,%ariaDescription,%ariaDetailsElements,%ariaDisabled,%ariaErrorMessageElements,%ariaExpanded,%ariaFlowToElements,%ariaHasPopup,%ariaHidden,%ariaInvalid,%ariaKeyShortcuts,%ariaLabel,%ariaLabelledByElements,%ariaLevel,%ariaLive,%ariaModal,%ariaMultiLine,%ariaMultiSelectable,%ariaOrientation,%ariaOwnsElements,%ariaPlaceholder,%ariaPosInSet,%ariaPressed,%ariaReadOnly,%ariaRelevant,%ariaRequired,%ariaRoleDescription,%ariaRowCount,%ariaRowIndex,%ariaRowIndexText,%ariaRowSpan,%ariaSelected,%ariaSetSize,%ariaSort,%ariaValueMax,%ariaValueMin,%ariaValueNow,%ariaValueText,%classList,className,elementTiming,id,innerHTML,*beforecopy,*beforecut,*beforepaste,*fullscreenchange,*fullscreenerror,*search,*webkitfullscreenchange,*webkitfullscreenerror,outerHTML,%part,#scrollLeft,#scrollTop,slot,*message,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored", "[HTMLElement]^[Element]|accessKey,autocapitalize,!autofocus,contentEditable,dir,!draggable,enterKeyHint,!hidden,!inert,innerText,inputMode,lang,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate,virtualKeyboardPolicy", "abbr,address,article,aside,b,bdi,bdo,cite,content,code,dd,dfn,dt,em,figcaption,figure,footer,header,hgroup,i,kbd,main,mark,nav,noscript,rb,rp,rt,rtc,ruby,s,samp,search,section,small,strong,sub,sup,u,var,wbr^[HTMLElement]|accessKey,autocapitalize,!autofocus,contentEditable,dir,!draggable,enterKeyHint,!hidden,innerText,inputMode,lang,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate,virtualKeyboardPolicy", "media^[HTMLElement]|!autoplay,!controls,%controlsList,%crossOrigin,#currentTime,!defaultMuted,#defaultPlaybackRate,!disableRemotePlayback,!loop,!muted,*encrypted,*waitingforkey,#playbackRate,preload,!preservesPitch,src,%srcObject,#volume", ":svg:^[HTMLElement]|!autofocus,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,%style,#tabIndex", ":svg:graphics^:svg:|", ":svg:animation^:svg:|*begin,*end,*repeat", ":svg:geometry^:svg:|", ":svg:componentTransferFunction^:svg:|", ":svg:gradient^:svg:|", ":svg:textContent^:svg:graphics|", ":svg:textPositioning^:svg:textContent|", "a^[HTMLElement]|charset,coords,download,hash,host,hostname,href,hreflang,name,password,pathname,ping,port,protocol,referrerPolicy,rel,%relList,rev,search,shape,target,text,type,username", "area^[HTMLElement]|alt,coords,download,hash,host,hostname,href,!noHref,password,pathname,ping,port,protocol,referrerPolicy,rel,%relList,search,shape,target,username", "audio^media|", "br^[HTMLElement]|clear", "base^[HTMLElement]|href,target", "body^[HTMLElement]|aLink,background,bgColor,link,*afterprint,*beforeprint,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*messageerror,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,text,vLink", "button^[HTMLElement]|!disabled,formAction,formEnctype,formMethod,!formNoValidate,formTarget,name,type,value", "canvas^[HTMLElement]|#height,#width", "content^[HTMLElement]|select", "dl^[HTMLElement]|!compact", "data^[HTMLElement]|value", "datalist^[HTMLElement]|", "details^[HTMLElement]|!open", "dialog^[HTMLElement]|!open,returnValue", "dir^[HTMLElement]|!compact", "div^[HTMLElement]|align", "embed^[HTMLElement]|align,height,name,src,type,width", "fieldset^[HTMLElement]|!disabled,name", "font^[HTMLElement]|color,face,size", "form^[HTMLElement]|acceptCharset,action,autocomplete,encoding,enctype,method,name,!noValidate,target", "frame^[HTMLElement]|frameBorder,longDesc,marginHeight,marginWidth,name,!noResize,scrolling,src", "frameset^[HTMLElement]|cols,*afterprint,*beforeprint,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*messageerror,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,rows", "geolocation^[HTMLElement]|accuracymode,!autolocate,*location,*promptaction,*promptdismiss,*validationstatuschange,!watch", "hr^[HTMLElement]|align,color,!noShade,size,width", "head^[HTMLElement]|", "h1,h2,h3,h4,h5,h6^[HTMLElement]|align", "html^[HTMLElement]|version", "iframe^[HTMLElement]|align,allow,!allowFullscreen,!allowPaymentRequest,csp,frameBorder,height,loading,longDesc,marginHeight,marginWidth,name,referrerPolicy,%sandbox,scrolling,src,srcdoc,width", "img^[HTMLElement]|align,alt,border,%crossOrigin,decoding,#height,#hspace,!isMap,loading,longDesc,lowsrc,name,referrerPolicy,sizes,src,srcset,useMap,#vspace,#width", "input^[HTMLElement]|accept,align,alt,autocomplete,!checked,!defaultChecked,defaultValue,dirName,!disabled,%files,formAction,formEnctype,formMethod,!formNoValidate,formTarget,#height,!incremental,!indeterminate,max,#maxLength,min,#minLength,!multiple,name,pattern,placeholder,!readOnly,!required,selectionDirection,#selectionEnd,#selectionStart,#size,src,step,type,useMap,value,%valueAsDate,#valueAsNumber,#width", "li^[HTMLElement]|type,#value", "label^[HTMLElement]|htmlFor", "legend^[HTMLElement]|align", "link^[HTMLElement]|as,charset,%crossOrigin,!disabled,href,hreflang,imageSizes,imageSrcset,integrity,media,referrerPolicy,rel,%relList,rev,%sizes,target,type", "map^[HTMLElement]|name", "marquee^[HTMLElement]|behavior,bgColor,direction,height,#hspace,#loop,#scrollAmount,#scrollDelay,!trueSpeed,#vspace,width", "menu^[HTMLElement]|!compact", "meta^[HTMLElement]|content,httpEquiv,media,name,scheme", "meter^[HTMLElement]|#high,#low,#max,#min,#optimum,#value", "ins,del^[HTMLElement]|cite,dateTime", "ol^[HTMLElement]|!compact,!reversed,#start,type", "object^[HTMLElement]|align,archive,border,code,codeBase,codeType,data,!declare,height,#hspace,name,standby,type,useMap,#vspace,width", "optgroup^[HTMLElement]|!disabled,label", "option^[HTMLElement]|!defaultSelected,!disabled,label,!selected,text,value", "output^[HTMLElement]|defaultValue,%htmlFor,name,value", "p^[HTMLElement]|align", "param^[HTMLElement]|name,type,value,valueType", "picture^[HTMLElement]|", "pre^[HTMLElement]|#width", "progress^[HTMLElement]|#max,#value", "q,blockquote,cite^[HTMLElement]|", "script^[HTMLElement]|!async,charset,%crossOrigin,!defer,event,htmlFor,integrity,!noModule,%referrerPolicy,src,text,type", "select^[HTMLElement]|autocomplete,!disabled,#length,!multiple,name,!required,#selectedIndex,#size,value", "selectedcontent^[HTMLElement]|", "slot^[HTMLElement]|name", "source^[HTMLElement]|#height,media,sizes,src,srcset,type,#width", "span^[HTMLElement]|", "style^[HTMLElement]|!disabled,media,type", "search^[HTMLELement]|", "caption^[HTMLElement]|align", "th,td^[HTMLElement]|abbr,align,axis,bgColor,ch,chOff,#colSpan,headers,height,!noWrap,#rowSpan,scope,vAlign,width", "col,colgroup^[HTMLElement]|align,ch,chOff,#span,vAlign,width", "table^[HTMLElement]|align,bgColor,border,%caption,cellPadding,cellSpacing,frame,rules,summary,%tFoot,%tHead,width", "tr^[HTMLElement]|align,bgColor,ch,chOff,vAlign", "tfoot,thead,tbody^[HTMLElement]|align,ch,chOff,vAlign", "template^[HTMLElement]|", "textarea^[HTMLElement]|autocomplete,#cols,defaultValue,dirName,!disabled,#maxLength,#minLength,name,placeholder,!readOnly,!required,#rows,selectionDirection,#selectionEnd,#selectionStart,value,wrap", "time^[HTMLElement]|dateTime", "title^[HTMLElement]|text", "track^[HTMLElement]|!default,kind,label,src,srclang", "ul^[HTMLElement]|!compact,type", "unknown^[HTMLElement]|", "video^media|!disablePictureInPicture,#height,*enterpictureinpicture,*leavepictureinpicture,!playsInline,poster,#width", ":svg:a^:svg:graphics|", ":svg:animate^:svg:animation|", ":svg:animateMotion^:svg:animation|", ":svg:animateTransform^:svg:animation|", ":svg:circle^:svg:geometry|", ":svg:clipPath^:svg:graphics|", ":svg:defs^:svg:graphics|", ":svg:desc^:svg:|", ":svg:discard^:svg:|", ":svg:ellipse^:svg:geometry|", ":svg:feBlend^:svg:|", ":svg:feColorMatrix^:svg:|", ":svg:feComponentTransfer^:svg:|", ":svg:feComposite^:svg:|", ":svg:feConvolveMatrix^:svg:|", ":svg:feDiffuseLighting^:svg:|", ":svg:feDisplacementMap^:svg:|", ":svg:feDistantLight^:svg:|", ":svg:feDropShadow^:svg:|", ":svg:feFlood^:svg:|", ":svg:feFuncA^:svg:componentTransferFunction|", ":svg:feFuncB^:svg:componentTransferFunction|", ":svg:feFuncG^:svg:componentTransferFunction|", ":svg:feFuncR^:svg:componentTransferFunction|", ":svg:feGaussianBlur^:svg:|", ":svg:feImage^:svg:|", ":svg:feMerge^:svg:|", ":svg:feMergeNode^:svg:|", ":svg:feMorphology^:svg:|", ":svg:feOffset^:svg:|", ":svg:fePointLight^:svg:|", ":svg:feSpecularLighting^:svg:|", ":svg:feSpotLight^:svg:|", ":svg:feTile^:svg:|", ":svg:feTurbulence^:svg:|", ":svg:filter^:svg:|", ":svg:foreignObject^:svg:graphics|", ":svg:g^:svg:graphics|", ":svg:image^:svg:graphics|decoding", ":svg:line^:svg:geometry|", ":svg:linearGradient^:svg:gradient|", ":svg:mpath^:svg:|", ":svg:marker^:svg:|", ":svg:mask^:svg:|", ":svg:metadata^:svg:|", ":svg:path^:svg:geometry|", ":svg:pattern^:svg:|", ":svg:polygon^:svg:geometry|", ":svg:polyline^:svg:geometry|", ":svg:radialGradient^:svg:gradient|", ":svg:rect^:svg:geometry|", ":svg:svg^:svg:graphics|#currentScale,#zoomAndPan", ":svg:script^:svg:|type", ":svg:set^:svg:animation|", ":svg:stop^:svg:|", ":svg:style^:svg:|!disabled,media,title,type", ":svg:switch^:svg:graphics|", ":svg:symbol^:svg:|", ":svg:tspan^:svg:textPositioning|", ":svg:text^:svg:textPositioning|", ":svg:textPath^:svg:textContent|", ":svg:title^:svg:|", ":svg:use^:svg:graphics|", ":svg:view^:svg:|#zoomAndPan", "data^[HTMLElement]|value", "keygen^[HTMLElement]|!autofocus,challenge,!disabled,form,keytype,name", "menuitem^[HTMLElement]|type,label,icon,!disabled,!checked,radiogroup,!default", "summary^[HTMLElement]|", "time^[HTMLElement]|dateTime", ":svg:cursor^:svg:|", ":math:^[HTMLElement]|!autofocus,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforeinput,*beforematch,*beforetoggle,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contentvisibilityautostatechange,*contextlost,*contextmenu,*contextrestored,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*scrollend,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,%style,#tabIndex", ":math:math^:math:|", ":math:maction^:math:|", ":math:menclose^:math:|", ":math:merror^:math:|", ":math:mfenced^:math:|", ":math:mfrac^:math:|", ":math:mi^:math:|", ":math:mmultiscripts^:math:|", ":math:mn^:math:|", ":math:mo^:math:|", ":math:mover^:math:|", ":math:mpadded^:math:|", ":math:mphantom^:math:|", ":math:mroot^:math:|", ":math:mrow^:math:|", ":math:ms^:math:|", ":math:mspace^:math:|", ":math:msqrt^:math:|", ":math:mstyle^:math:|", ":math:msub^:math:|", ":math:msubsup^:math:|", ":math:msup^:math:|", ":math:mtable^:math:|", ":math:mtd^:math:|", ":math:mtext^:math:|", ":math:mtr^:math:|", ":math:munder^:math:|", ":math:munderover^:math:|", ":math:semantics^:math:|"], hi = new Map(Object.entries({ class: "className", for: "htmlFor", formaction: "formAction", innerHtml: "innerHTML", readonly: "readOnly", tabindex: "tabIndex", "aria-activedescendant": "ariaActiveDescendantElement", "aria-atomic": "ariaAtomic", "aria-autocomplete": "ariaAutoComplete", "aria-busy": "ariaBusy", "aria-checked": "ariaChecked", "aria-colcount": "ariaColCount", "aria-colindex": "ariaColIndex", "aria-colindextext": "ariaColIndexText", "aria-colspan": "ariaColSpan", "aria-controls": "ariaControlsElements", "aria-current": "ariaCurrent", "aria-describedby": "ariaDescribedByElements", "aria-description": "ariaDescription", "aria-details": "ariaDetailsElements", "aria-disabled": "ariaDisabled", "aria-errormessage": "ariaErrorMessageElements", "aria-expanded": "ariaExpanded", "aria-flowto": "ariaFlowToElements", "aria-haspopup": "ariaHasPopup", "aria-hidden": "ariaHidden", "aria-invalid": "ariaInvalid", "aria-keyshortcuts": "ariaKeyShortcuts", "aria-label": "ariaLabel", "aria-labelledby": "ariaLabelledByElements", "aria-level": "ariaLevel", "aria-live": "ariaLive", "aria-modal": "ariaModal", "aria-multiline": "ariaMultiLine", "aria-multiselectable": "ariaMultiSelectable", "aria-orientation": "ariaOrientation", "aria-owns": "ariaOwnsElements", "aria-placeholder": "ariaPlaceholder", "aria-posinset": "ariaPosInSet", "aria-pressed": "ariaPressed", "aria-readonly": "ariaReadOnly", "aria-required": "ariaRequired", "aria-roledescription": "ariaRoleDescription", "aria-rowcount": "ariaRowCount", "aria-rowindex": "ariaRowIndex", "aria-rowindextext": "ariaRowIndexText", "aria-rowspan": "ariaRowSpan", "aria-selected": "ariaSelected", "aria-setsize": "ariaSetSize", "aria-sort": "ariaSort", "aria-valuemax": "ariaValueMax", "aria-valuemin": "ariaValueMin", "aria-valuenow": "ariaValueNow", "aria-valuetext": "ariaValueText" })), Ma$1 = Array.from(hi).reduce((e, [t, r]) => (e.set(t, r), e), /* @__PURE__ */ new Map()), mi = class extends pi {
  _schema = /* @__PURE__ */ new Map();
  _eventSchema = /* @__PURE__ */ new Map();
  constructor() {
    super(), Ra$1.forEach((e) => {
      let t = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set(), [n, i] = e.split("|"), s = i.split(","), [a, o] = n.split("^");
      a.split(",").forEach((u) => {
        this._schema.set(u.toLowerCase(), t), this._eventSchema.set(u.toLowerCase(), r);
      });
      let c = o && this._schema.get(o.toLowerCase());
      if (c) {
        for (let [u, p] of c) t.set(u, p);
        for (let u of this._eventSchema.get(o.toLowerCase())) r.add(u);
      }
      s.forEach((u) => {
        if (u.length > 0) switch (u[0]) {
          case "*":
            r.add(u.substring(1));
            break;
          case "!":
            t.set(u.substring(1), Pa$1);
            break;
          case "#":
            t.set(u.substring(1), Oa$1);
            break;
          case "%":
            t.set(u.substring(1), Ia$1);
            break;
          default:
            t.set(u, Da$1);
        }
      });
    });
  }
  hasProperty(e, t, r) {
    if (r.some((n) => n.name === ur$1.name)) return true;
    if (e.indexOf("-") > -1) {
      if (or$1(e) || lr$1(e)) return false;
      if (r.some((n) => n.name === cr$1.name)) return true;
    }
    return (this._schema.get(e.toLowerCase()) || this._schema.get("unknown")).has(t);
  }
  hasElement(e, t) {
    return t.some((r) => r.name === ur$1.name) || e.indexOf("-") > -1 && (or$1(e) || lr$1(e) || t.some((r) => r.name === cr$1.name)) ? true : this._schema.has(e.toLowerCase());
  }
  securityContext(e, t, r) {
    r && (t = this.getMappedPropName(t)), e = e.toLowerCase(), t = t.toLowerCase();
    let n = pr$1()[e + "|" + t];
    return n || (n = pr$1()["*|" + t], n || Z$1.NONE);
  }
  getMappedPropName(e) {
    return hi.get(e) ?? e;
  }
  getDefaultComponentElementName() {
    return "ng-component";
  }
  validateProperty(e) {
    return e.toLowerCase().startsWith("on") ? { error: true, msg: `Binding to event property '${e}' is disallowed for security reasons, please use (${e.slice(2)})=...
If '${e}' is a directive input, make sure the directive is imported by the current module.` } : { error: false };
  }
  validateAttribute(e) {
    return e.toLowerCase().startsWith("on") ? { error: true, msg: `Binding to event attribute '${e}' is disallowed for security reasons, please use (${e.slice(2)})=...` } : { error: false };
  }
  allKnownElementNames() {
    return Array.from(this._schema.keys());
  }
  allKnownAttributesOfElement(e) {
    let t = this._schema.get(e.toLowerCase()) || this._schema.get("unknown");
    return Array.from(t.keys()).map((r) => Ma$1.get(r) ?? r);
  }
  allKnownEventsOfElement(e) {
    return Array.from(this._eventSchema.get(e.toLowerCase()) ?? []);
  }
  normalizeAnimationStyleProperty(e) {
    return ui$1(e);
  }
  normalizeAnimationStyleValue(e, t, r) {
    let n = "", i = r.toString().trim(), s = null;
    if (Ba$1(e) && r !== 0 && r !== "0") if (typeof r == "number") n = "px";
    else {
      let a = r.match(/^[+-]?[\d\.]+([a-z]*)$/);
      a && a[1].length == 0 && (s = `Please provide a CSS unit value for ${t}:${r}`);
    }
    return { error: s, value: i + n };
  }
};
function Ba$1(e) {
  switch (e) {
    case "width":
    case "height":
    case "minWidth":
    case "minHeight":
    case "maxWidth":
    case "maxHeight":
    case "left":
    case "top":
    case "bottom":
    case "right":
    case "fontSize":
    case "outlineWidth":
    case "outlineOffset":
    case "paddingTop":
    case "paddingLeft":
    case "paddingBottom":
    case "paddingRight":
    case "marginTop":
    case "marginLeft":
    case "marginBottom":
    case "marginRight":
    case "borderRadius":
    case "borderWidth":
    case "borderTopWidth":
    case "borderLeftWidth":
    case "borderRightWidth":
    case "borderBottomWidth":
    case "textIndent":
      return true;
    default:
      return false;
  }
}
var f = class {
  closedByChildren = {};
  contentType;
  closedByParent = false;
  implicitNamespacePrefix;
  isVoid;
  ignoreFirstLf;
  canSelfClose;
  preventNamespaceInheritance;
  constructor({ closedByChildren: e, implicitNamespacePrefix: t, contentType: r = R$1.PARSABLE_DATA, closedByParent: n = false, isVoid: i = false, ignoreFirstLf: s = false, preventNamespaceInheritance: a = false, canSelfClose: o = false } = {}) {
    e && e.length > 0 && e.forEach((c) => this.closedByChildren[c] = true), this.isVoid = i, this.closedByParent = n || i, this.implicitNamespacePrefix = t || null, this.contentType = r, this.ignoreFirstLf = s, this.preventNamespaceInheritance = a, this.canSelfClose = o ?? i;
  }
  isClosedByChild(e) {
    return this.isVoid || e.toLowerCase() in this.closedByChildren;
  }
  getContentType(e) {
    return typeof this.contentType == "object" ? (e === void 0 ? void 0 : this.contentType[e]) ?? this.contentType.default : this.contentType;
  }
}, fi$1, rt$1;
function Oe$1(e) {
  return rt$1 || (fi$1 = new f({ canSelfClose: true }), rt$1 = Object.assign(/* @__PURE__ */ Object.create(null), { base: new f({ isVoid: true }), meta: new f({ isVoid: true }), area: new f({ isVoid: true }), embed: new f({ isVoid: true }), link: new f({ isVoid: true }), img: new f({ isVoid: true }), input: new f({ isVoid: true }), param: new f({ isVoid: true }), hr: new f({ isVoid: true }), br: new f({ isVoid: true }), source: new f({ isVoid: true }), track: new f({ isVoid: true }), wbr: new f({ isVoid: true }), p: new f({ closedByChildren: ["address", "article", "aside", "blockquote", "div", "dl", "fieldset", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "main", "nav", "ol", "p", "pre", "section", "table", "ul"], closedByParent: true }), thead: new f({ closedByChildren: ["tbody", "tfoot"] }), tbody: new f({ closedByChildren: ["tbody", "tfoot"], closedByParent: true }), tfoot: new f({ closedByChildren: ["tbody"], closedByParent: true }), tr: new f({ closedByChildren: ["tr"], closedByParent: true }), td: new f({ closedByChildren: ["td", "th"], closedByParent: true }), th: new f({ closedByChildren: ["td", "th"], closedByParent: true }), col: new f({ isVoid: true }), svg: new f({ implicitNamespacePrefix: "svg" }), foreignObject: new f({ implicitNamespacePrefix: "svg", preventNamespaceInheritance: true }), math: new f({ implicitNamespacePrefix: "math" }), li: new f({ closedByChildren: ["li"], closedByParent: true }), dt: new f({ closedByChildren: ["dt", "dd"] }), dd: new f({ closedByChildren: ["dt", "dd"], closedByParent: true }), rb: new f({ closedByChildren: ["rb", "rt", "rtc", "rp"], closedByParent: true }), rt: new f({ closedByChildren: ["rb", "rt", "rtc", "rp"], closedByParent: true }), rtc: new f({ closedByChildren: ["rb", "rtc", "rp"], closedByParent: true }), rp: new f({ closedByChildren: ["rb", "rt", "rtc", "rp"], closedByParent: true }), optgroup: new f({ closedByChildren: ["optgroup"], closedByParent: true }), option: new f({ closedByChildren: ["option", "optgroup"], closedByParent: true }), pre: new f({ ignoreFirstLf: true }), listing: new f({ ignoreFirstLf: true }), style: new f({ contentType: R$1.RAW_TEXT }), script: new f({ contentType: R$1.RAW_TEXT }), title: new f({ contentType: { default: R$1.ESCAPABLE_RAW_TEXT, svg: R$1.PARSABLE_DATA } }), textarea: new f({ contentType: R$1.ESCAPABLE_RAW_TEXT, ignoreFirstLf: true }) }), new mi().allKnownElementNames().forEach((t) => {
    !rt$1[t] && Pe$1(t) === null && (rt$1[t] = new f({ canSelfClose: false }));
  })), rt$1[e] ?? fi$1;
}
var De$1 = class gi {
  constructor(t, r, n, i) {
    this.file = t, this.offset = r, this.line = n, this.col = i;
  }
  toString() {
    return this.offset != null ? `${this.file.url}@${this.line}:${this.col}` : this.file.url;
  }
  moveBy(t) {
    let r = this.file.content, n = r.length, i = this.offset, s = this.line, a = this.col;
    for (; i > 0 && t < 0; ) if (i--, t++, r.charCodeAt(i) == 10) {
      s--;
      let o = r.substring(0, i - 1).lastIndexOf(`
`);
      a = o > 0 ? i - o : i;
    } else a--;
    for (; i < n && t > 0; ) {
      let o = r.charCodeAt(i);
      i++, t--, o == 10 ? (s++, a = 0) : a++;
    }
    return new gi(this.file, i, s, a);
  }
  getContext(t, r) {
    let n = this.file.content, i = this.offset;
    if (i != null) {
      i > n.length - 1 && (i = n.length - 1);
      let s = i, a = 0, o = 0;
      for (; a < t && i > 0 && (i--, a++, !(n[i] == `
` && ++o == r)); ) ;
      for (a = 0, o = 0; a < t && s < n.length - 1 && (s++, a++, !(n[s] == `
` && ++o == r)); ) ;
      return { before: n.substring(i, this.offset), after: n.substring(this.offset, s + 1) };
    }
    return null;
  }
}, nt$1 = class nt {
  constructor(e, t) {
    this.content = e, this.url = t;
  }
}, h = class {
  constructor(e, t, r = e, n = null) {
    this.start = e, this.end = t, this.fullStart = r, this.details = n;
  }
  toString() {
    return this.start.file.content.substring(this.start.offset, this.end.offset);
  }
}, di = (function(e) {
  return e[e.WARNING = 0] = "WARNING", e[e.ERROR = 1] = "ERROR", e;
})({}), ee$1 = class ee extends Error {
  constructor(e, t, r = di.ERROR, n) {
    super(t), this.span = e, this.msg = t, this.level = r, this.relatedError = n, Object.setPrototypeOf(this, new.target.prototype);
  }
  contextualMessage() {
    let e = this.span.start.getContext(100, 3);
    return e ? `${this.msg} ("${e.before}[${di[this.level]} ->]${e.after}")` : this.msg;
  }
  toString() {
    let e = this.span.details ? `, ${this.span.details}` : "";
    return `${this.contextualMessage()}: ${this.span.start}${e}`;
  }
};
var de$1 = class de {
  constructor(e, t) {
    this.sourceSpan = e, this.i18n = t;
  }
}, _i = class extends de$1 {
  constructor(e, t, r, n) {
    super(t, n), this.value = e, this.tokens = r;
  }
  visit(e, t) {
    return e.visitText(this, t);
  }
  kind = "text";
}, Si = class extends de$1 {
  constructor(e, t, r, n) {
    super(t, n), this.value = e, this.tokens = r;
  }
  visit(e, t) {
    return e.visitCdata(this, t);
  }
  kind = "cdata";
}, Ei = class extends de$1 {
  constructor(e, t, r, n, i, s) {
    super(n, s), this.switchValue = e, this.type = t, this.cases = r, this.switchValueSourceSpan = i;
  }
  visit(e, t) {
    return e.visitExpansion(this, t);
  }
  kind = "expansion";
}, Ci = class {
  constructor(e, t, r, n, i) {
    this.value = e, this.expression = t, this.sourceSpan = r, this.valueSourceSpan = n, this.expSourceSpan = i;
  }
  visit(e, t) {
    return e.visitExpansionCase(this, t);
  }
  kind = "expansionCase";
}, vi = class extends de$1 {
  constructor(e, t, r, n, i, s, a) {
    super(r, a), this.name = e, this.value = t, this.keySpan = n, this.valueSpan = i, this.valueTokens = s;
  }
  visit(e, t) {
    return e.visitAttribute(this, t);
  }
  kind = "attribute";
  get nameSpan() {
    return this.keySpan;
  }
}, te$1 = class te extends de$1 {
  constructor(e, t, r, n, i, s, a, o = null, c = null, u, p) {
    super(s, p), this.name = e, this.attrs = t, this.directives = r, this.children = n, this.isSelfClosing = i, this.startSourceSpan = a, this.endSourceSpan = o, this.nameSpan = c, this.isVoid = u;
  }
  visit(e, t) {
    return e.visitElement(this, t);
  }
  kind = "element";
}, Ti = class {
  constructor(e, t) {
    this.value = e, this.sourceSpan = t;
  }
  visit(e, t) {
    return e.visitComment(this, t);
  }
  kind = "comment";
}, bi = class {
  constructor(e, t) {
    this.value = e, this.sourceSpan = t;
  }
  visit(e, t) {
    return e.visitDocType(this, t);
  }
  kind = "docType";
}, ge$1 = class ge extends de$1 {
  constructor(e, t, r, n, i, s, a = null, o) {
    super(n, o), this.name = e, this.parameters = t, this.children = r, this.nameSpan = i, this.startSourceSpan = s, this.endSourceSpan = a;
  }
  visit(e, t) {
    return e.visitBlock(this, t);
  }
  kind = "block";
}, G$1 = class G extends de$1 {
  constructor(e, t, r, n, i, s, a, o, c, u = null, p) {
    super(o, p), this.componentName = e, this.tagName = t, this.fullName = r, this.attrs = n, this.directives = i, this.children = s, this.isSelfClosing = a, this.startSourceSpan = c, this.endSourceSpan = u;
  }
  visit(e, t) {
    return e.visitComponent(this, t);
  }
  kind = "component";
}, wi = class {
  constructor(e, t, r, n, i = null) {
    this.name = e, this.attrs = t, this.sourceSpan = r, this.startSourceSpan = n, this.endSourceSpan = i;
  }
  visit(e, t) {
    return e.visitDirective(this, t);
  }
  kind = "directive";
}, hr$1 = class hr {
  constructor(e, t) {
    this.expression = e, this.sourceSpan = t;
  }
  visit(e, t) {
    return e.visitBlockParameter(this, t);
  }
  kind = "blockParameter";
  startSourceSpan = null;
  endSourceSpan = null;
}, mr$1 = class mr {
  constructor(e, t, r, n, i) {
    this.name = e, this.value = t, this.sourceSpan = r, this.nameSpan = n, this.valueSpan = i;
  }
  visit(e, t) {
    return e.visitLetDeclaration(this, t);
  }
  kind = "letDeclaration";
  startSourceSpan = null;
  endSourceSpan = null;
};
function Ot(e, t, r = null) {
  let n = [], i = e.visit ? (s) => e.visit(s, r) || s.visit(e, r) : (s) => s.visit(e, r);
  return t.forEach((s) => {
    let a = i(s);
    a && n.push(a);
  }), n;
}
var fr$1 = class fr {
  constructor() {
  }
  visitElement(e, t) {
    this.visitChildren(t, (r) => {
      r(e.attrs), r(e.directives), r(e.children);
    });
  }
  visitAttribute(e, t) {
  }
  visitText(e, t) {
  }
  visitCdata(e, t) {
  }
  visitComment(e, t) {
  }
  visitDocType(e, t) {
  }
  visitExpansion(e, t) {
    return this.visitChildren(t, (r) => {
      r(e.cases);
    });
  }
  visitExpansionCase(e, t) {
  }
  visitBlock(e, t) {
    this.visitChildren(t, (r) => {
      r(e.parameters), r(e.children);
    });
  }
  visitBlockParameter(e, t) {
  }
  visitLetDeclaration(e, t) {
  }
  visitComponent(e, t) {
    this.visitChildren(t, (r) => {
      r(e.attrs), r(e.children);
    });
  }
  visitDirective(e, t) {
    this.visitChildren(t, (r) => {
      r(e.attrs);
    });
  }
  visitChildren(e, t) {
    let r = [], n = this;
    function i(s) {
      s && r.push(Ot(n, s, e));
    }
    return t(i), Array.prototype.concat.apply([], r);
  }
};
var _e$1 = { AElig: "Æ", AMP: "&", amp: "&", Aacute: "Á", Abreve: "Ă", Acirc: "Â", Acy: "А", Afr: "𝔄", Agrave: "À", Alpha: "Α", Amacr: "Ā", And: "⩓", Aogon: "Ą", Aopf: "𝔸", ApplyFunction: "⁡", af: "⁡", Aring: "Å", angst: "Å", Ascr: "𝒜", Assign: "≔", colone: "≔", coloneq: "≔", Atilde: "Ã", Auml: "Ä", Backslash: "∖", setminus: "∖", setmn: "∖", smallsetminus: "∖", ssetmn: "∖", Barv: "⫧", Barwed: "⌆", doublebarwedge: "⌆", Bcy: "Б", Because: "∵", becaus: "∵", because: "∵", Bernoullis: "ℬ", Bscr: "ℬ", bernou: "ℬ", Beta: "Β", Bfr: "𝔅", Bopf: "𝔹", Breve: "˘", breve: "˘", Bumpeq: "≎", HumpDownHump: "≎", bump: "≎", CHcy: "Ч", COPY: "©", copy: "©", Cacute: "Ć", Cap: "⋒", CapitalDifferentialD: "ⅅ", DD: "ⅅ", Cayleys: "ℭ", Cfr: "ℭ", Ccaron: "Č", Ccedil: "Ç", Ccirc: "Ĉ", Cconint: "∰", Cdot: "Ċ", Cedilla: "¸", cedil: "¸", CenterDot: "·", centerdot: "·", middot: "·", Chi: "Χ", CircleDot: "⊙", odot: "⊙", CircleMinus: "⊖", ominus: "⊖", CirclePlus: "⊕", oplus: "⊕", CircleTimes: "⊗", otimes: "⊗", ClockwiseContourIntegral: "∲", cwconint: "∲", CloseCurlyDoubleQuote: "”", rdquo: "”", rdquor: "”", CloseCurlyQuote: "’", rsquo: "’", rsquor: "’", Colon: "∷", Proportion: "∷", Colone: "⩴", Congruent: "≡", equiv: "≡", Conint: "∯", DoubleContourIntegral: "∯", ContourIntegral: "∮", conint: "∮", oint: "∮", Copf: "ℂ", complexes: "ℂ", Coproduct: "∐", coprod: "∐", CounterClockwiseContourIntegral: "∳", awconint: "∳", Cross: "⨯", Cscr: "𝒞", Cup: "⋓", CupCap: "≍", asympeq: "≍", DDotrahd: "⤑", DJcy: "Ђ", DScy: "Ѕ", DZcy: "Џ", Dagger: "‡", ddagger: "‡", Darr: "↡", Dashv: "⫤", DoubleLeftTee: "⫤", Dcaron: "Ď", Dcy: "Д", Del: "∇", nabla: "∇", Delta: "Δ", Dfr: "𝔇", DiacriticalAcute: "´", acute: "´", DiacriticalDot: "˙", dot: "˙", DiacriticalDoubleAcute: "˝", dblac: "˝", DiacriticalGrave: "`", grave: "`", DiacriticalTilde: "˜", tilde: "˜", Diamond: "⋄", diam: "⋄", diamond: "⋄", DifferentialD: "ⅆ", dd: "ⅆ", Dopf: "𝔻", Dot: "¨", DoubleDot: "¨", die: "¨", uml: "¨", DotDot: "⃜", DotEqual: "≐", doteq: "≐", esdot: "≐", DoubleDownArrow: "⇓", Downarrow: "⇓", dArr: "⇓", DoubleLeftArrow: "⇐", Leftarrow: "⇐", lArr: "⇐", DoubleLeftRightArrow: "⇔", Leftrightarrow: "⇔", hArr: "⇔", iff: "⇔", DoubleLongLeftArrow: "⟸", Longleftarrow: "⟸", xlArr: "⟸", DoubleLongLeftRightArrow: "⟺", Longleftrightarrow: "⟺", xhArr: "⟺", DoubleLongRightArrow: "⟹", Longrightarrow: "⟹", xrArr: "⟹", DoubleRightArrow: "⇒", Implies: "⇒", Rightarrow: "⇒", rArr: "⇒", DoubleRightTee: "⊨", vDash: "⊨", DoubleUpArrow: "⇑", Uparrow: "⇑", uArr: "⇑", DoubleUpDownArrow: "⇕", Updownarrow: "⇕", vArr: "⇕", DoubleVerticalBar: "∥", par: "∥", parallel: "∥", shortparallel: "∥", spar: "∥", DownArrow: "↓", ShortDownArrow: "↓", darr: "↓", downarrow: "↓", DownArrowBar: "⤓", DownArrowUpArrow: "⇵", duarr: "⇵", DownBreve: "̑", DownLeftRightVector: "⥐", DownLeftTeeVector: "⥞", DownLeftVector: "↽", leftharpoondown: "↽", lhard: "↽", DownLeftVectorBar: "⥖", DownRightTeeVector: "⥟", DownRightVector: "⇁", rhard: "⇁", rightharpoondown: "⇁", DownRightVectorBar: "⥗", DownTee: "⊤", top: "⊤", DownTeeArrow: "↧", mapstodown: "↧", Dscr: "𝒟", Dstrok: "Đ", ENG: "Ŋ", ETH: "Ð", Eacute: "É", Ecaron: "Ě", Ecirc: "Ê", Ecy: "Э", Edot: "Ė", Efr: "𝔈", Egrave: "È", Element: "∈", in: "∈", isin: "∈", isinv: "∈", Emacr: "Ē", EmptySmallSquare: "◻", EmptyVerySmallSquare: "▫", Eogon: "Ę", Eopf: "𝔼", Epsilon: "Ε", Equal: "⩵", EqualTilde: "≂", eqsim: "≂", esim: "≂", Equilibrium: "⇌", rightleftharpoons: "⇌", rlhar: "⇌", Escr: "ℰ", expectation: "ℰ", Esim: "⩳", Eta: "Η", Euml: "Ë", Exists: "∃", exist: "∃", ExponentialE: "ⅇ", ee: "ⅇ", exponentiale: "ⅇ", Fcy: "Ф", Ffr: "𝔉", FilledSmallSquare: "◼", FilledVerySmallSquare: "▪", blacksquare: "▪", squarf: "▪", squf: "▪", Fopf: "𝔽", ForAll: "∀", forall: "∀", Fouriertrf: "ℱ", Fscr: "ℱ", GJcy: "Ѓ", GT: ">", gt: ">", Gamma: "Γ", Gammad: "Ϝ", Gbreve: "Ğ", Gcedil: "Ģ", Gcirc: "Ĝ", Gcy: "Г", Gdot: "Ġ", Gfr: "𝔊", Gg: "⋙", ggg: "⋙", Gopf: "𝔾", GreaterEqual: "≥", ge: "≥", geq: "≥", GreaterEqualLess: "⋛", gel: "⋛", gtreqless: "⋛", GreaterFullEqual: "≧", gE: "≧", geqq: "≧", GreaterGreater: "⪢", GreaterLess: "≷", gl: "≷", gtrless: "≷", GreaterSlantEqual: "⩾", geqslant: "⩾", ges: "⩾", GreaterTilde: "≳", gsim: "≳", gtrsim: "≳", Gscr: "𝒢", Gt: "≫", NestedGreaterGreater: "≫", gg: "≫", HARDcy: "Ъ", Hacek: "ˇ", caron: "ˇ", Hat: "^", Hcirc: "Ĥ", Hfr: "ℌ", Poincareplane: "ℌ", HilbertSpace: "ℋ", Hscr: "ℋ", hamilt: "ℋ", Hopf: "ℍ", quaternions: "ℍ", HorizontalLine: "─", boxh: "─", Hstrok: "Ħ", HumpEqual: "≏", bumpe: "≏", bumpeq: "≏", IEcy: "Е", IJlig: "Ĳ", IOcy: "Ё", Iacute: "Í", Icirc: "Î", Icy: "И", Idot: "İ", Ifr: "ℑ", Im: "ℑ", image: "ℑ", imagpart: "ℑ", Igrave: "Ì", Imacr: "Ī", ImaginaryI: "ⅈ", ii: "ⅈ", Int: "∬", Integral: "∫", int: "∫", Intersection: "⋂", bigcap: "⋂", xcap: "⋂", InvisibleComma: "⁣", ic: "⁣", InvisibleTimes: "⁢", it: "⁢", Iogon: "Į", Iopf: "𝕀", Iota: "Ι", Iscr: "ℐ", imagline: "ℐ", Itilde: "Ĩ", Iukcy: "І", Iuml: "Ï", Jcirc: "Ĵ", Jcy: "Й", Jfr: "𝔍", Jopf: "𝕁", Jscr: "𝒥", Jsercy: "Ј", Jukcy: "Є", KHcy: "Х", KJcy: "Ќ", Kappa: "Κ", Kcedil: "Ķ", Kcy: "К", Kfr: "𝔎", Kopf: "𝕂", Kscr: "𝒦", LJcy: "Љ", LT: "<", lt: "<", Lacute: "Ĺ", Lambda: "Λ", Lang: "⟪", Laplacetrf: "ℒ", Lscr: "ℒ", lagran: "ℒ", Larr: "↞", twoheadleftarrow: "↞", Lcaron: "Ľ", Lcedil: "Ļ", Lcy: "Л", LeftAngleBracket: "⟨", lang: "⟨", langle: "⟨", LeftArrow: "←", ShortLeftArrow: "←", larr: "←", leftarrow: "←", slarr: "←", LeftArrowBar: "⇤", larrb: "⇤", LeftArrowRightArrow: "⇆", leftrightarrows: "⇆", lrarr: "⇆", LeftCeiling: "⌈", lceil: "⌈", LeftDoubleBracket: "⟦", lobrk: "⟦", LeftDownTeeVector: "⥡", LeftDownVector: "⇃", dharl: "⇃", downharpoonleft: "⇃", LeftDownVectorBar: "⥙", LeftFloor: "⌊", lfloor: "⌊", LeftRightArrow: "↔", harr: "↔", leftrightarrow: "↔", LeftRightVector: "⥎", LeftTee: "⊣", dashv: "⊣", LeftTeeArrow: "↤", mapstoleft: "↤", LeftTeeVector: "⥚", LeftTriangle: "⊲", vartriangleleft: "⊲", vltri: "⊲", LeftTriangleBar: "⧏", LeftTriangleEqual: "⊴", ltrie: "⊴", trianglelefteq: "⊴", LeftUpDownVector: "⥑", LeftUpTeeVector: "⥠", LeftUpVector: "↿", uharl: "↿", upharpoonleft: "↿", LeftUpVectorBar: "⥘", LeftVector: "↼", leftharpoonup: "↼", lharu: "↼", LeftVectorBar: "⥒", LessEqualGreater: "⋚", leg: "⋚", lesseqgtr: "⋚", LessFullEqual: "≦", lE: "≦", leqq: "≦", LessGreater: "≶", lessgtr: "≶", lg: "≶", LessLess: "⪡", LessSlantEqual: "⩽", leqslant: "⩽", les: "⩽", LessTilde: "≲", lesssim: "≲", lsim: "≲", Lfr: "𝔏", Ll: "⋘", Lleftarrow: "⇚", lAarr: "⇚", Lmidot: "Ŀ", LongLeftArrow: "⟵", longleftarrow: "⟵", xlarr: "⟵", LongLeftRightArrow: "⟷", longleftrightarrow: "⟷", xharr: "⟷", LongRightArrow: "⟶", longrightarrow: "⟶", xrarr: "⟶", Lopf: "𝕃", LowerLeftArrow: "↙", swarr: "↙", swarrow: "↙", LowerRightArrow: "↘", searr: "↘", searrow: "↘", Lsh: "↰", lsh: "↰", Lstrok: "Ł", Lt: "≪", NestedLessLess: "≪", ll: "≪", Map: "⤅", Mcy: "М", MediumSpace: " ", Mellintrf: "ℳ", Mscr: "ℳ", phmmat: "ℳ", Mfr: "𝔐", MinusPlus: "∓", mnplus: "∓", mp: "∓", Mopf: "𝕄", Mu: "Μ", NJcy: "Њ", Nacute: "Ń", Ncaron: "Ň", Ncedil: "Ņ", Ncy: "Н", NegativeMediumSpace: "​", NegativeThickSpace: "​", NegativeThinSpace: "​", NegativeVeryThinSpace: "​", ZeroWidthSpace: "​", NewLine: `
`, Nfr: "𝔑", NoBreak: "⁠", NonBreakingSpace: " ", nbsp: " ", Nopf: "ℕ", naturals: "ℕ", Not: "⫬", NotCongruent: "≢", nequiv: "≢", NotCupCap: "≭", NotDoubleVerticalBar: "∦", npar: "∦", nparallel: "∦", nshortparallel: "∦", nspar: "∦", NotElement: "∉", notin: "∉", notinva: "∉", NotEqual: "≠", ne: "≠", NotEqualTilde: "≂̸", nesim: "≂̸", NotExists: "∄", nexist: "∄", nexists: "∄", NotGreater: "≯", ngt: "≯", ngtr: "≯", NotGreaterEqual: "≱", nge: "≱", ngeq: "≱", NotGreaterFullEqual: "≧̸", ngE: "≧̸", ngeqq: "≧̸", NotGreaterGreater: "≫̸", nGtv: "≫̸", NotGreaterLess: "≹", ntgl: "≹", NotGreaterSlantEqual: "⩾̸", ngeqslant: "⩾̸", nges: "⩾̸", NotGreaterTilde: "≵", ngsim: "≵", NotHumpDownHump: "≎̸", nbump: "≎̸", NotHumpEqual: "≏̸", nbumpe: "≏̸", NotLeftTriangle: "⋪", nltri: "⋪", ntriangleleft: "⋪", NotLeftTriangleBar: "⧏̸", NotLeftTriangleEqual: "⋬", nltrie: "⋬", ntrianglelefteq: "⋬", NotLess: "≮", nless: "≮", nlt: "≮", NotLessEqual: "≰", nle: "≰", nleq: "≰", NotLessGreater: "≸", ntlg: "≸", NotLessLess: "≪̸", nLtv: "≪̸", NotLessSlantEqual: "⩽̸", nleqslant: "⩽̸", nles: "⩽̸", NotLessTilde: "≴", nlsim: "≴", NotNestedGreaterGreater: "⪢̸", NotNestedLessLess: "⪡̸", NotPrecedes: "⊀", npr: "⊀", nprec: "⊀", NotPrecedesEqual: "⪯̸", npre: "⪯̸", npreceq: "⪯̸", NotPrecedesSlantEqual: "⋠", nprcue: "⋠", NotReverseElement: "∌", notni: "∌", notniva: "∌", NotRightTriangle: "⋫", nrtri: "⋫", ntriangleright: "⋫", NotRightTriangleBar: "⧐̸", NotRightTriangleEqual: "⋭", nrtrie: "⋭", ntrianglerighteq: "⋭", NotSquareSubset: "⊏̸", NotSquareSubsetEqual: "⋢", nsqsube: "⋢", NotSquareSuperset: "⊐̸", NotSquareSupersetEqual: "⋣", nsqsupe: "⋣", NotSubset: "⊂⃒", nsubset: "⊂⃒", vnsub: "⊂⃒", NotSubsetEqual: "⊈", nsube: "⊈", nsubseteq: "⊈", NotSucceeds: "⊁", nsc: "⊁", nsucc: "⊁", NotSucceedsEqual: "⪰̸", nsce: "⪰̸", nsucceq: "⪰̸", NotSucceedsSlantEqual: "⋡", nsccue: "⋡", NotSucceedsTilde: "≿̸", NotSuperset: "⊃⃒", nsupset: "⊃⃒", vnsup: "⊃⃒", NotSupersetEqual: "⊉", nsupe: "⊉", nsupseteq: "⊉", NotTilde: "≁", nsim: "≁", NotTildeEqual: "≄", nsime: "≄", nsimeq: "≄", NotTildeFullEqual: "≇", ncong: "≇", NotTildeTilde: "≉", nap: "≉", napprox: "≉", NotVerticalBar: "∤", nmid: "∤", nshortmid: "∤", nsmid: "∤", Nscr: "𝒩", Ntilde: "Ñ", Nu: "Ν", OElig: "Œ", Oacute: "Ó", Ocirc: "Ô", Ocy: "О", Odblac: "Ő", Ofr: "𝔒", Ograve: "Ò", Omacr: "Ō", Omega: "Ω", ohm: "Ω", Omicron: "Ο", Oopf: "𝕆", OpenCurlyDoubleQuote: "“", ldquo: "“", OpenCurlyQuote: "‘", lsquo: "‘", Or: "⩔", Oscr: "𝒪", Oslash: "Ø", Otilde: "Õ", Otimes: "⨷", Ouml: "Ö", OverBar: "‾", oline: "‾", OverBrace: "⏞", OverBracket: "⎴", tbrk: "⎴", OverParenthesis: "⏜", PartialD: "∂", part: "∂", Pcy: "П", Pfr: "𝔓", Phi: "Φ", Pi: "Π", PlusMinus: "±", plusmn: "±", pm: "±", Popf: "ℙ", primes: "ℙ", Pr: "⪻", Precedes: "≺", pr: "≺", prec: "≺", PrecedesEqual: "⪯", pre: "⪯", preceq: "⪯", PrecedesSlantEqual: "≼", prcue: "≼", preccurlyeq: "≼", PrecedesTilde: "≾", precsim: "≾", prsim: "≾", Prime: "″", Product: "∏", prod: "∏", Proportional: "∝", prop: "∝", propto: "∝", varpropto: "∝", vprop: "∝", Pscr: "𝒫", Psi: "Ψ", QUOT: '"', quot: '"', Qfr: "𝔔", Qopf: "ℚ", rationals: "ℚ", Qscr: "𝒬", RBarr: "⤐", drbkarow: "⤐", REG: "®", circledR: "®", reg: "®", Racute: "Ŕ", Rang: "⟫", Rarr: "↠", twoheadrightarrow: "↠", Rarrtl: "⤖", Rcaron: "Ř", Rcedil: "Ŗ", Rcy: "Р", Re: "ℜ", Rfr: "ℜ", real: "ℜ", realpart: "ℜ", ReverseElement: "∋", SuchThat: "∋", ni: "∋", niv: "∋", ReverseEquilibrium: "⇋", leftrightharpoons: "⇋", lrhar: "⇋", ReverseUpEquilibrium: "⥯", duhar: "⥯", Rho: "Ρ", RightAngleBracket: "⟩", rang: "⟩", rangle: "⟩", RightArrow: "→", ShortRightArrow: "→", rarr: "→", rightarrow: "→", srarr: "→", RightArrowBar: "⇥", rarrb: "⇥", RightArrowLeftArrow: "⇄", rightleftarrows: "⇄", rlarr: "⇄", RightCeiling: "⌉", rceil: "⌉", RightDoubleBracket: "⟧", robrk: "⟧", RightDownTeeVector: "⥝", RightDownVector: "⇂", dharr: "⇂", downharpoonright: "⇂", RightDownVectorBar: "⥕", RightFloor: "⌋", rfloor: "⌋", RightTee: "⊢", vdash: "⊢", RightTeeArrow: "↦", map: "↦", mapsto: "↦", RightTeeVector: "⥛", RightTriangle: "⊳", vartriangleright: "⊳", vrtri: "⊳", RightTriangleBar: "⧐", RightTriangleEqual: "⊵", rtrie: "⊵", trianglerighteq: "⊵", RightUpDownVector: "⥏", RightUpTeeVector: "⥜", RightUpVector: "↾", uharr: "↾", upharpoonright: "↾", RightUpVectorBar: "⥔", RightVector: "⇀", rharu: "⇀", rightharpoonup: "⇀", RightVectorBar: "⥓", Ropf: "ℝ", reals: "ℝ", RoundImplies: "⥰", Rrightarrow: "⇛", rAarr: "⇛", Rscr: "ℛ", realine: "ℛ", Rsh: "↱", rsh: "↱", RuleDelayed: "⧴", SHCHcy: "Щ", SHcy: "Ш", SOFTcy: "Ь", Sacute: "Ś", Sc: "⪼", Scaron: "Š", Scedil: "Ş", Scirc: "Ŝ", Scy: "С", Sfr: "𝔖", ShortUpArrow: "↑", UpArrow: "↑", uarr: "↑", uparrow: "↑", Sigma: "Σ", SmallCircle: "∘", compfn: "∘", Sopf: "𝕊", Sqrt: "√", radic: "√", Square: "□", squ: "□", square: "□", SquareIntersection: "⊓", sqcap: "⊓", SquareSubset: "⊏", sqsub: "⊏", sqsubset: "⊏", SquareSubsetEqual: "⊑", sqsube: "⊑", sqsubseteq: "⊑", SquareSuperset: "⊐", sqsup: "⊐", sqsupset: "⊐", SquareSupersetEqual: "⊒", sqsupe: "⊒", sqsupseteq: "⊒", SquareUnion: "⊔", sqcup: "⊔", Sscr: "𝒮", Star: "⋆", sstarf: "⋆", Sub: "⋐", Subset: "⋐", SubsetEqual: "⊆", sube: "⊆", subseteq: "⊆", Succeeds: "≻", sc: "≻", succ: "≻", SucceedsEqual: "⪰", sce: "⪰", succeq: "⪰", SucceedsSlantEqual: "≽", sccue: "≽", succcurlyeq: "≽", SucceedsTilde: "≿", scsim: "≿", succsim: "≿", Sum: "∑", sum: "∑", Sup: "⋑", Supset: "⋑", Superset: "⊃", sup: "⊃", supset: "⊃", SupersetEqual: "⊇", supe: "⊇", supseteq: "⊇", THORN: "Þ", TRADE: "™", trade: "™", TSHcy: "Ћ", TScy: "Ц", Tab: "	", Tau: "Τ", Tcaron: "Ť", Tcedil: "Ţ", Tcy: "Т", Tfr: "𝔗", Therefore: "∴", there4: "∴", therefore: "∴", Theta: "Θ", ThickSpace: "  ", ThinSpace: " ", thinsp: " ", Tilde: "∼", sim: "∼", thicksim: "∼", thksim: "∼", TildeEqual: "≃", sime: "≃", simeq: "≃", TildeFullEqual: "≅", cong: "≅", TildeTilde: "≈", ap: "≈", approx: "≈", asymp: "≈", thickapprox: "≈", thkap: "≈", Topf: "𝕋", TripleDot: "⃛", tdot: "⃛", Tscr: "𝒯", Tstrok: "Ŧ", Uacute: "Ú", Uarr: "↟", Uarrocir: "⥉", Ubrcy: "Ў", Ubreve: "Ŭ", Ucirc: "Û", Ucy: "У", Udblac: "Ű", Ufr: "𝔘", Ugrave: "Ù", Umacr: "Ū", UnderBar: "_", lowbar: "_", UnderBrace: "⏟", UnderBracket: "⎵", bbrk: "⎵", UnderParenthesis: "⏝", Union: "⋃", bigcup: "⋃", xcup: "⋃", UnionPlus: "⊎", uplus: "⊎", Uogon: "Ų", Uopf: "𝕌", UpArrowBar: "⤒", UpArrowDownArrow: "⇅", udarr: "⇅", UpDownArrow: "↕", updownarrow: "↕", varr: "↕", UpEquilibrium: "⥮", udhar: "⥮", UpTee: "⊥", bot: "⊥", bottom: "⊥", perp: "⊥", UpTeeArrow: "↥", mapstoup: "↥", UpperLeftArrow: "↖", nwarr: "↖", nwarrow: "↖", UpperRightArrow: "↗", nearr: "↗", nearrow: "↗", Upsi: "ϒ", upsih: "ϒ", Upsilon: "Υ", Uring: "Ů", Uscr: "𝒰", Utilde: "Ũ", Uuml: "Ü", VDash: "⊫", Vbar: "⫫", Vcy: "В", Vdash: "⊩", Vdashl: "⫦", Vee: "⋁", bigvee: "⋁", xvee: "⋁", Verbar: "‖", Vert: "‖", VerticalBar: "∣", mid: "∣", shortmid: "∣", smid: "∣", VerticalLine: "|", verbar: "|", vert: "|", VerticalSeparator: "❘", VerticalTilde: "≀", wr: "≀", wreath: "≀", VeryThinSpace: " ", hairsp: " ", Vfr: "𝔙", Vopf: "𝕍", Vscr: "𝒱", Vvdash: "⊪", Wcirc: "Ŵ", Wedge: "⋀", bigwedge: "⋀", xwedge: "⋀", Wfr: "𝔚", Wopf: "𝕎", Wscr: "𝒲", Xfr: "𝔛", Xi: "Ξ", Xopf: "𝕏", Xscr: "𝒳", YAcy: "Я", YIcy: "Ї", YUcy: "Ю", Yacute: "Ý", Ycirc: "Ŷ", Ycy: "Ы", Yfr: "𝔜", Yopf: "𝕐", Yscr: "𝒴", Yuml: "Ÿ", ZHcy: "Ж", Zacute: "Ź", Zcaron: "Ž", Zcy: "З", Zdot: "Ż", Zeta: "Ζ", Zfr: "ℨ", zeetrf: "ℨ", Zopf: "ℤ", integers: "ℤ", Zscr: "𝒵", aacute: "á", abreve: "ă", ac: "∾", mstpos: "∾", acE: "∾̳", acd: "∿", acirc: "â", acy: "а", aelig: "æ", afr: "𝔞", agrave: "à", alefsym: "ℵ", aleph: "ℵ", alpha: "α", amacr: "ā", amalg: "⨿", and: "∧", wedge: "∧", andand: "⩕", andd: "⩜", andslope: "⩘", andv: "⩚", ang: "∠", angle: "∠", ange: "⦤", angmsd: "∡", measuredangle: "∡", angmsdaa: "⦨", angmsdab: "⦩", angmsdac: "⦪", angmsdad: "⦫", angmsdae: "⦬", angmsdaf: "⦭", angmsdag: "⦮", angmsdah: "⦯", angrt: "∟", angrtvb: "⊾", angrtvbd: "⦝", angsph: "∢", angzarr: "⍼", aogon: "ą", aopf: "𝕒", apE: "⩰", apacir: "⩯", ape: "≊", approxeq: "≊", apid: "≋", apos: "'", aring: "å", ascr: "𝒶", ast: "*", midast: "*", atilde: "ã", auml: "ä", awint: "⨑", bNot: "⫭", backcong: "≌", bcong: "≌", backepsilon: "϶", bepsi: "϶", backprime: "‵", bprime: "‵", backsim: "∽", bsim: "∽", backsimeq: "⋍", bsime: "⋍", barvee: "⊽", barwed: "⌅", barwedge: "⌅", bbrktbrk: "⎶", bcy: "б", bdquo: "„", ldquor: "„", bemptyv: "⦰", beta: "β", beth: "ℶ", between: "≬", twixt: "≬", bfr: "𝔟", bigcirc: "◯", xcirc: "◯", bigodot: "⨀", xodot: "⨀", bigoplus: "⨁", xoplus: "⨁", bigotimes: "⨂", xotime: "⨂", bigsqcup: "⨆", xsqcup: "⨆", bigstar: "★", starf: "★", bigtriangledown: "▽", xdtri: "▽", bigtriangleup: "△", xutri: "△", biguplus: "⨄", xuplus: "⨄", bkarow: "⤍", rbarr: "⤍", blacklozenge: "⧫", lozf: "⧫", blacktriangle: "▴", utrif: "▴", blacktriangledown: "▾", dtrif: "▾", blacktriangleleft: "◂", ltrif: "◂", blacktriangleright: "▸", rtrif: "▸", blank: "␣", blk12: "▒", blk14: "░", blk34: "▓", block: "█", bne: "=⃥", bnequiv: "≡⃥", bnot: "⌐", bopf: "𝕓", bowtie: "⋈", boxDL: "╗", boxDR: "╔", boxDl: "╖", boxDr: "╓", boxH: "═", boxHD: "╦", boxHU: "╩", boxHd: "╤", boxHu: "╧", boxUL: "╝", boxUR: "╚", boxUl: "╜", boxUr: "╙", boxV: "║", boxVH: "╬", boxVL: "╣", boxVR: "╠", boxVh: "╫", boxVl: "╢", boxVr: "╟", boxbox: "⧉", boxdL: "╕", boxdR: "╒", boxdl: "┐", boxdr: "┌", boxhD: "╥", boxhU: "╨", boxhd: "┬", boxhu: "┴", boxminus: "⊟", minusb: "⊟", boxplus: "⊞", plusb: "⊞", boxtimes: "⊠", timesb: "⊠", boxuL: "╛", boxuR: "╘", boxul: "┘", boxur: "└", boxv: "│", boxvH: "╪", boxvL: "╡", boxvR: "╞", boxvh: "┼", boxvl: "┤", boxvr: "├", brvbar: "¦", bscr: "𝒷", bsemi: "⁏", bsol: "\\", bsolb: "⧅", bsolhsub: "⟈", bull: "•", bullet: "•", bumpE: "⪮", cacute: "ć", cap: "∩", capand: "⩄", capbrcup: "⩉", capcap: "⩋", capcup: "⩇", capdot: "⩀", caps: "∩︀", caret: "⁁", ccaps: "⩍", ccaron: "č", ccedil: "ç", ccirc: "ĉ", ccups: "⩌", ccupssm: "⩐", cdot: "ċ", cemptyv: "⦲", cent: "¢", cfr: "𝔠", chcy: "ч", check: "✓", checkmark: "✓", chi: "χ", cir: "○", cirE: "⧃", circ: "ˆ", circeq: "≗", cire: "≗", circlearrowleft: "↺", olarr: "↺", circlearrowright: "↻", orarr: "↻", circledS: "Ⓢ", oS: "Ⓢ", circledast: "⊛", oast: "⊛", circledcirc: "⊚", ocir: "⊚", circleddash: "⊝", odash: "⊝", cirfnint: "⨐", cirmid: "⫯", cirscir: "⧂", clubs: "♣", clubsuit: "♣", colon: ":", comma: ",", commat: "@", comp: "∁", complement: "∁", congdot: "⩭", copf: "𝕔", copysr: "℗", crarr: "↵", cross: "✗", cscr: "𝒸", csub: "⫏", csube: "⫑", csup: "⫐", csupe: "⫒", ctdot: "⋯", cudarrl: "⤸", cudarrr: "⤵", cuepr: "⋞", curlyeqprec: "⋞", cuesc: "⋟", curlyeqsucc: "⋟", cularr: "↶", curvearrowleft: "↶", cularrp: "⤽", cup: "∪", cupbrcap: "⩈", cupcap: "⩆", cupcup: "⩊", cupdot: "⊍", cupor: "⩅", cups: "∪︀", curarr: "↷", curvearrowright: "↷", curarrm: "⤼", curlyvee: "⋎", cuvee: "⋎", curlywedge: "⋏", cuwed: "⋏", curren: "¤", cwint: "∱", cylcty: "⌭", dHar: "⥥", dagger: "†", daleth: "ℸ", dash: "‐", hyphen: "‐", dbkarow: "⤏", rBarr: "⤏", dcaron: "ď", dcy: "д", ddarr: "⇊", downdownarrows: "⇊", ddotseq: "⩷", eDDot: "⩷", deg: "°", delta: "δ", demptyv: "⦱", dfisht: "⥿", dfr: "𝔡", diamondsuit: "♦", diams: "♦", digamma: "ϝ", gammad: "ϝ", disin: "⋲", div: "÷", divide: "÷", divideontimes: "⋇", divonx: "⋇", djcy: "ђ", dlcorn: "⌞", llcorner: "⌞", dlcrop: "⌍", dollar: "$", dopf: "𝕕", doteqdot: "≑", eDot: "≑", dotminus: "∸", minusd: "∸", dotplus: "∔", plusdo: "∔", dotsquare: "⊡", sdotb: "⊡", drcorn: "⌟", lrcorner: "⌟", drcrop: "⌌", dscr: "𝒹", dscy: "ѕ", dsol: "⧶", dstrok: "đ", dtdot: "⋱", dtri: "▿", triangledown: "▿", dwangle: "⦦", dzcy: "џ", dzigrarr: "⟿", eacute: "é", easter: "⩮", ecaron: "ě", ecir: "≖", eqcirc: "≖", ecirc: "ê", ecolon: "≕", eqcolon: "≕", ecy: "э", edot: "ė", efDot: "≒", fallingdotseq: "≒", efr: "𝔢", eg: "⪚", egrave: "è", egs: "⪖", eqslantgtr: "⪖", egsdot: "⪘", el: "⪙", elinters: "⏧", ell: "ℓ", els: "⪕", eqslantless: "⪕", elsdot: "⪗", emacr: "ē", empty: "∅", emptyset: "∅", emptyv: "∅", varnothing: "∅", emsp13: " ", emsp14: " ", emsp: " ", eng: "ŋ", ensp: " ", eogon: "ę", eopf: "𝕖", epar: "⋕", eparsl: "⧣", eplus: "⩱", epsi: "ε", epsilon: "ε", epsiv: "ϵ", straightepsilon: "ϵ", varepsilon: "ϵ", equals: "=", equest: "≟", questeq: "≟", equivDD: "⩸", eqvparsl: "⧥", erDot: "≓", risingdotseq: "≓", erarr: "⥱", escr: "ℯ", eta: "η", eth: "ð", euml: "ë", euro: "€", excl: "!", fcy: "ф", female: "♀", ffilig: "ﬃ", fflig: "ﬀ", ffllig: "ﬄ", ffr: "𝔣", filig: "ﬁ", fjlig: "fj", flat: "♭", fllig: "ﬂ", fltns: "▱", fnof: "ƒ", fopf: "𝕗", fork: "⋔", pitchfork: "⋔", forkv: "⫙", fpartint: "⨍", frac12: "½", half: "½", frac13: "⅓", frac14: "¼", frac15: "⅕", frac16: "⅙", frac18: "⅛", frac23: "⅔", frac25: "⅖", frac34: "¾", frac35: "⅗", frac38: "⅜", frac45: "⅘", frac56: "⅚", frac58: "⅝", frac78: "⅞", frasl: "⁄", frown: "⌢", sfrown: "⌢", fscr: "𝒻", gEl: "⪌", gtreqqless: "⪌", gacute: "ǵ", gamma: "γ", gap: "⪆", gtrapprox: "⪆", gbreve: "ğ", gcirc: "ĝ", gcy: "г", gdot: "ġ", gescc: "⪩", gesdot: "⪀", gesdoto: "⪂", gesdotol: "⪄", gesl: "⋛︀", gesles: "⪔", gfr: "𝔤", gimel: "ℷ", gjcy: "ѓ", glE: "⪒", gla: "⪥", glj: "⪤", gnE: "≩", gneqq: "≩", gnap: "⪊", gnapprox: "⪊", gne: "⪈", gneq: "⪈", gnsim: "⋧", gopf: "𝕘", gscr: "ℊ", gsime: "⪎", gsiml: "⪐", gtcc: "⪧", gtcir: "⩺", gtdot: "⋗", gtrdot: "⋗", gtlPar: "⦕", gtquest: "⩼", gtrarr: "⥸", gvertneqq: "≩︀", gvnE: "≩︀", hardcy: "ъ", harrcir: "⥈", harrw: "↭", leftrightsquigarrow: "↭", hbar: "ℏ", hslash: "ℏ", planck: "ℏ", plankv: "ℏ", hcirc: "ĥ", hearts: "♥", heartsuit: "♥", hellip: "…", mldr: "…", hercon: "⊹", hfr: "𝔥", hksearow: "⤥", searhk: "⤥", hkswarow: "⤦", swarhk: "⤦", hoarr: "⇿", homtht: "∻", hookleftarrow: "↩", larrhk: "↩", hookrightarrow: "↪", rarrhk: "↪", hopf: "𝕙", horbar: "―", hscr: "𝒽", hstrok: "ħ", hybull: "⁃", iacute: "í", icirc: "î", icy: "и", iecy: "е", iexcl: "¡", ifr: "𝔦", igrave: "ì", iiiint: "⨌", qint: "⨌", iiint: "∭", tint: "∭", iinfin: "⧜", iiota: "℩", ijlig: "ĳ", imacr: "ī", imath: "ı", inodot: "ı", imof: "⊷", imped: "Ƶ", incare: "℅", infin: "∞", infintie: "⧝", intcal: "⊺", intercal: "⊺", intlarhk: "⨗", intprod: "⨼", iprod: "⨼", iocy: "ё", iogon: "į", iopf: "𝕚", iota: "ι", iquest: "¿", iscr: "𝒾", isinE: "⋹", isindot: "⋵", isins: "⋴", isinsv: "⋳", itilde: "ĩ", iukcy: "і", iuml: "ï", jcirc: "ĵ", jcy: "й", jfr: "𝔧", jmath: "ȷ", jopf: "𝕛", jscr: "𝒿", jsercy: "ј", jukcy: "є", kappa: "κ", kappav: "ϰ", varkappa: "ϰ", kcedil: "ķ", kcy: "к", kfr: "𝔨", kgreen: "ĸ", khcy: "х", kjcy: "ќ", kopf: "𝕜", kscr: "𝓀", lAtail: "⤛", lBarr: "⤎", lEg: "⪋", lesseqqgtr: "⪋", lHar: "⥢", lacute: "ĺ", laemptyv: "⦴", lambda: "λ", langd: "⦑", lap: "⪅", lessapprox: "⪅", laquo: "«", larrbfs: "⤟", larrfs: "⤝", larrlp: "↫", looparrowleft: "↫", larrpl: "⤹", larrsim: "⥳", larrtl: "↢", leftarrowtail: "↢", lat: "⪫", latail: "⤙", late: "⪭", lates: "⪭︀", lbarr: "⤌", lbbrk: "❲", lbrace: "{", lcub: "{", lbrack: "[", lsqb: "[", lbrke: "⦋", lbrksld: "⦏", lbrkslu: "⦍", lcaron: "ľ", lcedil: "ļ", lcy: "л", ldca: "⤶", ldrdhar: "⥧", ldrushar: "⥋", ldsh: "↲", le: "≤", leq: "≤", leftleftarrows: "⇇", llarr: "⇇", leftthreetimes: "⋋", lthree: "⋋", lescc: "⪨", lesdot: "⩿", lesdoto: "⪁", lesdotor: "⪃", lesg: "⋚︀", lesges: "⪓", lessdot: "⋖", ltdot: "⋖", lfisht: "⥼", lfr: "𝔩", lgE: "⪑", lharul: "⥪", lhblk: "▄", ljcy: "љ", llhard: "⥫", lltri: "◺", lmidot: "ŀ", lmoust: "⎰", lmoustache: "⎰", lnE: "≨", lneqq: "≨", lnap: "⪉", lnapprox: "⪉", lne: "⪇", lneq: "⪇", lnsim: "⋦", loang: "⟬", loarr: "⇽", longmapsto: "⟼", xmap: "⟼", looparrowright: "↬", rarrlp: "↬", lopar: "⦅", lopf: "𝕝", loplus: "⨭", lotimes: "⨴", lowast: "∗", loz: "◊", lozenge: "◊", lpar: "(", lparlt: "⦓", lrhard: "⥭", lrm: "‎", lrtri: "⊿", lsaquo: "‹", lscr: "𝓁", lsime: "⪍", lsimg: "⪏", lsquor: "‚", sbquo: "‚", lstrok: "ł", ltcc: "⪦", ltcir: "⩹", ltimes: "⋉", ltlarr: "⥶", ltquest: "⩻", ltrPar: "⦖", ltri: "◃", triangleleft: "◃", lurdshar: "⥊", luruhar: "⥦", lvertneqq: "≨︀", lvnE: "≨︀", mDDot: "∺", macr: "¯", strns: "¯", male: "♂", malt: "✠", maltese: "✠", marker: "▮", mcomma: "⨩", mcy: "м", mdash: "—", mfr: "𝔪", mho: "℧", micro: "µ", midcir: "⫰", minus: "−", minusdu: "⨪", mlcp: "⫛", models: "⊧", mopf: "𝕞", mscr: "𝓂", mu: "μ", multimap: "⊸", mumap: "⊸", nGg: "⋙̸", nGt: "≫⃒", nLeftarrow: "⇍", nlArr: "⇍", nLeftrightarrow: "⇎", nhArr: "⇎", nLl: "⋘̸", nLt: "≪⃒", nRightarrow: "⇏", nrArr: "⇏", nVDash: "⊯", nVdash: "⊮", nacute: "ń", nang: "∠⃒", napE: "⩰̸", napid: "≋̸", napos: "ŉ", natur: "♮", natural: "♮", ncap: "⩃", ncaron: "ň", ncedil: "ņ", ncongdot: "⩭̸", ncup: "⩂", ncy: "н", ndash: "–", neArr: "⇗", nearhk: "⤤", nedot: "≐̸", nesear: "⤨", toea: "⤨", nfr: "𝔫", nharr: "↮", nleftrightarrow: "↮", nhpar: "⫲", nis: "⋼", nisd: "⋺", njcy: "њ", nlE: "≦̸", nleqq: "≦̸", nlarr: "↚", nleftarrow: "↚", nldr: "‥", nopf: "𝕟", not: "¬", notinE: "⋹̸", notindot: "⋵̸", notinvb: "⋷", notinvc: "⋶", notnivb: "⋾", notnivc: "⋽", nparsl: "⫽⃥", npart: "∂̸", npolint: "⨔", nrarr: "↛", nrightarrow: "↛", nrarrc: "⤳̸", nrarrw: "↝̸", nscr: "𝓃", nsub: "⊄", nsubE: "⫅̸", nsubseteqq: "⫅̸", nsup: "⊅", nsupE: "⫆̸", nsupseteqq: "⫆̸", ntilde: "ñ", nu: "ν", num: "#", numero: "№", numsp: " ", nvDash: "⊭", nvHarr: "⤄", nvap: "≍⃒", nvdash: "⊬", nvge: "≥⃒", nvgt: ">⃒", nvinfin: "⧞", nvlArr: "⤂", nvle: "≤⃒", nvlt: "<⃒", nvltrie: "⊴⃒", nvrArr: "⤃", nvrtrie: "⊵⃒", nvsim: "∼⃒", nwArr: "⇖", nwarhk: "⤣", nwnear: "⤧", oacute: "ó", ocirc: "ô", ocy: "о", odblac: "ő", odiv: "⨸", odsold: "⦼", oelig: "œ", ofcir: "⦿", ofr: "𝔬", ogon: "˛", ograve: "ò", ogt: "⧁", ohbar: "⦵", olcir: "⦾", olcross: "⦻", olt: "⧀", omacr: "ō", omega: "ω", omicron: "ο", omid: "⦶", oopf: "𝕠", opar: "⦷", operp: "⦹", or: "∨", vee: "∨", ord: "⩝", order: "ℴ", orderof: "ℴ", oscr: "ℴ", ordf: "ª", ordm: "º", origof: "⊶", oror: "⩖", orslope: "⩗", orv: "⩛", oslash: "ø", osol: "⊘", otilde: "õ", otimesas: "⨶", ouml: "ö", ovbar: "⌽", para: "¶", parsim: "⫳", parsl: "⫽", pcy: "п", percnt: "%", period: ".", permil: "‰", pertenk: "‱", pfr: "𝔭", phi: "φ", phiv: "ϕ", straightphi: "ϕ", varphi: "ϕ", phone: "☎", pi: "π", piv: "ϖ", varpi: "ϖ", planckh: "ℎ", plus: "+", plusacir: "⨣", pluscir: "⨢", plusdu: "⨥", pluse: "⩲", plussim: "⨦", plustwo: "⨧", pointint: "⨕", popf: "𝕡", pound: "£", prE: "⪳", prap: "⪷", precapprox: "⪷", precnapprox: "⪹", prnap: "⪹", precneqq: "⪵", prnE: "⪵", precnsim: "⋨", prnsim: "⋨", prime: "′", profalar: "⌮", profline: "⌒", profsurf: "⌓", prurel: "⊰", pscr: "𝓅", psi: "ψ", puncsp: " ", qfr: "𝔮", qopf: "𝕢", qprime: "⁗", qscr: "𝓆", quatint: "⨖", quest: "?", rAtail: "⤜", rHar: "⥤", race: "∽̱", racute: "ŕ", raemptyv: "⦳", rangd: "⦒", range: "⦥", raquo: "»", rarrap: "⥵", rarrbfs: "⤠", rarrc: "⤳", rarrfs: "⤞", rarrpl: "⥅", rarrsim: "⥴", rarrtl: "↣", rightarrowtail: "↣", rarrw: "↝", rightsquigarrow: "↝", ratail: "⤚", ratio: "∶", rbbrk: "❳", rbrace: "}", rcub: "}", rbrack: "]", rsqb: "]", rbrke: "⦌", rbrksld: "⦎", rbrkslu: "⦐", rcaron: "ř", rcedil: "ŗ", rcy: "р", rdca: "⤷", rdldhar: "⥩", rdsh: "↳", rect: "▭", rfisht: "⥽", rfr: "𝔯", rharul: "⥬", rho: "ρ", rhov: "ϱ", varrho: "ϱ", rightrightarrows: "⇉", rrarr: "⇉", rightthreetimes: "⋌", rthree: "⋌", ring: "˚", rlm: "‏", rmoust: "⎱", rmoustache: "⎱", rnmid: "⫮", roang: "⟭", roarr: "⇾", ropar: "⦆", ropf: "𝕣", roplus: "⨮", rotimes: "⨵", rpar: ")", rpargt: "⦔", rppolint: "⨒", rsaquo: "›", rscr: "𝓇", rtimes: "⋊", rtri: "▹", triangleright: "▹", rtriltri: "⧎", ruluhar: "⥨", rx: "℞", sacute: "ś", scE: "⪴", scap: "⪸", succapprox: "⪸", scaron: "š", scedil: "ş", scirc: "ŝ", scnE: "⪶", succneqq: "⪶", scnap: "⪺", succnapprox: "⪺", scnsim: "⋩", succnsim: "⋩", scpolint: "⨓", scy: "с", sdot: "⋅", sdote: "⩦", seArr: "⇘", sect: "§", semi: ";", seswar: "⤩", tosa: "⤩", sext: "✶", sfr: "𝔰", sharp: "♯", shchcy: "щ", shcy: "ш", shy: "­", sigma: "σ", sigmaf: "ς", sigmav: "ς", varsigma: "ς", simdot: "⩪", simg: "⪞", simgE: "⪠", siml: "⪝", simlE: "⪟", simne: "≆", simplus: "⨤", simrarr: "⥲", smashp: "⨳", smeparsl: "⧤", smile: "⌣", ssmile: "⌣", smt: "⪪", smte: "⪬", smtes: "⪬︀", softcy: "ь", sol: "/", solb: "⧄", solbar: "⌿", sopf: "𝕤", spades: "♠", spadesuit: "♠", sqcaps: "⊓︀", sqcups: "⊔︀", sscr: "𝓈", star: "☆", sub: "⊂", subset: "⊂", subE: "⫅", subseteqq: "⫅", subdot: "⪽", subedot: "⫃", submult: "⫁", subnE: "⫋", subsetneqq: "⫋", subne: "⊊", subsetneq: "⊊", subplus: "⪿", subrarr: "⥹", subsim: "⫇", subsub: "⫕", subsup: "⫓", sung: "♪", sup1: "¹", sup2: "²", sup3: "³", supE: "⫆", supseteqq: "⫆", supdot: "⪾", supdsub: "⫘", supedot: "⫄", suphsol: "⟉", suphsub: "⫗", suplarr: "⥻", supmult: "⫂", supnE: "⫌", supsetneqq: "⫌", supne: "⊋", supsetneq: "⊋", supplus: "⫀", supsim: "⫈", supsub: "⫔", supsup: "⫖", swArr: "⇙", swnwar: "⤪", szlig: "ß", target: "⌖", tau: "τ", tcaron: "ť", tcedil: "ţ", tcy: "т", telrec: "⌕", tfr: "𝔱", theta: "θ", thetasym: "ϑ", thetav: "ϑ", vartheta: "ϑ", thorn: "þ", times: "×", timesbar: "⨱", timesd: "⨰", topbot: "⌶", topcir: "⫱", topf: "𝕥", topfork: "⫚", tprime: "‴", triangle: "▵", utri: "▵", triangleq: "≜", trie: "≜", tridot: "◬", triminus: "⨺", triplus: "⨹", trisb: "⧍", tritime: "⨻", trpezium: "⏢", tscr: "𝓉", tscy: "ц", tshcy: "ћ", tstrok: "ŧ", uHar: "⥣", uacute: "ú", ubrcy: "ў", ubreve: "ŭ", ucirc: "û", ucy: "у", udblac: "ű", ufisht: "⥾", ufr: "𝔲", ugrave: "ù", uhblk: "▀", ulcorn: "⌜", ulcorner: "⌜", ulcrop: "⌏", ultri: "◸", umacr: "ū", uogon: "ų", uopf: "𝕦", upsi: "υ", upsilon: "υ", upuparrows: "⇈", uuarr: "⇈", urcorn: "⌝", urcorner: "⌝", urcrop: "⌎", uring: "ů", urtri: "◹", uscr: "𝓊", utdot: "⋰", utilde: "ũ", uuml: "ü", uwangle: "⦧", vBar: "⫨", vBarv: "⫩", vangrt: "⦜", varsubsetneq: "⊊︀", vsubne: "⊊︀", varsubsetneqq: "⫋︀", vsubnE: "⫋︀", varsupsetneq: "⊋︀", vsupne: "⊋︀", varsupsetneqq: "⫌︀", vsupnE: "⫌︀", vcy: "в", veebar: "⊻", veeeq: "≚", vellip: "⋮", vfr: "𝔳", vopf: "𝕧", vscr: "𝓋", vzigzag: "⦚", wcirc: "ŵ", wedbar: "⩟", wedgeq: "≙", weierp: "℘", wp: "℘", wfr: "𝔴", wopf: "𝕨", wscr: "𝓌", xfr: "𝔵", xi: "ξ", xnis: "⋻", xopf: "𝕩", xscr: "𝓍", yacute: "ý", yacy: "я", ycirc: "ŷ", ycy: "ы", yen: "¥", yfr: "𝔶", yicy: "ї", yopf: "𝕪", yscr: "𝓎", yucy: "ю", yuml: "ÿ", zacute: "ź", zcaron: "ž", zcy: "з", zdot: "ż", zeta: "ζ", zfr: "𝔷", zhcy: "ж", zigrarr: "⇝", zopf: "𝕫", zscr: "𝓏", zwj: "‍", zwnj: "‌" };
_e$1.ngsp = "";
var l = (function(e) {
  return e[e.TAG_OPEN_START = 0] = "TAG_OPEN_START", e[e.TAG_OPEN_END = 1] = "TAG_OPEN_END", e[e.TAG_OPEN_END_VOID = 2] = "TAG_OPEN_END_VOID", e[e.TAG_CLOSE = 3] = "TAG_CLOSE", e[e.INCOMPLETE_TAG_OPEN = 4] = "INCOMPLETE_TAG_OPEN", e[e.TEXT = 5] = "TEXT", e[e.ESCAPABLE_RAW_TEXT = 6] = "ESCAPABLE_RAW_TEXT", e[e.RAW_TEXT = 7] = "RAW_TEXT", e[e.INTERPOLATION = 8] = "INTERPOLATION", e[e.ENCODED_ENTITY = 9] = "ENCODED_ENTITY", e[e.COMMENT_START = 10] = "COMMENT_START", e[e.COMMENT_END = 11] = "COMMENT_END", e[e.CDATA_START = 12] = "CDATA_START", e[e.CDATA_END = 13] = "CDATA_END", e[e.ATTR_NAME = 14] = "ATTR_NAME", e[e.ATTR_QUOTE = 15] = "ATTR_QUOTE", e[e.ATTR_VALUE_TEXT = 16] = "ATTR_VALUE_TEXT", e[e.ATTR_VALUE_INTERPOLATION = 17] = "ATTR_VALUE_INTERPOLATION", e[e.DOC_TYPE_START = 18] = "DOC_TYPE_START", e[e.DOC_TYPE_END = 19] = "DOC_TYPE_END", e[e.EXPANSION_FORM_START = 20] = "EXPANSION_FORM_START", e[e.EXPANSION_CASE_VALUE = 21] = "EXPANSION_CASE_VALUE", e[e.EXPANSION_CASE_EXP_START = 22] = "EXPANSION_CASE_EXP_START", e[e.EXPANSION_CASE_EXP_END = 23] = "EXPANSION_CASE_EXP_END", e[e.EXPANSION_FORM_END = 24] = "EXPANSION_FORM_END", e[e.BLOCK_OPEN_START = 25] = "BLOCK_OPEN_START", e[e.BLOCK_OPEN_END = 26] = "BLOCK_OPEN_END", e[e.BLOCK_CLOSE = 27] = "BLOCK_CLOSE", e[e.BLOCK_PARAMETER = 28] = "BLOCK_PARAMETER", e[e.INCOMPLETE_BLOCK_OPEN = 29] = "INCOMPLETE_BLOCK_OPEN", e[e.LET_START = 30] = "LET_START", e[e.LET_VALUE = 31] = "LET_VALUE", e[e.LET_END = 32] = "LET_END", e[e.INCOMPLETE_LET = 33] = "INCOMPLETE_LET", e[e.COMPONENT_OPEN_START = 34] = "COMPONENT_OPEN_START", e[e.COMPONENT_OPEN_END = 35] = "COMPONENT_OPEN_END", e[e.COMPONENT_OPEN_END_VOID = 36] = "COMPONENT_OPEN_END_VOID", e[e.COMPONENT_CLOSE = 37] = "COMPONENT_CLOSE", e[e.INCOMPLETE_COMPONENT_OPEN = 38] = "INCOMPLETE_COMPONENT_OPEN", e[e.DIRECTIVE_NAME = 39] = "DIRECTIVE_NAME", e[e.DIRECTIVE_OPEN = 40] = "DIRECTIVE_OPEN", e[e.DIRECTIVE_CLOSE = 41] = "DIRECTIVE_CLOSE", e[e.EOF = 42] = "EOF", e;
})({});
function it$1(e) {
  return e >= 9 && e <= 32 || e == 160;
}
function Ie$1(e) {
  return 48 <= e && e <= 57;
}
function Re$1(e) {
  return e >= 97 && e <= 122 || e >= 65 && e <= 90;
}
function ki(e) {
  return e >= 97 && e <= 102 || e >= 65 && e <= 70 || Ie$1(e);
}
function Me$1(e) {
  return e === 10 || e === 13;
}
function dr$1(e) {
  return 48 <= e && e <= 55;
}
function Dt$1(e) {
  return e === 39 || e === 34 || e === 96;
}
var qa$1 = class qa {
  constructor(e, t, r) {
    this.tokens = e, this.errors = t, this.nonNormalizedIcuExpressions = r;
  }
};
function Pi(e, t, r, n = {}) {
  let i = new Ua(new nt$1(e, t), r, n);
  return i.tokenize(), new qa$1(Xa$1(i.tokens), i.errors, i.nonNormalizedIcuExpressions);
}
var Fa$1 = /\r\n?/g;
function Se$1(e) {
  return `Unexpected character "${e === 0 ? "EOF" : String.fromCharCode(e)}"`;
}
function xi(e) {
  return `Unknown entity "${e}" - use the "&#<decimal>;" or  "&#x<hex>;" syntax`;
}
function Ha$1(e, t) {
  return `Unable to parse entity "${t}" - ${e} character reference entities must end with ";"`;
}
var gr$1 = (function(e) {
  return e.HEX = "hexadecimal", e.DEC = "decimal", e;
})(gr$1 || {}), Va$1 = ["@if", "@else", "@for", "@switch", "@case", "@default", "@empty", "@defer", "@placeholder", "@loading", "@error"], st$1 = { start: "{{", end: "}}" }, Ua = class {
  _cursor;
  _tokenizeIcu;
  _leadingTriviaCodePoints;
  _canSelfClose;
  _allowHtmComponentClosingTags;
  _currentTokenStart = null;
  _currentTokenType = null;
  _expansionCaseStack = [];
  _openDirectiveCount = 0;
  _inInterpolation = false;
  _preserveLineEndings;
  _i18nNormalizeLineEndingsInICUs;
  _fullNameStack = [];
  _tokenizeBlocks;
  _tokenizeLet;
  _selectorlessEnabled;
  tokens = [];
  errors = [];
  nonNormalizedIcuExpressions = [];
  constructor(e, t, r) {
    this._getTagContentType = t, this._tokenizeIcu = r.tokenizeExpansionForms || false, this._leadingTriviaCodePoints = r.leadingTriviaChars && r.leadingTriviaChars.map((i) => i.codePointAt(0) || 0), this._canSelfClose = r.canSelfClose || false, this._allowHtmComponentClosingTags = r.allowHtmComponentClosingTags || false;
    let n = r.range || { endPos: e.content.length, startPos: 0, startLine: 0, startCol: 0 };
    this._cursor = r.escapedString ? new Ka$1(e, n) : new Oi(e, n), this._preserveLineEndings = r.preserveLineEndings || false, this._i18nNormalizeLineEndingsInICUs = r.i18nNormalizeLineEndingsInICUs || false, this._tokenizeBlocks = r.tokenizeBlocks ?? true, this._tokenizeLet = r.tokenizeLet ?? true, this._selectorlessEnabled = r.selectorlessEnabled ?? false;
    try {
      this._cursor.init();
    } catch (i) {
      this.handleError(i);
    }
  }
  _processCarriageReturns(e) {
    return this._preserveLineEndings ? e : e.replace(Fa$1, `
`);
  }
  tokenize() {
    for (; this._cursor.peek() !== 0; ) {
      let e = this._cursor.clone();
      try {
        if (this._attemptCharCode(60)) if (this._attemptCharCode(33)) this._attemptStr("[CDATA[") ? this._consumeCdata(e) : this._attemptStr("--") ? this._consumeComment(e) : this._attemptStrCaseInsensitive("doctype") ? this._consumeDocType(e) : this._consumeBogusComment(e);
        else if (this._attemptCharCode(47)) this._consumeTagClose(e);
        else {
          let t = this._cursor.clone();
          this._attemptCharCode(63) ? (this._cursor = t, this._consumeBogusComment(e)) : this._consumeTagOpen(e);
        }
        else this._tokenizeLet && this._cursor.peek() === 64 && !this._inInterpolation && this._isLetStart() ? this._consumeLetDeclaration(e) : this._tokenizeBlocks && this._isBlockStart() ? this._consumeBlockStart(e) : this._tokenizeBlocks && !this._inInterpolation && !this._isInExpansionCase() && !this._isInExpansionForm() && this._attemptCharCode(125) ? this._consumeBlockEnd(e) : this._tokenizeIcu && this._tokenizeExpansionForm() || this._consumeWithInterpolation(l.TEXT, l.INTERPOLATION, () => this._isTextEnd(), () => this._isTagStart());
      } catch (t) {
        this.handleError(t);
      }
    }
    this._beginToken(l.EOF), this._endToken([]);
  }
  _getBlockName() {
    let e = false, t = this._cursor.clone();
    return this._attemptCharCodeUntilFn((r) => it$1(r) ? !e : ja$1(r) ? (e = true, false) : true), this._cursor.getChars(t).trim();
  }
  _consumeBlockStart(e) {
    this._requireCharCode(64), this._beginToken(l.BLOCK_OPEN_START, e);
    let t = this._endToken([this._getBlockName()]);
    if (this._cursor.peek() === 40) if (this._cursor.advance(), this._consumeBlockParameters(), this._attemptCharCodeUntilFn(v$1), this._attemptCharCode(41)) this._attemptCharCodeUntilFn(v$1);
    else {
      t.type = l.INCOMPLETE_BLOCK_OPEN;
      return;
    }
    if (t.parts[0] === "default never" && this._attemptCharCode(59)) {
      this._beginToken(l.BLOCK_OPEN_END), this._endToken([]), this._beginToken(l.BLOCK_CLOSE), this._endToken([]);
      return;
    }
    this._attemptCharCode(123) ? (this._beginToken(l.BLOCK_OPEN_END), this._endToken([])) : this._isBlockStart() && (t.parts[0] === "case" || t.parts[0] === "default") ? (this._beginToken(l.BLOCK_OPEN_END), this._endToken([]), this._beginToken(l.BLOCK_CLOSE), this._endToken([])) : t.type = l.INCOMPLETE_BLOCK_OPEN;
  }
  _consumeBlockEnd(e) {
    this._beginToken(l.BLOCK_CLOSE, e), this._endToken([]);
  }
  _consumeBlockParameters() {
    for (this._attemptCharCodeUntilFn(Ai); this._cursor.peek() !== 41 && this._cursor.peek() !== 0; ) {
      this._beginToken(l.BLOCK_PARAMETER);
      let e = this._cursor.clone(), t = null, r = 0;
      for (; this._cursor.peek() !== 59 && this._cursor.peek() !== 0 || t !== null; ) {
        let n = this._cursor.peek();
        if (n === 92) this._cursor.advance();
        else if (n === t) t = null;
        else if (t === null && Dt$1(n)) t = n;
        else if (n === 40 && t === null) r++;
        else if (n === 41 && t === null) {
          if (r === 0) break;
          r > 0 && r--;
        }
        this._cursor.advance();
      }
      this._endToken([this._cursor.getChars(e)]), this._attemptCharCodeUntilFn(Ai);
    }
  }
  _consumeLetDeclaration(e) {
    if (this._requireStr("@let"), this._beginToken(l.LET_START, e), it$1(this._cursor.peek())) this._attemptCharCodeUntilFn(v$1);
    else {
      let r = this._endToken([this._cursor.getChars(e)]);
      r.type = l.INCOMPLETE_LET;
      return;
    }
    let t = this._endToken([this._getLetDeclarationName()]);
    if (this._attemptCharCodeUntilFn(v$1), !this._attemptCharCode(61)) {
      t.type = l.INCOMPLETE_LET;
      return;
    }
    this._attemptCharCodeUntilFn((r) => v$1(r) && !Me$1(r)), this._consumeLetDeclarationValue(), this._cursor.peek() === 59 ? (this._beginToken(l.LET_END), this._endToken([]), this._cursor.advance()) : (t.type = l.INCOMPLETE_LET, t.sourceSpan = this._cursor.getSpan(e));
  }
  _getLetDeclarationName() {
    let e = this._cursor.clone(), t = false;
    return this._attemptCharCodeUntilFn((r) => Re$1(r) || r === 36 || r === 95 || t && Ie$1(r) ? (t = true, false) : true), this._cursor.getChars(e).trim();
  }
  _consumeLetDeclarationValue() {
    let e = this._cursor.clone();
    for (this._beginToken(l.LET_VALUE, e); this._cursor.peek() !== 0; ) {
      let t = this._cursor.peek();
      if (t === 59) break;
      Dt$1(t) && (this._cursor.advance(), this._attemptCharCodeUntilFn((r) => r === 92 ? (this._cursor.advance(), false) : r === t)), this._cursor.advance();
    }
    this._endToken([this._cursor.getChars(e)]);
  }
  _tokenizeExpansionForm() {
    if (this.isExpansionFormStart()) return this._consumeExpansionFormStart(), true;
    if ($a$1(this._cursor.peek()) && this._isInExpansionForm()) return this._consumeExpansionCaseStart(), true;
    if (this._cursor.peek() === 125) {
      if (this._isInExpansionCase()) return this._consumeExpansionCaseEnd(), true;
      if (this._isInExpansionForm()) return this._consumeExpansionFormEnd(), true;
    }
    return false;
  }
  _beginToken(e, t = this._cursor.clone()) {
    this._currentTokenStart = t, this._currentTokenType = e;
  }
  _endToken(e, t) {
    if (this._currentTokenStart === null) throw new ee$1(this._cursor.getSpan(t), "Programming error - attempted to end a token when there was no start to the token");
    if (this._currentTokenType === null) throw new ee$1(this._cursor.getSpan(this._currentTokenStart), "Programming error - attempted to end a token which has no token type");
    let r = { type: this._currentTokenType, parts: e, sourceSpan: (t ?? this._cursor).getSpan(this._currentTokenStart, this._leadingTriviaCodePoints) };
    return this.tokens.push(r), this._currentTokenStart = null, this._currentTokenType = null, r;
  }
  _createError(e, t) {
    this._isInExpansionForm() && (e += ` (Do you have an unescaped "{" in your template? Use "{{ '{' }}") to escape it.)`);
    let r = new ee$1(t, e);
    return this._currentTokenStart = null, this._currentTokenType = null, r;
  }
  handleError(e) {
    if (e instanceof Er$1 && (e = this._createError(e.msg, this._cursor.getSpan(e.cursor))), e instanceof ee$1) this.errors.push(e);
    else throw e;
  }
  _attemptCharCode(e) {
    return this._cursor.peek() === e ? (this._cursor.advance(), true) : false;
  }
  _attemptCharCodeCaseInsensitive(e) {
    return Ya$1(this._cursor.peek(), e) ? (this._cursor.advance(), true) : false;
  }
  _requireCharCode(e) {
    let t = this._cursor.clone();
    if (!this._attemptCharCode(e)) throw this._createError(Se$1(this._cursor.peek()), this._cursor.getSpan(t));
  }
  _attemptStr(e) {
    let t = e.length;
    if (this._cursor.charsLeft() < t) return false;
    let r = this._cursor.clone();
    for (let n = 0; n < t; n++) if (!this._attemptCharCode(e.charCodeAt(n))) return this._cursor = r, false;
    return true;
  }
  _attemptStrCaseInsensitive(e) {
    for (let t = 0; t < e.length; t++) if (!this._attemptCharCodeCaseInsensitive(e.charCodeAt(t))) return false;
    return true;
  }
  _requireStr(e) {
    let t = this._cursor.clone();
    if (!this._attemptStr(e)) throw this._createError(Se$1(this._cursor.peek()), this._cursor.getSpan(t));
  }
  _requireStrCaseInsensitive(e) {
    let t = this._cursor.clone();
    if (!this._attemptStrCaseInsensitive(e)) throw this._createError(Se$1(this._cursor.peek()), this._cursor.getSpan(t));
  }
  _attemptCharCodeUntilFn(e) {
    for (; !e(this._cursor.peek()); ) this._cursor.advance();
  }
  _requireCharCodeUntilFn(e, t) {
    let r = this._cursor.clone();
    if (this._attemptCharCodeUntilFn(e), this._cursor.diff(r) < t) throw this._createError(Se$1(this._cursor.peek()), this._cursor.getSpan(r));
  }
  _attemptUntilChar(e) {
    for (; this._cursor.peek() !== e; ) this._cursor.advance();
  }
  _readChar() {
    let e = String.fromCodePoint(this._cursor.peek());
    return this._cursor.advance(), e;
  }
  _peekStr(e) {
    let t = e.length;
    if (this._cursor.charsLeft() < t) return false;
    let r = this._cursor.clone();
    for (let n = 0; n < t; n++) {
      if (r.peek() !== e.charCodeAt(n)) return false;
      r.advance();
    }
    return true;
  }
  _isBlockStart() {
    return this._cursor.peek() === 64 && Va$1.some((e) => this._peekStr(e));
  }
  _isLetStart() {
    return this._cursor.peek() === 64 && this._peekStr("@let");
  }
  _consumeEntity(e) {
    this._beginToken(l.ENCODED_ENTITY);
    let t = this._cursor.clone();
    if (this._cursor.advance(), this._attemptCharCode(35)) {
      let r = this._attemptCharCode(120) || this._attemptCharCode(88), n = this._cursor.clone();
      if (this._attemptCharCodeUntilFn(Ga$1), this._cursor.peek() != 59) {
        this._cursor.advance();
        let s = r ? gr$1.HEX : gr$1.DEC;
        throw this._createError(Ha$1(s, this._cursor.getChars(t)), this._cursor.getSpan());
      }
      let i = this._cursor.getChars(n);
      this._cursor.advance();
      try {
        let s = parseInt(i, r ? 16 : 10);
        this._endToken([String.fromCodePoint(s), this._cursor.getChars(t)]);
      } catch {
        throw this._createError(xi(this._cursor.getChars(t)), this._cursor.getSpan());
      }
    } else {
      let r = this._cursor.clone();
      if (this._attemptCharCodeUntilFn(za$1), this._cursor.peek() != 59) this._beginToken(e, t), this._cursor = r, this._endToken(["&"]);
      else {
        let n = this._cursor.getChars(r);
        this._cursor.advance();
        let i = _e$1.hasOwnProperty(n) && _e$1[n];
        if (!i) throw this._createError(xi(n), this._cursor.getSpan(t));
        this._endToken([i, `&${n};`]);
      }
    }
  }
  _consumeRawText(e, t) {
    this._beginToken(e ? l.ESCAPABLE_RAW_TEXT : l.RAW_TEXT);
    let r = [];
    for (; ; ) {
      let n = this._cursor.clone(), i = t();
      if (this._cursor = n, i) break;
      e && this._cursor.peek() === 38 ? (this._endToken([this._processCarriageReturns(r.join(""))]), r.length = 0, this._consumeEntity(l.ESCAPABLE_RAW_TEXT), this._beginToken(l.ESCAPABLE_RAW_TEXT)) : r.push(this._readChar());
    }
    this._endToken([this._processCarriageReturns(r.join(""))]);
  }
  _consumeComment(e) {
    this._beginToken(l.COMMENT_START, e), this._endToken([]), this._consumeRawText(false, () => this._attemptStr("-->")), this._beginToken(l.COMMENT_END), this._requireStr("-->"), this._endToken([]);
  }
  _consumeBogusComment(e) {
    this._beginToken(l.COMMENT_START, e), this._endToken([]), this._consumeRawText(false, () => this._cursor.peek() === 62), this._beginToken(l.COMMENT_END), this._cursor.advance(), this._endToken([]);
  }
  _consumeCdata(e) {
    this._beginToken(l.CDATA_START, e), this._endToken([]), this._consumeRawText(false, () => this._attemptStr("]]>")), this._beginToken(l.CDATA_END), this._requireStr("]]>"), this._endToken([]);
  }
  _consumeDocType(e) {
    this._beginToken(l.DOC_TYPE_START, e), this._endToken([]), this._consumeRawText(false, () => this._cursor.peek() === 62), this._beginToken(l.DOC_TYPE_END), this._cursor.advance(), this._endToken([]);
  }
  _consumePrefixAndName(e) {
    let t = this._cursor.clone(), r = "";
    for (; this._cursor.peek() !== 58 && !Wa$1(this._cursor.peek()); ) this._cursor.advance();
    let n;
    this._cursor.peek() === 58 ? (r = this._cursor.getChars(t), this._cursor.advance(), n = this._cursor.clone()) : n = t, this._requireCharCodeUntilFn(e, r === "" ? 0 : 1);
    let i = this._cursor.getChars(n);
    return [r, i];
  }
  _consumeSingleLineComment() {
    this._attemptCharCodeUntilFn((e) => Me$1(e) || e === 0), this._attemptCharCodeUntilFn(v$1);
  }
  _consumeMultiLineComment() {
    this._attemptCharCodeUntilFn((e) => {
      if (e === 0) return true;
      if (e === 42) {
        let t = this._cursor.clone();
        return t.advance(), t.peek() === 47;
      }
      return false;
    }), this._attemptStr("*/") && this._attemptCharCodeUntilFn(v$1);
  }
  _consumeTagOpen(e) {
    let t, r, n, i, s = [];
    try {
      if (this._selectorlessEnabled && It$1(this._cursor.peek())) i = this._consumeComponentOpenStart(e), [n, r, t] = i.parts, r && (n += `:${r}`), t && (n += `:${t}`), this._attemptCharCodeUntilFn(v$1);
      else {
        if (!Re$1(this._cursor.peek())) throw this._createError(Se$1(this._cursor.peek()), this._cursor.getSpan(e));
        i = this._consumeTagOpenStart(e), r = i.parts[0], t = n = i.parts[1], this._attemptCharCodeUntilFn(v$1);
      }
      for (; ; ) {
        if (this._attemptStr("//")) {
          this._consumeSingleLineComment();
          continue;
        }
        if (this._attemptStr("/*")) {
          this._consumeMultiLineComment();
          continue;
        }
        if (Li(this._cursor.peek())) break;
        if (this._selectorlessEnabled && this._cursor.peek() === 64) {
          let o = this._cursor.clone(), c = o.clone();
          c.advance(), It$1(c.peek()) && this._consumeDirective(o, c);
        } else {
          let o = this._consumeAttribute();
          s.push(o);
        }
      }
      i.type === l.COMPONENT_OPEN_START ? this._consumeComponentOpenEnd() : this._consumeTagOpenEnd();
    } catch (o) {
      if (o instanceof ee$1) {
        i ? i.type = i.type === l.COMPONENT_OPEN_START ? l.INCOMPLETE_COMPONENT_OPEN : l.INCOMPLETE_TAG_OPEN : (this._beginToken(l.TEXT, e), this._endToken(["<"]));
        return;
      }
      throw o;
    }
    if (this._canSelfClose && this.tokens[this.tokens.length - 1].type === l.TAG_OPEN_END_VOID) return;
    let a = this._getTagContentType(t, r, this._fullNameStack.length > 0, s);
    this._handleFullNameStackForTagOpen(r, t), a === R$1.RAW_TEXT ? this._consumeRawTextWithTagClose(r, i, n, false) : a === R$1.ESCAPABLE_RAW_TEXT && this._consumeRawTextWithTagClose(r, i, n, true);
  }
  _consumeRawTextWithTagClose(e, t, r, n) {
    this._consumeRawText(n, () => !this._attemptCharCode(60) || !this._attemptCharCode(47) || (this._attemptCharCodeUntilFn(v$1), !this._attemptStrCaseInsensitive(e && t.type !== l.COMPONENT_OPEN_START ? `${e}:${r}` : r)) ? false : (this._attemptCharCodeUntilFn(v$1), this._attemptCharCode(62))), this._beginToken(t.type === l.COMPONENT_OPEN_START ? l.COMPONENT_CLOSE : l.TAG_CLOSE), this._requireCharCodeUntilFn((i) => i === 62, 3), this._cursor.advance(), this._endToken(t.parts), this._handleFullNameStackForTagClose(e, r);
  }
  _consumeTagOpenStart(e) {
    this._beginToken(l.TAG_OPEN_START, e);
    let t = this._consumePrefixAndName(Ee$1);
    return this._endToken(t);
  }
  _consumeComponentOpenStart(e) {
    this._beginToken(l.COMPONENT_OPEN_START, e);
    let t = this._consumeComponentName();
    return this._endToken(t);
  }
  _consumeComponentName() {
    let e = this._cursor.clone();
    for (; Ni(this._cursor.peek()); ) this._cursor.advance();
    let t = this._cursor.getChars(e), r = "", n = "";
    return this._cursor.peek() === 58 && (this._cursor.advance(), [r, n] = this._consumePrefixAndName(Ee$1)), [t, r, n];
  }
  _consumeAttribute() {
    let [e, t] = this._consumeAttributeName(), r;
    return this._attemptCharCodeUntilFn(v$1), this._attemptCharCode(61) && (this._attemptCharCodeUntilFn(v$1), r = this._consumeAttributeValue()), this._attemptCharCodeUntilFn(v$1), { prefix: e, name: t, value: r };
  }
  _consumeAttributeName() {
    let e = this._cursor.peek();
    if (e === 39 || e === 34) throw this._createError(Se$1(e), this._cursor.getSpan());
    this._beginToken(l.ATTR_NAME);
    let t;
    if (this._openDirectiveCount > 0) {
      let n = 0;
      t = (i) => {
        if (this._openDirectiveCount > 0) {
          if (i === 40) n++;
          else if (i === 41) {
            if (n === 0) return true;
            n--;
          }
        }
        return Ee$1(i);
      };
    } else if (e === 91) {
      let n = 0;
      t = (i) => (i === 91 ? n++ : i === 93 && n--, n <= 0 ? Ee$1(i) : Me$1(i));
    } else t = Ee$1;
    let r = this._consumePrefixAndName(t);
    return this._endToken(r), r;
  }
  _consumeAttributeValue() {
    let e;
    if (this._cursor.peek() === 39 || this._cursor.peek() === 34) {
      let t = this._cursor.peek();
      this._consumeQuote(t);
      let r = () => this._cursor.peek() === t;
      e = this._consumeWithInterpolation(l.ATTR_VALUE_TEXT, l.ATTR_VALUE_INTERPOLATION, r, r), this._consumeQuote(t);
    } else {
      let t = () => Ee$1(this._cursor.peek());
      e = this._consumeWithInterpolation(l.ATTR_VALUE_TEXT, l.ATTR_VALUE_INTERPOLATION, t, t);
    }
    return e;
  }
  _consumeQuote(e) {
    this._beginToken(l.ATTR_QUOTE), this._requireCharCode(e), this._endToken([String.fromCodePoint(e)]);
  }
  _consumeTagOpenEnd() {
    let e = this._attemptCharCode(47) ? l.TAG_OPEN_END_VOID : l.TAG_OPEN_END;
    this._beginToken(e), this._requireCharCode(62), this._endToken([]);
  }
  _consumeComponentOpenEnd() {
    let e = this._attemptCharCode(47) ? l.COMPONENT_OPEN_END_VOID : l.COMPONENT_OPEN_END;
    this._beginToken(e), this._requireCharCode(62), this._endToken([]);
  }
  _consumeTagClose(e) {
    if (this._selectorlessEnabled) {
      let t = e.clone();
      for (; t.peek() !== 62 && !It$1(t.peek()); ) t.advance();
      if (It$1(t.peek())) {
        this._beginToken(l.COMPONENT_CLOSE, e);
        let r = this._consumeComponentName();
        this._attemptCharCodeUntilFn(v$1), this._requireCharCode(62), this._endToken(r);
        return;
      }
    }
    if (this._beginToken(l.TAG_CLOSE, e), this._attemptCharCodeUntilFn(v$1), this._allowHtmComponentClosingTags && this._attemptCharCode(47)) this._attemptCharCodeUntilFn(v$1), this._requireCharCode(62), this._endToken([]);
    else {
      let [t, r] = this._consumePrefixAndName(Ee$1);
      this._attemptCharCodeUntilFn(v$1), this._requireCharCode(62), this._endToken([t, r]), this._handleFullNameStackForTagClose(t, r);
    }
  }
  _consumeExpansionFormStart() {
    this._beginToken(l.EXPANSION_FORM_START), this._requireCharCode(123), this._endToken([]), this._expansionCaseStack.push(l.EXPANSION_FORM_START), this._beginToken(l.RAW_TEXT);
    let e = this._readUntil(44), t = this._processCarriageReturns(e);
    if (this._i18nNormalizeLineEndingsInICUs) this._endToken([t]);
    else {
      let n = this._endToken([e]);
      t !== e && this.nonNormalizedIcuExpressions.push(n);
    }
    this._requireCharCode(44), this._attemptCharCodeUntilFn(v$1), this._beginToken(l.RAW_TEXT);
    let r = this._readUntil(44);
    this._endToken([r]), this._requireCharCode(44), this._attemptCharCodeUntilFn(v$1);
  }
  _consumeExpansionCaseStart() {
    this._beginToken(l.EXPANSION_CASE_VALUE);
    let e = this._readUntil(123).trim();
    this._endToken([e]), this._attemptCharCodeUntilFn(v$1), this._beginToken(l.EXPANSION_CASE_EXP_START), this._requireCharCode(123), this._endToken([]), this._attemptCharCodeUntilFn(v$1), this._expansionCaseStack.push(l.EXPANSION_CASE_EXP_START);
  }
  _consumeExpansionCaseEnd() {
    this._beginToken(l.EXPANSION_CASE_EXP_END), this._requireCharCode(125), this._endToken([]), this._attemptCharCodeUntilFn(v$1), this._expansionCaseStack.pop();
  }
  _consumeExpansionFormEnd() {
    this._beginToken(l.EXPANSION_FORM_END), this._requireCharCode(125), this._endToken([]), this._expansionCaseStack.pop();
  }
  _consumeWithInterpolation(e, t, r, n) {
    this._beginToken(e);
    let i = [];
    for (; !r(); ) {
      let a = this._cursor.clone();
      this._attemptStr(st$1.start) ? (this._endToken([this._processCarriageReturns(i.join(""))], a), i.length = 0, this._consumeInterpolation(t, a, n), this._beginToken(e)) : this._cursor.peek() === 38 ? (this._endToken([this._processCarriageReturns(i.join(""))]), i.length = 0, this._consumeEntity(e), this._beginToken(e)) : i.push(this._readChar());
    }
    this._inInterpolation = false;
    let s = this._processCarriageReturns(i.join(""));
    return this._endToken([s]), s;
  }
  _consumeInterpolation(e, t, r) {
    let n = [];
    this._beginToken(e, t), n.push(st$1.start);
    let i = this._cursor.clone(), s = null, a = false;
    for (; this._cursor.peek() !== 0 && (r === null || !r()); ) {
      let o = this._cursor.clone();
      if (this._isTagStart()) {
        this._cursor = o, n.push(this._getProcessedChars(i, o)), this._endToken(n);
        return;
      }
      if (s === null) if (this._attemptStr(st$1.end)) {
        n.push(this._getProcessedChars(i, o)), n.push(st$1.end), this._endToken(n);
        return;
      } else this._attemptStr("//") && (a = true);
      let c = this._cursor.peek();
      this._cursor.advance(), c === 92 ? this._cursor.advance() : c === s ? s = null : !a && s === null && Dt$1(c) && (s = c);
    }
    n.push(this._getProcessedChars(i, this._cursor)), this._endToken(n);
  }
  _consumeDirective(e, t) {
    for (this._requireCharCode(64), this._cursor.advance(); Ni(this._cursor.peek()); ) this._cursor.advance();
    this._beginToken(l.DIRECTIVE_NAME, e);
    let r = this._cursor.getChars(t);
    if (this._endToken([r]), this._attemptCharCodeUntilFn(v$1), this._cursor.peek() === 40) {
      for (this._openDirectiveCount++, this._beginToken(l.DIRECTIVE_OPEN), this._cursor.advance(), this._endToken([]), this._attemptCharCodeUntilFn(v$1); !Li(this._cursor.peek()) && this._cursor.peek() !== 41; ) this._consumeAttribute();
      if (this._attemptCharCodeUntilFn(v$1), this._openDirectiveCount--, this._cursor.peek() !== 41) {
        if (this._cursor.peek() === 62 || this._cursor.peek() === 47) return;
        throw this._createError(Se$1(this._cursor.peek()), this._cursor.getSpan(e));
      }
      this._beginToken(l.DIRECTIVE_CLOSE), this._cursor.advance(), this._endToken([]), this._attemptCharCodeUntilFn(v$1);
    }
  }
  _getProcessedChars(e, t) {
    return this._processCarriageReturns(t.getChars(e));
  }
  _isTextEnd() {
    return !!(this._isTagStart() || this._cursor.peek() === 0 || this._tokenizeIcu && !this._inInterpolation && (this.isExpansionFormStart() || this._cursor.peek() === 125 && this._isInExpansionCase()) || this._tokenizeBlocks && !this._inInterpolation && !this._isInExpansion() && (this._isBlockStart() || this._isLetStart() || this._cursor.peek() === 125));
  }
  _isTagStart() {
    if (this._cursor.peek() === 60) {
      let e = this._cursor.clone();
      e.advance();
      let t = e.peek();
      if (97 <= t && t <= 122 || 65 <= t && t <= 90 || t === 47 || t === 33) return true;
    }
    return false;
  }
  _readUntil(e) {
    let t = this._cursor.clone();
    return this._attemptUntilChar(e), this._cursor.getChars(t);
  }
  _isInExpansion() {
    return this._isInExpansionCase() || this._isInExpansionForm();
  }
  _isInExpansionCase() {
    return this._expansionCaseStack.length > 0 && this._expansionCaseStack[this._expansionCaseStack.length - 1] === l.EXPANSION_CASE_EXP_START;
  }
  _isInExpansionForm() {
    return this._expansionCaseStack.length > 0 && this._expansionCaseStack[this._expansionCaseStack.length - 1] === l.EXPANSION_FORM_START;
  }
  isExpansionFormStart() {
    if (this._cursor.peek() !== 123) return false;
    let e = this._cursor.clone(), t = this._attemptStr(st$1.start);
    return this._cursor = e, !t;
  }
  _handleFullNameStackForTagOpen(e, t) {
    let r = fe$1(e, t);
    (this._fullNameStack.length === 0 || this._fullNameStack[this._fullNameStack.length - 1] === r) && this._fullNameStack.push(r);
  }
  _handleFullNameStackForTagClose(e, t) {
    let r = fe$1(e, t);
    this._fullNameStack.length !== 0 && this._fullNameStack[this._fullNameStack.length - 1] === r && this._fullNameStack.pop();
  }
};
function v$1(e) {
  return !it$1(e) || e === 0;
}
function Ee$1(e) {
  return it$1(e) || e === 62 || e === 60 || e === 47 || e === 39 || e === 34 || e === 61 || e === 0;
}
function Wa$1(e) {
  return (e < 97 || 122 < e) && (e < 65 || 90 < e) && (e < 48 || e > 57);
}
function Ga$1(e) {
  return e === 59 || e === 0 || !ki(e);
}
function za$1(e) {
  return e === 59 || e === 0 || !(Re$1(e) || Ie$1(e));
}
function $a$1(e) {
  return e !== 125;
}
function Ya$1(e, t) {
  return yi(e) === yi(t);
}
function yi(e) {
  return e >= 97 && e <= 122 ? e - 97 + 65 : e;
}
function ja$1(e) {
  return Re$1(e) || Ie$1(e) || e === 95;
}
function Ai(e) {
  return e !== 59 && v$1(e);
}
function It$1(e) {
  return e === 95 || e >= 65 && e <= 90;
}
function Ni(e) {
  return Re$1(e) || Ie$1(e) || e === 95;
}
function Li(e) {
  return e === 47 || e === 62 || e === 60 || e === 0;
}
function Xa$1(e) {
  let t = [], r;
  for (let n = 0; n < e.length; n++) {
    let i = e[n];
    r && r.type === l.TEXT && i.type === l.TEXT || r && r.type === l.ATTR_VALUE_TEXT && i.type === l.ATTR_VALUE_TEXT ? (r.parts[0] += i.parts[0], r.sourceSpan.end = i.sourceSpan.end) : (r = i, t.push(r));
  }
  return t;
}
var Oi = class _r {
  state;
  file;
  input;
  end;
  constructor(t, r) {
    if (t instanceof _r) {
      this.file = t.file, this.input = t.input, this.end = t.end;
      let n = t.state;
      this.state = { peek: n.peek, offset: n.offset, line: n.line, column: n.column };
    } else {
      if (!r) throw new Error("Programming error: the range argument must be provided with a file argument.");
      this.file = t, this.input = t.content, this.end = r.endPos, this.state = { peek: -1, offset: r.startPos, line: r.startLine, column: r.startCol };
    }
  }
  clone() {
    return new _r(this);
  }
  peek() {
    return this.state.peek;
  }
  charsLeft() {
    return this.end - this.state.offset;
  }
  diff(t) {
    return this.state.offset - t.state.offset;
  }
  advance() {
    this.advanceState(this.state);
  }
  init() {
    this.updatePeek(this.state);
  }
  getSpan(t, r) {
    t = t || this;
    let n = t;
    if (r) for (; this.diff(t) > 0 && r.indexOf(t.peek()) !== -1; ) n === t && (t = t.clone()), t.advance();
    let i = this.locationFromCursor(t);
    return new h(i, this.locationFromCursor(this), n !== t ? this.locationFromCursor(n) : i);
  }
  getChars(t) {
    return this.input.substring(t.state.offset, this.state.offset);
  }
  charAt(t) {
    return this.input.charCodeAt(t);
  }
  advanceState(t) {
    if (t.offset >= this.end) throw this.state = t, new Er$1('Unexpected character "EOF"', this);
    let r = this.charAt(t.offset);
    r === 10 ? (t.line++, t.column = 0) : Me$1(r) || t.column++, t.offset++, this.updatePeek(t);
  }
  updatePeek(t) {
    t.peek = t.offset >= this.end ? 0 : this.charAt(t.offset);
  }
  locationFromCursor(t) {
    return new De$1(t.file, t.state.offset, t.state.line, t.state.column);
  }
}, Ka$1 = class Sr extends Oi {
  internalState;
  constructor(t, r) {
    t instanceof Sr ? (super(t), this.internalState = { ...t.internalState }) : (super(t, r), this.internalState = this.state);
  }
  advance() {
    this.state = this.internalState, super.advance(), this.processEscapeSequence();
  }
  init() {
    super.init(), this.processEscapeSequence();
  }
  clone() {
    return new Sr(this);
  }
  getChars(t) {
    let r = t.clone(), n = "";
    for (; r.internalState.offset < this.internalState.offset; ) n += String.fromCodePoint(r.peek()), r.advance();
    return n;
  }
  processEscapeSequence() {
    let t = () => this.internalState.peek;
    if (t() === 92) if (this.internalState = { ...this.state }, this.advanceState(this.internalState), t() === 110) this.state.peek = 10;
    else if (t() === 114) this.state.peek = 13;
    else if (t() === 118) this.state.peek = 11;
    else if (t() === 116) this.state.peek = 9;
    else if (t() === 98) this.state.peek = 8;
    else if (t() === 102) this.state.peek = 12;
    else if (t() === 117) if (this.advanceState(this.internalState), t() === 123) {
      this.advanceState(this.internalState);
      let r = this.clone(), n = 0;
      for (; t() !== 125; ) this.advanceState(this.internalState), n++;
      this.state.peek = this.decodeHexDigits(r, n);
    } else {
      let r = this.clone();
      this.advanceState(this.internalState), this.advanceState(this.internalState), this.advanceState(this.internalState), this.state.peek = this.decodeHexDigits(r, 4);
    }
    else if (t() === 120) {
      this.advanceState(this.internalState);
      let r = this.clone();
      this.advanceState(this.internalState), this.state.peek = this.decodeHexDigits(r, 2);
    } else if (dr$1(t())) {
      let r = "", n = 0, i = this.clone();
      for (; dr$1(t()) && n < 3; ) i = this.clone(), r += String.fromCodePoint(t()), this.advanceState(this.internalState), n++;
      this.state.peek = parseInt(r, 8), this.internalState = i.internalState;
    } else Me$1(this.internalState.peek) ? (this.advanceState(this.internalState), this.state = this.internalState) : this.state.peek = this.internalState.peek;
  }
  decodeHexDigits(t, r) {
    let n = this.input.slice(t.internalState.offset, t.internalState.offset + r), i = parseInt(n, 16);
    if (isNaN(i)) throw t.state = t.internalState, new Er$1("Invalid hexadecimal escape sequence", t);
    return i;
  }
}, Er$1 = class Er extends Error {
  constructor(e, t) {
    super(e), this.msg = e, this.cursor = t, Object.setPrototypeOf(this, new.target.prototype);
  }
};
var y = class Ri extends ee$1 {
  static create(t, r, n) {
    return new Ri(t, r, n);
  }
  constructor(t, r, n) {
    super(r, n), this.elementName = t;
  }
}, Qa$1 = class Qa {
  constructor(e, t) {
    this.rootNodes = e, this.errors = t;
  }
}, Mi = class {
  constructor(e) {
    this.getTagDefinition = e;
  }
  parse(e, t, r, n = false, i) {
    let s = (m) => (_2, ...T2) => m(_2.toLowerCase(), ...T2), a = n ? this.getTagDefinition : s(this.getTagDefinition), o = (m) => a(m).getContentType(), c = n ? i : s(i), u = Pi(e, t, i ? (m, _2, T2, P2) => {
      let z2 = c(m, _2, T2, P2);
      return z2 !== void 0 ? z2 : o(m);
    } : o, r), p = r && r.canSelfClose || false, d = r && r.allowHtmComponentClosingTags || false, g = new Ja$1(u.tokens, a, p, d, n);
    return g.build(), new Qa$1(g.rootNodes, [...u.errors, ...g.errors]);
  }
}, Ja$1 = class Bi {
  _index = -1;
  _peek;
  _containerStack = [];
  rootNodes = [];
  errors = [];
  constructor(t, r, n, i, s) {
    this.tokens = t, this.tagDefinitionResolver = r, this.canSelfClose = n, this.allowHtmComponentClosingTags = i, this.isTagNameCaseSensitive = s, this._advance();
  }
  build() {
    for (; this._peek.type !== l.EOF; ) this._peek.type === l.TAG_OPEN_START || this._peek.type === l.INCOMPLETE_TAG_OPEN ? this._consumeElementStartTag(this._advance()) : this._peek.type === l.TAG_CLOSE ? (this._closeVoidElement(), this._consumeElementEndTag(this._advance())) : this._peek.type === l.CDATA_START ? (this._closeVoidElement(), this._consumeCdata(this._advance())) : this._peek.type === l.COMMENT_START ? (this._closeVoidElement(), this._consumeComment(this._advance())) : this._peek.type === l.TEXT || this._peek.type === l.RAW_TEXT || this._peek.type === l.ESCAPABLE_RAW_TEXT ? (this._closeVoidElement(), this._consumeText(this._advance())) : this._peek.type === l.EXPANSION_FORM_START ? this._consumeExpansion(this._advance()) : this._peek.type === l.BLOCK_OPEN_START ? (this._closeVoidElement(), this._consumeBlockOpen(this._advance())) : this._peek.type === l.BLOCK_CLOSE ? (this._closeVoidElement(), this._consumeBlockClose(this._advance())) : this._peek.type === l.INCOMPLETE_BLOCK_OPEN ? (this._closeVoidElement(), this._consumeIncompleteBlock(this._advance())) : this._peek.type === l.LET_START ? (this._closeVoidElement(), this._consumeLet(this._advance())) : this._peek.type === l.DOC_TYPE_START ? this._consumeDocType(this._advance()) : this._peek.type === l.INCOMPLETE_LET ? (this._closeVoidElement(), this._consumeIncompleteLet(this._advance())) : this._peek.type === l.COMPONENT_OPEN_START || this._peek.type === l.INCOMPLETE_COMPONENT_OPEN ? this._consumeComponentStartTag(this._advance()) : this._peek.type === l.COMPONENT_CLOSE ? this._consumeComponentEndTag(this._advance()) : this._advance();
    for (let t of this._containerStack) t instanceof ge$1 && this.errors.push(y.create(t.name, t.sourceSpan, `Unclosed block "${t.name}"`));
  }
  _advance() {
    let t = this._peek;
    return this._index < this.tokens.length - 1 && this._index++, this._peek = this.tokens[this._index], t;
  }
  _advanceIf(t) {
    return this._peek.type === t ? this._advance() : null;
  }
  _consumeCdata(t) {
    let r = this._advance(), n = this._getText(r), i = this._advanceIf(l.CDATA_END);
    this._addToParent(new Si(n, new h(t.sourceSpan.start, (i || r).sourceSpan.end), [r]));
  }
  _consumeComment(t) {
    let r = this._advanceIf(l.RAW_TEXT), n = this._advanceIf(l.COMMENT_END), i = r != null ? r.parts[0].trim() : null, s = n == null ? t.sourceSpan : new h(t.sourceSpan.start, n.sourceSpan.end, t.sourceSpan.fullStart);
    this._addToParent(new Ti(i, s));
  }
  _consumeDocType(t) {
    let r = this._advanceIf(l.RAW_TEXT), n = this._advanceIf(l.DOC_TYPE_END), i = r != null ? r.parts[0].trim() : null, s = new h(t.sourceSpan.start, (n || r || t).sourceSpan.end);
    this._addToParent(new bi(i, s));
  }
  _consumeExpansion(t) {
    let r = this._advance(), n = this._advance(), i = [];
    for (; this._peek.type === l.EXPANSION_CASE_VALUE; ) {
      let a = this._parseExpansionCase();
      if (!a) return;
      i.push(a);
    }
    if (this._peek.type !== l.EXPANSION_FORM_END) {
      this.errors.push(y.create(null, this._peek.sourceSpan, "Invalid ICU message. Missing '}'."));
      return;
    }
    let s = new h(t.sourceSpan.start, this._peek.sourceSpan.end, t.sourceSpan.fullStart);
    this._addToParent(new Ei(r.parts[0], n.parts[0], i, s, r.sourceSpan)), this._advance();
  }
  _parseExpansionCase() {
    let t = this._advance();
    if (this._peek.type !== l.EXPANSION_CASE_EXP_START) return this.errors.push(y.create(null, this._peek.sourceSpan, "Invalid ICU message. Missing '{'.")), null;
    let r = this._advance(), n = this._collectExpansionExpTokens(r);
    if (!n) return null;
    let i = this._advance();
    n.push({ type: l.EOF, parts: [], sourceSpan: i.sourceSpan });
    let s = new Bi(n, this.tagDefinitionResolver, this.canSelfClose, this.allowHtmComponentClosingTags, this.isTagNameCaseSensitive);
    if (s.build(), s.errors.length > 0) return this.errors = this.errors.concat(s.errors), null;
    let a = new h(t.sourceSpan.start, i.sourceSpan.end, t.sourceSpan.fullStart), o = new h(r.sourceSpan.start, i.sourceSpan.end, r.sourceSpan.fullStart);
    return new Ci(t.parts[0], s.rootNodes, a, t.sourceSpan, o);
  }
  _collectExpansionExpTokens(t) {
    let r = [], n = [l.EXPANSION_CASE_EXP_START];
    for (; ; ) {
      if ((this._peek.type === l.EXPANSION_FORM_START || this._peek.type === l.EXPANSION_CASE_EXP_START) && n.push(this._peek.type), this._peek.type === l.EXPANSION_CASE_EXP_END) if (Di$1(n, l.EXPANSION_CASE_EXP_START)) {
        if (n.pop(), n.length === 0) return r;
      } else return this.errors.push(y.create(null, t.sourceSpan, "Invalid ICU message. Missing '}'.")), null;
      if (this._peek.type === l.EXPANSION_FORM_END) if (Di$1(n, l.EXPANSION_FORM_START)) n.pop();
      else return this.errors.push(y.create(null, t.sourceSpan, "Invalid ICU message. Missing '}'.")), null;
      if (this._peek.type === l.EOF) return this.errors.push(y.create(null, t.sourceSpan, "Invalid ICU message. Missing '}'.")), null;
      r.push(this._advance());
    }
  }
  _getText(t) {
    let r = t.parts[0];
    if (r.length > 0 && r[0] == `
`) {
      var n;
      let i = this._getClosestElementLikeParent();
      i != null && i.children.length == 0 && (!((n = this._getTagDefinition(i)) === null || n === void 0) && n.ignoreFirstLf) && (r = r.substring(1));
    }
    return r;
  }
  _consumeText(t) {
    let r = [t], n = t.sourceSpan, i = t.parts[0];
    if (i.length > 0 && i[0] === `
`) {
      var s;
      let a = this._getContainer();
      a != null && a.children.length === 0 && (!((s = this._getTagDefinition(a)) === null || s === void 0) && s.ignoreFirstLf) && (i = i.substring(1), r[0] = { type: t.type, sourceSpan: t.sourceSpan, parts: [i] });
    }
    for (; this._peek.type === l.INTERPOLATION || this._peek.type === l.TEXT || this._peek.type === l.ENCODED_ENTITY; ) t = this._advance(), r.push(t), t.type === l.INTERPOLATION ? i += t.parts.join("").replace(/&([^;]+);/g, Ii) : t.type === l.ENCODED_ENTITY ? i += t.parts[0] : i += t.parts.join("");
    if (i.length > 0) {
      let a = t.sourceSpan;
      this._addToParent(new _i(i, new h(n.start, a.end, n.fullStart, n.details), r));
    }
  }
  _closeVoidElement() {
    var t;
    let r = this._getContainer();
    r !== null && (!((t = this._getTagDefinition(r)) === null || t === void 0) && t.isVoid) && this._containerStack.pop();
  }
  _consumeElementStartTag(t) {
    var r;
    let n = [], i = [];
    this._consumeAttributesAndDirectives(n, i);
    let s = this._getElementFullName(t, this._getClosestElementLikeParent()), a = this._getTagDefinition(s), o = false;
    if (this._peek.type === l.TAG_OPEN_END_VOID) {
      this._advance(), o = true;
      let T2 = this._getTagDefinition(s);
      this.canSelfClose || T2?.canSelfClose || Pe$1(s) !== null || T2?.isVoid || this.errors.push(y.create(s, t.sourceSpan, `Only void, custom and foreign elements can be self closed "${t.parts[1]}"`));
    } else this._peek.type === l.TAG_OPEN_END && (this._advance(), o = false);
    let c = this._peek.sourceSpan.fullStart, u = new h(t.sourceSpan.start, c, t.sourceSpan.fullStart), p = new h(t.sourceSpan.start, c, t.sourceSpan.fullStart), d = new h(t.sourceSpan.start.moveBy(1), t.sourceSpan.end), g = new te$1(s, n, i, [], o, u, p, void 0, d, a?.isVoid ?? false), m = this._getContainer(), _2 = m !== null && !!(!((r = this._getTagDefinition(m)) === null || r === void 0) && r.isClosedByChild(g.name));
    this._pushContainer(g, _2), o ? this._popContainer(s, te$1, u) : t.type === l.INCOMPLETE_TAG_OPEN && (this._popContainer(s, te$1, null), this.errors.push(y.create(s, u, `Opening tag "${s}" not terminated.`)));
  }
  _consumeComponentStartTag(t) {
    var r;
    let n = t.parts[0], i = [], s = [];
    this._consumeAttributesAndDirectives(i, s);
    let a = this._getClosestElementLikeParent(), o = this._getComponentTagName(t, a), c = this._getComponentFullName(t, a), u = this._peek.type === l.COMPONENT_OPEN_END_VOID;
    this._advance();
    let p = this._peek.sourceSpan.fullStart, d = new h(t.sourceSpan.start, p, t.sourceSpan.fullStart), g = new G$1(n, o, c, i, s, [], u, d, new h(t.sourceSpan.start, p, t.sourceSpan.fullStart), void 0), m = this._getContainer(), _2 = m !== null && g.tagName !== null && !!(!((r = this._getTagDefinition(m)) === null || r === void 0) && r.isClosedByChild(g.tagName));
    this._pushContainer(g, _2), u ? this._popContainer(c, G$1, d) : t.type === l.INCOMPLETE_COMPONENT_OPEN && (this._popContainer(c, G$1, null), this.errors.push(y.create(c, d, `Opening tag "${c}" not terminated.`)));
  }
  _consumeAttributesAndDirectives(t, r) {
    for (; this._peek.type === l.ATTR_NAME || this._peek.type === l.DIRECTIVE_NAME; ) this._peek.type === l.DIRECTIVE_NAME ? r.push(this._consumeDirective(this._peek)) : t.push(this._consumeAttr(this._advance()));
  }
  _consumeComponentEndTag(t) {
    let r = this._getComponentFullName(t, this._getClosestElementLikeParent());
    if (!this._popContainer(r, G$1, t.sourceSpan)) {
      let n = this._containerStack[this._containerStack.length - 1], i;
      n instanceof G$1 && n.componentName === t.parts[0] ? i = `, did you mean "${n.fullName}"?` : i = ". It may happen when the tag has already been closed by another tag.";
      let s = `Unexpected closing tag "${r}"${i}`;
      this.errors.push(y.create(r, t.sourceSpan, s));
    }
  }
  _getTagDefinition(t) {
    return typeof t == "string" ? this.tagDefinitionResolver(t) : t instanceof te$1 ? this.tagDefinitionResolver(t.name) : t instanceof G$1 && t.tagName !== null ? this.tagDefinitionResolver(t.tagName) : null;
  }
  _pushContainer(t, r) {
    r && this._containerStack.pop(), this._addToParent(t), this._containerStack.push(t);
  }
  _consumeElementEndTag(t) {
    var r;
    let n = this.allowHtmComponentClosingTags && t.parts.length === 0 ? null : this._getElementFullName(t, this._getClosestElementLikeParent());
    if (n && (!((r = this._getTagDefinition(n)) === null || r === void 0) && r.isVoid)) this.errors.push(y.create(n, t.sourceSpan, `Void elements do not have end tags "${t.parts[1]}"`));
    else if (!this._popContainer(n, te$1, t.sourceSpan)) {
      let i = `Unexpected closing tag "${n}". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags`;
      this.errors.push(y.create(n, t.sourceSpan, i));
    }
  }
  _popContainer(t, r, n) {
    let i = false;
    for (let a = this._containerStack.length - 1; a >= 0; a--) {
      var s;
      let o = this._containerStack[a], c = o instanceof G$1 ? o.fullName : o.name;
      if (Pe$1(c) ? c === t : (c === t || t === null) && o instanceof r) return o.endSourceSpan = n, o.sourceSpan.end = n !== null ? n.end : o.sourceSpan.end, this._containerStack.splice(a, this._containerStack.length - a), !i;
      (o instanceof ge$1 || !(!((s = this._getTagDefinition(o)) === null || s === void 0) && s.closedByParent)) && (i = true);
    }
    return false;
  }
  _consumeAttr(t) {
    let r = fe$1(t.parts[0], t.parts[1]), n = t.sourceSpan.end, i;
    this._peek.type === l.ATTR_QUOTE && (i = this._advance());
    let s = "", a = [], o, c;
    if (this._peek.type === l.ATTR_VALUE_TEXT) for (o = this._peek.sourceSpan, c = this._peek.sourceSpan.end; this._peek.type === l.ATTR_VALUE_TEXT || this._peek.type === l.ATTR_VALUE_INTERPOLATION || this._peek.type === l.ENCODED_ENTITY; ) {
      let p = this._advance();
      a.push(p), p.type === l.ATTR_VALUE_INTERPOLATION ? s += p.parts.join("").replace(/&([^;]+);/g, Ii) : p.type === l.ENCODED_ENTITY ? s += p.parts[0] : s += p.parts.join(""), c = n = p.sourceSpan.end;
    }
    this._peek.type === l.ATTR_QUOTE && (c = n = this._advance().sourceSpan.end);
    let u = o && c && new h(i?.sourceSpan.start ?? o.start, c, i?.sourceSpan.fullStart ?? o.fullStart);
    return new vi(r, s, new h(t.sourceSpan.start, n, t.sourceSpan.fullStart), t.sourceSpan, u, a.length > 0 ? a : void 0, void 0);
  }
  _consumeDirective(t) {
    let r = [], n = t.sourceSpan.end, i = null;
    if (this._advance(), this._peek.type === l.DIRECTIVE_OPEN) {
      for (n = this._peek.sourceSpan.end, this._advance(); this._peek.type === l.ATTR_NAME; ) r.push(this._consumeAttr(this._advance()));
      this._peek.type === l.DIRECTIVE_CLOSE ? (i = this._peek.sourceSpan, this._advance()) : this.errors.push(y.create(null, t.sourceSpan, "Unterminated directive definition"));
    }
    let s = new h(t.sourceSpan.start, n, t.sourceSpan.fullStart), a = new h(s.start, i === null ? t.sourceSpan.end : i.end, s.fullStart);
    return new wi(t.parts[0], r, a, s, i);
  }
  _consumeBlockOpen(t) {
    let r = [];
    for (; this._peek.type === l.BLOCK_PARAMETER; ) {
      let o = this._advance();
      r.push(new hr$1(o.parts[0], o.sourceSpan));
    }
    this._peek.type === l.BLOCK_OPEN_END && this._advance();
    let n = this._peek.sourceSpan.fullStart, i = new h(t.sourceSpan.start, n, t.sourceSpan.fullStart), s = new h(t.sourceSpan.start, n, t.sourceSpan.fullStart), a = new ge$1(t.parts[0], r, [], i, t.sourceSpan, s);
    this._pushContainer(a, false);
  }
  _consumeBlockClose(t) {
    let r = this._containerStack.length, n = this._containerStack[r - 1];
    if (!this._popContainer(null, ge$1, t.sourceSpan)) {
      if (this._containerStack.length < r) {
        let i = n instanceof G$1 ? n.fullName : n.name;
        this.errors.push(y.create(null, t.sourceSpan, `Unexpected closing block. The block may have been closed earlier. Did you forget to close the <${i}> element? If you meant to write the \`}\` character, you should use the "&#125;" HTML entity instead.`));
        return;
      }
      this.errors.push(y.create(null, t.sourceSpan, 'Unexpected closing block. The block may have been closed earlier. If you meant to write the `}` character, you should use the "&#125;" HTML entity instead.'));
    }
  }
  _consumeIncompleteBlock(t) {
    let r = [];
    for (; this._peek.type === l.BLOCK_PARAMETER; ) {
      let o = this._advance();
      r.push(new hr$1(o.parts[0], o.sourceSpan));
    }
    let n = this._peek.sourceSpan.fullStart, i = new h(t.sourceSpan.start, n, t.sourceSpan.fullStart), s = new h(t.sourceSpan.start, n, t.sourceSpan.fullStart), a = new ge$1(t.parts[0], r, [], i, t.sourceSpan, s);
    this._pushContainer(a, false), this._popContainer(null, ge$1, null), this.errors.push(y.create(t.parts[0], i, `Incomplete block "${t.parts[0]}". If you meant to write the @ character, you should use the "&#64;" HTML entity instead.`));
  }
  _consumeLet(t) {
    let r = t.parts[0], n, i;
    if (this._peek.type !== l.LET_VALUE) {
      this.errors.push(y.create(t.parts[0], t.sourceSpan, `Invalid @let declaration "${r}". Declaration must have a value.`));
      return;
    } else n = this._advance();
    if (this._peek.type !== l.LET_END) {
      this.errors.push(y.create(t.parts[0], t.sourceSpan, `Unterminated @let declaration "${r}". Declaration must be terminated with a semicolon.`));
      return;
    } else i = this._advance();
    let s = i.sourceSpan.fullStart, a = new h(t.sourceSpan.start, s, t.sourceSpan.fullStart), o = t.sourceSpan.toString().lastIndexOf(r), c = new h(t.sourceSpan.start.moveBy(o), t.sourceSpan.end), u = new mr$1(r, n.parts[0], a, c, n.sourceSpan);
    this._addToParent(u);
  }
  _consumeIncompleteLet(t) {
    let r = t.parts[0] ?? "", n = r ? ` "${r}"` : "";
    if (r.length > 0) {
      let i = t.sourceSpan.toString().lastIndexOf(r), s = new h(t.sourceSpan.start.moveBy(i), t.sourceSpan.end), a = new h(t.sourceSpan.start, t.sourceSpan.start.moveBy(0)), o = new mr$1(r, "", t.sourceSpan, s, a);
      this._addToParent(o);
    }
    this.errors.push(y.create(t.parts[0], t.sourceSpan, `Incomplete @let declaration${n}. @let declarations must be written as \`@let <name> = <value>;\``));
  }
  _getContainer() {
    return this._containerStack.length > 0 ? this._containerStack[this._containerStack.length - 1] : null;
  }
  _getClosestElementLikeParent() {
    for (let t = this._containerStack.length - 1; t > -1; t--) {
      let r = this._containerStack[t];
      if (r instanceof te$1 || r instanceof G$1) return r;
    }
    return null;
  }
  _addToParent(t) {
    let r = this._getContainer();
    r === null ? this.rootNodes.push(t) : r.children.push(t);
  }
  _getElementFullName(t, r) {
    return fe$1(this._getPrefix(t, r), t.parts[1]);
  }
  _getComponentFullName(t, r) {
    let n = t.parts[0], i = this._getComponentTagName(t, r);
    return i === null ? n : i.startsWith(":") ? n + i : `${n}:${i}`;
  }
  _getComponentTagName(t, r) {
    let n = this._getPrefix(t, r), i = t.parts[2];
    return !n && !i ? null : !n && i ? i : fe$1(n, i || "ng-component");
  }
  _getPrefix(t, r) {
    var n;
    let i, s;
    if (t.type === l.COMPONENT_OPEN_START || t.type === l.INCOMPLETE_COMPONENT_OPEN || t.type === l.COMPONENT_CLOSE ? (i = t.parts[1], s = t.parts[2]) : (i = t.parts[0], s = t.parts[1]), i = i || ((n = this._getTagDefinition(s)) === null || n === void 0 ? void 0 : n.implicitNamespacePrefix) || "", !i && r) {
      let a = r instanceof te$1 ? r.name : r.tagName;
      if (a !== null) {
        let o = et$1(a)[1], c = this._getTagDefinition(o);
        c !== null && !c.preventNamespaceInheritance && (i = Pe$1(a));
      }
    }
    return i;
  }
};
function Di$1(e, t) {
  return e.length > 0 && e[e.length - 1] === t;
}
function Ii(e, t) {
  return _e$1[t] !== void 0 ? _e$1[t] || e : /^#x[a-f0-9]+$/i.test(t) ? String.fromCodePoint(parseInt(t.slice(2), 16)) : /^#\d+$/.test(t) ? String.fromCodePoint(parseInt(t.slice(1), 10)) : e;
}
var qi = class extends Mi {
  constructor() {
    super(Oe$1);
  }
  parse(e, t, r, n = false, i) {
    return super.parse(e, t, r, n, i);
  }
};
var Cr$1;
function Rt(e, t = {}) {
  let { canSelfClose: r = false, allowHtmComponentClosingTags: n = false, isTagNameCaseSensitive: i = false, getTagContentType: s, tokenizeAngularBlocks: a = false, tokenizeAngularLetDeclaration: o = false, enableAngularSelectorlessSyntax: c = false } = t;
  return Cr$1 ?? (Cr$1 = new qi()), Cr$1.parse(e, "angular-html-parser", { tokenizeExpansionForms: a, canSelfClose: r, allowHtmComponentClosingTags: n, tokenizeBlocks: a, tokenizeLet: o, selectorlessEnabled: c }, i, s);
}
var Za$1 = [to$1, ro$1, io$1, ao$1, oo$1, uo$1, lo$1, co$1, po$1, so$1];
function eo$1(e, t) {
  for (let r of Za$1) r(e, t);
  return e;
}
function to$1(e) {
  e.walk((t) => {
    if (t.kind === "element" && t.tagDefinition.ignoreFirstLf && t.children.length > 0 && t.children[0].kind === "text" && t.children[0].value[0] === `
`) {
      let r = t.children[0];
      r.value.length === 1 ? t.removeChild(r) : r.value = r.value.slice(1);
    }
  });
}
function ro$1(e) {
  let t = (r) => r.kind === "element" && r.prev?.kind === "ieConditionalStartComment" && r.prev.sourceSpan.end.offset === r.startSourceSpan.start.offset && r.firstChild?.kind === "ieConditionalEndComment" && r.firstChild.sourceSpan.start.offset === r.startSourceSpan.end.offset;
  e.walk((r) => {
    if (r.children) for (let n = 0; n < r.children.length; n++) {
      let i = r.children[n];
      if (!t(i)) continue;
      let s = i.prev, a = i.firstChild;
      r.removeChild(s), n--;
      let o = new h(s.sourceSpan.start, a.sourceSpan.end), c = new h(o.start, i.sourceSpan.end);
      i.condition = s.condition, i.sourceSpan = c, i.startSourceSpan = o, i.removeChild(a);
    }
  });
}
function no$1(e, t, r) {
  e.walk((n) => {
    if (n.children) for (let i = 0; i < n.children.length; i++) {
      let s = n.children[i];
      if (s.kind !== "text" && !t(s)) continue;
      s.kind !== "text" && (s.kind = "text", s.value = r(s));
      let a = s.prev;
      !a || a.kind !== "text" || (a.value += s.value, a.sourceSpan = new h(a.sourceSpan.start, s.sourceSpan.end), n.removeChild(s), i--);
    }
  });
}
function io$1(e) {
  return no$1(e, (t) => t.kind === "cdata", (t) => `<![CDATA[${t.value}]]>`);
}
function so$1(e) {
  let t = (r) => r.kind === "element" && r.attrs.length === 0 && r.children.length === 1 && r.firstChild.kind === "text" && !N.hasWhitespaceCharacter(r.children[0].value) && !r.firstChild.hasLeadingSpaces && !r.firstChild.hasTrailingSpaces && r.isLeadingSpaceSensitive && !r.hasLeadingSpaces && r.isTrailingSpaceSensitive && !r.hasTrailingSpaces && r.prev?.kind === "text" && r.next?.kind === "text";
  e.walk((r) => {
    if (r.children) for (let n = 0; n < r.children.length; n++) {
      let i = r.children[n];
      if (!t(i)) continue;
      let s = i.prev, a = i.next;
      s.value += `<${i.rawName}>` + i.firstChild.value + `</${i.rawName}>` + a.value, s.sourceSpan = new h(s.sourceSpan.start, a.sourceSpan.end), s.isTrailingSpaceSensitive = a.isTrailingSpaceSensitive, s.hasTrailingSpaces = a.hasTrailingSpaces, r.removeChild(i), n--, r.removeChild(a);
    }
  });
}
function ao$1(e, t) {
  if (t.parser === "html") return;
  let r = /\{\{(.+?)\}\}/su;
  e.walk((n) => {
    if (nn$1(n, t)) for (let i of n.children) {
      if (i.kind !== "text") continue;
      let s = i.sourceSpan.start, a = null, o = i.value.split(r);
      for (let c = 0; c < o.length; c++, s = a) {
        let u = o[c];
        if (c % 2 === 0) {
          a = s.moveBy(u.length), u.length > 0 && n.insertChildBefore(i, { kind: "text", value: u, sourceSpan: new h(s, a) });
          continue;
        }
        a = s.moveBy(u.length + 4), n.insertChildBefore(i, { kind: "interpolation", sourceSpan: new h(s, a), children: u.length === 0 ? [] : [{ kind: "text", value: u, sourceSpan: new h(s.moveBy(2), a.moveBy(-2)) }] });
      }
      n.removeChild(i);
    }
  });
}
function oo$1(e, t) {
  e.walk((r) => {
    let n = r.$children;
    if (!n) return;
    if (n.length === 0 || n.length === 1 && n[0].kind === "text" && N.trim(n[0].value).length === 0) {
      r.hasDanglingSpaces = n.length > 0, r.$children = [];
      return;
    }
    let i = sn$1(r, t), s = Zt$1(r);
    if (!i) for (let a = 0; a < n.length; a++) {
      let o = n[a];
      if (o.kind !== "text") continue;
      let { leadingWhitespace: c, text: u, trailingWhitespace: p } = rn$1(o.value), d = o.prev, g = o.next;
      u ? (o.value = u, o.sourceSpan = new h(o.sourceSpan.start.moveBy(c.length), o.sourceSpan.end.moveBy(-p.length)), c && (d && (d.hasTrailingSpaces = true), o.hasLeadingSpaces = true), p && (o.hasTrailingSpaces = true, g && (g.hasLeadingSpaces = true))) : (r.removeChild(o), a--, (c || p) && (d && (d.hasTrailingSpaces = true), g && (g.hasLeadingSpaces = true)));
    }
    r.isWhitespaceSensitive = i, r.isIndentationSensitive = s;
  });
}
function lo$1(e) {
  e.walk((t) => {
    t.isSelfClosing = !t.children || t.kind === "element" && (t.tagDefinition.isVoid || t.endSourceSpan && t.startSourceSpan.start === t.endSourceSpan.start && t.startSourceSpan.end === t.endSourceSpan.end);
  });
}
function co$1(e, t) {
  e.walk((r) => {
    r.kind === "element" && (r.hasHtmComponentClosingTag = r.endSourceSpan && /^<\s*\/\s*\/\s*>$/u.test(t.originalText.slice(r.endSourceSpan.start.offset, r.endSourceSpan.end.offset)));
  });
}
function uo$1(e, t) {
  e.walk((r) => {
    r.cssDisplay = dn$1(r, t);
  });
}
function po$1(e, t) {
  e.walk((r) => {
    let { children: n } = r;
    if (n) {
      if (n.length === 0) {
        r.isDanglingSpaceSensitive = ln(r, t);
        return;
      }
      for (let i of n) i.isLeadingSpaceSensitive = an$1(i, t), i.isTrailingSpaceSensitive = on$1(i, t);
      for (let i = 0; i < n.length; i++) {
        let s = n[i];
        s.isLeadingSpaceSensitive = (i === 0 || s.prev.isTrailingSpaceSensitive) && s.isLeadingSpaceSensitive, s.isTrailingSpaceSensitive = (i === n.length - 1 || s.next.isLeadingSpaceSensitive) && s.isTrailingSpaceSensitive;
      }
    }
  });
}
var Fi = eo$1;
function ho$1(e, t, r) {
  let { node: n } = e;
  switch (n.kind) {
    case "root":
      return t.__onHtmlRoot && t.__onHtmlRoot(n), [E(Le$1(e, t, r)), C];
    case "element":
    case "ieConditionalComment":
      return ci$1(e, t, r);
    case "angularControlFlowBlock":
      return ii$1(e, t, r);
    case "angularControlFlowBlockParameters":
      return ai$1(e, t, r);
    case "angularControlFlowBlockParameter":
      return N.trim(n.expression);
    case "angularLetDeclaration":
      return E(["@let ", E([n.id, " =", E(A([S$1, r("init")]))]), ";"]);
    case "angularLetDeclarationInitializer":
      return n.value;
    case "angularIcuExpression":
      return oi$1(e, t, r);
    case "angularIcuCase":
      return li$1(e, t, r);
    case "ieConditionalStartComment":
    case "ieConditionalEndComment":
      return [me$1(n), ce$1(n)];
    case "interpolation":
      return [me$1(n, t), ...e.map(r, "children"), ce$1(n, t)];
    case "text": {
      if (n.parent.kind === "interpolation") {
        let o = /\n[^\S\n]*$/u, c = o.test(n.value), u = c ? n.value.replace(o, "") : n.value;
        return [L$1(u), c ? C : ""];
      }
      let i = H$1(n, t), s = bt(n), a = F(n, t);
      return s[0] = [i, s[0]], s.push([s.pop(), a]), gt$1(s);
    }
    case "docType":
      return [E([me$1(n, t), " ", w$1(0, n.value.replace(/^html\b/iu, "html"), /\s+/gu, " ")]), ce$1(n, t)];
    case "comment":
      return [H$1(n, t), L$1(t.originalText.slice(K$1(n), J(n))), F(n, t)];
    case "attribute": {
      if (n.value === null) return n.rawName;
      let i = rr$1(n.value), s = kt$1(n, t) ? "" : Ur$1(i, '"');
      return [n.rawName, "=", s, L$1(s === '"' ? w$1(0, i, '"', "&quot;") : w$1(0, i, "'", "&apos;")), s];
    }
    case "frontMatter":
    case "cdata":
    default:
      throw new Gr$1(n, "HTML");
  }
}
var mo$1 = { features: { experimental_frontMatterSupport: { massageAstNode: true, embed: true, print: true } }, preprocess: Fi, print: ho$1, insertPragma: ti$1, massageAstNode: $r$1, embed: $n$1, getVisitorKeys: Xn }, Hi = mo$1;
var Vi = [{ name: "Angular", type: "markup", aceMode: "html", extensions: [".component.html"], tmScope: "text.html.basic", aliases: ["xhtml"], codemirrorMode: "htmlmixed", codemirrorMimeType: "text/html", parsers: ["angular"], vscodeLanguageIds: ["html"], filenames: [], linguistLanguageId: 146 }, { name: "HTML", type: "markup", aceMode: "html", extensions: [".html", ".hta", ".htm", ".html.hl", ".inc", ".xht", ".xhtml"], tmScope: "text.html.basic", aliases: ["xhtml"], codemirrorMode: "htmlmixed", codemirrorMimeType: "text/html", parsers: ["html"], vscodeLanguageIds: ["html"], linguistLanguageId: 146 }, { name: "Lightning Web Components", type: "markup", aceMode: "html", extensions: [], tmScope: "text.html.basic", aliases: ["xhtml"], codemirrorMode: "htmlmixed", codemirrorMimeType: "text/html", parsers: ["lwc"], vscodeLanguageIds: ["html"], filenames: [], linguistLanguageId: 146 }, { name: "MJML", type: "markup", aceMode: "html", extensions: [".mjml"], tmScope: "text.mjml.basic", aliases: ["MJML", "mjml"], codemirrorMode: "htmlmixed", codemirrorMimeType: "text/html", parsers: ["mjml"], filenames: [], vscodeLanguageIds: ["mjml"], linguistLanguageId: 146 }, { name: "Vue", type: "markup", aceMode: "vue", extensions: [".vue"], tmScope: "source.vue", codemirrorMode: "vue", codemirrorMimeType: "text/x-vue", parsers: ["vue"], vscodeLanguageIds: ["vue"], linguistLanguageId: 391 }];
var vr$1 = { bracketSameLine: { category: "Common", type: "boolean", default: false, description: "Put > of opening tags on the last line instead of on a new line." }, singleAttributePerLine: { category: "Common", type: "boolean", default: false, description: "Enforce single attribute per line in HTML, Vue and JSX." } };
var Ui = "HTML", fo$1 = { bracketSameLine: vr$1.bracketSameLine, htmlWhitespaceSensitivity: { category: Ui, type: "choice", default: "css", description: "How to handle whitespaces in HTML.", choices: [{ value: "css", description: "Respect the default value of CSS display property." }, { value: "strict", description: "Whitespaces are considered sensitive." }, { value: "ignore", description: "Whitespaces are considered insensitive." }] }, singleAttributePerLine: vr$1.singleAttributePerLine, vueIndentScriptAndStyle: { category: Ui, type: "boolean", default: false, description: "Indent script and style tags in Vue files." } }, Wi = fo$1;
var Nr = {};
Or$1(Nr, { angular: () => Ro$1, html: () => Oo$1, lwc: () => Bo$1, mjml: () => Io$1, vue: () => Mo$1 });
function go$1(e, t) {
  let r = new SyntaxError(e + " (" + t.loc.start.line + ":" + t.loc.start.column + ")");
  return Object.assign(r, t);
}
var Gi = go$1;
var _o$1 = { canSelfClose: true, normalizeTagName: false, normalizeAttributeName: false, allowHtmComponentClosingTags: false, isTagNameCaseSensitive: false, shouldParseFrontMatter: true };
function Mt$1(e) {
  return { ..._o$1, ...e };
}
function Tr$1(e) {
  let { canSelfClose: t, allowHtmComponentClosingTags: r, isTagNameCaseSensitive: n, shouldParseAsRawText: i, tokenizeAngularBlocks: s, tokenizeAngularLetDeclaration: a } = e;
  return { canSelfClose: t, allowHtmComponentClosingTags: r, isTagNameCaseSensitive: n, getTagContentType: i ? (...o) => i(...o) ? R$1.RAW_TEXT : void 0 : void 0, tokenizeAngularBlocks: s, tokenizeAngularLetDeclaration: a };
}
var Bt = /* @__PURE__ */ new Map([["*", /* @__PURE__ */ new Set(["accesskey", "autocapitalize", "autocorrect", "autofocus", "class", "contenteditable", "dir", "draggable", "enterkeyhint", "exportparts", "hidden", "id", "inert", "inputmode", "is", "itemid", "itemprop", "itemref", "itemscope", "itemtype", "lang", "nonce", "part", "popover", "slot", "spellcheck", "style", "tabindex", "title", "translate", "writingsuggestions"])], ["a", /* @__PURE__ */ new Set(["charset", "coords", "download", "href", "hreflang", "name", "ping", "referrerpolicy", "rel", "rev", "shape", "target", "type"])], ["applet", /* @__PURE__ */ new Set(["align", "alt", "archive", "code", "codebase", "height", "hspace", "name", "object", "vspace", "width"])], ["area", /* @__PURE__ */ new Set(["alt", "coords", "download", "href", "hreflang", "nohref", "ping", "referrerpolicy", "rel", "shape", "target", "type"])], ["audio", /* @__PURE__ */ new Set(["autoplay", "controls", "crossorigin", "loop", "muted", "preload", "src"])], ["base", /* @__PURE__ */ new Set(["href", "target"])], ["basefont", /* @__PURE__ */ new Set(["color", "face", "size"])], ["blockquote", /* @__PURE__ */ new Set(["cite"])], ["body", /* @__PURE__ */ new Set(["alink", "background", "bgcolor", "link", "text", "vlink"])], ["br", /* @__PURE__ */ new Set(["clear"])], ["button", /* @__PURE__ */ new Set(["command", "commandfor", "disabled", "form", "formaction", "formenctype", "formmethod", "formnovalidate", "formtarget", "name", "popovertarget", "popovertargetaction", "type", "value"])], ["canvas", /* @__PURE__ */ new Set(["height", "width"])], ["caption", /* @__PURE__ */ new Set(["align"])], ["col", /* @__PURE__ */ new Set(["align", "char", "charoff", "span", "valign", "width"])], ["colgroup", /* @__PURE__ */ new Set(["align", "char", "charoff", "span", "valign", "width"])], ["data", /* @__PURE__ */ new Set(["value"])], ["del", /* @__PURE__ */ new Set(["cite", "datetime"])], ["details", /* @__PURE__ */ new Set(["name", "open"])], ["dialog", /* @__PURE__ */ new Set(["closedby", "open"])], ["dir", /* @__PURE__ */ new Set(["compact"])], ["div", /* @__PURE__ */ new Set(["align"])], ["dl", /* @__PURE__ */ new Set(["compact"])], ["embed", /* @__PURE__ */ new Set(["height", "src", "type", "width"])], ["fieldset", /* @__PURE__ */ new Set(["disabled", "form", "name"])], ["font", /* @__PURE__ */ new Set(["color", "face", "size"])], ["form", /* @__PURE__ */ new Set(["accept", "accept-charset", "action", "autocomplete", "enctype", "method", "name", "novalidate", "target"])], ["frame", /* @__PURE__ */ new Set(["frameborder", "longdesc", "marginheight", "marginwidth", "name", "noresize", "scrolling", "src"])], ["frameset", /* @__PURE__ */ new Set(["cols", "rows"])], ["h1", /* @__PURE__ */ new Set(["align"])], ["h2", /* @__PURE__ */ new Set(["align"])], ["h3", /* @__PURE__ */ new Set(["align"])], ["h4", /* @__PURE__ */ new Set(["align"])], ["h5", /* @__PURE__ */ new Set(["align"])], ["h6", /* @__PURE__ */ new Set(["align"])], ["head", /* @__PURE__ */ new Set(["profile"])], ["hr", /* @__PURE__ */ new Set(["align", "noshade", "size", "width"])], ["html", /* @__PURE__ */ new Set(["manifest", "version"])], ["iframe", /* @__PURE__ */ new Set(["align", "allow", "allowfullscreen", "allowpaymentrequest", "allowusermedia", "frameborder", "height", "loading", "longdesc", "marginheight", "marginwidth", "name", "referrerpolicy", "sandbox", "scrolling", "src", "srcdoc", "width"])], ["img", /* @__PURE__ */ new Set(["align", "alt", "border", "crossorigin", "decoding", "fetchpriority", "height", "hspace", "ismap", "loading", "longdesc", "name", "referrerpolicy", "sizes", "src", "srcset", "usemap", "vspace", "width"])], ["input", /* @__PURE__ */ new Set(["accept", "align", "alpha", "alt", "autocomplete", "checked", "colorspace", "dirname", "disabled", "form", "formaction", "formenctype", "formmethod", "formnovalidate", "formtarget", "height", "ismap", "list", "max", "maxlength", "min", "minlength", "multiple", "name", "pattern", "placeholder", "popovertarget", "popovertargetaction", "readonly", "required", "size", "src", "step", "type", "usemap", "value", "width"])], ["ins", /* @__PURE__ */ new Set(["cite", "datetime"])], ["isindex", /* @__PURE__ */ new Set(["prompt"])], ["label", /* @__PURE__ */ new Set(["for", "form"])], ["legend", /* @__PURE__ */ new Set(["align"])], ["li", /* @__PURE__ */ new Set(["type", "value"])], ["link", /* @__PURE__ */ new Set(["as", "blocking", "charset", "color", "crossorigin", "disabled", "fetchpriority", "href", "hreflang", "imagesizes", "imagesrcset", "integrity", "media", "referrerpolicy", "rel", "rev", "sizes", "target", "type"])], ["map", /* @__PURE__ */ new Set(["name"])], ["menu", /* @__PURE__ */ new Set(["compact"])], ["meta", /* @__PURE__ */ new Set(["charset", "content", "http-equiv", "media", "name", "scheme"])], ["meter", /* @__PURE__ */ new Set(["high", "low", "max", "min", "optimum", "value"])], ["object", /* @__PURE__ */ new Set(["align", "archive", "border", "classid", "codebase", "codetype", "data", "declare", "form", "height", "hspace", "name", "standby", "type", "typemustmatch", "usemap", "vspace", "width"])], ["ol", /* @__PURE__ */ new Set(["compact", "reversed", "start", "type"])], ["optgroup", /* @__PURE__ */ new Set(["disabled", "label"])], ["option", /* @__PURE__ */ new Set(["disabled", "label", "selected", "value"])], ["output", /* @__PURE__ */ new Set(["for", "form", "name"])], ["p", /* @__PURE__ */ new Set(["align"])], ["param", /* @__PURE__ */ new Set(["name", "type", "value", "valuetype"])], ["pre", /* @__PURE__ */ new Set(["width"])], ["progress", /* @__PURE__ */ new Set(["max", "value"])], ["q", /* @__PURE__ */ new Set(["cite"])], ["script", /* @__PURE__ */ new Set(["async", "blocking", "charset", "crossorigin", "defer", "fetchpriority", "integrity", "language", "nomodule", "referrerpolicy", "src", "type"])], ["select", /* @__PURE__ */ new Set(["autocomplete", "disabled", "form", "multiple", "name", "required", "size"])], ["slot", /* @__PURE__ */ new Set(["name"])], ["source", /* @__PURE__ */ new Set(["height", "media", "sizes", "src", "srcset", "type", "width"])], ["style", /* @__PURE__ */ new Set(["blocking", "media", "type"])], ["table", /* @__PURE__ */ new Set(["align", "bgcolor", "border", "cellpadding", "cellspacing", "frame", "rules", "summary", "width"])], ["tbody", /* @__PURE__ */ new Set(["align", "char", "charoff", "valign"])], ["td", /* @__PURE__ */ new Set(["abbr", "align", "axis", "bgcolor", "char", "charoff", "colspan", "headers", "height", "nowrap", "rowspan", "scope", "valign", "width"])], ["template", /* @__PURE__ */ new Set(["shadowrootclonable", "shadowrootcustomelementregistry", "shadowrootdelegatesfocus", "shadowrootmode", "shadowrootserializable"])], ["textarea", /* @__PURE__ */ new Set(["autocomplete", "cols", "dirname", "disabled", "form", "maxlength", "minlength", "name", "placeholder", "readonly", "required", "rows", "wrap"])], ["tfoot", /* @__PURE__ */ new Set(["align", "char", "charoff", "valign"])], ["th", /* @__PURE__ */ new Set(["abbr", "align", "axis", "bgcolor", "char", "charoff", "colspan", "headers", "height", "nowrap", "rowspan", "scope", "valign", "width"])], ["thead", /* @__PURE__ */ new Set(["align", "char", "charoff", "valign"])], ["time", /* @__PURE__ */ new Set(["datetime"])], ["tr", /* @__PURE__ */ new Set(["align", "bgcolor", "char", "charoff", "valign"])], ["track", /* @__PURE__ */ new Set(["default", "kind", "label", "src", "srclang"])], ["ul", /* @__PURE__ */ new Set(["compact", "type"])], ["video", /* @__PURE__ */ new Set(["autoplay", "controls", "crossorigin", "height", "loop", "muted", "playsinline", "poster", "preload", "src", "width"])]]);
var zi = /* @__PURE__ */ new Set(["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "bgsound", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "content", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fencedframe", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "image", "img", "input", "ins", "isindex", "kbd", "keygen", "label", "legend", "li", "link", "listing", "main", "map", "mark", "marquee", "math", "menu", "menuitem", "meta", "meter", "multicol", "nav", "nextid", "nobr", "noembed", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "plaintext", "pre", "progress", "q", "rb", "rbc", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "search", "section", "select", "selectedcontent", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr", "xmp"]);
var qt$1 = { attrs: true, children: true, cases: true, expression: true }, $i = /* @__PURE__ */ new Set(["parent"]), re, br$1, wr$1, Be$1 = class Be {
  constructor(t = {}) {
    Dr$1(this, re);
    Ut$1(this, "kind");
    Ut$1(this, "parent");
    for (let r of /* @__PURE__ */ new Set([...$i, ...Object.keys(t)])) this.setProperty(r, t[r]);
    if (ie$1(t)) for (let r of Object.getOwnPropertySymbols(t)) this.setProperty(r, t[r]);
  }
  setProperty(t, r) {
    if (this[t] !== r) {
      if (t in qt$1 && (r = r.map((n) => this.createChild(n))), !$i.has(t)) {
        this[t] = r;
        return;
      }
      Object.defineProperty(this, t, { value: r, enumerable: false, configurable: true });
    }
  }
  map(t) {
    let r;
    for (let n in qt$1) {
      let i = this[n];
      if (i) {
        let s = So$1(i, (a) => a.map(t));
        r !== i && (r || (r = new Be({ parent: this.parent })), r.setProperty(n, s));
      }
    }
    if (r) for (let n in this) n in qt$1 || (r[n] = this[n]);
    return t(r || this);
  }
  walk(t) {
    for (let r in qt$1) {
      let n = this[r];
      if (n) for (let i = 0; i < n.length; i++) n[i].walk(t);
    }
    t(this);
  }
  createChild(t) {
    let r = t instanceof Be ? t.clone() : new Be(t);
    return r.setProperty("parent", this), r;
  }
  insertChildBefore(t, r) {
    let n = this.$children;
    n.splice(n.indexOf(t), 0, this.createChild(r));
  }
  removeChild(t) {
    let r = this.$children;
    r.splice(r.indexOf(t), 1);
  }
  replaceChild(t, r) {
    let n = this.$children;
    n[n.indexOf(t)] = this.createChild(r);
  }
  clone() {
    return new Be(this);
  }
  get $children() {
    return this[Fe$1(this, re, br$1)];
  }
  set $children(t) {
    this[Fe$1(this, re, br$1)] = t;
  }
  get firstChild() {
    return this.$children?.[0];
  }
  get lastChild() {
    return M$1(1, this.$children, -1);
  }
  get prev() {
    let t = Fe$1(this, re, wr$1);
    return t[t.indexOf(this) - 1];
  }
  get next() {
    let t = Fe$1(this, re, wr$1);
    return t[t.indexOf(this) + 1];
  }
  get rawName() {
    return this.hasExplicitNamespace ? this.fullName : this.name;
  }
  get fullName() {
    return this.namespace ? this.namespace + ":" + this.name : this.name;
  }
  get attrMap() {
    return Object.fromEntries(this.attrs.map((t) => [t.fullName, t.value]));
  }
};
re = /* @__PURE__ */ new WeakSet(), br$1 = function() {
  return this.kind === "angularIcuCase" ? "expression" : this.kind === "angularIcuExpression" ? "cases" : "children";
}, wr$1 = function() {
  return this.parent?.$children ?? [];
};
var Ft$1 = Be$1;
function So$1(e, t) {
  let r = e.map(t);
  return r.some((n, i) => n !== e[i]) ? r : e;
}
var Eo$1 = [{ regex: /^(?<openingTagSuffix>\[if(?<condition>[^\]]*)\]>)(?<data>.*?)<!\s*\[endif\]$/su, parse: Co$1 }, { regex: /^\[if(?<condition>[^\]]*)\]><!$/u, parse: vo$1 }, { regex: /^<!\s*\[endif\]$/u, parse: To$1 }];
function Yi(e, t) {
  if (e.value) for (let { regex: r, parse: n } of Eo$1) {
    let i = e.value.match(r);
    if (i) return n(e, i, t);
  }
  return null;
}
function Co$1(e, t, r) {
  let { openingTagSuffix: n, condition: i, data: s } = t.groups, a = 4 + n.length, o = e.sourceSpan.start.moveBy(a), c = o.moveBy(s.length), [u, p] = (() => {
    try {
      return [true, r(s, o).children];
    } catch {
      return [false, [{ kind: "text", value: s, sourceSpan: new h(o, c) }]];
    }
  })();
  return { kind: "ieConditionalComment", complete: u, children: p, condition: w$1(0, i.trim(), /\s+/gu, " "), sourceSpan: e.sourceSpan, startSourceSpan: new h(e.sourceSpan.start, o), endSourceSpan: new h(c, e.sourceSpan.end) };
}
function vo$1(e, t) {
  let { condition: r } = t.groups;
  return { kind: "ieConditionalStartComment", condition: w$1(0, r.trim(), /\s+/gu, " "), sourceSpan: e.sourceSpan };
}
function To$1(e) {
  return { kind: "ieConditionalEndComment", sourceSpan: e.sourceSpan };
}
var kr$1 = class kr extends fr$1 {
  visitExpansionCase(t, r) {
    r.parseOptions.name === "angular" && this.visitChildren(r, (n) => {
      n(t.expression);
    });
  }
  visit(t, { parseOptions: r }) {
    xo$1(t), yo$1(t, r), No$1(t, r), Ao$1(t);
  }
};
function Ki(e, t, r, n) {
  Ot(new kr$1(), e.children, { parseOptions: r }), t && e.children.unshift(t);
  let i = new Ft$1(e);
  return i.walk((s) => {
    if (s.kind === "comment") {
      let a = Yi(s, n);
      a && s.parent.replaceChild(s, a);
    }
    bo$1(s), wo$1(s), ko$1(s);
  }), i;
}
function bo$1(e) {
  if (e.kind === "block") {
    if (e.name = w$1(0, e.name.toLowerCase(), /\s+/gu, " ").trim(), e.kind = "angularControlFlowBlock", !Ne$1(e.parameters)) {
      delete e.parameters;
      return;
    }
    for (let t of e.parameters) t.kind = "angularControlFlowBlockParameter";
    e.parameters = { kind: "angularControlFlowBlockParameters", children: e.parameters, sourceSpan: new h(e.parameters[0].sourceSpan.start, M$1(0, e.parameters, -1).sourceSpan.end) };
  }
}
function wo$1(e) {
  e.kind === "letDeclaration" && (e.kind = "angularLetDeclaration", e.id = e.name, e.init = { kind: "angularLetDeclarationInitializer", sourceSpan: new h(e.valueSpan.start, e.valueSpan.end), value: e.value }, delete e.name, delete e.value);
}
function ko$1(e) {
  e.kind === "expansion" && (e.kind = "angularIcuExpression"), e.kind === "expansionCase" && (e.kind = "angularIcuCase");
}
function ji(e, t) {
  let r = e.toLowerCase();
  return t(r) ? r : e;
}
function Xi(e) {
  let t = e.name.startsWith(":") ? e.name.slice(1).split(":")[0] : null, r = e.nameSpan.toString(), n = t !== null && r.startsWith(`${t}:`), i = n ? r.slice(t.length + 1) : r;
  e.name = i, e.namespace = t, e.hasExplicitNamespace = n;
}
function xo$1(e) {
  switch (e.kind) {
    case "element":
      Xi(e);
      for (let t of e.attrs) Xi(t), t.valueSpan ? (t.value = t.valueSpan.toString(), /["']/u.test(t.value[0]) && (t.value = t.value.slice(1, -1))) : t.value = null;
      break;
    case "comment":
      e.value = e.sourceSpan.toString().slice(4, -3);
      break;
    case "text":
      e.value = e.sourceSpan.toString();
      break;
  }
}
function yo$1(e, t) {
  if (e.kind === "element") {
    let r = Oe$1(t.isTagNameCaseSensitive ? e.name : e.name.toLowerCase());
    !e.namespace || e.namespace === r.implicitNamespacePrefix || se$1(e) ? e.tagDefinition = r : e.tagDefinition = Oe$1("");
  }
}
function Ao$1(e) {
  e.sourceSpan && e.endSourceSpan && (e.sourceSpan = new h(e.sourceSpan.start, e.endSourceSpan.end));
}
function No$1(e, t) {
  if (e.kind === "element" && (t.normalizeTagName && (!e.namespace || e.namespace === e.tagDefinition.implicitNamespacePrefix || se$1(e)) && (e.name = ji(e.name, (r) => zi.has(r))), t.normalizeAttributeName)) for (let r of e.attrs) r.namespace || (r.name = ji(r.name, (n) => Bt.has(e.name) && (Bt.get("*").has(n) || Bt.get(e.name).has(n))));
}
function yr$1(e, t) {
  let { rootNodes: r, errors: n } = Rt(e, Tr$1(t));
  return n.length > 0 && xr$1(n[0]), { parseOptions: t, rootNodes: r };
}
function Qi(e, t) {
  let r = Tr$1(t), { rootNodes: n, errors: i } = Rt(e, r);
  if (n.some((u) => u.kind === "docType" && u.value === "html" || u.kind === "element" && u.name.toLowerCase() === "html")) return yr$1(e, Ht$1);
  let a, o = () => a ?? (a = Rt(e, { ...r, getTagContentType: void 0 })), c = (u) => {
    let { offset: p } = u.startSourceSpan.start;
    return o().rootNodes.find((d) => d.kind === "element" && d.startSourceSpan.start.offset === p) ?? u;
  };
  for (let [u, p] of n.entries()) if (p.kind === "element") {
    if (p.isVoid) i = o().errors, n[u] = c(p);
    else if (Lo$1(p)) {
      let { endSourceSpan: d, startSourceSpan: g } = p, m = o().errors.find((_2) => _2.span.start.offset > g.start.offset && _2.span.start.offset < d.end.offset);
      m && xr$1(m), n[u] = c(p);
    }
  }
  return i.length > 0 && xr$1(i[0]), { parseOptions: t, rootNodes: n };
}
function Lo$1(e) {
  if (e.kind !== "element" || e.name !== "template") return false;
  let t = e.attrs.find((r) => r.name === "lang")?.value;
  return !t || t === "html";
}
function xr$1(e) {
  let { msg: t, span: { start: r, end: n } } = e;
  throw Gi(t, { loc: { start: { line: r.line + 1, column: r.col + 1 }, end: { line: n.line + 1, column: n.col + 1 } }, cause: e });
}
function Po$1(e, t, r, n, i, s) {
  let { offset: a } = n, o = w$1(0, t.slice(0, a), /[^\n]/gu, " ") + r, c = Ar$1(o, e, { ...i, shouldParseFrontMatter: false }, s);
  c.sourceSpan = new h(n, M$1(0, c.children, -1).sourceSpan.end);
  let u = c.children[0];
  return u.length === a ? c.children.shift() : (u.sourceSpan = new h(u.sourceSpan.start.moveBy(a), u.sourceSpan.end), u.value = u.value.slice(a)), c;
}
function Ar$1(e, t, r, n = {}) {
  let { frontMatter: i, content: s } = r.shouldParseFrontMatter ? Xt$1(e) : { content: e }, a = new nt$1(e, n.filepath), o = new De$1(a, 0, 0, 0), c = o.moveBy(e.length), { parseOptions: u, rootNodes: p } = t(s, r), d = { kind: "root", sourceSpan: new h(o, c), children: p }, g;
  if (i) {
    let [_2, T2] = [i.start, i.end].map((P2) => new De$1(a, P2.index, P2.line - 1, P2.column));
    g = { ...i, kind: "frontMatter", sourceSpan: new h(_2, T2) };
  }
  return Ki(d, g, u, (_2, T2) => Po$1(t, e, _2, T2, u, n));
}
var Ht$1 = Mt$1({ name: "html", normalizeTagName: true, normalizeAttributeName: true, allowHtmComponentClosingTags: true });
function at$1(e) {
  let t = Mt$1(e), r = t.name === "vue" ? Qi : yr$1;
  return { parse: (n, i) => Ar$1(n, r, t, i), hasPragma: Zn$1, hasIgnorePragma: ei$1, astFormat: "html", locStart: K$1, locEnd: J };
}
var Oo$1 = at$1(Ht$1), Do$1 = /* @__PURE__ */ new Set(["mj-style", "mj-raw"]), Io$1 = at$1({ ...Ht$1, name: "mjml", shouldParseAsRawText: (e) => Do$1.has(e) }), Ro$1 = at$1({ name: "angular", tokenizeAngularBlocks: true, tokenizeAngularLetDeclaration: true }), Mo$1 = at$1({ name: "vue", isTagNameCaseSensitive: true, shouldParseAsRawText(e, t, r, n) {
  return e.toLowerCase() !== "html" && !r && (e !== "template" || n.some(({ name: i, value: s }) => i === "lang" && s !== "html" && s !== "" && s !== void 0));
} }), Bo$1 = at$1({ name: "lwc", canSelfClose: false });
var qo$1 = { html: Hi };
const html = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: Ji,
  languages: Vi,
  options: Wi,
  parsers: Nr,
  printers: qo$1
});
var Zn = Object.create;
var Mt = Object.defineProperty;
var eo = Object.getOwnPropertyDescriptor;
var to = Object.getOwnPropertyNames;
var uo = Object.getPrototypeOf, ro = Object.prototype.hasOwnProperty;
var no = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), Yt2 = (e, t) => {
  for (var u in t) Mt(e, u, { get: t[u], enumerable: true });
}, oo = (e, t, u, r) => {
  if (t && typeof t == "object" || typeof t == "function") for (let o of to(t)) !ro.call(e, o) && o !== u && Mt(e, o, { get: () => t[o], enumerable: !(r = eo(t, o)) || r.enumerable });
  return e;
};
var ao = (e, t, u) => (u = e != null ? Zn(uo(e)) : {}, oo(Mt(u, "default", { value: e, enumerable: true }), e));
var dn = no((of, ln2) => {
  var yt2, bt2, At2, _t2, xt2, $e2, bu, Ke2, Bt2, cn2, Tt2, Ve2, Nt2, St2, wt2, pe2, fn2, Ot2, Pt2;
  Nt2 = /\/(?![*\/])(?:\[(?:[^\]\\\n\r\u2028\u2029]+|\\.)*\]|[^\/\\\n\r\u2028\u2029]+|\\.)*(\/[$_\u200C\u200D\p{ID_Continue}]*|\\)?/yu;
  Ve2 = /--|\+\+|=>|\.{3}|\??\.(?!\d)|(?:&&|\|\||\?\?|[+\-%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2}|\/(?![\/*]))=?|[?~,:;[\](){}]/y;
  yt2 = /(\x23?)(?=[$_\p{ID_Start}\\])(?:[$_\u200C\u200D\p{ID_Continue}]+|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+/yu;
  wt2 = /(['"])(?:[^'"\\\n\r]+|(?!\1)['"]|\\(?:\r\n|[^]))*(\1)?/y;
  Tt2 = /(?:0[xX][\da-fA-F](?:_?[\da-fA-F])*|0[oO][0-7](?:_?[0-7])*|0[bB][01](?:_?[01])*)n?|0n|[1-9](?:_?\d)*n|(?:(?:0(?!\d)|0\d*[89]\d*|[1-9](?:_?\d)*)(?:\.(?:\d(?:_?\d)*)?)?|\.\d(?:_?\d)*)(?:[eE][+-]?\d(?:_?\d)*)?|0[0-7]+/y;
  pe2 = /[`}](?:[^`\\$]+|\\[^]|\$(?!\{))*(`|\$\{)?/y;
  Pt2 = /[\t\v\f\ufeff\p{Zs}]+/yu;
  Ke2 = /\r?\n|[\r\u2028\u2029]/y;
  Bt2 = /\/\*(?:[^*]+|\*(?!\/))*(\*\/)?/y;
  St2 = /\/\/.*/y;
  At2 = /[<>.:={}]|\/(?![\/*])/y;
  bt2 = /[$_\p{ID_Start}][$_\u200C\u200D\p{ID_Continue}-]*/yu;
  _t2 = /(['"])(?:[^'"]+|(?!\1)['"])*(\1)?/y;
  xt2 = /[^<>{}]+/y;
  Ot2 = /^(?:[\/+-]|\.{3}|\?(?:InterpolationIn(?:JSX|Template)|NoLineTerminatorHere|NonExpressionParenEnd|UnaryIncDec))?$|[{}([,;<>=*%&|^!~?:]$/;
  fn2 = /^(?:=>|[;\]){}]|else|\?(?:NoLineTerminatorHere|NonExpressionParenEnd))?$/;
  $e2 = /^(?:await|case|default|delete|do|else|instanceof|new|return|throw|typeof|void|yield)$/;
  bu = /^(?:return|throw|yield)$/;
  cn2 = RegExp(Ke2.source);
  ln2.exports = function* (e, { jsx: t = false } = {}) {
    var u, r, o, n, a, s, i, D, f2, l2, d, c, p, F2;
    for ({ length: s } = e, n = 0, a = "", F2 = [{ tag: "JS" }], u = [], d = 0, c = false; n < s; ) {
      switch (D = F2[F2.length - 1], D.tag) {
        case "JS":
        case "JSNonExpressionParen":
        case "InterpolationInTemplate":
        case "InterpolationInJSX":
          if (e[n] === "/" && (Ot2.test(a) || $e2.test(a)) && (Nt2.lastIndex = n, i = Nt2.exec(e))) {
            n = Nt2.lastIndex, a = i[0], c = true, yield { type: "RegularExpressionLiteral", value: i[0], closed: i[1] !== void 0 && i[1] !== "\\" };
            continue;
          }
          if (Ve2.lastIndex = n, i = Ve2.exec(e)) {
            switch (p = i[0], f2 = Ve2.lastIndex, l2 = p, p) {
              case "(":
                a === "?NonExpressionParenKeyword" && F2.push({ tag: "JSNonExpressionParen", nesting: d }), d++, c = false;
                break;
              case ")":
                d--, c = true, D.tag === "JSNonExpressionParen" && d === D.nesting && (F2.pop(), l2 = "?NonExpressionParenEnd", c = false);
                break;
              case "{":
                Ve2.lastIndex = 0, o = !fn2.test(a) && (Ot2.test(a) || $e2.test(a)), u.push(o), c = false;
                break;
              case "}":
                switch (D.tag) {
                  case "InterpolationInTemplate":
                    if (u.length === D.nesting) {
                      pe2.lastIndex = n, i = pe2.exec(e), n = pe2.lastIndex, a = i[0], i[1] === "${" ? (a = "?InterpolationInTemplate", c = false, yield { type: "TemplateMiddle", value: i[0] }) : (F2.pop(), c = true, yield { type: "TemplateTail", value: i[0], closed: i[1] === "`" });
                      continue;
                    }
                    break;
                  case "InterpolationInJSX":
                    if (u.length === D.nesting) {
                      F2.pop(), n += 1, a = "}", yield { type: "JSXPunctuator", value: "}" };
                      continue;
                    }
                }
                c = u.pop(), l2 = c ? "?ExpressionBraceEnd" : "}";
                break;
              case "]":
                c = true;
                break;
              case "++":
              case "--":
                l2 = c ? "?PostfixIncDec" : "?UnaryIncDec";
                break;
              case "<":
                if (t && (Ot2.test(a) || $e2.test(a))) {
                  F2.push({ tag: "JSXTag" }), n += 1, a = "<", yield { type: "JSXPunctuator", value: p };
                  continue;
                }
                c = false;
                break;
              default:
                c = false;
            }
            n = f2, a = l2, yield { type: "Punctuator", value: p };
            continue;
          }
          if (yt2.lastIndex = n, i = yt2.exec(e)) {
            switch (n = yt2.lastIndex, l2 = i[0], i[0]) {
              case "for":
              case "if":
              case "while":
              case "with":
                a !== "." && a !== "?." && (l2 = "?NonExpressionParenKeyword");
            }
            a = l2, c = !$e2.test(i[0]), yield { type: i[1] === "#" ? "PrivateIdentifier" : "IdentifierName", value: i[0] };
            continue;
          }
          if (wt2.lastIndex = n, i = wt2.exec(e)) {
            n = wt2.lastIndex, a = i[0], c = true, yield { type: "StringLiteral", value: i[0], closed: i[2] !== void 0 };
            continue;
          }
          if (Tt2.lastIndex = n, i = Tt2.exec(e)) {
            n = Tt2.lastIndex, a = i[0], c = true, yield { type: "NumericLiteral", value: i[0] };
            continue;
          }
          if (pe2.lastIndex = n, i = pe2.exec(e)) {
            n = pe2.lastIndex, a = i[0], i[1] === "${" ? (a = "?InterpolationInTemplate", F2.push({ tag: "InterpolationInTemplate", nesting: u.length }), c = false, yield { type: "TemplateHead", value: i[0] }) : (c = true, yield { type: "NoSubstitutionTemplate", value: i[0], closed: i[1] === "`" });
            continue;
          }
          break;
        case "JSXTag":
        case "JSXTagEnd":
          if (At2.lastIndex = n, i = At2.exec(e)) {
            switch (n = At2.lastIndex, l2 = i[0], i[0]) {
              case "<":
                F2.push({ tag: "JSXTag" });
                break;
              case ">":
                F2.pop(), a === "/" || D.tag === "JSXTagEnd" ? (l2 = "?JSX", c = true) : F2.push({ tag: "JSXChildren" });
                break;
              case "{":
                F2.push({ tag: "InterpolationInJSX", nesting: u.length }), l2 = "?InterpolationInJSX", c = false;
                break;
              case "/":
                a === "<" && (F2.pop(), F2[F2.length - 1].tag === "JSXChildren" && F2.pop(), F2.push({ tag: "JSXTagEnd" }));
            }
            a = l2, yield { type: "JSXPunctuator", value: i[0] };
            continue;
          }
          if (bt2.lastIndex = n, i = bt2.exec(e)) {
            n = bt2.lastIndex, a = i[0], yield { type: "JSXIdentifier", value: i[0] };
            continue;
          }
          if (_t2.lastIndex = n, i = _t2.exec(e)) {
            n = _t2.lastIndex, a = i[0], yield { type: "JSXString", value: i[0], closed: i[2] !== void 0 };
            continue;
          }
          break;
        case "JSXChildren":
          if (xt2.lastIndex = n, i = xt2.exec(e)) {
            n = xt2.lastIndex, a = i[0], yield { type: "JSXText", value: i[0] };
            continue;
          }
          switch (e[n]) {
            case "<":
              F2.push({ tag: "JSXTag" }), n++, a = "<", yield { type: "JSXPunctuator", value: "<" };
              continue;
            case "{":
              F2.push({ tag: "InterpolationInJSX", nesting: u.length }), n++, a = "?InterpolationInJSX", c = false, yield { type: "JSXPunctuator", value: "{" };
              continue;
          }
      }
      if (Pt2.lastIndex = n, i = Pt2.exec(e)) {
        n = Pt2.lastIndex, yield { type: "WhiteSpace", value: i[0] };
        continue;
      }
      if (Ke2.lastIndex = n, i = Ke2.exec(e)) {
        n = Ke2.lastIndex, c = false, bu.test(a) && (a = "?NoLineTerminatorHere"), yield { type: "LineTerminatorSequence", value: i[0] };
        continue;
      }
      if (Bt2.lastIndex = n, i = Bt2.exec(e)) {
        n = Bt2.lastIndex, cn2.test(i[0]) && (c = false, bu.test(a) && (a = "?NoLineTerminatorHere")), yield { type: "MultiLineComment", value: i[0], closed: i[1] !== void 0 };
        continue;
      }
      if (St2.lastIndex = n, i = St2.exec(e)) {
        n = St2.lastIndex, c = false, yield { type: "SingleLineComment", value: i[0] };
        continue;
      }
      r = String.fromCodePoint(e.codePointAt(n)), n += r.length, a = r, c = false, yield { type: D.tag.startsWith("JSX") ? "JSXInvalid" : "Invalid", value: r };
    }
  };
});
var Hn = {};
Yt2(Hn, { __debug: () => li, check: () => ci, doc: () => wu, format: () => Jn, formatWithCursor: () => zn, getSupportInfo: () => fi, util: () => Pu, version: () => Mn });
var X = (e, t) => (u, r, ...o) => u | 1 && r == null ? void 0 : (t.call(r) ?? r[e]).apply(r, o);
var io = String.prototype.replaceAll ?? function(e, t) {
  return e.global ? this.replace(e, t) : this.split(e).join(t);
}, so = X("replaceAll", function() {
  if (typeof this == "string") return io;
}), oe = so;
var Ne = class {
  diff(t, u, r = {}) {
    let o;
    typeof r == "function" ? (o = r, r = {}) : "callback" in r && (o = r.callback);
    let n = this.castInput(t, r), a = this.castInput(u, r), s = this.removeEmpty(this.tokenize(n, r)), i = this.removeEmpty(this.tokenize(a, r));
    return this.diffWithOptionsObj(s, i, r, o);
  }
  diffWithOptionsObj(t, u, r, o) {
    var n;
    let a = (m) => {
      if (m = this.postProcess(m, r), o) {
        setTimeout(function() {
          o(m);
        }, 0);
        return;
      } else return m;
    }, s = u.length, i = t.length, D = 1, f2 = s + i;
    r.maxEditLength != null && (f2 = Math.min(f2, r.maxEditLength));
    let l2 = (n = r.timeout) !== null && n !== void 0 ? n : 1 / 0, d = Date.now() + l2, c = [{ oldPos: -1, lastComponent: void 0 }], p = this.extractCommon(c[0], u, t, 0, r);
    if (c[0].oldPos + 1 >= i && p + 1 >= s) return a(this.buildValues(c[0].lastComponent, u, t));
    let F2 = -1 / 0, C2 = 1 / 0, y2 = () => {
      for (let m = Math.max(F2, -D); m <= Math.min(C2, D); m += 2) {
        let h2, E2 = c[m - 1], g = c[m + 1];
        E2 && (c[m - 1] = void 0);
        let A2 = false;
        if (g) {
          let Q = g.oldPos - m;
          A2 = g && 0 <= Q && Q < s;
        }
        let J2 = E2 && E2.oldPos + 1 < i;
        if (!A2 && !J2) {
          c[m] = void 0;
          continue;
        }
        if (!J2 || A2 && E2.oldPos < g.oldPos ? h2 = this.addToPath(g, true, false, 0, r) : h2 = this.addToPath(E2, false, true, 1, r), p = this.extractCommon(h2, u, t, m, r), h2.oldPos + 1 >= i && p + 1 >= s) return a(this.buildValues(h2.lastComponent, u, t)) || true;
        c[m] = h2, h2.oldPos + 1 >= i && (C2 = Math.min(C2, m - 1)), p + 1 >= s && (F2 = Math.max(F2, m + 1));
      }
      D++;
    };
    if (o) (function m() {
      setTimeout(function() {
        if (D > f2 || Date.now() > d) return o(void 0);
        y2() || m();
      }, 0);
    })();
    else for (; D <= f2 && Date.now() <= d; ) {
      let m = y2();
      if (m) return m;
    }
  }
  addToPath(t, u, r, o, n) {
    let a = t.lastComponent;
    return a && !n.oneChangePerToken && a.added === u && a.removed === r ? { oldPos: t.oldPos + o, lastComponent: { count: a.count + 1, added: u, removed: r, previousComponent: a.previousComponent } } : { oldPos: t.oldPos + o, lastComponent: { count: 1, added: u, removed: r, previousComponent: a } };
  }
  extractCommon(t, u, r, o, n) {
    let a = u.length, s = r.length, i = t.oldPos, D = i - o, f2 = 0;
    for (; D + 1 < a && i + 1 < s && this.equals(r[i + 1], u[D + 1], n); ) D++, i++, f2++, n.oneChangePerToken && (t.lastComponent = { count: 1, previousComponent: t.lastComponent, added: false, removed: false });
    return f2 && !n.oneChangePerToken && (t.lastComponent = { count: f2, previousComponent: t.lastComponent, added: false, removed: false }), t.oldPos = i, D;
  }
  equals(t, u, r) {
    return r.comparator ? r.comparator(t, u) : t === u || !!r.ignoreCase && t.toLowerCase() === u.toLowerCase();
  }
  removeEmpty(t) {
    let u = [];
    for (let r = 0; r < t.length; r++) t[r] && u.push(t[r]);
    return u;
  }
  castInput(t, u) {
    return t;
  }
  tokenize(t, u) {
    return Array.from(t);
  }
  join(t) {
    return t.join("");
  }
  postProcess(t, u) {
    return t;
  }
  get useLongestToken() {
    return false;
  }
  buildValues(t, u, r) {
    let o = [], n;
    for (; t; ) o.push(t), n = t.previousComponent, delete t.previousComponent, t = n;
    o.reverse();
    let a = o.length, s = 0, i = 0, D = 0;
    for (; s < a; s++) {
      let f2 = o[s];
      if (f2.removed) f2.value = this.join(r.slice(D, D + f2.count)), D += f2.count;
      else {
        if (!f2.added && this.useLongestToken) {
          let l2 = u.slice(i, i + f2.count);
          l2 = l2.map(function(d, c) {
            let p = r[D + c];
            return p.length > d.length ? p : d;
          }), f2.value = this.join(l2);
        } else f2.value = this.join(u.slice(i, i + f2.count));
        i += f2.count, f2.added || (D += f2.count);
      }
    }
    return o;
  }
};
var jt = class extends Ne {
  tokenize(t) {
    return t.slice();
  }
  join(t) {
    return t;
  }
  removeEmpty(t) {
    return t;
  }
}, ku = new jt();
function Ut(e, t, u) {
  return ku.diff(e, t, u);
}
var Do = () => {
}, P = Do;
var Ru = "cr", Lu = "crlf", co = "lf", fo = co, Wt2 = "\r", Mu = `\r
`, Je = `
`, lo = Je;
function Yu(e) {
  let t = e.indexOf(Wt2);
  return t !== -1 ? e.charAt(t + 1) === Je ? Lu : Ru : fo;
}
function Se(e) {
  return e === Ru ? Wt2 : e === Lu ? Mu : lo;
}
var po = /* @__PURE__ */ new Map([[Je, /\n/gu], [Wt2, /\r/gu], [Mu, /\r\n/gu]]);
function $t2(e, t) {
  let u = po.get(t);
  return e.match(u)?.length ?? 0;
}
var Fo = /\r\n?/gu;
function ju(e) {
  return oe(0, e, Fo, Je);
}
function mo(e) {
  return this[e < 0 ? this.length + e : e];
}
var Eo = X("at", function() {
  if (Array.isArray(this) || typeof this == "string") return mo;
}), b = Eo;
var G2 = "string", j = "array", U = "cursor", I = "indent", k = "align", v = "trim", x = "group", w = "fill", B = "if-break", R = "indent-if-break", L = "line-suffix", M = "line-suffix-boundary", _ = "line", O = "label", T = "break-parent", He = /* @__PURE__ */ new Set([U, I, k, v, x, w, B, R, L, M, _, O, T]);
function Uu(e) {
  let t = e.length;
  for (; t > 0 && (e[t - 1] === "\r" || e[t - 1] === `
`); ) t--;
  return t < e.length ? e.slice(0, t) : e;
}
function Co(e) {
  if (typeof e == "string") return G2;
  if (Array.isArray(e)) return j;
  if (!e) return;
  let { type: t } = e;
  if (He.has(t)) return t;
}
var H = Co;
var ho = (e) => new Intl.ListFormat("en-US", { type: "disjunction" }).format(e);
function go(e) {
  let t = e === null ? "null" : typeof e;
  if (t !== "string" && t !== "object") return `Unexpected doc '${t}', 
Expected it to be 'string' or 'object'.`;
  if (H(e)) throw new Error("doc is valid.");
  let u = Object.prototype.toString.call(e);
  if (u !== "[object Object]") return `Unexpected doc '${u}'.`;
  let r = ho([...He].map((o) => `'${o}'`));
  return `Unexpected doc.type '${e.type}'.
Expected it to be ${r}.`;
}
var Vt = class extends Error {
  name = "InvalidDocError";
  constructor(t) {
    super(go(t)), this.doc = t;
  }
}, Z = Vt;
var Wu = {};
function yo(e, t, u, r) {
  let o = [e];
  for (; o.length > 0; ) {
    let n = o.pop();
    if (n === Wu) {
      u(o.pop());
      continue;
    }
    u && o.push(n, Wu);
    let a = H(n);
    if (!a) throw new Z(n);
    if (t?.(n) !== false) switch (a) {
      case j:
      case w: {
        let s = a === j ? n : n.parts;
        for (let i = s.length, D = i - 1; D >= 0; --D) o.push(s[D]);
        break;
      }
      case B:
        o.push(n.flatContents, n.breakContents);
        break;
      case x:
        if (r && n.expandedStates) for (let s = n.expandedStates.length, i = s - 1; i >= 0; --i) o.push(n.expandedStates[i]);
        else o.push(n.contents);
        break;
      case k:
      case I:
      case R:
      case O:
      case L:
        o.push(n.contents);
        break;
      case G2:
      case U:
      case v:
      case M:
      case _:
      case T:
        break;
      default:
        throw new Z(n);
    }
  }
}
var we = yo;
function Pe(e, t) {
  if (typeof e == "string") return t(e);
  let u = /* @__PURE__ */ new Map();
  return r(e);
  function r(n) {
    if (u.has(n)) return u.get(n);
    let a = o(n);
    return u.set(n, a), a;
  }
  function o(n) {
    switch (H(n)) {
      case j:
        return t(n.map(r));
      case w:
        return t({ ...n, parts: n.parts.map(r) });
      case B:
        return t({ ...n, breakContents: r(n.breakContents), flatContents: r(n.flatContents) });
      case x: {
        let { expandedStates: a, contents: s } = n;
        return a ? (a = a.map(r), s = a[0]) : s = r(s), t({ ...n, contents: s, expandedStates: a });
      }
      case k:
      case I:
      case R:
      case O:
      case L:
        return t({ ...n, contents: r(n.contents) });
      case G2:
      case U:
      case v:
      case M:
      case _:
      case T:
        return t(n);
      default:
        throw new Z(n);
    }
  }
}
function Xe(e, t, u) {
  let r = u, o = false;
  function n(a) {
    if (o) return false;
    let s = t(a);
    s !== void 0 && (o = true, r = s);
  }
  return we(e, n), r;
}
function bo(e) {
  if (e.type === x && e.break || e.type === _ && e.hard || e.type === T) return true;
}
function Ku(e) {
  return Xe(e, bo, false);
}
function $u(e) {
  if (e.length > 0) {
    let t = b(0, e, -1);
    !t.expandedStates && !t.break && (t.break = "propagated");
  }
  return null;
}
function Gu(e) {
  let t = /* @__PURE__ */ new Set(), u = [];
  function r(n) {
    if (n.type === T && $u(u), n.type === x) {
      if (u.push(n), t.has(n)) return false;
      t.add(n);
    }
  }
  function o(n) {
    n.type === x && u.pop().break && $u(u);
  }
  we(e, r, o, true);
}
function Ao(e) {
  return e.type === _ && !e.hard ? e.soft ? "" : " " : e.type === B ? e.flatContents : e;
}
function zu(e) {
  return Pe(e, Ao);
}
function Vu(e) {
  for (e = [...e]; e.length >= 2 && b(0, e, -2).type === _ && b(0, e, -1).type === T; ) e.length -= 2;
  if (e.length > 0) {
    let t = Oe(b(0, e, -1));
    e[e.length - 1] = t;
  }
  return e;
}
function Oe(e) {
  switch (H(e)) {
    case I:
    case R:
    case x:
    case L:
    case O: {
      let t = Oe(e.contents);
      return { ...e, contents: t };
    }
    case B:
      return { ...e, breakContents: Oe(e.breakContents), flatContents: Oe(e.flatContents) };
    case w:
      return { ...e, parts: Vu(e.parts) };
    case j:
      return Vu(e);
    case G2:
      return Uu(e);
    case k:
    case U:
    case v:
    case M:
    case _:
    case T:
      break;
    default:
      throw new Z(e);
  }
  return e;
}
function qe(e) {
  return Oe(xo(e));
}
function _o(e) {
  switch (H(e)) {
    case w:
      if (e.parts.every((t) => t === "")) return "";
      break;
    case x:
      if (!e.contents && !e.id && !e.break && !e.expandedStates) return "";
      if (e.contents.type === x && e.contents.id === e.id && e.contents.break === e.break && e.contents.expandedStates === e.expandedStates) return e.contents;
      break;
    case k:
    case I:
    case R:
    case L:
      if (!e.contents) return "";
      break;
    case B:
      if (!e.flatContents && !e.breakContents) return "";
      break;
    case j: {
      let t = [];
      for (let u of e) {
        if (!u) continue;
        let [r, ...o] = Array.isArray(u) ? u : [u];
        typeof r == "string" && typeof b(0, t, -1) == "string" ? t[t.length - 1] += r : t.push(r), t.push(...o);
      }
      return t.length === 0 ? "" : t.length === 1 ? t[0] : t;
    }
    case G2:
    case U:
    case v:
    case M:
    case _:
    case O:
    case T:
      break;
    default:
      throw new Z(e);
  }
  return e;
}
function xo(e) {
  return Pe(e, (t) => _o(t));
}
function Ju(e, t = Qe) {
  return Pe(e, (u) => typeof u == "string" ? Ie(t, u.split(`
`)) : u);
}
function Bo(e) {
  if (e.type === _) return true;
}
function Hu(e) {
  return Xe(e, Bo, false);
}
function Ee(e, t) {
  return e.type === O ? { ...e, contents: t(e.contents) } : t(e);
}
var Ze = P;
function ae(e) {
  return { type: I, contents: e };
}
function De(e, t) {
  return { type: k, contents: t, n: e };
}
function Qu(e) {
  return De(Number.NEGATIVE_INFINITY, e);
}
function et(e) {
  return De({ type: "root" }, e);
}
function Zu(e) {
  return De(-1, e);
}
function tt(e, t, u) {
  let r = e;
  if (t > 0) {
    for (let o = 0; o < Math.floor(t / u); ++o) r = ae(r);
    r = De(t % u, r), r = De(Number.NEGATIVE_INFINITY, r);
  }
  return r;
}
var ce = { type: T };
var ee2 = { type: U };
function er(e) {
  return { type: w, parts: e };
}
function Kt(e, t = {}) {
  return Ze(t.expandedStates), { type: x, id: t.id, contents: e, break: !!t.shouldBreak, expandedStates: t.expandedStates };
}
function tr(e, t) {
  return Kt(e[0], { ...t, expandedStates: e });
}
function ur(e, t = "", u = {}) {
  return { type: B, breakContents: e, flatContents: t, groupId: u.groupId };
}
function rr(e, t) {
  return { type: R, contents: e, groupId: t.groupId, negate: t.negate };
}
function Ie(e, t) {
  let u = [];
  for (let r = 0; r < t.length; r++) r !== 0 && u.push(e), u.push(t[r]);
  return u;
}
function nr(e, t) {
  return e ? { type: O, label: e, contents: t } : t;
}
var ut = { type: _ }, or = { type: _, soft: true }, ke = { type: _, hard: true }, V = [ke, ce], Gt = { type: _, hard: true, literal: true }, Qe = [Gt, ce];
function ve(e) {
  return { type: L, contents: e };
}
var ar = { type: M };
var ir = { type: v };
function te2(e) {
  if (!e) return "";
  if (Array.isArray(e)) {
    let t = [];
    for (let u of e) if (Array.isArray(u)) t.push(...te2(u));
    else {
      let r = te2(u);
      r !== "" && t.push(r);
    }
    return t;
  }
  return e.type === B ? { ...e, breakContents: te2(e.breakContents), flatContents: te2(e.flatContents) } : e.type === x ? { ...e, contents: te2(e.contents), expandedStates: e.expandedStates?.map(te2) } : e.type === w ? { type: "fill", parts: e.parts.map(te2) } : e.contents ? { ...e, contents: te2(e.contents) } : e;
}
function sr(e) {
  let t = /* @__PURE__ */ Object.create(null), u = /* @__PURE__ */ new Set();
  return r(te2(e));
  function r(n, a, s) {
    if (typeof n == "string") return JSON.stringify(n);
    if (Array.isArray(n)) {
      let i = n.map(r).filter(Boolean);
      return i.length === 1 ? i[0] : `[${i.join(", ")}]`;
    }
    if (n.type === _) {
      let i = s?.[a + 1]?.type === T;
      return n.literal ? i ? "literalline" : "literallineWithoutBreakParent" : n.hard ? i ? "hardline" : "hardlineWithoutBreakParent" : n.soft ? "softline" : "line";
    }
    if (n.type === T) return s?.[a - 1]?.type === _ && s[a - 1].hard ? void 0 : "breakParent";
    if (n.type === v) return "trim";
    if (n.type === I) return "indent(" + r(n.contents) + ")";
    if (n.type === k) return n.n === Number.NEGATIVE_INFINITY ? "dedentToRoot(" + r(n.contents) + ")" : n.n < 0 ? "dedent(" + r(n.contents) + ")" : n.n.type === "root" ? "markAsRoot(" + r(n.contents) + ")" : "align(" + JSON.stringify(n.n) + ", " + r(n.contents) + ")";
    if (n.type === B) return "ifBreak(" + r(n.breakContents) + (n.flatContents ? ", " + r(n.flatContents) : "") + (n.groupId ? (n.flatContents ? "" : ', ""') + `, { groupId: ${o(n.groupId)} }` : "") + ")";
    if (n.type === R) {
      let i = [];
      n.negate && i.push("negate: true"), n.groupId && i.push(`groupId: ${o(n.groupId)}`);
      let D = i.length > 0 ? `, { ${i.join(", ")} }` : "";
      return `indentIfBreak(${r(n.contents)}${D})`;
    }
    if (n.type === x) {
      let i = [];
      n.break && n.break !== "propagated" && i.push("shouldBreak: true"), n.id && i.push(`id: ${o(n.id)}`);
      let D = i.length > 0 ? `, { ${i.join(", ")} }` : "";
      return n.expandedStates ? `conditionalGroup([${n.expandedStates.map((f2) => r(f2)).join(",")}]${D})` : `group(${r(n.contents)}${D})`;
    }
    if (n.type === w) return `fill([${n.parts.map((i) => r(i)).join(", ")}])`;
    if (n.type === L) return "lineSuffix(" + r(n.contents) + ")";
    if (n.type === M) return "lineSuffixBoundary";
    if (n.type === O) return `label(${JSON.stringify(n.label)}, ${r(n.contents)})`;
    if (n.type === U) return "cursor";
    throw new Error("Unknown doc type " + n.type);
  }
  function o(n) {
    if (typeof n != "symbol") return JSON.stringify(String(n));
    if (n in t) return t[n];
    let a = n.description || "symbol";
    for (let s = 0; ; s++) {
      let i = a + (s > 0 ? ` #${s}` : "");
      if (!u.has(i)) return u.add(i), t[n] = `Symbol.for(${JSON.stringify(i)})`;
    }
  }
}
var Dr = () => /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26D3\uFE0F?(?:\u200D\uD83D\uDCA5)?|\u26F9(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF43\uDF45-\uDF4A\uDF4C-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDF44(?:\u200D\uD83D\uDFEB)?|\uDF4B(?:\u200D\uD83D\uDFE9)?|\uDFC3(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E-\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4\uDEB5](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE41\uDE43\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED8\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC08(?:\u200D\u2B1B)?|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC26(?:\u200D(?:\u2B1B|\uD83D\uDD25))?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])))?))?|\uDD75(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?|\uDE42(?:\u200D[\u2194\u2195]\uFE0F?)?|\uDEB6(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3C-\uDD3E\uDDB8\uDDB9\uDDCD\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE8A\uDE8E-\uDEC2\uDEC6\uDEC8\uDECD-\uDEDC\uDEDF-\uDEEA\uDEEF]|\uDDCE(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1|\uDDD1\u200D\uD83E\uDDD2(?:\u200D\uD83E\uDDD2)?|\uDDD2(?:\u200D\uD83E\uDDD2)?))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g;
function zt(e) {
  return e === 12288 || e >= 65281 && e <= 65376 || e >= 65504 && e <= 65510;
}
function Jt(e) {
  return e >= 4352 && e <= 4447 || e === 8986 || e === 8987 || e === 9001 || e === 9002 || e >= 9193 && e <= 9196 || e === 9200 || e === 9203 || e === 9725 || e === 9726 || e === 9748 || e === 9749 || e >= 9776 && e <= 9783 || e >= 9800 && e <= 9811 || e === 9855 || e >= 9866 && e <= 9871 || e === 9875 || e === 9889 || e === 9898 || e === 9899 || e === 9917 || e === 9918 || e === 9924 || e === 9925 || e === 9934 || e === 9940 || e === 9962 || e === 9970 || e === 9971 || e === 9973 || e === 9978 || e === 9981 || e === 9989 || e === 9994 || e === 9995 || e === 10024 || e === 10060 || e === 10062 || e >= 10067 && e <= 10069 || e === 10071 || e >= 10133 && e <= 10135 || e === 10160 || e === 10175 || e === 11035 || e === 11036 || e === 11088 || e === 11093 || e >= 11904 && e <= 11929 || e >= 11931 && e <= 12019 || e >= 12032 && e <= 12245 || e >= 12272 && e <= 12287 || e >= 12289 && e <= 12350 || e >= 12353 && e <= 12438 || e >= 12441 && e <= 12543 || e >= 12549 && e <= 12591 || e >= 12593 && e <= 12686 || e >= 12688 && e <= 12773 || e >= 12783 && e <= 12830 || e >= 12832 && e <= 12871 || e >= 12880 && e <= 42124 || e >= 42128 && e <= 42182 || e >= 43360 && e <= 43388 || e >= 44032 && e <= 55203 || e >= 63744 && e <= 64255 || e >= 65040 && e <= 65049 || e >= 65072 && e <= 65106 || e >= 65108 && e <= 65126 || e >= 65128 && e <= 65131 || e >= 94176 && e <= 94180 || e >= 94192 && e <= 94198 || e >= 94208 && e <= 101589 || e >= 101631 && e <= 101662 || e >= 101760 && e <= 101874 || e >= 110576 && e <= 110579 || e >= 110581 && e <= 110587 || e === 110589 || e === 110590 || e >= 110592 && e <= 110882 || e === 110898 || e >= 110928 && e <= 110930 || e === 110933 || e >= 110948 && e <= 110951 || e >= 110960 && e <= 111355 || e >= 119552 && e <= 119638 || e >= 119648 && e <= 119670 || e === 126980 || e === 127183 || e === 127374 || e >= 127377 && e <= 127386 || e >= 127488 && e <= 127490 || e >= 127504 && e <= 127547 || e >= 127552 && e <= 127560 || e === 127568 || e === 127569 || e >= 127584 && e <= 127589 || e >= 127744 && e <= 127776 || e >= 127789 && e <= 127797 || e >= 127799 && e <= 127868 || e >= 127870 && e <= 127891 || e >= 127904 && e <= 127946 || e >= 127951 && e <= 127955 || e >= 127968 && e <= 127984 || e === 127988 || e >= 127992 && e <= 128062 || e === 128064 || e >= 128066 && e <= 128252 || e >= 128255 && e <= 128317 || e >= 128331 && e <= 128334 || e >= 128336 && e <= 128359 || e === 128378 || e === 128405 || e === 128406 || e === 128420 || e >= 128507 && e <= 128591 || e >= 128640 && e <= 128709 || e === 128716 || e >= 128720 && e <= 128722 || e >= 128725 && e <= 128728 || e >= 128732 && e <= 128735 || e === 128747 || e === 128748 || e >= 128756 && e <= 128764 || e >= 128992 && e <= 129003 || e === 129008 || e >= 129292 && e <= 129338 || e >= 129340 && e <= 129349 || e >= 129351 && e <= 129535 || e >= 129648 && e <= 129660 || e >= 129664 && e <= 129674 || e >= 129678 && e <= 129734 || e === 129736 || e >= 129741 && e <= 129756 || e >= 129759 && e <= 129770 || e >= 129775 && e <= 129784 || e >= 131072 && e <= 196605 || e >= 196608 && e <= 262141;
}
var cr = "©®‼⁉™ℹ↔↕↖↗↘↙↩↪⌨⏏⏱⏲⏸⏹⏺▪▫▶◀◻◼☀☁☂☃☄☎☑☘☝☠☢☣☦☪☮☯☸☹☺♀♂♟♠♣♥♦♨♻♾⚒⚔⚕⚖⚗⚙⚛⚜⚠⚧⚰⚱⛈⛏⛑⛓⛩⛱⛷⛸⛹✂✈✉✌✍✏✒✔✖✝✡✳✴❄❇❣❤➡⤴⤵⬅⬆⬇";
var To = /[^\x20-\x7F]/u, No = new Set(cr);
function So(e) {
  if (!e) return 0;
  if (!To.test(e)) return e.length;
  e = e.replace(Dr(), (u) => No.has(u) ? " " : "  ");
  let t = 0;
  for (let u of e) {
    let r = u.codePointAt(0);
    r <= 31 || r >= 127 && r <= 159 || r >= 768 && r <= 879 || r >= 65024 && r <= 65039 || (t += zt(r) || Jt(r) ? 2 : 1);
  }
  return t;
}
var Re = So;
var wo = { type: 0 }, Oo = { type: 1 }, Ht = { value: "", length: 0, queue: [], get root() {
  return Ht;
} };
function fr2(e, t, u) {
  let r = t.type === 1 ? e.queue.slice(0, -1) : [...e.queue, t], o = "", n = 0, a = 0, s = 0;
  for (let p of r) switch (p.type) {
    case 0:
      f2(), u.useTabs ? i(1) : D(u.tabWidth);
      break;
    case 3: {
      let { string: F2 } = p;
      f2(), o += F2, n += F2.length;
      break;
    }
    case 2: {
      let { width: F2 } = p;
      a += 1, s += F2;
      break;
    }
    default:
      throw new Error(`Unexpected indent comment '${p.type}'.`);
  }
  return d(), { ...e, value: o, length: n, queue: r };
  function i(p) {
    o += "	".repeat(p), n += u.tabWidth * p;
  }
  function D(p) {
    o += " ".repeat(p), n += p;
  }
  function f2() {
    u.useTabs ? l2() : d();
  }
  function l2() {
    a > 0 && i(a), c();
  }
  function d() {
    s > 0 && D(s), c();
  }
  function c() {
    a = 0, s = 0;
  }
}
function lr(e, t, u) {
  if (!t) return e;
  if (t.type === "root") return { ...e, root: e };
  if (t === Number.NEGATIVE_INFINITY) return e.root;
  let r;
  return typeof t == "number" ? t < 0 ? r = Oo : r = { type: 2, width: t } : r = { type: 3, string: t }, fr2(e, r, u);
}
function dr(e, t) {
  return fr2(e, wo, t);
}
function Po(e) {
  let t = 0;
  for (let u = e.length - 1; u >= 0; u--) {
    let r = e[u];
    if (r === " " || r === "	") t++;
    else break;
  }
  return t;
}
function Xt(e) {
  let t = Po(e);
  return { text: t === 0 ? e : e.slice(0, e.length - t), count: t };
}
var W = /* @__PURE__ */ Symbol("MODE_BREAK"), q = /* @__PURE__ */ Symbol("MODE_FLAT"), qt = /* @__PURE__ */ Symbol("DOC_FILL_PRINTED_LENGTH");
function rt(e, t, u, r, o, n) {
  if (u === Number.POSITIVE_INFINITY) return true;
  let a = t.length, s = false, i = [e], D = "";
  for (; u >= 0; ) {
    if (i.length === 0) {
      if (a === 0) return true;
      i.push(t[--a]);
      continue;
    }
    let { mode: f2, doc: l2 } = i.pop(), d = H(l2);
    switch (d) {
      case G2:
        l2 && (s && (D += " ", u -= 1, s = false), D += l2, u -= Re(l2));
        break;
      case j:
      case w: {
        let c = d === j ? l2 : l2.parts, p = l2[qt] ?? 0;
        for (let F2 = c.length - 1; F2 >= p; F2--) i.push({ mode: f2, doc: c[F2] });
        break;
      }
      case I:
      case k:
      case R:
      case O:
        i.push({ mode: f2, doc: l2.contents });
        break;
      case v: {
        let { text: c, count: p } = Xt(D);
        D = c, u += p;
        break;
      }
      case x: {
        if (n && l2.break) return false;
        let c = l2.break ? W : f2, p = l2.expandedStates && c === W ? b(0, l2.expandedStates, -1) : l2.contents;
        i.push({ mode: c, doc: p });
        break;
      }
      case B: {
        let p = (l2.groupId ? o[l2.groupId] || q : f2) === W ? l2.breakContents : l2.flatContents;
        p && i.push({ mode: f2, doc: p });
        break;
      }
      case _:
        if (f2 === W || l2.hard) return true;
        l2.soft || (s = true);
        break;
      case L:
        r = true;
        break;
      case M:
        if (r) return false;
        break;
    }
  }
  return false;
}
function Ce(e, t) {
  let u = /* @__PURE__ */ Object.create(null), r = t.printWidth, o = Se(t.endOfLine), n = 0, a = [{ indent: Ht, mode: W, doc: e }], s = "", i = false, D = [], f2 = [], l2 = [], d = [], c = 0;
  for (Gu(e); a.length > 0; ) {
    let { indent: m, mode: h2, doc: E2 } = a.pop();
    switch (H(E2)) {
      case G2: {
        let g = o !== `
` ? oe(0, E2, `
`, o) : E2;
        g && (s += g, a.length > 0 && (n += Re(g)));
        break;
      }
      case j:
        for (let g = E2.length - 1; g >= 0; g--) a.push({ indent: m, mode: h2, doc: E2[g] });
        break;
      case U:
        if (f2.length >= 2) throw new Error("There are too many 'cursor' in doc.");
        f2.push(c + s.length);
        break;
      case I:
        a.push({ indent: dr(m, t), mode: h2, doc: E2.contents });
        break;
      case k:
        a.push({ indent: lr(m, E2.n, t), mode: h2, doc: E2.contents });
        break;
      case v:
        y2();
        break;
      case x:
        switch (h2) {
          case q:
            if (!i) {
              a.push({ indent: m, mode: E2.break ? W : q, doc: E2.contents });
              break;
            }
          case W: {
            i = false;
            let g = { indent: m, mode: q, doc: E2.contents }, A2 = r - n, J2 = D.length > 0;
            if (!E2.break && rt(g, a, A2, J2, u)) a.push(g);
            else if (E2.expandedStates) {
              let Q = b(0, E2.expandedStates, -1);
              if (E2.break) {
                a.push({ indent: m, mode: W, doc: Q });
                break;
              } else for (let re2 = 1; re2 < E2.expandedStates.length + 1; re2++) if (re2 >= E2.expandedStates.length) {
                a.push({ indent: m, mode: W, doc: Q });
                break;
              } else {
                let Te2 = E2.expandedStates[re2], ne = { indent: m, mode: q, doc: Te2 };
                if (rt(ne, a, A2, J2, u)) {
                  a.push(ne);
                  break;
                }
              }
            } else a.push({ indent: m, mode: W, doc: E2.contents });
            break;
          }
        }
        E2.id && (u[E2.id] = b(0, a, -1).mode);
        break;
      case w: {
        let g = r - n, A2 = E2[qt] ?? 0, { parts: J2 } = E2, Q = J2.length - A2;
        if (Q === 0) break;
        let re2 = J2[A2 + 0], Te2 = J2[A2 + 1], ne = { indent: m, mode: q, doc: re2 }, vt2 = { indent: m, mode: W, doc: re2 }, Rt2 = rt(ne, [], g, D.length > 0, u, true);
        if (Q === 1) {
          Rt2 ? a.push(ne) : a.push(vt2);
          break;
        }
        let Iu = { indent: m, mode: q, doc: Te2 }, Lt2 = { indent: m, mode: W, doc: Te2 };
        if (Q === 2) {
          Rt2 ? a.push(Iu, ne) : a.push(Lt2, vt2);
          break;
        }
        let Xn2 = J2[A2 + 2], qn2 = { indent: m, mode: h2, doc: { ...E2, [qt]: A2 + 2 } }, Qn2 = rt({ indent: m, mode: q, doc: [re2, Te2, Xn2] }, [], g, D.length > 0, u, true);
        a.push(qn2), Qn2 ? a.push(Iu, ne) : Rt2 ? a.push(Lt2, ne) : a.push(Lt2, vt2);
        break;
      }
      case B:
      case R: {
        let g = E2.groupId ? u[E2.groupId] : h2;
        if (g === W) {
          let A2 = E2.type === B ? E2.breakContents : E2.negate ? E2.contents : ae(E2.contents);
          A2 && a.push({ indent: m, mode: h2, doc: A2 });
        }
        if (g === q) {
          let A2 = E2.type === B ? E2.flatContents : E2.negate ? ae(E2.contents) : E2.contents;
          A2 && a.push({ indent: m, mode: h2, doc: A2 });
        }
        break;
      }
      case L:
        D.push({ indent: m, mode: h2, doc: E2.contents });
        break;
      case M:
        D.length > 0 && a.push({ indent: m, mode: h2, doc: ke });
        break;
      case _:
        switch (h2) {
          case q:
            if (E2.hard) i = true;
            else {
              E2.soft || (s += " ", n += 1);
              break;
            }
          case W:
            if (D.length > 0) {
              a.push({ indent: m, mode: h2, doc: E2 }, ...D.reverse()), D.length = 0;
              break;
            }
            E2.literal ? (s += o, n = 0, m.root && (m.root.value && (s += m.root.value), n = m.root.length)) : (y2(), s += o + m.value, n = m.length);
            break;
        }
        break;
      case O:
        a.push({ indent: m, mode: h2, doc: E2.contents });
        break;
      case T:
        break;
      default:
        throw new Z(E2);
    }
    a.length === 0 && D.length > 0 && (a.push(...D.reverse()), D.length = 0);
  }
  let p = l2.join("") + s, F2 = [...d, ...f2];
  if (F2.length !== 2) return { formatted: p };
  let C2 = F2[0];
  return { formatted: p, cursorNodeStart: C2, cursorNodeText: p.slice(C2, b(0, F2, -1)) };
  function y2() {
    let { text: m, count: h2 } = Xt(s);
    m && (l2.push(m), c += m.length), s = "", n -= h2, f2.length > 0 && (d.push(...f2.map((E2) => Math.min(E2, c))), f2.length = 0);
  }
}
function Io(e, t, u = 0) {
  let r = 0;
  for (let o = u; o < e.length; ++o) e[o] === "	" ? r = r + t - r % t : r++;
  return r;
}
var he = Io;
var Qt = class {
  constructor(t) {
    this.stack = [t];
  }
  get key() {
    let { stack: t, siblings: u } = this;
    return b(0, t, u === null ? -2 : -4) ?? null;
  }
  get index() {
    return this.siblings === null ? null : b(0, this.stack, -2);
  }
  get node() {
    return b(0, this.stack, -1);
  }
  get parent() {
    return this.getNode(1);
  }
  get grandparent() {
    return this.getNode(2);
  }
  get isInArray() {
    return this.siblings !== null;
  }
  get siblings() {
    let { stack: t } = this, u = b(0, t, -3);
    return Array.isArray(u) ? u : null;
  }
  get next() {
    let { siblings: t } = this;
    return t === null ? null : t[this.index + 1];
  }
  get previous() {
    let { siblings: t } = this;
    return t === null ? null : t[this.index - 1];
  }
  get isFirst() {
    return this.index === 0;
  }
  get isLast() {
    let { siblings: t, index: u } = this;
    return t !== null && u === t.length - 1;
  }
  get isRoot() {
    return this.stack.length === 1;
  }
  get root() {
    return this.stack[0];
  }
  get ancestors() {
    return [...this.#e()];
  }
  getName() {
    let { stack: t } = this, { length: u } = t;
    return u > 1 ? b(0, t, -2) : null;
  }
  getValue() {
    return b(0, this.stack, -1);
  }
  getNode(t = 0) {
    let u = this.#t(t);
    return u === -1 ? null : this.stack[u];
  }
  getParentNode(t = 0) {
    return this.getNode(t + 1);
  }
  #t(t) {
    let { stack: u } = this;
    for (let r = u.length - 1; r >= 0; r -= 2) if (!Array.isArray(u[r]) && --t < 0) return r;
    return -1;
  }
  call(t, ...u) {
    let { stack: r } = this, { length: o } = r, n = b(0, r, -1);
    for (let a of u) n = n?.[a], r.push(a, n);
    try {
      return t(this);
    } finally {
      r.length = o;
    }
  }
  callParent(t, u = 0) {
    let r = this.#t(u + 1), o = this.stack.splice(r + 1);
    try {
      return t(this);
    } finally {
      this.stack.push(...o);
    }
  }
  each(t, ...u) {
    let { stack: r } = this, { length: o } = r, n = b(0, r, -1);
    for (let a of u) n = n[a], r.push(a, n);
    try {
      for (let a = 0; a < n.length; ++a) r.push(a, n[a]), t(this, a, n), r.length -= 2;
    } finally {
      r.length = o;
    }
  }
  map(t, ...u) {
    let r = [];
    return this.each((o, n, a) => {
      r[n] = t(o, n, a);
    }, ...u), r;
  }
  match(...t) {
    let u = this.stack.length - 1, r = null, o = this.stack[u--];
    for (let n of t) {
      if (o === void 0) return false;
      let a = null;
      if (typeof r == "number" && (a = r, r = this.stack[u--], o = this.stack[u--]), n && !n(o, r, a)) return false;
      r = this.stack[u--], o = this.stack[u--];
    }
    return true;
  }
  findAncestor(t) {
    for (let u of this.#e()) if (t(u)) return u;
  }
  hasAncestor(t) {
    for (let u of this.#e()) if (t(u)) return true;
    return false;
  }
  *#e() {
    let { stack: t } = this;
    for (let u = t.length - 3; u >= 0; u -= 2) {
      let r = t[u];
      Array.isArray(r) || (yield r);
    }
  }
}, pr = Qt;
function ko(e) {
  return e !== null && typeof e == "object";
}
var ge2 = ko;
function ye(e) {
  return (t, u, r) => {
    let o = !!r?.backwards;
    if (u === false) return false;
    let { length: n } = t, a = u;
    for (; a >= 0 && a < n; ) {
      let s = t.charAt(a);
      if (e instanceof RegExp) {
        if (!e.test(s)) return a;
      } else if (!e.includes(s)) return a;
      o ? a-- : a++;
    }
    return a === -1 || a === n ? a : false;
  };
}
var Fr = ye(/\s/u), Y = ye(" 	"), nt2 = ye(",; 	"), ot = ye(/[^\n\r]/u);
var mr2 = (e) => e === `
` || e === "\r" || e === "\u2028" || e === "\u2029";
function vo(e, t, u) {
  let r = !!u?.backwards;
  if (t === false) return false;
  let o = e.charAt(t);
  if (r) {
    if (e.charAt(t - 1) === "\r" && o === `
`) return t - 2;
    if (mr2(o)) return t - 1;
  } else {
    if (o === "\r" && e.charAt(t + 1) === `
`) return t + 2;
    if (mr2(o)) return t + 1;
  }
  return t;
}
var K = vo;
function Ro(e, t, u = {}) {
  let r = Y(e, u.backwards ? t - 1 : t, u), o = K(e, r, u);
  return r !== o;
}
var z = Ro;
function Lo(e) {
  return Array.isArray(e) && e.length > 0;
}
var Er2 = Lo;
function* be(e, t) {
  let { getVisitorKeys: u, filter: r = () => true } = t, o = (n) => ge2(n) && r(n);
  for (let n of u(e)) {
    let a = e[n];
    if (Array.isArray(a)) for (let s of a) o(s) && (yield s);
    else o(a) && (yield a);
  }
}
function* Cr(e, t) {
  let u = [e];
  for (let r = 0; r < u.length; r++) {
    let o = u[r];
    for (let n of be(o, t)) yield n, u.push(n);
  }
}
function hr2(e, t) {
  return be(e, t).next().done;
}
function gr(e, t, u) {
  let { cache: r } = u;
  if (r.has(e)) return r.get(e);
  let { filter: o } = u;
  if (!o) return [];
  let n, a = (u.getChildren?.(e, u) ?? [...be(e, { getVisitorKeys: u.getVisitorKeys })]).flatMap((D) => (n ?? (n = [e, ...t]), o(D, n) ? [D] : gr(D, n, u))), { locStart: s, locEnd: i } = u;
  return a.sort((D, f2) => s(D) - s(f2) || i(D) - i(f2)), r.set(e, a), a;
}
var at = gr;
function Mo(e) {
  let t = e.type || e.kind || "(unknown type)", u = String(e.name || e.id && (typeof e.id == "object" ? e.id.name : e.id) || e.key && (typeof e.key == "object" ? e.key.name : e.key) || e.value && (typeof e.value == "object" ? "" : String(e.value)) || e.operator || "");
  return u.length > 20 && (u = u.slice(0, 19) + "…"), t + (u ? " " + u : "");
}
function Zt(e, t) {
  (e.comments ?? (e.comments = [])).push(t), t.printed = false, t.nodeDescription = Mo(e);
}
function fe(e, t) {
  t.leading = true, t.trailing = false, Zt(e, t);
}
function ue(e, t, u) {
  t.leading = false, t.trailing = false, u && (t.marker = u), Zt(e, t);
}
function le(e, t) {
  t.leading = false, t.trailing = true, Zt(e, t);
}
var uu = /* @__PURE__ */ new WeakMap();
function br(e, t, u, r, o = []) {
  let { locStart: n, locEnd: a } = u, s = n(t), i = a(t), D = at(e, o, { cache: uu, locStart: n, locEnd: a, getVisitorKeys: u.getVisitorKeys, filter: u.printer.canAttachComment, getChildren: u.printer.getCommentChildNodes }), f2, l2, d = 0, c = D.length;
  for (; d < c; ) {
    let p = d + c >> 1, F2 = D[p], C2 = n(F2), y2 = a(F2);
    if (C2 <= s && i <= y2) return br(F2, t, u, F2, [F2, ...o]);
    if (y2 <= s) {
      f2 = F2, d = p + 1;
      continue;
    }
    if (i <= C2) {
      l2 = F2, c = p;
      continue;
    }
    throw new Error("Comment location overlaps with node location");
  }
  if (r?.type === "TemplateLiteral") {
    let { quasis: p } = r, F2 = tu(p, t, u);
    f2 && tu(p, f2, u) !== F2 && (f2 = null), l2 && tu(p, l2, u) !== F2 && (l2 = null);
  }
  return { enclosingNode: r, precedingNode: f2, followingNode: l2 };
}
var eu = () => false;
function Ar(e, t) {
  let { comments: u } = e;
  if (delete e.comments, !Er2(u) || !t.printer.canAttachComment) return;
  let r = [], { printer: { features: { experimental_avoidAstMutation: o }, handleComments: n = {} }, originalText: a } = t, { ownLine: s = eu, endOfLine: i = eu, remaining: D = eu } = n, f2 = u.map((l2, d) => ({ ...br(e, l2, t), comment: l2, text: a, options: t, ast: e, isLastComment: u.length - 1 === d }));
  for (let [l2, d] of f2.entries()) {
    let { comment: c, precedingNode: p, enclosingNode: F2, followingNode: C2, text: y2, options: m, ast: h2, isLastComment: E2 } = d, g;
    if (o ? g = [d] : (c.enclosingNode = F2, c.precedingNode = p, c.followingNode = C2, g = [c, y2, m, h2, E2]), Yo(y2, m, f2, l2)) c.placement = "ownLine", s(...g) || (C2 ? fe(C2, c) : p ? le(p, c) : F2 ? ue(F2, c) : ue(h2, c));
    else if (jo(y2, m, f2, l2)) c.placement = "endOfLine", i(...g) || (p ? le(p, c) : C2 ? fe(C2, c) : F2 ? ue(F2, c) : ue(h2, c));
    else if (c.placement = "remaining", !D(...g)) if (p && C2) {
      let A2 = r.length;
      A2 > 0 && r[A2 - 1].followingNode !== C2 && yr(r, m), r.push(d);
    } else p ? le(p, c) : C2 ? fe(C2, c) : F2 ? ue(F2, c) : ue(h2, c);
  }
  if (yr(r, t), !o) for (let l2 of u) delete l2.precedingNode, delete l2.enclosingNode, delete l2.followingNode;
}
var _r2 = (e) => !/[\S\n\u2028\u2029]/u.test(e);
function Yo(e, t, u, r) {
  let { comment: o, precedingNode: n } = u[r], { locStart: a, locEnd: s } = t, i = a(o);
  if (n) for (let D = r - 1; D >= 0; D--) {
    let { comment: f2, precedingNode: l2 } = u[D];
    if (l2 !== n || !_r2(e.slice(s(f2), i))) break;
    i = a(f2);
  }
  return z(e, i, { backwards: true });
}
function jo(e, t, u, r) {
  let { comment: o, followingNode: n } = u[r], { locStart: a, locEnd: s } = t, i = s(o);
  if (n) for (let D = r + 1; D < u.length; D++) {
    let { comment: f2, followingNode: l2 } = u[D];
    if (l2 !== n || !_r2(e.slice(i, a(f2)))) break;
    i = s(f2);
  }
  return z(e, i);
}
function yr(e, t) {
  let u = e.length;
  if (u === 0) return;
  let { precedingNode: r, followingNode: o } = e[0], n = t.locStart(o), a;
  for (a = u; a > 0; --a) {
    let { comment: s, precedingNode: i, followingNode: D } = e[a - 1];
    let f2 = t.originalText.slice(t.locEnd(s), n);
    if (t.printer.isGap?.(f2, t) ?? /^[\s(]*$/u.test(f2)) n = t.locStart(s);
    else break;
  }
  for (let [s, { comment: i }] of e.entries()) s < a ? le(r, i) : fe(o, i);
  for (let s of [r, o]) s.comments && s.comments.length > 1 && s.comments.sort((i, D) => t.locStart(i) - t.locStart(D));
  e.length = 0;
}
function tu(e, t, u) {
  let r = u.locStart(t) - 1;
  for (let o = 1; o < e.length; ++o) if (r < u.locStart(e[o])) return o - 1;
  return 0;
}
function Uo(e, t) {
  let u = t - 1;
  u = Y(e, u, { backwards: true }), u = K(e, u, { backwards: true }), u = Y(e, u, { backwards: true });
  let r = K(e, u, { backwards: true });
  return u !== r;
}
var Le = Uo;
function xr(e, t) {
  let u = e.node;
  return u.printed = true, t.printer.printComment(e, t);
}
function Wo(e, t) {
  let u = e.node, r = [xr(e, t)], { printer: o, originalText: n, locStart: a, locEnd: s } = t;
  if (o.isBlockComment?.(u)) {
    let f2 = z(n, s(u)) ? z(n, a(u), { backwards: true }) ? V : ut : " ";
    r.push(f2);
  } else r.push(V);
  let D = K(n, Y(n, s(u)));
  return D !== false && z(n, D) && r.push(V), r;
}
function $o(e, t, u) {
  let r = e.node, o = xr(e, t), { printer: n, originalText: a, locStart: s } = t, i = n.isBlockComment?.(r);
  if (u?.hasLineSuffix && !u?.isBlock || z(a, s(r), { backwards: true })) {
    let D = Le(a, s(r));
    return { doc: ve([V, D ? V : "", o]), isBlock: i, hasLineSuffix: true };
  }
  return !i || u?.hasLineSuffix ? { doc: [ve([" ", o]), ce], isBlock: i, hasLineSuffix: true } : { doc: [" ", o], isBlock: i, hasLineSuffix: false };
}
function Vo(e, t) {
  let u = e.node;
  if (!u) return {};
  let r = t[/* @__PURE__ */ Symbol.for("printedComments")];
  if ((u.comments || []).filter((i) => !r.has(i)).length === 0) return { leading: "", trailing: "" };
  let n = [], a = [], s;
  return e.each(() => {
    let i = e.node;
    if (r?.has(i)) return;
    let { leading: D, trailing: f2 } = i;
    D ? n.push(Wo(e, t)) : f2 && (s = $o(e, t, s), a.push(s.doc));
  }, "comments"), { leading: n, trailing: a };
}
function Br(e, t, u) {
  let { leading: r, trailing: o } = Vo(e, u);
  return !r && !o ? t : Ee(t, (n) => [r, n, o]);
}
function Tr(e) {
  let { [/* @__PURE__ */ Symbol.for("comments")]: t, [/* @__PURE__ */ Symbol.for("printedComments")]: u } = e;
  for (let r of t) {
    if (!r.printed && !u.has(r)) throw new Error('Comment "' + r.value.trim() + '" was not printed. Please report this error!');
    delete r.printed;
  }
}
var Me = class extends Error {
  name = "ConfigError";
}, Ye = class extends Error {
  name = "UndefinedParserError";
};
var Sr2 = { checkIgnorePragma: { category: "Special", type: "boolean", default: false, description: "Check whether the file's first docblock comment contains '@noprettier' or '@noformat' to determine if it should be formatted.", cliCategory: "Other" }, cursorOffset: { category: "Special", type: "int", default: -1, range: { start: -1, end: 1 / 0, step: 1 }, description: "Print (to stderr) where a cursor at the given position would move to after formatting.", cliCategory: "Editor" }, endOfLine: { category: "Global", type: "choice", default: "lf", description: "Which end of line characters to apply.", choices: [{ value: "lf", description: "Line Feed only (\\n), common on Linux and macOS as well as inside git repos" }, { value: "crlf", description: "Carriage Return + Line Feed characters (\\r\\n), common on Windows" }, { value: "cr", description: "Carriage Return character only (\\r), used very rarely" }, { value: "auto", description: `Maintain existing
(mixed values within one file are normalised by looking at what's used after the first line)` }] }, filepath: { category: "Special", type: "path", description: "Specify the input filepath. This will be used to do parser inference.", cliName: "stdin-filepath", cliCategory: "Other", cliDescription: "Path to the file to pretend that stdin comes from." }, insertPragma: { category: "Special", type: "boolean", default: false, description: "Insert @format pragma into file's first docblock comment.", cliCategory: "Other" }, parser: { category: "Global", type: "choice", default: void 0, description: "Which parser to use.", exception: (e) => typeof e == "string" || typeof e == "function", choices: [{ value: "flow", description: "Flow" }, { value: "babel", description: "JavaScript" }, { value: "babel-flow", description: "Flow" }, { value: "babel-ts", description: "TypeScript" }, { value: "typescript", description: "TypeScript" }, { value: "acorn", description: "JavaScript" }, { value: "espree", description: "JavaScript" }, { value: "meriyah", description: "JavaScript" }, { value: "css", description: "CSS" }, { value: "less", description: "Less" }, { value: "scss", description: "SCSS" }, { value: "json", description: "JSON" }, { value: "json5", description: "JSON5" }, { value: "jsonc", description: "JSON with Comments" }, { value: "json-stringify", description: "JSON.stringify" }, { value: "graphql", description: "GraphQL" }, { value: "markdown", description: "Markdown" }, { value: "mdx", description: "MDX" }, { value: "vue", description: "Vue" }, { value: "yaml", description: "YAML" }, { value: "glimmer", description: "Ember / Handlebars" }, { value: "html", description: "HTML" }, { value: "angular", description: "Angular" }, { value: "lwc", description: "Lightning Web Components" }, { value: "mjml", description: "MJML" }] }, plugins: { type: "path", array: true, default: [{ value: [] }], category: "Global", description: "Add a plugin. Multiple plugins can be passed as separate `--plugin`s.", exception: (e) => typeof e == "string" || typeof e == "object", cliName: "plugin", cliCategory: "Config" }, printWidth: { category: "Global", type: "int", default: 80, description: "The line length where Prettier will try wrap.", range: { start: 0, end: 1 / 0, step: 1 } }, rangeEnd: { category: "Special", type: "int", default: 1 / 0, range: { start: 0, end: 1 / 0, step: 1 }, description: `Format code ending at a given character offset (exclusive).
The range will extend forwards to the end of the selected statement.`, cliCategory: "Editor" }, rangeStart: { category: "Special", type: "int", default: 0, range: { start: 0, end: 1 / 0, step: 1 }, description: `Format code starting at a given character offset.
The range will extend backwards to the start of the first line containing the selected statement.`, cliCategory: "Editor" }, requirePragma: { category: "Special", type: "boolean", default: false, description: "Require either '@prettier' or '@format' to be present in the file's first docblock comment in order for it to be formatted.", cliCategory: "Other" }, tabWidth: { type: "int", category: "Global", default: 2, description: "Number of spaces per indentation level.", range: { start: 0, end: 1 / 0, step: 1 } }, useTabs: { category: "Global", type: "boolean", default: false, description: "Indent with tabs instead of spaces." }, embeddedLanguageFormatting: { category: "Global", type: "choice", default: "auto", description: "Control how Prettier formats quoted code embedded in the file.", choices: [{ value: "auto", description: "Format embedded code if Prettier can automatically identify it." }, { value: "off", description: "Never automatically format embedded code." }] } };
function it({ plugins: e = [], showDeprecated: t = false } = {}) {
  let u = e.flatMap((o) => o.languages ?? []), r = [];
  for (let o of Go(Object.assign({}, ...e.map(({ options: n }) => n), Sr2))) !t && o.deprecated || (Array.isArray(o.choices) && (t || (o.choices = o.choices.filter((n) => !n.deprecated)), o.name === "parser" && (o.choices = [...o.choices, ...Ko(o.choices, u, e)])), o.pluginDefaults = Object.fromEntries(e.filter((n) => n.defaultOptions?.[o.name] !== void 0).map((n) => [n.name, n.defaultOptions[o.name]])), r.push(o));
  return { languages: u, options: r };
}
function* Ko(e, t, u) {
  let r = new Set(e.map((o) => o.value));
  for (let o of t) if (o.parsers) {
    for (let n of o.parsers) if (!r.has(n)) {
      r.add(n);
      let a = u.find((i) => i.parsers && Object.prototype.hasOwnProperty.call(i.parsers, n)), s = o.name;
      a?.name && (s += ` (plugin: ${a.name})`), yield { value: n, description: s };
    }
  }
}
function Go(e) {
  let t = [];
  for (let [u, r] of Object.entries(e)) {
    let o = { name: u, ...r };
    Array.isArray(o.default) && (o.default = b(0, o.default, -1).value), t.push(o);
  }
  return t;
}
var zo = Array.prototype.toReversed ?? function() {
  return [...this].reverse();
}, Jo = X("toReversed", function() {
  if (Array.isArray(this)) return zo;
}), wr = Jo;
function Ho() {
  let e = globalThis, t = e.Deno?.build?.os;
  return typeof t == "string" ? t === "windows" : e.navigator?.platform?.startsWith("Win") ?? e.process?.platform?.startsWith("win") ?? false;
}
var Xo = Ho();
function Or(e) {
  if (e = e instanceof URL ? e : new URL(e), e.protocol !== "file:") throw new TypeError(`URL must be a file URL: received "${e.protocol}"`);
  return e;
}
function qo(e) {
  return e = Or(e), decodeURIComponent(e.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function Qo(e) {
  e = Or(e);
  let t = decodeURIComponent(e.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
  return e.hostname !== "" && (t = `\\\\${e.hostname}${t}`), t;
}
function ru(e) {
  return Xo ? Qo(e) : qo(e);
}
var Pr = (e) => String(e).split(/[/\\]/u).pop(), Ir = (e) => String(e).startsWith("file:");
function kr2(e, t) {
  if (!t) return;
  let u = Pr(t).toLowerCase();
  return e.find(({ filenames: r }) => r?.some((o) => o.toLowerCase() === u)) ?? e.find(({ extensions: r }) => r?.some((o) => u.endsWith(o)));
}
function Zo(e, t) {
  if (t) return e.find(({ name: u }) => u.toLowerCase() === t) ?? e.find(({ aliases: u }) => u?.includes(t)) ?? e.find(({ extensions: u }) => u?.includes(`.${t}`));
}
var ea = void 0;
function vr(e, t) {
  if (t) {
    if (Ir(t)) try {
      t = ru(t);
    } catch {
      return;
    }
    if (typeof t == "string") return e.find(({ isSupported: u }) => u?.({ filepath: t }));
  }
}
function ta(e, t) {
  let u = wr(0, e.plugins).flatMap((o) => o.languages ?? []);
  return (Zo(u, t.language) ?? kr2(u, t.physicalFile) ?? kr2(u, t.file) ?? vr(u, t.physicalFile) ?? vr(u, t.file) ?? ea?.(u, t.physicalFile))?.parsers[0];
}
var st = ta;
var ie = { key: (e) => /^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(e) ? e : JSON.stringify(e), value(e) {
  if (e === null || typeof e != "object") return JSON.stringify(e);
  if (Array.isArray(e)) return `[${e.map((u) => ie.value(u)).join(", ")}]`;
  let t = Object.keys(e);
  return t.length === 0 ? "{}" : `{ ${t.map((u) => `${ie.key(u)}: ${ie.value(e[u])}`).join(", ")} }`;
}, pair: ({ key: e, value: t }) => ie.value({ [e]: t }) };
var nu = new Proxy(String, { get: () => nu }), $ = nu, ou = () => nu;
var Rr = (e, t, { descriptor: u }) => {
  let r = [`${$.yellow(typeof e == "string" ? u.key(e) : u.pair(e))} is deprecated`];
  return t && r.push(`we now treat it as ${$.blue(typeof t == "string" ? u.key(t) : u.pair(t))}`), r.join("; ") + ".";
};
var Dt = /* @__PURE__ */ Symbol.for("vnopts.VALUE_NOT_EXIST"), Ae = /* @__PURE__ */ Symbol.for("vnopts.VALUE_UNCHANGED");
var Lr = " ".repeat(2), Yr = (e, t, u) => {
  let { text: r, list: o } = u.normalizeExpectedResult(u.schemas[e].expected(u)), n = [];
  return r && n.push(Mr(e, t, r, u.descriptor)), o && n.push([Mr(e, t, o.title, u.descriptor)].concat(o.values.map((a) => jr(a, u.loggerPrintWidth))).join(`
`)), Ur(n, u.loggerPrintWidth);
};
function Mr(e, t, u, r) {
  return [`Invalid ${$.red(r.key(e))} value.`, `Expected ${$.blue(u)},`, `but received ${t === Dt ? $.gray("nothing") : $.red(r.value(t))}.`].join(" ");
}
function jr({ text: e, list: t }, u) {
  let r = [];
  return e && r.push(`- ${$.blue(e)}`), t && r.push([`- ${$.blue(t.title)}:`].concat(t.values.map((o) => jr(o, u - Lr.length).replace(/^|\n/g, `$&${Lr}`))).join(`
`)), Ur(r, u);
}
function Ur(e, t) {
  if (e.length === 1) return e[0];
  let [u, r] = e, [o, n] = e.map((a) => a.split(`
`, 1)[0].length);
  return o > t && o > n ? r : u;
}
var _e = [], au = [];
function ct(e, t, u) {
  if (e === t) return 0;
  let r = u?.maxDistance, o = e;
  e.length > t.length && (e = t, t = o);
  let n = e.length, a = t.length;
  for (; n > 0 && e.charCodeAt(~-n) === t.charCodeAt(~-a); ) n--, a--;
  let s = 0;
  for (; s < n && e.charCodeAt(s) === t.charCodeAt(s); ) s++;
  if (n -= s, a -= s, r !== void 0 && a - n > r) return r;
  if (n === 0) return r !== void 0 && a > r ? r : a;
  let i, D, f2, l2, d = 0, c = 0;
  for (; d < n; ) au[d] = e.charCodeAt(s + d), _e[d] = ++d;
  for (; c < a; ) {
    for (i = t.charCodeAt(s + c), f2 = c++, D = c, d = 0; d < n; d++) l2 = i === au[d] ? f2 : f2 + 1, f2 = _e[d], D = _e[d] = f2 > D ? l2 > D ? D + 1 : l2 : l2 > f2 ? f2 + 1 : l2;
    if (r !== void 0) {
      let p = D;
      for (d = 0; d < n; d++) _e[d] < p && (p = _e[d]);
      if (p > r) return r;
    }
  }
  return _e.length = n, au.length = n, r !== void 0 && D > r ? r : D;
}
function Wr(e, t, u) {
  if (!Array.isArray(t) || t.length === 0) return;
  let r = u?.maxDistance, o = e.length;
  for (let i of t) if (i === e) return i;
  let n, a = Number.POSITIVE_INFINITY, s = /* @__PURE__ */ new Set();
  for (let i of t) {
    if (s.has(i)) continue;
    s.add(i);
    let D = Math.abs(i.length - o);
    if (D >= a || D > r) continue;
    let f2 = Number.isFinite(a) ? Math.min(a, r) : r, l2 = f2 === void 0 ? ct(e, i) : ct(e, i, { maxDistance: f2 });
    if (l2 > r) continue;
    let d = l2;
    if (f2 !== void 0 && l2 === f2 && f2 === r && (d = ct(e, i)), d < a && (a = d, n = i, a === 0)) break;
  }
  if (!(a > r)) return n;
}
var ft = (e, t, { descriptor: u, logger: r, schemas: o }) => {
  let n = [`Ignored unknown option ${$.yellow(u.pair({ key: e, value: t }))}.`], a = Wr(e, Object.keys(o), { maxDistance: 3 });
  a && n.push(`Did you mean ${$.blue(u.key(a))}?`), r.warn(n.join(" "));
};
var ua = ["default", "expected", "validate", "deprecated", "forward", "redirect", "overlap", "preprocess", "postprocess"];
function ra(e, t) {
  let u = new e(t), r = Object.create(u);
  for (let o of ua) o in t && (r[o] = na(t[o], u, S.prototype[o].length));
  return r;
}
var S = class {
  static create(t) {
    return ra(this, t);
  }
  constructor(t) {
    this.name = t.name;
  }
  default(t) {
  }
  expected(t) {
    return "nothing";
  }
  validate(t, u) {
    return false;
  }
  deprecated(t, u) {
    return false;
  }
  forward(t, u) {
  }
  redirect(t, u) {
  }
  overlap(t, u, r) {
    return t;
  }
  preprocess(t, u) {
    return t;
  }
  postprocess(t, u) {
    return Ae;
  }
};
function na(e, t, u) {
  return typeof e == "function" ? (...r) => e(...r.slice(0, u - 1), t, ...r.slice(u - 1)) : () => e;
}
var lt = class extends S {
  constructor(t) {
    super(t), this._sourceName = t.sourceName;
  }
  expected(t) {
    return t.schemas[this._sourceName].expected(t);
  }
  validate(t, u) {
    return u.schemas[this._sourceName].validate(t, u);
  }
  redirect(t, u) {
    return this._sourceName;
  }
};
var dt = class extends S {
  expected() {
    return "anything";
  }
  validate() {
    return true;
  }
};
var pt = class extends S {
  constructor({ valueSchema: t, name: u = t.name, ...r }) {
    super({ ...r, name: u }), this._valueSchema = t;
  }
  expected(t) {
    let { text: u, list: r } = t.normalizeExpectedResult(this._valueSchema.expected(t));
    return { text: u && `an array of ${u}`, list: r && { title: "an array of the following values", values: [{ list: r }] } };
  }
  validate(t, u) {
    if (!Array.isArray(t)) return false;
    let r = [];
    for (let o of t) {
      let n = u.normalizeValidateResult(this._valueSchema.validate(o, u), o);
      n !== true && r.push(n.value);
    }
    return r.length === 0 ? true : { value: r };
  }
  deprecated(t, u) {
    let r = [];
    for (let o of t) {
      let n = u.normalizeDeprecatedResult(this._valueSchema.deprecated(o, u), o);
      n !== false && r.push(...n.map(({ value: a }) => ({ value: [a] })));
    }
    return r;
  }
  forward(t, u) {
    let r = [];
    for (let o of t) {
      let n = u.normalizeForwardResult(this._valueSchema.forward(o, u), o);
      r.push(...n.map($r));
    }
    return r;
  }
  redirect(t, u) {
    let r = [], o = [];
    for (let n of t) {
      let a = u.normalizeRedirectResult(this._valueSchema.redirect(n, u), n);
      "remain" in a && r.push(a.remain), o.push(...a.redirect.map($r));
    }
    return r.length === 0 ? { redirect: o } : { redirect: o, remain: r };
  }
  overlap(t, u) {
    return t.concat(u);
  }
};
function $r({ from: e, to: t }) {
  return { from: [e], to: t };
}
var Ft = class extends S {
  expected() {
    return "true or false";
  }
  validate(t) {
    return typeof t == "boolean";
  }
};
function Kr(e, t) {
  let u = /* @__PURE__ */ Object.create(null);
  for (let r of e) {
    let o = r[t];
    if (u[o]) throw new Error(`Duplicate ${t} ${JSON.stringify(o)}`);
    u[o] = r;
  }
  return u;
}
function Gr(e, t) {
  let u = /* @__PURE__ */ new Map();
  for (let r of e) {
    let o = r[t];
    if (u.has(o)) throw new Error(`Duplicate ${t} ${JSON.stringify(o)}`);
    u.set(o, r);
  }
  return u;
}
function zr() {
  let e = /* @__PURE__ */ Object.create(null);
  return (t) => {
    let u = JSON.stringify(t);
    return e[u] ? true : (e[u] = true, false);
  };
}
function Jr(e, t) {
  let u = [], r = [];
  for (let o of e) t(o) ? u.push(o) : r.push(o);
  return [u, r];
}
function Hr(e) {
  return e === Math.floor(e);
}
function Xr(e, t) {
  if (e === t) return 0;
  let u = typeof e, r = typeof t, o = ["undefined", "object", "boolean", "number", "string"];
  return u !== r ? o.indexOf(u) - o.indexOf(r) : u !== "string" ? Number(e) - Number(t) : e.localeCompare(t);
}
function qr(e) {
  return (...t) => {
    let u = e(...t);
    return typeof u == "string" ? new Error(u) : u;
  };
}
function iu(e) {
  return e === void 0 ? {} : e;
}
function su(e) {
  if (typeof e == "string") return { text: e };
  let { text: t, list: u } = e;
  return oa((t || u) !== void 0, "Unexpected `expected` result, there should be at least one field."), u ? { text: t, list: { title: u.title, values: u.values.map(su) } } : { text: t };
}
function Du(e, t) {
  return e === true ? true : e === false ? { value: t } : e;
}
function cu(e, t, u = false) {
  return e === false ? false : e === true ? u ? true : [{ value: t }] : "value" in e ? [e] : e.length === 0 ? false : e;
}
function Vr(e, t) {
  return typeof e == "string" || "key" in e ? { from: t, to: e } : "from" in e ? { from: e.from, to: e.to } : { from: t, to: e.to };
}
function mt(e, t) {
  return e === void 0 ? [] : Array.isArray(e) ? e.map((u) => Vr(u, t)) : [Vr(e, t)];
}
function fu(e, t) {
  let u = mt(typeof e == "object" && "redirect" in e ? e.redirect : e, t);
  return u.length === 0 ? { remain: t, redirect: u } : typeof e == "object" && "remain" in e ? { remain: e.remain, redirect: u } : { redirect: u };
}
function oa(e, t) {
  if (!e) throw new Error(t);
}
var Et = class extends S {
  constructor(t) {
    super(t), this._choices = Gr(t.choices.map((u) => u && typeof u == "object" ? u : { value: u }), "value");
  }
  expected({ descriptor: t }) {
    let u = Array.from(this._choices.keys()).map((a) => this._choices.get(a)).filter(({ hidden: a }) => !a).map((a) => a.value).sort(Xr).map(t.value), r = u.slice(0, -2), o = u.slice(-2);
    return { text: r.concat(o.join(" or ")).join(", "), list: { title: "one of the following values", values: u } };
  }
  validate(t) {
    return this._choices.has(t);
  }
  deprecated(t) {
    let u = this._choices.get(t);
    return u && u.deprecated ? { value: t } : false;
  }
  forward(t) {
    let u = this._choices.get(t);
    return u ? u.forward : void 0;
  }
  redirect(t) {
    let u = this._choices.get(t);
    return u ? u.redirect : void 0;
  }
};
var Ct = class extends S {
  expected() {
    return "a number";
  }
  validate(t, u) {
    return typeof t == "number";
  }
};
var ht = class extends Ct {
  expected() {
    return "an integer";
  }
  validate(t, u) {
    return u.normalizeValidateResult(super.validate(t, u), t) === true && Hr(t);
  }
};
var je = class extends S {
  expected() {
    return "a string";
  }
  validate(t) {
    return typeof t == "string";
  }
};
var Qr = ie, Zr = ft, en = Yr, tn = Rr;
var gt = class {
  constructor(t, u) {
    let { logger: r = console, loggerPrintWidth: o = 80, descriptor: n = Qr, unknown: a = Zr, invalid: s = en, deprecated: i = tn, missing: D = () => false, required: f2 = () => false, preprocess: l2 = (c) => c, postprocess: d = () => Ae } = u || {};
    this._utils = { descriptor: n, logger: r || { warn: () => {
    } }, loggerPrintWidth: o, schemas: Kr(t, "name"), normalizeDefaultResult: iu, normalizeExpectedResult: su, normalizeDeprecatedResult: cu, normalizeForwardResult: mt, normalizeRedirectResult: fu, normalizeValidateResult: Du }, this._unknownHandler = a, this._invalidHandler = qr(s), this._deprecatedHandler = i, this._identifyMissing = (c, p) => !(c in p) || D(c, p), this._identifyRequired = f2, this._preprocess = l2, this._postprocess = d, this.cleanHistory();
  }
  cleanHistory() {
    this._hasDeprecationWarned = zr();
  }
  normalize(t) {
    let u = {}, o = [this._preprocess(t, this._utils)], n = () => {
      for (; o.length !== 0; ) {
        let a = o.shift(), s = this._applyNormalization(a, u);
        o.push(...s);
      }
    };
    n();
    for (let a of Object.keys(this._utils.schemas)) {
      let s = this._utils.schemas[a];
      if (!(a in u)) {
        let i = iu(s.default(this._utils));
        "value" in i && o.push({ [a]: i.value });
      }
    }
    n();
    for (let a of Object.keys(this._utils.schemas)) {
      if (!(a in u)) continue;
      let s = this._utils.schemas[a], i = u[a], D = s.postprocess(i, this._utils);
      D !== Ae && (this._applyValidation(D, a, s), u[a] = D);
    }
    return this._applyPostprocess(u), this._applyRequiredCheck(u), u;
  }
  _applyNormalization(t, u) {
    let r = [], { knownKeys: o, unknownKeys: n } = this._partitionOptionKeys(t);
    for (let a of o) {
      let s = this._utils.schemas[a], i = s.preprocess(t[a], this._utils);
      this._applyValidation(i, a, s);
      let D = ({ from: c, to: p }) => {
        r.push(typeof p == "string" ? { [p]: c } : { [p.key]: p.value });
      }, f2 = ({ value: c, redirectTo: p }) => {
        let F2 = cu(s.deprecated(c, this._utils), i, true);
        if (F2 !== false) if (F2 === true) this._hasDeprecationWarned(a) || this._utils.logger.warn(this._deprecatedHandler(a, p, this._utils));
        else for (let { value: C2 } of F2) {
          let y2 = { key: a, value: C2 };
          if (!this._hasDeprecationWarned(y2)) {
            let m = typeof p == "string" ? { key: p, value: C2 } : p;
            this._utils.logger.warn(this._deprecatedHandler(y2, m, this._utils));
          }
        }
      };
      mt(s.forward(i, this._utils), i).forEach(D);
      let d = fu(s.redirect(i, this._utils), i);
      if (d.redirect.forEach(D), "remain" in d) {
        let c = d.remain;
        u[a] = a in u ? s.overlap(u[a], c, this._utils) : c, f2({ value: c });
      }
      for (let { from: c, to: p } of d.redirect) f2({ value: c, redirectTo: p });
    }
    for (let a of n) {
      let s = t[a];
      this._applyUnknownHandler(a, s, u, (i, D) => {
        r.push({ [i]: D });
      });
    }
    return r;
  }
  _applyRequiredCheck(t) {
    for (let u of Object.keys(this._utils.schemas)) if (this._identifyMissing(u, t) && this._identifyRequired(u)) throw this._invalidHandler(u, Dt, this._utils);
  }
  _partitionOptionKeys(t) {
    let [u, r] = Jr(Object.keys(t).filter((o) => !this._identifyMissing(o, t)), (o) => o in this._utils.schemas);
    return { knownKeys: u, unknownKeys: r };
  }
  _applyValidation(t, u, r) {
    let o = Du(r.validate(t, this._utils), t);
    if (o !== true) throw this._invalidHandler(u, o.value, this._utils);
  }
  _applyUnknownHandler(t, u, r, o) {
    let n = this._unknownHandler(t, u, this._utils);
    if (n) for (let a of Object.keys(n)) {
      if (this._identifyMissing(a, n)) continue;
      let s = n[a];
      a in this._utils.schemas ? o(a, s) : r[a] = s;
    }
  }
  _applyPostprocess(t) {
    let u = this._postprocess(t, this._utils);
    if (u !== Ae) {
      if (u.delete) for (let r of u.delete) delete t[r];
      if (u.override) {
        let { knownKeys: r, unknownKeys: o } = this._partitionOptionKeys(u.override);
        for (let n of r) {
          let a = u.override[n];
          this._applyValidation(a, n, this._utils.schemas[n]), t[n] = a;
        }
        for (let n of o) {
          let a = u.override[n];
          this._applyUnknownHandler(n, a, t, (s, i) => {
            let D = this._utils.schemas[s];
            this._applyValidation(i, s, D), t[s] = i;
          });
        }
      }
    }
  }
};
var lu;
function ia(e, t, { logger: u = false, isCLI: r = false, passThrough: o = false, FlagSchema: n, descriptor: a } = {}) {
  if (r) {
    if (!n) throw new Error("'FlagSchema' option is required.");
    if (!a) throw new Error("'descriptor' option is required.");
  } else a = ie;
  let s = o ? Array.isArray(o) ? (d, c) => o.includes(d) ? { [d]: c } : void 0 : (d, c) => ({ [d]: c }) : (d, c, p) => {
    let { _: F2, ...C2 } = p.schemas;
    return ft(d, c, { ...p, schemas: C2 });
  }, i = sa(t, { isCLI: r, FlagSchema: n }), D = new gt(i, { logger: u, unknown: s, descriptor: a }), f2 = u !== false;
  f2 && lu && (D._hasDeprecationWarned = lu);
  let l2 = D.normalize(e);
  return f2 && (lu = D._hasDeprecationWarned), l2;
}
function sa(e, { isCLI: t, FlagSchema: u }) {
  let r = [];
  t && r.push(dt.create({ name: "_" }));
  for (let o of e) r.push(Da(o, { isCLI: t, optionInfos: e, FlagSchema: u })), o.alias && t && r.push(lt.create({ name: o.alias, sourceName: o.name }));
  return r;
}
function Da(e, { isCLI: t, optionInfos: u, FlagSchema: r }) {
  let { name: o } = e, n = { name: o }, a, s = {};
  switch (e.type) {
    case "int":
      a = ht, t && (n.preprocess = Number);
      break;
    case "string":
      a = je;
      break;
    case "choice":
      a = Et, n.choices = e.choices.map((i) => i?.redirect ? { ...i, redirect: { to: { key: e.name, value: i.redirect } } } : i);
      break;
    case "boolean":
      a = Ft;
      break;
    case "flag":
      a = r, n.flags = u.flatMap((i) => [i.alias, i.description && i.name, i.oppositeDescription && `no-${i.name}`].filter(Boolean));
      break;
    case "path":
      a = je;
      break;
    default:
      throw new Error(`Unexpected type ${e.type}`);
  }
  if (e.exception ? n.validate = (i, D, f2) => e.exception(i) || D.validate(i, f2) : n.validate = (i, D, f2) => i === void 0 || D.validate(i, f2), e.redirect && (s.redirect = (i) => i ? { to: typeof e.redirect == "string" ? e.redirect : { key: e.redirect.option, value: e.redirect.value } } : void 0), e.deprecated && (s.deprecated = true), t && !e.array) {
    let i = n.preprocess || ((D) => D);
    n.preprocess = (D, f2, l2) => f2.preprocess(i(Array.isArray(D) ? b(0, D, -1) : D), l2);
  }
  return e.array ? pt.create({ ...t ? { preprocess: (i) => Array.isArray(i) ? i : [i] } : {}, ...s, valueSchema: a.create(n) }) : a.create({ ...n, ...s });
}
var un = ia;
var ca = Array.prototype.findLast ?? function(e) {
  for (let t = this.length - 1; t >= 0; t--) {
    let u = this[t];
    if (e(u, t, this)) return u;
  }
}, fa = X("findLast", function() {
  if (Array.isArray(this)) return ca;
}), du = fa;
var rn = /* @__PURE__ */ Symbol.for("PRETTIER_IS_FRONT_MATTER"), pu = [];
function la(e) {
  return !!e?.[rn];
}
var de2 = la;
var nn = /* @__PURE__ */ new Set(["yaml", "toml"]), Ue = ({ node: e }) => de2(e) && nn.has(e.language);
async function Fu(e, t, u, r) {
  let { node: o } = u, { language: n } = o;
  if (!nn.has(n)) return;
  let a = o.value.trim(), s;
  if (a) {
    let i = n === "yaml" ? n : st(r, { language: n });
    if (!i) return;
    s = a ? await e(a, { parser: i }) : "";
  } else s = a;
  return et([o.startDelimiter, o.explicitLanguage ?? "", V, s, s ? V : "", o.endDelimiter]);
}
function da(e, t) {
  return Ue({ node: e }) && (delete t.end, delete t.raw, delete t.value), t;
}
var mu = da;
function pa({ node: e }) {
  return e.raw;
}
var Eu = pa;
var on = /* @__PURE__ */ new Set(["tokens", "comments", "parent", "enclosingNode", "precedingNode", "followingNode"]), Fa = (e) => Object.keys(e).filter((t) => !on.has(t));
function ma(e, t) {
  let u = e ? (r) => e(r, on) : Fa;
  return t ? new Proxy(u, { apply: (r, o, n) => de2(n[0]) ? pu : Reflect.apply(r, o, n) }) : u;
}
var Cu = ma;
function gu(e, t) {
  if (!t) throw new Error("parserName is required.");
  let u = du(0, e, (o) => o.parsers && Object.prototype.hasOwnProperty.call(o.parsers, t));
  if (u) return u;
  let r = `Couldn't resolve parser "${t}".`;
  throw r += " Plugins must be explicitly added to the standalone bundle.", new Me(r);
}
function an(e, t) {
  if (!t) throw new Error("astFormat is required.");
  let u = du(0, e, (o) => o.printers && Object.prototype.hasOwnProperty.call(o.printers, t));
  if (u) return u;
  let r = `Couldn't find plugin for AST format "${t}".`;
  throw r += " Plugins must be explicitly added to the standalone bundle.", new Me(r);
}
function We({ plugins: e, parser: t }) {
  let u = gu(e, t);
  return yu(u, t);
}
function yu(e, t) {
  let u = e.parsers[t];
  return typeof u == "function" ? u() : u;
}
async function sn(e, t) {
  let u = e.printers[t], r = typeof u == "function" ? await u() : u;
  return Ea(r);
}
var hu = /* @__PURE__ */ new WeakMap();
function Ea(e) {
  if (hu.has(e)) return hu.get(e);
  let { features: t, getVisitorKeys: u, embed: r, massageAstNode: o, print: n, ...a } = e;
  t = ya(t);
  let s = t.experimental_frontMatterSupport;
  u = Cu(u, s.massageAstNode || s.embed || s.print);
  let i = o;
  o && s.massageAstNode && (i = new Proxy(o, { apply(d, c, p) {
    return mu(...p), Reflect.apply(d, c, p);
  } }));
  let D = r;
  if (r) {
    let d;
    D = new Proxy(r, { get(c, p, F2) {
      return p === "getVisitorKeys" ? (d ?? (d = r.getVisitorKeys ? Cu(r.getVisitorKeys, s.massageAstNode || s.embed) : u), d) : Reflect.get(c, p, F2);
    }, apply: (c, p, F2) => s.embed && Ue(...F2) ? Fu : Reflect.apply(c, p, F2) });
  }
  let f2 = n;
  s.print && (f2 = new Proxy(n, { apply(d, c, p) {
    let [F2] = p;
    return de2(F2.node) ? Eu(F2) : Reflect.apply(d, c, p);
  } }));
  let l2 = { features: t, getVisitorKeys: u, embed: D, massageAstNode: i, print: f2, ...a };
  return hu.set(e, l2), l2;
}
var Ca = ["clean", "embed", "print"], ha = Object.fromEntries(Ca.map((e) => [e, false]));
function ga(e) {
  return { ...ha, ...e };
}
function ya(e) {
  return { experimental_avoidAstMutation: false, ...e, experimental_frontMatterSupport: ga(e?.experimental_frontMatterSupport) };
}
var Dn = { astFormat: "estree", printer: {}, originalText: void 0, locStart: null, locEnd: null, getVisitorKeys: null };
async function ba(e, t = {}) {
  let u = { ...e };
  if (!u.parser) if (u.filepath) {
    if (u.parser = st(u, { physicalFile: u.filepath }), !u.parser) throw new Ye(`No parser could be inferred for file "${u.filepath}".`);
  } else throw new Ye("No parser and no file path given, couldn't infer a parser.");
  let r = it({ plugins: e.plugins, showDeprecated: true }).options, o = { ...Dn, ...Object.fromEntries(r.filter((l2) => l2.default !== void 0).map((l2) => [l2.name, l2.default])) }, n = gu(u.plugins, u.parser), a = await yu(n, u.parser);
  u.astFormat = a.astFormat, u.locEnd = a.locEnd, u.locStart = a.locStart;
  let s = n.printers?.[a.astFormat] ? n : an(u.plugins, a.astFormat), i = await sn(s, a.astFormat);
  u.printer = i, u.getVisitorKeys = i.getVisitorKeys;
  let D = s.defaultOptions ? Object.fromEntries(Object.entries(s.defaultOptions).filter(([, l2]) => l2 !== void 0)) : {}, f2 = { ...o, ...D };
  for (let [l2, d] of Object.entries(f2)) (u[l2] === null || u[l2] === void 0) && (u[l2] = d);
  return u.parser === "json" && (u.trailingComma = "none"), un(u, r, { passThrough: Object.keys(Dn), ...t });
}
var se = ba;
ao(dn());
var _u = { keyword: ["break", "case", "catch", "continue", "debugger", "default", "do", "else", "finally", "for", "function", "if", "return", "switch", "throw", "try", "var", "const", "while", "with", "new", "this", "super", "class", "extends", "export", "import", "null", "true", "false", "in", "instanceof", "typeof", "void", "delete"], strict: ["implements", "interface", "let", "package", "private", "protected", "public", "static", "yield"], strictBind: ["eval", "arguments"] };
new Set(_u.keyword);
new Set(_u.strict);
new Set(_u.strictBind);
var It = (e, t) => (u) => e(t(u));
function mn(e) {
  return { keyword: e.cyan, capitalized: e.yellow, jsxIdentifier: e.yellow, punctuator: e.yellow, number: e.magenta, string: e.green, regex: e.magenta, comment: e.gray, invalid: It(It(e.white, e.bgRed), e.bold), gutter: e.gray, marker: It(e.red, e.bold), message: It(e.red, e.bold), reset: e.reset };
}
mn(ou());
mn(ou());
function _a() {
  return new Proxy({}, { get: () => (e) => e });
}
var Fn = /\r\n|[\n\r\u2028\u2029]/;
function xa(e, t, u) {
  let r = Object.assign({ column: 0, line: -1 }, e.start), o = Object.assign({}, r, e.end), { linesAbove: n = 2, linesBelow: a = 3 } = u || {}, s = r.line, i = r.column, D = o.line, f2 = o.column, l2 = Math.max(s - (n + 1), 0), d = Math.min(t.length, D + a);
  s === -1 && (l2 = 0), D === -1 && (d = t.length);
  let c = D - s, p = {};
  if (c) for (let F2 = 0; F2 <= c; F2++) {
    let C2 = F2 + s;
    if (!i) p[C2] = true;
    else if (F2 === 0) {
      let y2 = t[C2 - 1].length;
      p[C2] = [i, y2 - i + 1];
    } else if (F2 === c) p[C2] = [0, f2];
    else {
      let y2 = t[C2 - F2].length;
      p[C2] = [0, y2];
    }
  }
  else i === f2 ? i ? p[s] = [i, 0] : p[s] = true : p[s] = [i, f2 - i];
  return { start: l2, end: d, markerLines: p };
}
function En(e, t, u = {}) {
  let o = _a(), n = e.split(Fn), { start: a, end: s, markerLines: i } = xa(t, n, u), D = t.start && typeof t.start.column == "number", f2 = String(s).length, d = e.split(Fn, s).slice(a, s).map((c, p) => {
    let F2 = a + 1 + p, y2 = ` ${` ${F2}`.slice(-f2)} |`, m = i[F2], h2 = !i[F2 + 1];
    if (m) {
      let E2 = "";
      if (Array.isArray(m)) {
        let g = c.slice(0, Math.max(m[0] - 1, 0)).replace(/[^\t]/g, " "), A2 = m[1] || 1;
        E2 = [`
 `, o.gutter(y2.replace(/\d/g, " ")), " ", g, o.marker("^").repeat(A2)].join(""), h2 && u.message && (E2 += " " + o.message(u.message));
      }
      return [o.marker(">"), o.gutter(y2), c.length > 0 ? ` ${c}` : "", E2].join("");
    } else return ` ${o.gutter(y2)}${c.length > 0 ? ` ${c}` : ""}`;
  }).join(`
`);
  return u.message && !D && (d = `${" ".repeat(f2 + 1)}${u.message}
${d}`), d;
}
async function Ba(e, t) {
  let u = await We(t), r = u.preprocess ? await u.preprocess(e, t) : e;
  t.originalText = r;
  let o;
  try {
    o = await u.parse(r, t, t);
  } catch (n) {
    Ta(n, e);
  }
  return { text: r, ast: o };
}
function Ta(e, t) {
  let { loc: u } = e;
  if (u) {
    let r = En(t, u, {});
    throw e.message += `
` + r, e.codeFrame = r, e;
  }
  throw e;
}
var Fe = Ba;
async function Cn(e, t, u, r, o) {
  if (u.embeddedLanguageFormatting !== "auto") return;
  let { printer: n } = u, { embed: a } = n;
  if (!a) return;
  if (a.length > 2) throw new Error("printer.embed has too many parameters. The API changed in Prettier v3. Please update your plugin. See https://prettier.io/docs/plugins#optional-embed");
  let { hasPrettierIgnore: s } = n, { getVisitorKeys: i } = a, D = [];
  d();
  let f2 = e.stack;
  for (let { print: c, node: p, pathStack: F2 } of D) try {
    e.stack = F2;
    let C2 = await c(l2, t, e, u);
    C2 && o.set(p, C2);
  } catch (C2) {
    if (globalThis.PRETTIER_DEBUG) throw C2;
  }
  e.stack = f2;
  function l2(c, p) {
    return Na(c, p, u, r);
  }
  function d() {
    let { node: c } = e;
    if (c === null || typeof c != "object" || s?.(e)) return;
    for (let F2 of i(c)) Array.isArray(c[F2]) ? e.each(d, F2) : e.call(d, F2);
    let p = a(e, u);
    if (p) {
      if (typeof p == "function") {
        D.push({ print: p, node: c, pathStack: [...e.stack] });
        return;
      }
      o.set(c, p);
    }
  }
}
async function Na(e, t, u, r) {
  let o = await se({ ...u, ...t, parentParser: u.parser, originalText: e, cursorOffset: void 0, rangeStart: void 0, rangeEnd: void 0 }, { passThrough: true }), { ast: n } = await Fe(e, o), a = await r(n, o);
  return qe(a);
}
function Sa(e, t, u, r) {
  let { originalText: o, [/* @__PURE__ */ Symbol.for("comments")]: n, locStart: a, locEnd: s, [/* @__PURE__ */ Symbol.for("printedComments")]: i } = t, { node: D } = e, f2 = a(D), l2 = s(D);
  for (let c of n) a(c) >= f2 && s(c) <= l2 && i.add(c);
  let { printPrettierIgnored: d } = t.printer;
  return d ? d(e, t, u, r) : o.slice(f2, l2);
}
var hn = Sa;
async function Ge(e, t) {
  ({ ast: e } = await xu(e, t));
  let u = /* @__PURE__ */ new Map(), r = new pr(e), n = /* @__PURE__ */ new Map();
  await Cn(r, s, t, Ge, n);
  let a = await gn(r, t, s, void 0, n);
  if (Tr(t), t.cursorOffset >= 0) {
    if (t.nodeAfterCursor && !t.nodeBeforeCursor) return [ee2, a];
    if (t.nodeBeforeCursor && !t.nodeAfterCursor) return [a, ee2];
  }
  return a;
  function s(D, f2) {
    return D === void 0 || D === r ? i(f2) : Array.isArray(D) ? r.call(() => i(f2), ...D) : r.call(() => i(f2), D);
  }
  function i(D) {
    let f2 = r.node;
    if (f2 == null) return "";
    let l2 = ge2(f2) && D === void 0;
    if (l2 && u.has(f2)) return u.get(f2);
    let d = gn(r, t, s, D, n);
    return l2 && u.set(f2, d), d;
  }
}
function gn(e, t, u, r, o) {
  let { node: n } = e, { printer: a } = t, s;
  switch (a.hasPrettierIgnore?.(e) ? s = hn(e, t, u, r) : o.has(n) ? s = o.get(n) : s = a.print(e, t, u, r), n) {
    case t.cursorNode:
      s = Ee(s, (i) => [ee2, i, ee2]);
      break;
    case t.nodeBeforeCursor:
      s = Ee(s, (i) => [i, ee2]);
      break;
    case t.nodeAfterCursor:
      s = Ee(s, (i) => [ee2, i]);
      break;
  }
  return a.printComment && !a.willPrintOwnComments?.(e, t) && (s = Br(e, s, t)), s;
}
async function xu(e, t) {
  let u = e.comments ?? [];
  t[/* @__PURE__ */ Symbol.for("comments")] = u, t[/* @__PURE__ */ Symbol.for("printedComments")] = /* @__PURE__ */ new Set(), Ar(e, t);
  let { printer: { preprocess: r } } = t;
  return e = r ? await r(e, t) : e, { ast: e, comments: u };
}
function wa(e, t) {
  let { cursorOffset: u, locStart: r, locEnd: o, getVisitorKeys: n } = t, a = (c) => r(c) <= u && o(c) >= u, s = e, i = [e];
  for (let c of Cr(e, { getVisitorKeys: n, filter: a })) i.push(c), s = c;
  if (hr2(s, { getVisitorKeys: n })) return { cursorNode: s };
  let D, f2, l2 = -1, d = Number.POSITIVE_INFINITY;
  for (; i.length > 0 && (D === void 0 || f2 === void 0); ) {
    s = i.pop();
    let c = D !== void 0, p = f2 !== void 0;
    for (let F2 of be(s, { getVisitorKeys: n })) {
      if (!c) {
        let C2 = o(F2);
        C2 <= u && C2 > l2 && (D = F2, l2 = C2);
      }
      if (!p) {
        let C2 = r(F2);
        C2 >= u && C2 < d && (f2 = F2, d = C2);
      }
    }
  }
  return { nodeBeforeCursor: D, nodeAfterCursor: f2 };
}
var Bu = wa;
function Oa(e, t) {
  let { printer: u } = t, r = u.massageAstNode;
  if (!r) return e;
  let { getVisitorKeys: o } = u, { ignoredProperties: n } = r;
  return a(e);
  function a(s, i) {
    if (!ge2(s)) return s;
    if (Array.isArray(s)) return s.map((d) => a(d, i)).filter(Boolean);
    let D = {}, f2 = new Set(o(s));
    for (let d in s) !Object.prototype.hasOwnProperty.call(s, d) || n?.has(d) || (f2.has(d) ? D[d] = a(s[d], s) : D[d] = s[d]);
    let l2 = r(s, D, i);
    if (l2 !== null) return l2 ?? D;
  }
}
var yn = Oa;
var Pa = Array.prototype.findLastIndex ?? function(e) {
  for (let t = this.length - 1; t >= 0; t--) {
    let u = this[t];
    if (e(u, t, this)) return t;
  }
  return -1;
}, Ia = X("findLastIndex", function() {
  if (Array.isArray(this)) return Pa;
}), bn = Ia;
var ka = ({ parser: e }) => e === "json" || e === "json5" || e === "jsonc" || e === "json-stringify";
function va(e, t) {
  return t = new Set(t), e.find((u) => xn.has(u.type) && t.has(u));
}
function An(e) {
  let t = bn(0, e, (u) => u.type !== "Program" && u.type !== "File");
  return t === -1 ? e : e.slice(0, t + 1);
}
function Ra(e, t, { locStart: u, locEnd: r }) {
  let [o, ...n] = e, [a, ...s] = t;
  if (o === a) return [o, a];
  let i = u(o);
  for (let f2 of An(s)) if (u(f2) >= i) a = f2;
  else break;
  let D = r(a);
  for (let f2 of An(n)) {
    if (r(f2) <= D) o = f2;
    else break;
    if (o === a) break;
  }
  return [o, a];
}
function Tu(e, t, u, r, o = [], n) {
  let { locStart: a, locEnd: s } = u, i = a(e), D = s(e);
  if (t > D || t < i || n === "rangeEnd" && t === i || n === "rangeStart" && t === D) return;
  let f2 = [e, ...o], l2 = at(e, f2, { cache: uu, locStart: a, locEnd: s, getVisitorKeys: u.getVisitorKeys, filter: u.printer.canAttachComment, getChildren: u.printer.getCommentChildNodes });
  for (let d of l2) {
    let c = Tu(d, t, u, r, f2, n);
    if (c) return c;
  }
  if (r(e, o[0])) return f2;
}
function La(e, t) {
  return t !== "DeclareExportDeclaration" && e !== "TypeParameterDeclaration" && (e === "Directive" || e === "TypeAlias" || e === "TSExportAssignment" || e.startsWith("Declare") || e.startsWith("TSDeclare") || e.endsWith("Statement") || e.endsWith("Declaration"));
}
var xn = /* @__PURE__ */ new Set(["JsonRoot", "ObjectExpression", "ArrayExpression", "StringLiteral", "NumericLiteral", "BooleanLiteral", "NullLiteral", "UnaryExpression", "TemplateLiteral"]), Ma = /* @__PURE__ */ new Set(["OperationDefinition", "FragmentDefinition", "VariableDefinition", "TypeExtensionDefinition", "ObjectTypeDefinition", "FieldDefinition", "DirectiveDefinition", "EnumTypeDefinition", "EnumValueDefinition", "InputValueDefinition", "InputObjectTypeDefinition", "SchemaDefinition", "OperationTypeDefinition", "InterfaceTypeDefinition", "UnionTypeDefinition", "ScalarTypeDefinition"]);
function _n(e, t, u) {
  if (!t) return false;
  switch (e.parser) {
    case "flow":
    case "hermes":
    case "babel":
    case "babel-flow":
    case "babel-ts":
    case "typescript":
    case "acorn":
    case "espree":
    case "meriyah":
    case "oxc":
    case "oxc-ts":
    case "__babel_estree":
      return La(t.type, u?.type);
    case "json":
    case "json5":
    case "jsonc":
    case "json-stringify":
      return xn.has(t.type);
    case "graphql":
      return Ma.has(t.kind);
    case "vue":
      return t.tag !== "root";
  }
  return false;
}
function Bn(e, t, u) {
  let { rangeStart: r, rangeEnd: o, locStart: n, locEnd: a } = t;
  let s = e.slice(r, o).search(/\S/u), i = s === -1;
  if (!i) for (r += s; o > r && !/\S/u.test(e[o - 1]); --o) ;
  let D = Tu(u, r, t, (c, p) => _n(t, c, p), [], "rangeStart");
  if (!D) return;
  let f2 = i ? D : Tu(u, o, t, (c) => _n(t, c), [], "rangeEnd");
  if (!f2) return;
  let l2, d;
  if (ka(t)) {
    let c = va(D, f2);
    l2 = c, d = c;
  } else [l2, d] = Ra(D, f2, t);
  return [Math.min(n(l2), n(d)), Math.max(a(l2), a(d))];
}
var wn = "\uFEFF", Tn = /* @__PURE__ */ Symbol("cursor");
async function On(e, t, u = 0) {
  if (!e || e.trim().length === 0) return { formatted: "", cursorOffset: -1, comments: [] };
  let { ast: r, text: o } = await Fe(e, t);
  t.cursorOffset >= 0 && (t = { ...t, ...Bu(r, t) });
  let n = await Ge(r, t);
  u > 0 && (n = tt([V, n], u, t.tabWidth));
  let a = Ce(n, t);
  if (u > 0) {
    let i = a.formatted.trim();
    a.cursorNodeStart !== void 0 && (a.cursorNodeStart -= a.formatted.indexOf(i), a.cursorNodeStart < 0 && (a.cursorNodeStart = 0, a.cursorNodeText = a.cursorNodeText.trimStart()), a.cursorNodeStart + a.cursorNodeText.length > i.length && (a.cursorNodeText = a.cursorNodeText.trimEnd())), a.formatted = i + Se(t.endOfLine);
  }
  let s = t[/* @__PURE__ */ Symbol.for("comments")];
  if (t.cursorOffset >= 0) {
    let i, D, f2, l2;
    if ((t.cursorNode || t.nodeBeforeCursor || t.nodeAfterCursor) && a.cursorNodeText) if (f2 = a.cursorNodeStart, l2 = a.cursorNodeText, t.cursorNode) i = t.locStart(t.cursorNode), D = o.slice(i, t.locEnd(t.cursorNode));
    else {
      if (!t.nodeBeforeCursor && !t.nodeAfterCursor) throw new Error("Cursor location must contain at least one of cursorNode, nodeBeforeCursor, nodeAfterCursor");
      i = t.nodeBeforeCursor ? t.locEnd(t.nodeBeforeCursor) : 0;
      let y2 = t.nodeAfterCursor ? t.locStart(t.nodeAfterCursor) : o.length;
      D = o.slice(i, y2);
    }
    else i = 0, D = o, f2 = 0, l2 = a.formatted;
    let d = t.cursorOffset - i;
    if (D === l2) return { formatted: a.formatted, cursorOffset: f2 + d, comments: s };
    let c = D.split("");
    c.splice(d, 0, Tn);
    let p = l2.split(""), F2 = Ut(c, p), C2 = f2;
    for (let y2 of F2) if (y2.removed) {
      if (y2.value.includes(Tn)) break;
    } else C2 += y2.count;
    return { formatted: a.formatted, cursorOffset: C2, comments: s };
  }
  return { formatted: a.formatted, cursorOffset: -1, comments: s };
}
async function Ya(e, t) {
  let { ast: u, text: r } = await Fe(e, t), [o, n] = Bn(r, t, u) ?? [0, 0], a = r.slice(o, n), s = Math.min(o, r.lastIndexOf(`
`, o) + 1), i = r.slice(s, o).match(/^\s*/u)[0], D = he(i, t.tabWidth), f2 = await On(a, { ...t, rangeStart: 0, rangeEnd: Number.POSITIVE_INFINITY, cursorOffset: t.cursorOffset > o && t.cursorOffset <= n ? t.cursorOffset - o : -1, endOfLine: "lf" }, D), l2 = f2.formatted.trimEnd(), { cursorOffset: d } = t;
  d > n ? d += l2.length - a.length : f2.cursorOffset >= 0 && (d = f2.cursorOffset + o);
  let c = r.slice(0, o) + l2 + r.slice(n);
  if (t.endOfLine !== "lf") {
    let p = Se(t.endOfLine);
    d >= 0 && p === `\r
` && (d += $t2(c.slice(0, d), `
`)), c = oe(0, c, `
`, p);
  }
  return { formatted: c, cursorOffset: d, comments: f2.comments };
}
function Nu(e, t, u) {
  return typeof t != "number" || Number.isNaN(t) || t < 0 || t > e.length ? u : t;
}
function Nn(e, t) {
  let { cursorOffset: u, rangeStart: r, rangeEnd: o } = t;
  return u = Nu(e, u, -1), r = Nu(e, r, 0), o = Nu(e, o, e.length), { ...t, cursorOffset: u, rangeStart: r, rangeEnd: o };
}
function Pn(e, t) {
  let { cursorOffset: u, rangeStart: r, rangeEnd: o, endOfLine: n } = Nn(e, t), a = e.charAt(0) === wn;
  if (a && (e = e.slice(1), u--, r--, o--), n === "auto" && (n = Yu(e)), e.includes("\r")) {
    let s = (i) => $t2(e.slice(0, Math.max(i, 0)), `\r
`);
    u -= s(u), r -= s(r), o -= s(o), e = ju(e);
  }
  return { hasBOM: a, text: e, options: Nn(e, { ...t, cursorOffset: u, rangeStart: r, rangeEnd: o, endOfLine: n }) };
}
async function Sn(e, t) {
  let u = await We(t);
  return !u.hasPragma || u.hasPragma(e);
}
async function ja(e, t) {
  return (await We(t)).hasIgnorePragma?.(e);
}
async function Su(e, t) {
  let { hasBOM: u, text: r, options: o } = Pn(e, await se(t));
  if (o.rangeStart >= o.rangeEnd && r !== "" || o.requirePragma && !await Sn(r, o) || o.checkIgnorePragma && await ja(r, o)) return { formatted: e, cursorOffset: t.cursorOffset, comments: [] };
  let n;
  return o.rangeStart > 0 || o.rangeEnd < r.length ? n = await Ya(r, o) : (!o.requirePragma && o.insertPragma && o.printer.insertPragma && !await Sn(r, o) && (r = o.printer.insertPragma(r)), n = await On(r, o)), u && (n.formatted = wn + n.formatted, n.cursorOffset >= 0 && n.cursorOffset++), n;
}
async function In(e, t, u) {
  let { text: r, options: o } = Pn(e, await se(t)), n = await Fe(r, o);
  return u && (u.preprocessForPrint && (n.ast = await xu(n.ast, o)), u.massage && (n.ast = yn(n.ast, o))), n;
}
async function kn(e, t) {
  t = await se(t);
  let u = await Ge(e, t);
  return Ce(u, t);
}
async function vn(e, t) {
  let u = sr(e), { formatted: r } = await Su(u, { ...t, parser: "__js_expression" });
  return r;
}
async function Rn(e, t) {
  t = await se(t);
  let { ast: u } = await Fe(e, t);
  return t.cursorOffset >= 0 && (t = { ...t, ...Bu(u, t) }), Ge(u, t);
}
async function Ln(e, t) {
  return Ce(e, await se(t));
}
var wu = {};
Yt2(wu, { builders: () => Wa, printer: () => $a, utils: () => Va });
var Wa = { join: Ie, line: ut, softline: or, hardline: V, literalline: Qe, group: Kt, conditionalGroup: tr, fill: er, lineSuffix: ve, lineSuffixBoundary: ar, cursor: ee2, breakParent: ce, ifBreak: ur, trim: ir, indent: ae, indentIfBreak: rr, align: De, addAlignmentToDoc: tt, markAsRoot: et, dedentToRoot: Qu, dedent: Zu, hardlineWithoutBreakParent: ke, literallineWithoutBreakParent: Gt, label: nr, concat: (e) => e }, $a = { printDocToString: Ce }, Va = { willBreak: Ku, traverseDoc: we, findInDoc: Xe, mapDoc: Pe, removeLines: zu, stripTrailingHardline: qe, replaceEndOfLine: Ju, canBreak: Hu };
var Mn = "3.8.3";
var Pu = {};
Yt2(Pu, { addDanglingComment: () => ue, addLeadingComment: () => fe, addTrailingComment: () => le, getAlignmentSize: () => he, getIndentSize: () => Yn, getMaxContinuousCount: () => jn, getNextNonSpaceNonCommentCharacter: () => Un, getNextNonSpaceNonCommentCharacterIndex: () => ni, getPreferredQuote: () => Vn, getStringWidth: () => Re, hasNewline: () => z, hasNewlineInRange: () => Kn, hasSpaces: () => Gn, isNextLineEmpty: () => Di, isNextLineEmptyAfterIndex: () => kt, isPreviousLineEmpty: () => ai, makeString: () => si, skip: () => ye, skipEverythingButNewLine: () => ot, skipInlineComment: () => xe, skipNewline: () => K, skipSpaces: () => Y, skipToLineEnd: () => nt2, skipTrailingComment: () => Be2, skipWhitespace: () => Fr });
function Ka(e, t) {
  if (t === false) return false;
  if (e.charAt(t) === "/" && e.charAt(t + 1) === "*") {
    for (let u = t + 2; u < e.length; ++u) if (e.charAt(u) === "*" && e.charAt(u + 1) === "/") return u + 2;
  }
  return t;
}
var xe = Ka;
function Ga(e, t) {
  return t === false ? false : e.charAt(t) === "/" && e.charAt(t + 1) === "/" ? ot(e, t) : t;
}
var Be2 = Ga;
function za(e, t) {
  let u = null, r = t;
  for (; r !== u; ) u = r, r = Y(e, r), r = xe(e, r), r = Be2(e, r), r = K(e, r);
  return r;
}
var ze = za;
function Ja(e, t) {
  let u = null, r = t;
  for (; r !== u; ) u = r, r = nt2(e, r), r = xe(e, r), r = Y(e, r);
  return r = Be2(e, r), r = K(e, r), r !== false && z(e, r);
}
var kt = Ja;
function Ha(e, t) {
  let u = e.lastIndexOf(`
`);
  return u === -1 ? 0 : he(e.slice(u + 1).match(/^[\t ]*/u)[0], t);
}
var Yn = Ha;
function Ou(e) {
  if (typeof e != "string") throw new TypeError("Expected a string");
  return e.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function Xa(e, t) {
  let u = e.matchAll(new RegExp(`(?:${Ou(t)})+`, "gu"));
  return u.reduce || (u = [...u]), u.reduce((r, [o]) => Math.max(r, o.length), 0) / t.length;
}
var jn = Xa;
function qa2(e, t) {
  let u = ze(e, t);
  return u === false ? "" : e.charAt(u);
}
var Un = qa2;
var Wn = Object.freeze({ character: "'", codePoint: 39 }), $n = Object.freeze({ character: '"', codePoint: 34 }), Qa2 = Object.freeze({ preferred: Wn, alternate: $n }), Za = Object.freeze({ preferred: $n, alternate: Wn });
function ei(e, t) {
  let { preferred: u, alternate: r } = t === true || t === "'" ? Qa2 : Za, { length: o } = e, n = 0, a = 0;
  for (let s = 0; s < o; s++) {
    let i = e.charCodeAt(s);
    i === u.codePoint ? n++ : i === r.codePoint && a++;
  }
  return (n > a ? r : u).character;
}
var Vn = ei;
function ti(e, t, u) {
  for (let r = t; r < u; ++r) if (e.charAt(r) === `
`) return true;
  return false;
}
var Kn = ti;
function ui(e, t, u = {}) {
  return Y(e, u.backwards ? t - 1 : t, u) !== t;
}
var Gn = ui;
function ri(e, t, u) {
  return ze(e, u(t));
}
function ni(e, t) {
  return arguments.length === 2 || typeof t == "number" ? ze(e, t) : ri(...arguments);
}
function oi(e, t, u) {
  return Le(e, u(t));
}
function ai(e, t) {
  return arguments.length === 2 || typeof t == "number" ? Le(e, t) : oi(...arguments);
}
function ii(e, t, u) {
  return kt(e, u(t));
}
function si(e, t, u) {
  let r = t === '"' ? "'" : '"', n = oe(0, e, /\\(.)|(["'])/gsu, (a, s, i) => s === r ? s : i === t ? "\\" + i : i || (u && /^[^\n\r"'0-7\\bfnrt-vx\u2028\u2029]$/u.test(s) ? s : "\\" + s));
  return t + n + t;
}
function Di(e, t) {
  return arguments.length === 2 || typeof t == "number" ? kt(e, t) : ii(...arguments);
}
function me(e, t = 1) {
  return async (...u) => {
    let r = u[t] ?? {}, o = r.plugins ?? [];
    return u[t] = { ...r, plugins: Array.isArray(o) ? o : Object.values(o) }, e(...u);
  };
}
var zn = me(Su);
async function Jn(e, t) {
  let { formatted: u } = await zn(e, { ...t, cursorOffset: -1 });
  return u;
}
async function ci(e, t) {
  return await Jn(e, t) === e;
}
var fi = me(it, 0), li = { parse: me(In), formatAST: me(kn), formatDoc: me(vn), printToDoc: me(Rn), printDocToString: me(Ln) };
export {
  Jn as J,
  html as h
};
