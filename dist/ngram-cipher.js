//#region src/ngram.ts
var e = globalThis.crypto;
if (!e || !e.subtle) throw Error("Web Crypto API is required but unavailable in this environment.");
function t(e) {
	let t = new ArrayBuffer(e.byteLength);
	return new Uint8Array(t).set(e), t;
}
async function n(n, r) {
	let i = new TextEncoder(), a = await e.subtle.importKey("raw", i.encode(n), "PBKDF2", !1, ["deriveKey"]);
	return e.subtle.deriveKey({
		name: "PBKDF2",
		salt: t(r),
		iterations: 1e5,
		hash: "SHA-256"
	}, a, {
		name: "AES-GCM",
		length: 256
	}, !1, ["encrypt", "decrypt"]);
}
async function r(r, i) {
	let a = e.getRandomValues(/* @__PURE__ */ new Uint8Array(16)), o = e.getRandomValues(/* @__PURE__ */ new Uint8Array(12)), s = await n(i, a), c = await e.subtle.encrypt({
		name: "AES-GCM",
		iv: t(o)
	}, s, t(r)), l = new Uint8Array(c), u = new Uint8Array(a.length + o.length + l.length);
	return u.set(a, 0), u.set(o, a.length), u.set(l, a.length + o.length), u;
}
async function i(r, i) {
	if (r.length < 44) throw Error("Invalid payload length: payload too short or corrupted.");
	let a = r.subarray(0, 16), o = r.subarray(16, 28), s = r.subarray(28), c = await n(i, a);
	try {
		let n = await e.subtle.decrypt({
			name: "AES-GCM",
			iv: t(o)
		}, c, t(s));
		return new Uint8Array(n);
	} catch {
		throw Error("Decryption failed: Incorrect password or corrupted text.");
	}
}
var a = /* @__PURE__ */ "the.a.this.that.my.your.his.her.our.their.every.some.any.no.one.each.another.such.what.which.many.few.all.both.time.person.year.way.day.thing.man.world.life.hand.part.child.eye.woman.place.work.week.case.point.government.company.number.group.problem.idea.water.money.story.fact.month.lot.right.study.book.cloud.job.word.business.issue.side.kind.head.house.service.friend.father.power.hour.game.line.end.member.law.car.city.community.name.president.team.minute.kid.body.information.back.parent.face.others.level.office.door.health.art.war.history.party.result.change.morning.reason.research.girl.guy.moment.air.teacher.force.education.foot.boy.age.policy.music.market.sense.nation.plan.college.interest.death.experience.effect.use.class.control.care.field.development.role.effort.rate.heart.drug.show.leader.light.voice.wife.whole.police.mind.final.report.decision.son.view.relationship.town.road.arm.difference.thank.value.building.action.full.model.season.society.tax.director.position.player.record.paper.space.ground.form.event.official.matter.center.couple.site.project.activity.star.table.need.court.american.oil.situation.cost.industry.figure.street.image.data.phone.cover.source.author.picture.trade.term.degree.stage.land.type.south.north.east.west.surface.truth.network.range.past.future.movement.nature.quality.memory.unit.science.sound.peace.river.tree.plant.window.winter.summer.spring.autumn.letter.claim.choice.corner.valley.island.stone.shadow.flight.beauty.sign.signal.garden.forest.harbor.journey.ocean.bridge.silence.horizon.breeze.whisper.stream.mountain.feather.meadow.blossom.shelter.harvest.wonder.compass.passage.echo.flame.silver.golden.crystal.starlight.sunshine.miracle.fountain.twilight.orchard.beacon.voyage.solitude.harmony.symphony.treasure.tapestry.rhythm.serenity.zenith.velvet.amber.emerald.sapphire.autumnal.celestial.tranquil.radiant.vibrant.endless.graceful.timeless.precious.splendid.sublime.peaceful.infinite.majestic.glorious".split(".");
function o() {
	let e = /* @__PURE__ */ new Set();
	for (let t of a) e.add(t.toLowerCase());
	let t = Array.from(e);
	if (t.length < 256) throw Error(`ENGLISH_256_WORDS needs 256 unique items, but has ${t.length}`);
	return t.slice(0, 256);
}
var s = o(), c = /* @__PURE__ */ new Map();
s.forEach((e, t) => {
	c.set(e, t);
});
function l(e) {
	let t = [], n = 0, r = 8;
	for (let i = 0; i < e.length; i++) {
		let a = e[i], o = s[a];
		n === 0 && (o = o.charAt(0).toUpperCase() + o.slice(1)), n++, (n >= r || i === e.length - 1) && (o += ".", n = 0, r = 6 + a % 5), t.push(o);
	}
	return t.join(" ");
}
function u(e) {
	let t = e.replace(/[\r\n]+/g, " ").trim().split(/\s+/), n = [];
	for (let e of t) {
		if (!e) continue;
		let t = e.replace(/[.,!?;:]+$/g, "").toLowerCase(), r = c.get(t);
		if (r === void 0) throw Error(`Invalid or unrecognized token in cipher text: "${e}"`);
		n.push(r);
	}
	return new Uint8Array(n);
}
async function d(e, t) {
	return l(await r(new TextEncoder().encode(e), t));
}
async function f(e, t) {
	let n = await i(u(e), t);
	return new TextDecoder("utf-8", { fatal: !0 }).decode(n);
}
//#endregion
export { s as VOCABULARY, l as bytesToEnglishText, f as decode, i as decryptBytes, d as encode, r as encryptBytes, u as englishTextToBytes };

//# sourceMappingURL=ngram-cipher.js.map