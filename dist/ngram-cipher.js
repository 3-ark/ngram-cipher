import { $ as e, A as t, B as n, C as r, Ct as i, D as a, E as o, Et as s, F as c, G as l, H as u, I as d, J as f, K as p, L as m, M as h, N as g, O as _, P as v, Q as ee, R as te, S as ne, St as re, T as ie, Tt as y, U as ae, V as oe, W as se, X as ce, Y as b, Z as x, _ as S, _t as C, a as le, at as ue, b as de, bt as fe, c as pe, ct as me, d as w, dt as T, et as E, f as D, ft as O, g as k, gt as A, h as j, ht as M, i as N, it as P, j as F, k as I, l as L, lt as R, m as z, mt as B, n as V, nt as he, o as ge, ot as _e, p as ve, pt as ye, q as be, r as H, rt as xe, s as Se, st as Ce, t as U, tt as we, u as Te, ut as W, v as Ee, vt as G, w as De, wt as K, x as Oe, xt as ke, y as Ae, yt as je, z as Me } from "./encoding-DzGs7C5N.js";
// src/ngram.ts
var q = 10485760, J = 16, Y = /* @__PURE__ */ "the.be.to.of.and.a.in.that.have.i.it.for.not.on.with.he.as.you.do.at.this.but.his.by.from.they.we.say.her.she.or.an.will.my.one.all.would.there.their.what.so.up.out.if.about.who.get.which.go.me.when.make.can.like.time.no.just.him.know.take.people.into.year.your.good.some.could.them.see.other.than.then.now.look.only.come.its.over.think.also.back.after.use.two.how.our.work.first.well.way.even.new.want.because.any.these.give.day.most.us.hello.world.secret.message.encoded.natural.english.text.is.are.was.were.has.had.said.more.very.much.through.before.between.under".split("."), Ne = new Map(Y.map((e, t) => [e, t])), X = new TextEncoder();
function Pe(e, t) {
	let n = new Uint8Array(t), r = 0, i = (e) => r + e.length >= t ? !1 : (n.set(e, r), r += e.length, !0), a = 0;
	for (let t of e.matchAll(/[A-Za-z]+/g)) {
		let n = t.index, r = t[0];
		if (!i(X.encode(e.slice(a, n)))) return;
		let o = r.toLowerCase(), s = Ne.get(o), c = r === o, l = r === o[0].toUpperCase() + o.slice(1);
		if (s !== void 0 && (c || l)) {
			if (!i(Uint8Array.of(255, s | (l ? 128 : 0)))) return;
		} else if (!i(X.encode(r))) return;
		a = n + r.length;
	}
	if (!i(X.encode(e.slice(a))) || r > 65535) return;
	let o = r + 2, s = Math.ceil(o / J) * J;
	if (s >= t) return;
	let c = new Uint8Array(s);
	return new DataView(c.buffer).setUint16(0, r, !1), c.set(n.subarray(0, r), 2), c;
}
function Fe(e) {
	if (e.length < 2) throw new G("Invalid dictionary-compressed payload.");
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint16(0, !1);
	if (t > e.length - 2 || t > q) throw new G("Invalid dictionary-compressed payload.");
	let n = e.subarray(2, 2 + t), r = new Uint8Array(q), i = 0, a = (e) => {
		if (i + e.length > q) throw new G(`Decompression limit exceeded (maximum allowed output size is ${q} bytes).`);
		r.set(e, i), i += e.length;
	};
	for (let e = 0; e < n.length; e++) {
		if (n[e] !== 255) {
			let t = e;
			for (; e < n.length && n[e] !== 255;) e++;
			a(n.subarray(t, e)), e--;
			continue;
		}
		if (e + 1 >= n.length) throw new G("Invalid dictionary-compressed payload.");
		let t = n[++e], r = Y[t & 127];
		if (r === void 0) throw new G("Invalid dictionary-compressed payload.");
		let i = t & 128 ? r[0].toUpperCase() + r.slice(1) : r;
		a(X.encode(i));
	}
	return r.slice(0, i);
}
async function Z(e, t) {
	let n = e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength), r = new Blob([n]).stream().pipeThrough(t).getReader(), i = [], a = 0;
	for (;;) {
		let { done: e, value: t } = await r.read();
		if (e) break;
		if (t) {
			if (a += t.length, a > q) throw r.cancel(), new G(`Decompression limit exceeded (maximum allowed output size is ${q} bytes).`);
			i.push(t);
		}
	}
	let o = new Uint8Array(a), s = 0;
	for (let e of i) o.set(e, s), s += e.length;
	return o;
}
async function Q(e, t, n) {
	y(t), s(e);
	let r = K(n), i = new TextEncoder().encode(e);
	if (i.length > q) throw new G(`Plaintext size exceeds maximum allowed limit of ${q} bytes.`);
	if (typeof CompressionStream > "u") throw new G("Compression Streams API is required to encode messages.");
	let a = await Z(i, new CompressionStream("gzip")), o = Pe(e, i.length), c = 0, l = i;
	a.length < l.length && (c = 1, l = a), o && o.length < l.length && (c = 2, l = o);
	let u = new Uint8Array(l.length + 1);
	u[0] = c, u.set(l, 1);
	let d = await M(u, t, r.crypto), f = W(d, r.framing), p = r.crypto.saltByteLength, m = d.subarray(0, p), h = await B(t, /* @__PURE__ */ new Uint8Array(), p), g = await B(t, m, f.length - p), _ = new Uint8Array(f.length);
	return _.set(C(f.subarray(0, p), h), 0), _.set(C(f.subarray(p), g), p), await U(_, r.encoding);
}
async function $(e, t, n) {
	if (y(t), typeof e != "string" || e.trim().length === 0) throw new G("Carrier text must be a non-empty string.");
	let r = K(n), i;
	try {
		i = await V(e, r.encoding);
	} catch (e) {
		let t = e instanceof Error ? e.message : String(e);
		throw new G(`Invalid ciphertext: ${t}`);
	}
	let a = r.crypto.saltByteLength;
	if (i.length < a) throw new G("Invalid ciphertext: Payload too short.");
	let o = await B(t, /* @__PURE__ */ new Uint8Array(), a), s = C(i.subarray(0, a), o), c = await B(t, s, i.length - a), l = C(i.subarray(a), c), u = new Uint8Array(i.length);
	u.set(s, 0), u.set(l, a);
	let d;
	try {
		d = T(u, r.framing).payload;
	} catch {
		throw new G("Decryption failed: Incorrect password or corrupted text.");
	}
	let f = await O(d, t, r.crypto);
	if (f.length < 1 || f[0] > 2) throw new G("Invalid decrypted payload format.");
	let p = f.subarray(1);
	if (f[0] === 1) {
		if (typeof DecompressionStream > "u") throw new G("Decompression Streams API is required to decode this message.");
		p = await Z(p, new DecompressionStream("gzip"));
	} else f[0] === 2 && (p = Fe(p));
	return new TextDecoder("utf-8", { fatal: !0 }).decode(p);
}
// src/index.ts
var Ie = {
	encode: Q,
	decode: $,
	encryptBytes: M,
	decryptBytes: O,
	bytesToEnglishText: U,
	englishTextToBytes: V,
	VOCABULARY: e,
	analyzeCarrierText: E
};
export { le as ACTION_ADVERBS, ge as ACTION_OBJECTS_EXTENDED, Se as ACTION_SUBJECTS_EXTENDED, pe as ACTION_VERBS_EXTENDED, L as ADJECTIVES, Te as ADVERBS, w as AFTER_EVENTS, D as APPOSITIVE_REQUEST_VERBS, H as BitStreamReader, N as BitStreamWriter, ve as CARRIER_WORDS, z as CAUSE_ADJECTIVES, j as CAUSE_NOUNS, k as CAUSE_VERBS, S as COMPLEMENT_ADJECTIVES, Ee as CONDITION_NOUNS, Ae as CONDITION_VERBS, de as CONJUNCTIONS, Oe as CORE_TREND_NOUNS, ne as CORE_TREND_VERBS, G as CryptoError, r as D, je as DEFAULT_CONFIG, De as DETERMINERS, ie as DISCOURSE_ADVERBS, he as DOMAIN_TOPICS, o as EFFECT_ADVERBS, a as EFFECT_NOUNS, _ as EFFECT_SCOPE_ADJECTIVES, I as EFFECT_TYPE_ADJECTIVES, t as EFFECT_VERBS, fe as EncodingError, F, ke as FramingError, h as LOCATION_PROPER_NOUNS, g as METRIC_ACTION_VERBS, v as NOUNS, c as PERCENTAGES, d as POETRY_TEMPLATES, m as POS_LISTS, te as POS_SETS, Me as POS_WORD_TO_INDEX, n as PREPOSITIONS, oe as PRONOUNS, u as PROPER_NOUNS, ae as RELATIVES, se as RELATIVE_ANTECEDENTS, l as RELATIVE_SUBJECTS, p as RELATIVE_VERBS, be as REPORTING_CLAUSE_VERBS, f as REPORTING_SUBJECTS_PROPER, re as StegoError, b as TEMPLATES, ce as UNRESOLVED_COMPLEMENT_VERBS, x as VERBS, ee as VERBS_PAST, e as VOCABULARY, i as ValidationError, E as analyzeCarrierText, U as bytesToEnglishText, xe as calculateNGramScore, R as crc32, $ as decode, O as decryptBytes, Ie as default, ye as deriveKey, B as deriveKeystream, Q as encode, M as encryptBytes, V as englishTextToBytes, P as getCompatibleCandidates, ue as getNounCategory, we as matchTemplate, K as mergeConfig, W as packFrame, _e as rankCandidates, Ce as rankToVal, A as timingSafeEqual, T as unpackFrame, me as valToRank, y as validatePassword, s as validatePlaintext, C as xorBytes };

//# sourceMappingURL=ngram-cipher.js.map