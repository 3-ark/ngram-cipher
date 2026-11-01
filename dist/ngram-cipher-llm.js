import { $ as e, A as t, B as n, C as r, Ct as i, D as a, E as o, Et as s, F as c, G as l, H as u, I as d, J as f, K as p, L as m, M as h, N as g, O as _, P as v, Q as y, R as b, S as ee, St as x, T as te, Tt as S, U as ne, V as re, W as ie, X as ae, Y as oe, Z as se, _ as ce, _t as C, a as le, at as ue, b as de, bt as w, c as fe, ct as pe, d as me, dt as he, et as ge, f as _e, ft as T, g as ve, gt as ye, h as be, ht as E, i as D, it as xe, j as Se, k as Ce, l as we, lt as Te, m as Ee, mt as O, n as De, nt as Oe, o as ke, ot as Ae, p as je, pt as Me, q as Ne, r as k, rt as Pe, s as Fe, st as Ie, t as Le, tt as Re, u as ze, ut as A, v as Be, vt as j, w as Ve, wt as M, x as He, xt as Ue, y as We, yt as N, z as Ge } from "./encoding-DzGs7C5N.js";
import { AutoModelForCausalLM as Ke, AutoTokenizer as P, Tensor as F, env as I } from "@huggingface/transformers";
I.allowLocalModels = !1, I.allowRemoteModels = !0;
var L = /* @__PURE__ */ new Map();
function qe(e, t) {
	return t ?? (typeof process < "u" && process.versions != null && process.versions.node != null) ? "cpu" : "wasm";
}
function Je(e) {
	return Math.max(1, e || 20);
}
function Ye(e) {
	let t = [];
	if (!e || typeof e != "string" || e.trim().length === 0) return ["onnx-community/Supra-Mini-v2-0.1M-ONNX"];
	let n = e.trim();
	if (t.push(n), /^SupraLabs\/Supra-Mini-/i.test(n)) {
		let e = n.replace(/^SupraLabs\//i, "").replace(/-ONNX$/i, "");
		t.push(`onnx-community/${e}-ONNX`), t.push(`onnx-community/${e}`);
	} else if (/^onnx-community\/Supra-Mini-/i.test(n)) {
		let e = n.replace(/^onnx-community\//i, "").replace(/-ONNX$/i, "");
		t.push(`SupraLabs/${e}`);
	}
	return Array.from(new Set(t));
}
function Xe(e) {
	let t = [];
	if (!e || typeof e != "string" || e.trim().length === 0) return ["Xenova/gpt2"];
	let n = e.trim();
	if (t.push(n), /^onnx-community\/Supra-Mini-/i.test(n)) {
		let e = n.replace(/^onnx-community\//i, "").replace(/-ONNX$/i, "");
		t.push(`SupraLabs/${e}`);
	} else if (/^SupraLabs\/Supra-Mini-/i.test(n)) {
		let e = n.replace(/^SupraLabs\//i, "").replace(/-ONNX$/i, "");
		t.push(`onnx-community/${e}-ONNX`), t.push(`onnx-community/${e}`);
	}
	if (/^onnx-community\//i.test(n) || /-ONNX$/i.test(n)) {
		let e = n.replace(/-ONNX$/i, "");
		t.push(e);
		let r = e.replace(/^onnx-community\//i, "");
		t.push(r);
		let i = r.split("/"), a = i[i.length - 1], o = a.toLowerCase(), s = r.toLowerCase();
		o.startsWith("supra-mini") || s.startsWith("supra-mini") ? t.push(`SupraLabs/${a}`) : o.startsWith("llama") || s.startsWith("llama") ? t.push(`meta-llama/${a}`) : o.startsWith("qwen") || s.startsWith("qwen") ? t.push(`Qwen/${a}`) : o.startsWith("phi") || s.startsWith("phi") ? t.push(`microsoft/${a}`) : (o.startsWith("gemma") || s.startsWith("gemma")) && t.push(`google/${a}`), t.push(`Xenova/${a}`);
	}
	return t.push("Xenova/gpt2"), Array.from(new Set(t));
}
function R(e) {
	if (!e || typeof e != "string" || e.trim().length === 0) return {
		modelId: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
		quantized: !0
	};
	let t = e.trim().split("?")[0].split("#")[0], n = t.match(/huggingface\.co\/([^\/]+)\/([^\/]+)(?:\/(resolve|blob|tree|raw)\/([^\/]+)(?:\/(.+))?)?/i);
	if (n) {
		let e = `${n[1]}/${n[2]}`, t = n[4] || "main", r = (n[5] || "").replace(/^\/+|\/+$/g, ""), i, a = !0;
		if (r.toLowerCase().endsWith(".onnx")) {
			a = !1;
			let e = r.split("/").pop();
			i = e.substring(0, e.lastIndexOf(".")), r = r.includes("/") ? r.substring(0, r.lastIndexOf("/")) : "";
		}
		return {
			modelId: e,
			revision: t,
			subfolder: r && r !== "config.json" ? r : void 0,
			model_file_name: i,
			quantized: a
		};
	}
	return {
		modelId: t,
		quantized: !0
	};
}
function z(e) {
	return R(e).modelId;
}
async function B(e) {
	if (e.llmCustomModel && e.llmCustomTokenizer) return {
		model: e.llmCustomModel,
		tokenizer: e.llmCustomTokenizer
	};
	let t = R(e.llmModel), n = e.llmDtype || t.dtype || "fp16", r = [
		t.modelId,
		t.revision ?? "main",
		t.subfolder ?? "root",
		t.model_file_name ?? "default",
		n,
		e.llmDevice ?? "cpu",
		e.llmCacheDir ?? "default"
	].join("::");
	if (L.has(r)) return L.get(r);
	e.llmCacheDir && (I.cacheDir = e.llmCacheDir);
	try {
		let i = Xe(t.modelId), a, o;
		for (let e of i) try {
			if (a = await P.from_pretrained(e, { revision: t.revision ?? "main" }), a) break;
		} catch (t) {
			o = t;
			try {
				if (a = await P.from_pretrained(e), a) break;
			} catch (e) {
				o = e;
			}
		}
		if (!a) {
			let e = o instanceof Error ? o.message : String(o);
			throw Error(`Failed to load tokenizer for '${t.modelId}'. ${e}`);
		}
		let s, c, l = {};
		t.subfolder && (l.subfolder = t.subfolder), t.model_file_name && (l.file_name = t.model_file_name);
		let u = qe(e.llmDevice), d = {
			intraOpNumThreads: Je(typeof navigator < "u" ? navigator.hardwareConcurrency : void 0),
			graphOptimizationLevel: "all",
			...e.llmSessionOptions ?? {}
		}, f = [];
		f.push({
			...l,
			dtype: n,
			device: u,
			revision: t.revision ?? "main",
			session_options: d
		}), f.push({
			...l,
			dtype: n,
			revision: t.revision ?? "main",
			session_options: d
		}), f.push({
			dtype: n,
			session_options: d
		}), f.push({ session_options: d }), f.push({});
		let p = Ye(t.modelId);
		for (let e of p) {
			for (let t of f) try {
				if (s = await Ke.from_pretrained(e, t), s) break;
			} catch (e) {
				c = e;
			}
			if (s) break;
		}
		if (!s) {
			let e = c instanceof Error ? c.message : String(c);
			throw Error(e);
		}
		let m = {
			model: s,
			tokenizer: a
		};
		return L.set(r, m), m;
	} catch (e) {
		let n = e instanceof Error ? e.message : String(e);
		throw new w(`Failed to load ONNX model '${t.modelId}'. Error: ${n}`);
	}
}
function V() {
	L.clear();
}
function H(e) {
	let t = e.length;
	return {
		input_ids: new F("int64", BigInt64Array.from(e.map((e) => BigInt(e))), [1, t]),
		attention_mask: new F("int64", new BigInt64Array(t).fill(1n), [1, t])
	};
}
var U = /* @__PURE__ */ new WeakMap();
function W(e, t) {
	let n = typeof t == "object" && t ? U.get(t) : void 0;
	if (!n && typeof t == "object" && t && (n = /* @__PURE__ */ new Map(), U.set(t, n)), n && n.has(e)) return n.get(e);
	let r = t.decode([e], { skip_special_tokens: !1 }), i = !/[\r\n]/.test(r);
	return n && n.set(e, i), i;
}
function Ze(e, t, n) {
	function r(n, i, a) {
		if (n >= i) return;
		let o = n + i >> 1, s = e[o], c = t[s];
		e[o] = e[i], e[i] = s;
		let l = n;
		for (let r = n; r < i; r++) {
			let n = e[r], i = t[n];
			(i > c || i === c && n < s) && (e[r] = e[l], e[l] = n, l++);
		}
		e[i] = e[l], e[l] = s, l !== a && (l > a ? r(n, l - 1, a) : r(l + 1, i, a));
	}
	r(0, e.length - 1, n);
}
function G(e, t, n) {
	if (t < 0) return !1;
	let r = [...e, t], i = n(n.decode(r, { skip_special_tokens: !1 }), { add_special_tokens: !1 }), a = i?.input_ids?.data ?? i?.input_ids ?? i, o = Array.from(a ?? []).map(Number);
	if (o.length !== r.length) return !1;
	for (let e = 0; e < r.length; e++) if (o[e] !== r[e]) return !1;
	return !0;
}
function Qe(e, t, n, r, i) {
	let a = i?.temperature && i.temperature > 0 ? i.temperature : 1, o = e.length, s = new Set(r.all_special_ids ?? []), c = i?.precision ?? 100, l = new Float32Array(o);
	for (let t = 0; t < o; t++) {
		let n = Number(e[t]), r = a === 1 ? n : n / a;
		l[t] = c > 0 && Number.isFinite(c) ? Math.round(r * c) / c : r;
	}
	let u = i?.topP && i.topP > 0 && i.topP < 1, d = [];
	if (u) {
		for (let e = 0; e < o; e++) s.has(e) || W(e, r) && d.push({
			id: e,
			score: l[e]
		});
		d.sort((e, t) => t.score === e.score ? e.id - t.id : t.score - e.score);
	} else {
		let e = i?.topK && i.topK > 0 ? Math.max(i.topK, t * 20, 500) : Math.max(t * 20, 500), n = Math.min(o, e), a = new Int32Array(o);
		for (let e = 0; e < o; e++) a[e] = e;
		Ze(a, l, n);
		let c = a.subarray(0, n);
		c.sort((e, t) => l[t] === l[e] ? e - t : l[t] - l[e]);
		for (let e = 0; e < c.length; e++) {
			let t = c[e];
			s.has(t) || W(t, r) && d.push({
				id: t,
				score: l[t]
			});
		}
	}
	let f = d;
	if (i?.topK && i.topK > 0) {
		let e = Math.max(i.topK, t);
		d.length > e && (f = d.slice(0, e));
	}
	if (i?.topP && i.topP > 0 && i.topP < 1) {
		let e = f.length > 0 ? Math.max(...f.map((e) => e.score)) : 0, n = f.map((t) => Math.exp(t.score - e)), r = n.reduce((e, t) => e + t, 0);
		if (r > 0) {
			let e = 0, a = f.length;
			for (let o = 0; o < f.length; o++) if (e += n[o] / r, e >= i.topP) {
				a = Math.max(o + 1, t);
				break;
			}
			f = f.slice(0, a);
		}
	}
	let p = [], m = /* @__PURE__ */ new Set();
	for (let e of f) if (m.add(e.id), G(n, e.id, r) && (p.push(e.id), p.length === t)) break;
	if (p.length < t) {
		for (let e of d) if (!m.has(e.id) && (m.add(e.id), G(n, e.id, r) && (p.push(e.id), p.length === t))) break;
	}
	if (p.length < t && !u) {
		let e = [];
		for (let t = 0; t < o; t++) s.has(t) || m.has(t) || W(t, r) && e.push({
			id: t,
			score: l[t]
		});
		e.sort((e, t) => t.score === e.score ? e.id - t.id : t.score - e.score);
		for (let i of e) if (!m.has(i.id) && (m.add(i.id), G(n, i.id, r) && (p.push(i.id), p.length === t))) break;
	}
	if (p.length < t) throw new w(`StepVerify failed: Insufficient reversible tokens (found ${p.length}/${t}) across entire vocabulary pool. Aborting to prevent data corruption.`);
	return p;
}
async function K(e, t) {
	let { model: n, tokenizer: r } = await B(t), i = Math.max(1, Math.min(16, t.bitsPerToken ?? 4)), a = 1 << i, o = e.length * 8, s = /* @__PURE__ */ new Uint8Array(4);
	new DataView(s.buffer).setUint32(0, o, !1);
	let c = new Uint8Array(4 + e.length);
	c.set(s, 0), c.set(e, 4);
	let l = new k(c), u = t.llmPrompt ?? "In recent news,";
	!u.endsWith(" ") && !u.endsWith("\n") && (u += " ");
	let d = r(u, { add_special_tokens: !1 }), f = d?.input_ids?.data ?? d?.input_ids ?? d, p = Array.from(f).map(Number), m = p.slice(), h = typeof n.forward == "function" && typeof n._update_model_kwargs_for_generation == "function", g = null, _ = null;
	try {
		if (h) {
			let e = H(p);
			g = {
				input_ids: e.input_ids,
				attention_mask: e.attention_mask
			}, _ = await n.forward(g);
		}
		for (; l.hasBits;) {
			let e, o;
			if (h && _) {
				e = _.logits;
				let [, t, n] = e.dims, r = (t - 1) * n;
				o = e.data.subarray(r, r + n);
			} else {
				e = (await n(H(m))).logits;
				let [, t, r] = e.dims, i = (t - 1) * r;
				o = e.data.subarray(i, i + r);
			}
			let s = Qe(o, a, m, r, {
				temperature: t.llmTemperature,
				topP: t.llmTopP,
				topK: t.llmTopK,
				precision: t.llmLogitPrecision
			}), c = Math.min(i, l.remainingBits ?? i), u = s[l.readBits(c)];
			if (m.push(u), h && l.hasBits) try {
				n._update_model_kwargs_for_generation.length === 1 ? g = n._update_model_kwargs_for_generation({
					generated_input_ids: [[BigInt(u)]],
					outputs: _,
					model_inputs: g,
					is_encoder_decoder: !1
				}) : (g = n._update_model_kwargs_for_generation(_, g, !1), g && (g.input_ids = new F("int64", BigInt64Array.from([BigInt(u)]), [1, 1]))), _ = await n.forward(g);
			} catch {
				g = null, _ = null;
			}
		}
	} finally {
		g?.past_key_values && typeof g.past_key_values.dispose == "function" && g.past_key_values.dispose().catch?.(() => {});
	}
	let v = m.slice(p.length);
	return r.decode(v, { skip_special_tokens: !1 });
}
async function q(e, t) {
	let { model: n, tokenizer: r } = await B(t), i = Math.max(1, Math.min(16, t.bitsPerToken ?? 4)), a = 1 << i, o = t.llmPrompt ?? "In recent news,";
	!o.endsWith(" ") && !o.endsWith("\n") && (o += " ");
	let s = r(o, { add_special_tokens: !1 }), c = s?.input_ids?.data ?? s?.input_ids ?? s, l = Array.from(c).map(Number), u = r(e, { add_special_tokens: !1 }), d = u?.input_ids?.data ?? u?.input_ids ?? u, f = Array.from(d).map(Number);
	if (f.length === 0) throw new w("Carrier text does not contain any generated LLM payload tokens.");
	let p = new D(), m = l.slice(), h = null, g = 0, _ = typeof n.forward == "function" && typeof n._update_model_kwargs_for_generation == "function", v = null, y = null;
	try {
		if (_) {
			let e = H(l);
			v = {
				input_ids: e.input_ids,
				attention_mask: e.attention_mask
			}, y = await n.forward(v);
		}
		for (let e = 0; e < f.length; e++) {
			let o = f[e];
			if (h !== null && g >= 32 + h) break;
			let s, c;
			if (_ && y) {
				s = y.logits;
				let [, e, t] = s.dims, n = (e - 1) * t;
				c = s.data.subarray(n, n + t);
			} else {
				s = (await n(H(m))).logits;
				let [, e, t] = s.dims, r = (e - 1) * t;
				c = s.data.subarray(r, r + t);
			}
			let l = Qe(c, a, m, r, {
				temperature: t.llmTemperature,
				topP: t.llmTopP,
				topK: t.llmTopK,
				precision: t.llmLogitPrecision
			}).indexOf(o);
			if (l === -1) throw new w(`Decoding failed: Token ID ${o} was not found in top ${a} candidate pool during reconstruction.`);
			let u = i;
			if (h !== null) {
				let e = 32 + h - g;
				e < u && (u = e);
			}
			if (p.writeBits(l, u), g += u, m.push(o), h === null && g >= 32) {
				let e = p.toBytes();
				h = new DataView(e.buffer, e.byteOffset, 4).getUint32(0, !1);
			}
			let d = h !== null && g >= 32 + h;
			if (_ && !d && e + 1 < f.length) try {
				n._update_model_kwargs_for_generation.length === 1 ? v = n._update_model_kwargs_for_generation({
					generated_input_ids: [[BigInt(o)]],
					outputs: y,
					model_inputs: v,
					is_encoder_decoder: !1
				}) : (v = n._update_model_kwargs_for_generation(y, v, !1), v && (v.input_ids = new F("int64", BigInt64Array.from([BigInt(o)]), [1, 1]))), y = await n.forward(v);
			} catch {
				v = null, y = null;
			}
		}
	} finally {
		v?.past_key_values && typeof v.past_key_values.dispose == "function" && v.past_key_values.dispose().catch?.(() => {});
	}
	let b = p.toBytes();
	if (b.length < 4) throw new w("Carrier text payload is too short to read length header.");
	h === null && (h = new DataView(b.buffer, b.byteOffset, 4).getUint32(0, !1));
	let ee = 32 + h;
	if (g < ee) throw new w(`Truncated carrier text: Expected ${h} payload bits, but received only ${Math.max(0, g - 32)} payload bits.`);
	let x = Math.ceil(h / 8);
	return b.subarray(4, 4 + x);
}
// src/encoding/index.llm.ts
function J(e, t = N.encoding) {
	return t.style === "llm" ? K(e, t) : Le(e, t);
}
function Y(e, t = N.encoding) {
	return t.style === "llm" ? q(e, t) : De(e, t);
}
// src/ngram.llm.ts
var X = 10485760, $e = 16, Z = /* @__PURE__ */ "the.be.to.of.and.a.in.that.have.i.it.for.not.on.with.he.as.you.do.at.this.but.his.by.from.they.we.say.her.she.or.an.will.my.one.all.would.there.their.what.so.up.out.if.about.who.get.which.go.me.when.make.can.like.time.no.just.him.know.take.people.into.year.your.good.some.could.them.see.other.than.then.now.look.only.come.its.over.think.also.back.after.use.two.how.our.work.first.well.way.even.new.want.because.any.these.give.day.most.us.hello.world.secret.message.encoded.natural.english.text.is.are.was.were.has.had.said.more.very.much.through.before.between.under".split("."), et = new Map(Z.map((e, t) => [e, t])), Q = new TextEncoder();
function tt(e, t) {
	let n = new Uint8Array(t), r = 0, i = (e) => r + e.length >= t ? !1 : (n.set(e, r), r += e.length, !0), a = 0;
	for (let t of e.matchAll(/[A-Za-z]+/g)) {
		let n = t.index, r = t[0];
		if (!i(Q.encode(e.slice(a, n)))) return;
		let o = r.toLowerCase(), s = et.get(o), c = r === o, l = r === o[0].toUpperCase() + o.slice(1);
		if (s !== void 0 && (c || l)) {
			if (!i(Uint8Array.of(255, s | (l ? 128 : 0)))) return;
		} else if (!i(Q.encode(r))) return;
		a = n + r.length;
	}
	if (!i(Q.encode(e.slice(a))) || r > 65535) return;
	let o = r + 2, s = Math.ceil(o / $e) * $e;
	if (s >= t) return;
	let c = new Uint8Array(s);
	return new DataView(c.buffer).setUint16(0, r, !1), c.set(n.subarray(0, r), 2), c;
}
function nt(e) {
	if (e.length < 2) throw new j("Invalid dictionary-compressed payload.");
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint16(0, !1);
	if (t > e.length - 2 || t > X) throw new j("Invalid dictionary-compressed payload.");
	let n = e.subarray(2, 2 + t), r = new Uint8Array(X), i = 0, a = (e) => {
		if (i + e.length > X) throw new j(`Decompression limit exceeded (maximum allowed output size is ${X} bytes).`);
		r.set(e, i), i += e.length;
	};
	for (let e = 0; e < n.length; e++) {
		if (n[e] !== 255) {
			let t = e;
			for (; e < n.length && n[e] !== 255;) e++;
			a(n.subarray(t, e)), e--;
			continue;
		}
		if (e + 1 >= n.length) throw new j("Invalid dictionary-compressed payload.");
		let t = n[++e], r = Z[t & 127];
		if (r === void 0) throw new j("Invalid dictionary-compressed payload.");
		let i = t & 128 ? r[0].toUpperCase() + r.slice(1) : r;
		a(Q.encode(i));
	}
	return r.slice(0, i);
}
async function rt(e, t) {
	let n = e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength), r = new Blob([n]).stream().pipeThrough(t).getReader(), i = [], a = 0;
	for (;;) {
		let { done: e, value: t } = await r.read();
		if (e) break;
		if (t) {
			if (a += t.length, a > X) throw r.cancel(), new j(`Decompression limit exceeded (maximum allowed output size is ${X} bytes).`);
			i.push(t);
		}
	}
	let o = new Uint8Array(a), s = 0;
	for (let e of i) o.set(e, s), s += e.length;
	return o;
}
async function it(e, t, n) {
	S(t), s(e);
	let r = M(n), i = new TextEncoder().encode(e);
	if (i.length > X) throw new j(`Plaintext size exceeds maximum allowed limit of ${X} bytes.`);
	if (typeof CompressionStream > "u") throw new j("Compression Streams API is required to encode messages.");
	let a = await rt(i, new CompressionStream("gzip")), o = tt(e, i.length), c = 0, l = i;
	a.length < l.length && (c = 1, l = a), o && o.length < l.length && (c = 2, l = o);
	let u = new Uint8Array(l.length + 1);
	u[0] = c, u.set(l, 1);
	let d = await E(u, t, r.crypto), f = A(d, r.framing), p = r.crypto.saltByteLength, m = d.subarray(0, p), h = await O(t, /* @__PURE__ */ new Uint8Array(), p), g = await O(t, m, f.length - p), _ = new Uint8Array(f.length);
	return _.set(C(f.subarray(0, p), h), 0), _.set(C(f.subarray(p), g), p), await J(_, r.encoding);
}
async function $(e, t, n) {
	if (S(t), typeof e != "string" || e.trim().length === 0) throw new j("Carrier text must be a non-empty string.");
	let r = M(n), i;
	try {
		i = await Y(e, r.encoding);
	} catch (e) {
		let t = e instanceof Error ? e.message : String(e);
		throw new j(`Invalid ciphertext: ${t}`);
	}
	let a = r.crypto.saltByteLength;
	if (i.length < a) throw new j("Invalid ciphertext: Payload too short.");
	let o = await O(t, /* @__PURE__ */ new Uint8Array(), a), s = C(i.subarray(0, a), o), c = await O(t, s, i.length - a), l = C(i.subarray(a), c), u = new Uint8Array(i.length);
	u.set(s, 0), u.set(l, a);
	let d;
	try {
		d = he(u, r.framing).payload;
	} catch {
		throw new j("Decryption failed: Incorrect password or corrupted text.");
	}
	let f = await T(d, t, r.crypto);
	if (f.length < 1 || f[0] > 2) throw new j("Invalid decrypted payload format.");
	let p = f.subarray(1);
	if (f[0] === 1) {
		if (typeof DecompressionStream > "u") throw new j("Decompression Streams API is required to decode this message.");
		p = await rt(p, new DecompressionStream("gzip"));
	} else f[0] === 2 && (p = nt(p));
	return new TextDecoder("utf-8", { fatal: !0 }).decode(p);
}
// src/index.llm.ts
var at = {
	encode: it,
	decode: $,
	encryptBytes: E,
	decryptBytes: T,
	bytesToEnglishText: J,
	englishTextToBytes: Y,
	bytesToLlmText: K,
	llmTextToBytes: q,
	loadLlmModel: B,
	clearLlmModelCache: V,
	normalizeModelName: z,
	VOCABULARY: e,
	analyzeCarrierText: ge
};
export { le as ACTION_ADVERBS, ke as ACTION_OBJECTS_EXTENDED, Fe as ACTION_SUBJECTS_EXTENDED, fe as ACTION_VERBS_EXTENDED, we as ADJECTIVES, ze as ADVERBS, me as AFTER_EVENTS, _e as APPOSITIVE_REQUEST_VERBS, k as BitStreamReader, D as BitStreamWriter, je as CARRIER_WORDS, Ee as CAUSE_ADJECTIVES, be as CAUSE_NOUNS, ve as CAUSE_VERBS, ce as COMPLEMENT_ADJECTIVES, Be as CONDITION_NOUNS, We as CONDITION_VERBS, de as CONJUNCTIONS, He as CORE_TREND_NOUNS, ee as CORE_TREND_VERBS, j as CryptoError, r as D, N as DEFAULT_CONFIG, Ve as DETERMINERS, te as DISCOURSE_ADVERBS, Oe as DOMAIN_TOPICS, o as EFFECT_ADVERBS, a as EFFECT_NOUNS, _ as EFFECT_SCOPE_ADJECTIVES, Ce as EFFECT_TYPE_ADJECTIVES, t as EFFECT_VERBS, w as EncodingError, Se as F, Ue as FramingError, h as LOCATION_PROPER_NOUNS, g as METRIC_ACTION_VERBS, v as NOUNS, c as PERCENTAGES, d as POETRY_TEMPLATES, m as POS_LISTS, b as POS_SETS, Ge as POS_WORD_TO_INDEX, n as PREPOSITIONS, re as PRONOUNS, u as PROPER_NOUNS, ne as RELATIVES, ie as RELATIVE_ANTECEDENTS, l as RELATIVE_SUBJECTS, p as RELATIVE_VERBS, Ne as REPORTING_CLAUSE_VERBS, f as REPORTING_SUBJECTS_PROPER, x as StegoError, oe as TEMPLATES, ae as UNRESOLVED_COMPLEMENT_VERBS, se as VERBS, y as VERBS_PAST, e as VOCABULARY, i as ValidationError, ge as analyzeCarrierText, J as bytesToEnglishText, K as bytesToLlmText, Pe as calculateNGramScore, V as clearLlmModelCache, Te as crc32, $ as decode, T as decryptBytes, at as default, Me as deriveKey, O as deriveKeystream, it as encode, E as encryptBytes, Y as englishTextToBytes, xe as getCompatibleCandidates, ue as getNounCategory, q as llmTextToBytes, B as loadLlmModel, Re as matchTemplate, M as mergeConfig, z as normalizeModelName, A as packFrame, Ae as rankCandidates, Ie as rankToVal, ye as timingSafeEqual, he as unpackFrame, pe as valToRank, S as validatePassword, s as validatePlaintext, C as xorBytes };

//# sourceMappingURL=ngram-cipher-llm.js.map