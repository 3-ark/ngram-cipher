// src/config/index.ts
var e = class extends Error {
	constructor(e) {
		super(e), this.name = "StegoError";
	}
}, t = class extends e {
	constructor(e) {
		super(e), this.name = "CryptoError";
	}
}, n = class extends e {
	constructor(e) {
		super(e), this.name = "FramingError";
	}
}, r = class extends e {
	constructor(e) {
		super(e), this.name = "EncodingError";
	}
}, i = class extends e {
	constructor(e) {
		super(e), this.name = "ValidationError";
	}
}, a = {
	crypto: {
		pbkdf2Iterations: 1e5,
		saltByteLength: 16,
		ivByteLength: 12
	},
	framing: {
		magicHeader: new Uint8Array([78, 71]),
		version: 1,
		enableChecksum: !0
	},
	encoding: {
		sentenceEndingVariance: !0,
		style: "news",
		llmModel: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
		llmPrompt: "In recent news,",
		bitsPerToken: 4,
		llmQuantized: !0,
		llmDevice: "cpu",
		llmTemperature: 1,
		llmTopK: 50,
		llmTopP: .95,
		llmLogitPrecision: 100
	}
};
function o(e) {
	return {
		crypto: {
			...a.crypto,
			...e?.crypto
		},
		framing: {
			...a.framing,
			...e?.framing
		},
		encoding: {
			...a.encoding,
			...e?.encoding
		}
	};
}
function s(e) {
	if (!e || typeof e != "string" || e.trim().length === 0) throw new i("Password must be a non-empty string.");
}
function c(e) {
	if (typeof e != "string") throw new i("Plaintext must be a string.");
}
// src/crypto/index.ts
var l = globalThis.crypto;
if (!l || !l.subtle) throw new t("Web Crypto API is required but unavailable in this environment.");
function u(e) {
	let t = new ArrayBuffer(e.byteLength);
	return new Uint8Array(t).set(e), t;
}
async function d(e, n, r = a.crypto) {
	try {
		let t = new TextEncoder(), i = await l.subtle.importKey("raw", t.encode(e), "PBKDF2", !1, ["deriveKey"]);
		return await l.subtle.deriveKey({
			name: "PBKDF2",
			salt: u(n),
			iterations: r.pbkdf2Iterations,
			hash: "SHA-256"
		}, i, {
			name: "AES-GCM",
			length: 256
		}, !1, ["encrypt", "decrypt"]);
	} catch (e) {
		throw new t(`Key derivation failed: ${e instanceof Error ? e.message : String(e)}`);
	}
}
async function f(e, n, r = a.crypto) {
	try {
		let t = l.getRandomValues(new Uint8Array(r.saltByteLength)), i = l.getRandomValues(new Uint8Array(r.ivByteLength)), a = await d(n, t, r), o = await l.subtle.encrypt({
			name: "AES-GCM",
			iv: u(i)
		}, a, u(e)), s = new Uint8Array(o), c = new Uint8Array(t.length + i.length + s.length);
		return c.set(t, 0), c.set(i, t.length), c.set(s, t.length + i.length), c;
	} catch (e) {
		throw e instanceof t ? e : new t(`Encryption failed: ${e instanceof Error ? e.message : String(e)}`);
	}
}
function p(e, t) {
	if (e.length !== t.length) return !1;
	let n = 0;
	for (let r = 0; r < e.length; r++) n |= e[r] ^ t[r];
	return n === 0;
}
function m(e, t) {
	let n = new Uint8Array(e.length);
	for (let r = 0; r < e.length; r++) n[r] = e[r] ^ (t[r % t.length] || 0);
	return n;
}
async function h(e, t, n) {
	let r = new TextEncoder().encode(e), i = new Uint8Array(n), a = 0, o = 0;
	for (; o < n;) {
		let e = new Uint8Array(r.length + t.length + 4);
		e.set(r, 0), e.set(t, r.length), new DataView(e.buffer).setUint32(r.length + t.length, a++, !1);
		let s = await l.subtle.digest("SHA-256", e), c = new Uint8Array(s), u = Math.min(c.length, n - o);
		i.set(c.subarray(0, u), o), o += u;
	}
	return i;
}
async function g(e, n, r = a.crypto) {
	let i = r.saltByteLength + r.ivByteLength;
	if (e.length < i + 16) throw new t("Invalid payload length: payload too short or corrupted.");
	let o = e.subarray(0, r.saltByteLength), s = e.subarray(r.saltByteLength, i), c = e.subarray(i);
	try {
		let e = await d(n, o, r), t = await l.subtle.decrypt({
			name: "AES-GCM",
			iv: u(s)
		}, e, u(c));
		return new Uint8Array(t);
	} catch {
		throw new t("Decryption failed: Incorrect password or corrupted text.");
	}
}
// src/framing/index.ts
function _(e) {
	let t = 4294967295;
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e = 0; e < 8; e++) {
			let e = (r ^ t) & 1;
			t >>>= 1, e && (t ^= 3988292384), r >>>= 1;
		}
	}
	return (t ^ 4294967295) >>> 0;
}
function v(e, t = a.framing) {
	let r = e.subarray(0, 16), i = e.subarray(16);
	if (i.length > 65535) throw new n(`Payload too large for 16-bit framing: ${i.length} bytes (max 65535 bytes).`);
	let o = t.enableChecksum ? 4 : 0, s = 21 + i.length + o, c = new Uint8Array(s), l = new DataView(c.buffer);
	if (c.set(r, 0), c.set(t.magicHeader.subarray(0, 2), 16), c[18] = t.version, l.setUint16(19, i.length, !1), c.set(i, 21), t.enableChecksum) {
		let e = _(i);
		l.setUint32(21 + i.length, e, !1);
	}
	return c;
}
function y(e, t = a.framing) {
	let r = t.enableChecksum ? 4 : 0, i = 21 + r;
	if (e.length < i) throw new n(`Frame too short: ${e.length} bytes (minimum ${i} bytes required).`);
	let o = e.subarray(0, 16), s = e.subarray(16, 18), c = t.magicHeader.subarray(0, 2);
	if (!p(s, c)) throw new n(`Invalid frame magic header: expected [0x${c[0].toString(16)}, 0x${c[1].toString(16)}], got [0x${s[0].toString(16)}, 0x${s[1].toString(16)}].`);
	let l = e[18];
	if (l !== t.version) throw new n(`Unsupported frame version ${l} (expected version ${t.version}).`);
	let u = new DataView(e.buffer, e.byteOffset, e.byteLength), d = u.getUint16(19, !1), f = 21 + d + r;
	if (e.length < f) throw new n(`Truncated frame payload: expected ${d} bytes payload (total ${f} bytes), but got ${e.length} bytes total.`);
	let m = e.subarray(21, 21 + d), h = 0;
	if (t.enableChecksum) {
		h = u.getUint32(21 + d, !1);
		let e = _(m), t = /* @__PURE__ */ new Uint8Array(4), r = /* @__PURE__ */ new Uint8Array(4), i = new DataView(t.buffer), a = new DataView(r.buffer);
		if (i.setUint32(0, h, !1), a.setUint32(0, e, !1), !p(t, r)) throw new n(`Frame payload checksum mismatch: computed 0x${e.toString(16)}, frame header contained 0x${h.toString(16)}.`);
	}
	let g = new Uint8Array(16 + m.length);
	return g.set(o, 0), g.set(m, 16), {
		header: {
			salt: o,
			magic: s,
			version: l,
			payloadLength: d,
			checksum: h
		},
		payload: g
	};
}
// src/nlg/dict.ts
var b = /* @__PURE__ */ "market.economy.growth.profit.revenue.stock.climate.energy.demand.supply.shortage.surplus.trade.export.investment.production.employment.inflation.output.sales.cost.price.spending.value.capacity.earnings.imports.exports.yield.assets.rates.budget.finance.salary.benefit.resource.cargo.delivery.debt.income.volume.level.activity.traffic.attendance.services.performance.record.harvest.crops.transport.coverage.stocks.access.resources.capital.wealth.payroll.credit.expenditure.consumption.manufacturing.turnover.margin.productivity.efficiency.unemployment.housing.rent.construction.index.exchange.currency.dollar.euro.pound.oil.gas.electricity.power.water.food.wheat.grain.steel.copper.gold.silver.cotton.timber.freight.shipping.passengers.inventory.stockpile.tariff.deficit.subsidy.stimulus.commerce.valuation.portfolio.benchmark.allowance.annuity.appreciation.appropriation.arrears.audit.balance.bankruptcies.bankruptcy.bargain.barrel.bill.bond.bonus.borrowing.brokerage.bulk.bushel.bushels.business.buying.buyout.cash.circulation.clearing.coins.collateral.commodity.commodities.compensation.competition.concession.consolidation.consumer.decline.deflation.denomination.discount.distribution.dividend.downturn.duty.equity.expansion.expense.exportation.factor.factors.fee.fees.financing.fluctuation.foreclosure.gross.guarantee.import.importation.incentive.indebtedness.inflow.infrastructure.installment.insurance.interest.investments.invoice.issue.issues.lease.liability.liquidity.loan.loss.manufacture.markup.maturity.merger.monopoly.mortgage.net.obligation.outflow.outlay.overdraft.overhead.ownership.partition.pension.premium.pricing.principal.proceeds.procurement.product.property.prosperity.quota.rally.receipt.recession.recovery.redemption.refinancing.refund.registration.remittance.repayment.reserve.retail.retrenchment.revenues.royalty.saving.scarcity.securities.security.segment.settlement.share.shareholder.shareholders.solvency.speculation.stagnation.standard.sum.surcharge.tangible.tax.taxation.tenure.tonnage.trading.transaction.transfer.treasury.vendor.venture.voucher.warehouse.wholesale.asset.wage.rate.service.crop.shipment.fund.return.deposit.gain.allotment.bounty".split("."), ee = /* @__PURE__ */ "rose.grew.fell.declined.expanded.remained.continued.improved.increased.dropped.shrank.survived.persisted.lasted.advanced.recovered.surged.plunged.climbed.slipped.stabilized.rebounded.soared.dwindled.weakened.strengthened.accelerated.moderated.peaked.bottomed.plateaued.boosted.lowered.cut.gained.lost.changed.varied.eased.tightened.slowed.stalled.bounced.retreated.surpassed.leveled.fluctuated.shifted.doubled.tripled.halved.plummeted.spiked.slumped.tumbled.adjusted.aligned.altered.amplified.appreciated.broadened.collapsed.contracted.corrected.depreciated.diminished.dipped.diverged.drifted.escalated.flattened.floated.heightened.lessened.narrowed.normalized.outpaced.rallied.receded.regressed.reset.resumed.reversed.revived.settled.softened.solidified.stagnated.steepened.subsided.swelled.tapered.unraveled.upticked.yielded.accumulated.balanced.bounded.checked.consolidated.dampened.eclipsed.extended.faltered.folded.hinged.lagged.lengthened.mounted.multiplied.overtook.paced.paused.pivoted.poised.pressed.prospered.quickened.rebound.redefined.regained.relapsed.renewed.restabilized.restructured.retrenched.softer.spurred.stiffened.stimulated.swung.thrived.topped.trailed.transformed.transitioned.trended.tripped.trimmed.turned.unfolded.unsettled.upshot.wavered.widened.converged.reappeared.resurfaced.unseated.firmed.realigned.exceeded.outstripped.matched.paralleled.mirrored.abated.cooled.warmed.heated.eroded.decayed.de-escalated.slackened.averted.built.calculated.faded.graduated.intensified.progressed.absorbed.acclimated.accommodated.accorded.accrued.achieved.acquired.adapted.affected.anchored.appeared.applied.approached.approved.arose.ascended.assembled.assessed.assumed.attained.attracted.augmented.authorized.began.belied.benefited.bloomed.bolstered.branched.burgeoned.calmed.captured.catalyzed.caused.ceased.centered.channeled.cleared.closed.clustered.coalesced.coincided.collected.combined.commenced.compacted.compared.compensated.completed.complicated.composed.compounded.concentrated.concluded.condensed.conducted.conformed.conjoined.connected.constrained.consumed.contained.controlled.converted.coordinated.corresponded.countered.crept.cresting.culminated.curbed.curtailed.dawned.decelerated.decided.decreased.deepened.deferred.deflected.delayed.demanded.depleted.derived.descended.developed".split("."), te = /* @__PURE__ */ "government.president.company.council.agency.coalition.commission.authority.parliament.court.police.team.leader.minister.ambassador.official.alliance.foundation.union.journalist.governor.senator.researcher.delegate.institution.academy.institute.administration.politician.statesman.envoy.dignitary.representative.spokesman.spokesperson.spokeswoman.chairperson.chairman.chairwoman.officer.detective.investigator.inspector.auditor.examiner.specialist.expert.advisor.consultant.strategist.economist.scientist.biologist.chemist.physicist.engineer.technician.developer.programmer.designer.architect.planner.coordinator.manager.supervisor.administrator.founder.trustee.investor.shareholder.trader.broker.financier.banker.lender.creditor.borrower.merchant.vendor.supplier.contractor.operator.employer.employee.laborer.staff.crew.member.participant.attendee.cadre.pioneer.donor.sponsor.supporter.advocate.critic.opponent.ally.partner.competitor.candidate.contender.entrant.nominee.appointee.successor.predecessor.deputy.assistant.aide.associate.colleague.peer.fellow.observer.spectator.bystander.victim.survivor.inhabitant.dweller.local.native.foreigner.immigrant.refugee.migrant.traveler.visitor.guest.host.organizer.creator.writer.reporter.editor.broadcaster.columnist.correspondent.producer.filmmaker.musician.singer.performer.lawmaker.regulator.voter.judge.prosecutor.attorney.lawyer.juror.magistrate.chancellor.premier.mayor.legislator.alderman.bureaucrat.emissary.ombudsman.provost.dean.rector.commissioner.custodian.steward.guardian.arbiter.mediator.arbitrator.referee.umpire.controller.treasurer.cashier.accountant.actuary.statistician.analyst.league.crowd.rival.family.children.mother.father.neighbor.household.generation.worker.media.press.artist.director.actor.audience.author.publisher.soldier.battalion.commander.regiment.astronaut.citizen.resident.volunteer.activist.diplomat.scholar.graduate.professor.industry.community.prosecution.defense.witness.movement.board.cabinet.ministry.panel.committee.executive.directorate.bureau.department.federation.association.party.delegation.assembly.legislature.judiciary.tribunal.chamber.society.trust.consortium.syndicate.conglomerate.corporation.enterprise.firm.principal.magistrates.custodians.arbitrators.evaluator.assessor.notary.clerk.deputies.advisers.trustees".split("."), ne = /* @__PURE__ */ "policy.program.system.campaign.budget.strategy.network.foundation.treaty.border.reform.investment.project.contract.benefit.statement.agreement.proposal.amendment.regulation.standard.guideline.framework.protocol.report.verdict.sentence.evidence.broadcast.headline.coverage.interview.film.production.scene.screenplay.novel.chapter.story.edition.volume.archive.legend.memorial.forecast.petition.lecture.seminar.debate.opinion.analysis.survey.finding.conclusion.outcome.assessment.concept.theory.principle.bill.act.measure.deal.accord.resolution.motion.initiative.mandate.package.solution.decree.directive.statute.law.code.pact.covenant.charter.declaration.manifesto.compromise.settlement.arrangement.understanding.scheme.blueprint.roadmap.masterplan.agenda.schedule.timetable.pipeline.venture.undertaking.enterprise.operation.mission.task.assignment.duty.obligation.pledge.commitment.guarantee.warranty.subsidy.grant.allowance.pension.loan.credit.mortgage.debt.bond.equity.asset.fund.portfolio.account.audit.review.inquiry.investigation.study.research.paper.article.document.file.record.dossier.register.index.database.registry.catalog.directory.list.roster.manifest.invoice.receipt.ticket.permit.license.visa.passport.patent.trademark.copyright.lease.deed.title.certificate.warrant.summons.subpoena.injunction.ruling.decision.judgment.order.command.instruction.guidance.advice.recommendation.suggestion.submission.application.appeal.claim.demand.request.requisition.purchase.sale.transaction.transfer.delivery.shipment.cargo.payload.supply.stockpile.inventory.resource.facility.infrastructure.platform.software.module.component.device.processor.algorithm.model.prototype.design.structure.architecture.format.pattern.mechanism.process.procedure.method.technique.approach.practice.custom.tradition.convention.sanction.embargo.compendium.whitepaper.brief.docket.transcript.pronouncement.enactment.ordinance.proclamation.briefing.memo.memorandum.bulletin.dispatch.monograph.thesis.dissertation.manuscript.treatise.exposition.announcement.addendum.appendix.atlas.binder.circular.clipping.digest.handbook.leaflet.logbook.manual.pamphlet.periodical.proceeding.prospectus.publication.summary.tract.paperback.hardcover".split("."), re = /* @__PURE__ */ "johnson.williams.thompson.anderson.mitchell.campbell.robinson.stewart.harrison.jackson.kennedy.morrison.sullivan.patterson.henderson.crawford.marshall.spencer.tucker.wallace.andrews.douglas.fleming.gardner.hamilton.lambert.maxwell.pearson.richards.sanders.warren.webster.reuters.bloomberg.guardian.chronicle.tribune.herald.observer.gazette.clinton.carter.nixon.reagan.lincoln.churchill.macron.trudeau.merkel.erdogan.netanyahu.kishida.albanese.starmer.scholz.sunak.biden.obama.bush.trump.harris.blinken.austin.yellen.powell.lagarde.draghi.guterres.von.der.leyen.michel.borrell.stoltenberg.grossi.tedros.georgieva.malpass.bangal.king.smith.jones.brown.davis.miller.wilson.moore.taylor.thomas.white.martin.garcia.martinez.clark.rodriquez.lewis.lee.walker.hall.allen.young.hernandez.wright.lopez.hill.scott.green.adams.baker.gonzalez.nelson.perez.roberts.turner.phillips.parker.evans.edwards.collins.sanchez.morris.rogers.reed.cook.morgan.bell.murphy.bailey.rivera.cooper.richardson.cox.howard.ward.torres.peterson.gray.ramirez.james.watson.brooks.kelly.price.bennett.wood.barnes.ross.coleman.jenkins.perry.long.hughes.flores.washington.butler.simmons.foster.gonzales.bryant.alexander.russell.griffin.diaz.hayes.myers.ford.graham.woods.cole.west.jordan.owens.reynolds.fisher.ellis.gibson.mcdonald.cruz.ortiz.gomez.murray.freeman.wells.webb.simpson.stevens.porter.hunter.hicks.henry.boyd.mason.morales.clements.fletcher.snyder.gibbs.chavez.glover.mcdaniel.boone.bowman.brandon.bridges.carr.carson.chambers.chandler.chapman.christensen.cross.curtis.daniel.davenport.delgado.dennis.drake.duncan.eaton.elliott.farmer.faulkner.fitzgerald.fowler.fox.franklin.french.frost.fuller.gaines.gallagher.garrett.gates.gentry.gilbert.giles.gillespie.gilmore.glass.godfrey.golden.goodman.goodwin.gordon.alvarez.armstrong.atkinson.baldwin.barker.barton.baxter.becker.benjamin.bentley.benton.bernard".split("."), ie = /* @__PURE__ */ "severe.prolonged.sudden.widespread.intense.ongoing.regional.damaging.persistent.major.extreme.deadly.powerful.heavy.sustained.serious.acute.critical.devastating.catastrophic.unprecedented.growing.deepening.mounting.rising.worsening.escalating.expanding.spreading.pervasive.chronic.recurrent.intermittent.relentless.unyielding.unflinching.harsh.punishing.paralyzing.crippling.disruptive.destructive.ruinous.fatal.lethal.dangerous.hazardous.perilous.threatening.alarmingly.unsettling.disturbing.troubling.worrying.grave.gloomy.grim.bleak.dire.drastic.dramatic.sharp.steep.rapid.swift.abrupt.unexpected.unforeseen.unplanned.uncontrolled.unchecked.unrestrained.unbridled.rampant.universal.global.national.domestic.internal.external.foreign.systemic.structural.fundamental.deep-seated.entrenched.general.common.frequent.regular.continual.continuous.constant.unbroken.unceasing.enduring.lasting.long-standing.lingering.protracted.extended.lengthy.steady.unwavering.resolute.firm.solid.tough.rigid.strict.stringent.rigorous.exacting.demanding.challenging.difficult.complex.complicated.thorny.knotty.intricate.troublesome.problematic.vexing.baffling.perplexing.distressing.grievous.painful.costly.expensive.burdensome.onerous.taxing.exhausting.debilitating.fearsome.formidable.intolerable.unbearable.unforgiving.merciless.ferocious.fierce.wild.raging.turbulent.tempestuous.chaotic.disorderly.unsettled.precarious.unstable.volatile.fragile.vulnerable.exposed.sensitive.delicate.risky.precipitous.violent.hostile.adverse.inimical.antagonistic.injurious.detrimental.deleterious.calamitous.pernicious.noxious.harmful.unfavorable.oppressive.tyrannical.alarming.insufferable.insupportable.unendurable.agonizing.excruciating.afflicting.tormenting.harassing.plaguing.vexatious.new.local.public.political.economic.social.international.federal.military.financial.legal.official.recent.current.former.senior.key.top.leading.primary.significant.important.essential.increasing.long.short.large.small.high.low.big.little.strong.weak.hard.soft.fast.slow.deep.broad.young.old.early.late.next.last.first.final.urban.rural.northern.southern.eastern.western.annual.daily.weekly.monthly.quarterly.temporary.permanent.available.possible.likely.potential.expected.proposed.planned.unrelenting".split("."), ae = /* @__PURE__ */ "drought.storm.flood.conflict.crisis.shortage.strike.blockade.recession.disruption.protest.fire.outbreak.failure.decline.collapse.delay.dispute.war.epidemic.unrest.violence.wildfire.instability.inflation.pressure.tension.friction.stagnation.embargo.sanction.disaster.snowfall.heat.cyclone.hurricane.typhoon.avalanche.earthquake.eruption.landslide.tsunami.contamination.pollution.infection.famine.poverty.unemployment.bankruptcy.default.devaluation.turmoil.chaos.riot.rebellion.insurgency.clash.confrontation.stalemate.deadlock.gridlock.impasse.bottleneck.scarcity.depletion.shortfall.glut.imbalance.fluctuation.uncertainty.vulnerability.risk.threat.hazard.danger.downturn.slump.contraction.austerity.boycott.walkout.stoppage.closure.shutdown.blackout.outage.breakdown.malfunction.defect.leak.spill.accident.crash.tragedy.catastrophe.incident.phenomenon.shift.transition.development.surge.wave.escalation.expansion.spread.growth.rise.increase.drop.fall.loss.damage.harm.destruction.toll.burden.strain.stress.hardship.struggle.volatility.panic.penalty.calamity.mishap.cataclysm.upheaval.convulsion.disturbance.tumult.commotion.agitation.ferment.strife.dissension.discord.anarchy.lawlessness.disorder.disarray.confusion.paralysis.depression.retrenchment.deficit.paucity.dearth.lack.want.deficiency.insufficiency.inadequacy.meagerness.scantiness.tightness.squeeze.crunch.pinch.contention.controversy.argument.quarrel.wrangle.feud.hostility.animosity.antagonism.enmity.collision.encounter.skirmish.engagement.altercation.adversity.tribulation.affliction.woe.misfortune.mischance.reversal.setback.misadventure.casualty.fatality.report.market.policy.program.system.country.government.president.election.campaign.economy.industry.community.company.security.council.budget.summit.treaty.border.reform.strategy.network.agency.coalition.alliance.foundation.commission.authority.parliament.court.trial.verdict.sentence.witness.evidence.justice.crime.police.investigation.arrest.charge.prison.defense.prosecution.education.research.university.science.technology.treatment.vaccine.medicine.surgery.team.season.match.victory.championship.tournament.stadium.record.conflagration.blizzard.inundation.deluge.torrent.downpour.freeze.frostbite.coldwave.heatwave".split("."), oe = /* @__PURE__ */ "continued.persisted.worsened.intensified.escalated.deepened.spread.grew.expanded.increased.emerged.erupted.lasted.struck.hit.developed.lingered.accelerated.flared.raged.subsided.moderated.halted.softened.stiffened.unfolded.returned.ended.re-emerged.began.started.commenced.initiated.surged.spiked.soared.plunged.collapsed.faded.dissipated.vanished.ceased.stopped.concluded.receded.retreated.dwindled.diminished.lessened.eased.relaxed.abated.slowed.stalled.paused.wavered.fluctuated.varied.shifted.changed.deteriorated.compounded.multiplied.proliferated.broadened.widened.heightened.amplified.magnified.mounted.accumulated.rose.swelled.built.manifested.appeared.materialized.surfaced.arose.occurred.transpired.impacted.affected.disrupted.paralyzed.crippled.impeded.delayed.threatened.endangered.endured.prevailed.stayed.loomed.reappeared.resurfaced.renewed.reignited.resumed.rebounded.recovered.relapsed.reverted.remained.hovered.abided.survived.dominated.reigned.obtained.existed.proceeded.progressed.advanced.evolved.befell.visited.afflicted.plagued.troubled.disturbed.upset.unsettled.derailed.hampered.hindered.obstructed.blocked.checked.curbed.restrained.stifled.smothered.quenched.extinguished.subdued.quelled.suppressed.repressed.crushed.stamped.nipped.choked.aggravated.exacerbated.strengthened.reinforced.fortified.prolonged.extended.protracted.lengthened.sustained.maintained.perpetuated.augmented.burgeoned.climaxed.consolidated.crystallized.said.reported.claimed.argued.revealed.confirmed.announced.showed.warned.noted.added.explained.stated.described.planned.expected.sought.called.demanded.urged.proposed.requested.supported.endorsed.promoted.defended.protected.upheld.led.drove.guided.directed.managed.oversaw.controlled.monitored.created.designed.launched.introduced.established.formed.improved.boosted.reduced.cut.lowered.dropped.declined.fell.shrank.limited.faced.encountered.confronted.addressed.tackled.handled.regulated.resolved.joined.entered.attended.gathered.assembled.met.connected.opened.triggered.activated.enabled.closed.finished.terminated.suspended.moved.transferred.relocated.traveled.crossed.reached.approached.held.provided.offered.delivered.supplied.gave.granted.allocated.distributed.received.climbed.slipped.stabilized.intensified".split("."), se = /* @__PURE__ */ "unprecedented.critical.significant.essential.crucial.vital.decisive.unclear.vulnerable.unresolved.limited.substantial.urgent.promising.troubling.reassuring.uncertain.volatile.precarious.delicate.unstable.tense.challenging.difficult.complex.problematic.controversial.sensitive.pressing.acute.grave.severe.intense.moderate.favorable.unfavorable.positive.negative.mixed.balanced.stable.firm.steady.fragile.weak.strong.encouraging.disappointing.dismal.bleak.grim.gloomy.optimistic.pessimistic.cautious.skeptical.confident.determined.committed.resolute.unwavering.steadfast.unyielding.inflexible.rigid.strict.stringent.rigorous.exacting.demanding.onerous.burdensome.taxing.exhausting.debilitating.disruptive.destructive.ruinous.costly.expensive.valuable.precious.priceless.invaluable.beneficial.advantageous.lucrative.profitable.productive.fruitful.effective.efficient.successful.victorious.triumphant.dominant.supreme.paramount.primary.principal.chief.main.central.focal.pivotal.key.core.fundamental.basic.elemental.indispensable.necessary.imperative.unavoidable.inevitable.imminent.impending.approaching.looming.doubtful.questionable.debatable.disputed.ambiguous.equivocal.opaque.clouded.shadowed.perilous.hazardous.untrustworthy.dubious.acceptable.accessible.acclaimed.new.major.local.national.public.political.economic.social.international.global.federal.regional.military.financial.legal.official.recent.current.former.senior.top.leading.important.serious.growing.increasing.long.short.large.small.high.low.big.little.hard.soft.fast.slow.deep.broad.young.old.early.late.next.last.first.final.foreign.domestic.urban.rural.northern.southern.eastern.western.annual.daily.weekly.monthly.quarterly.ongoing.temporary.permanent.available.possible.likely.potential.expected.proposed.planned.scheduled.additional.further.continued.remaining.existing.established.traditional.conventional.independent.separate.distinct.unique.specific.particular.special.exclusive.medical.clinical.scientific.technical.digital.electronic.nuclear.chemical.environmental.sustainable.renewable.clean.green.natural.organic.raw.commercial.industrial.corporate.private.direct.strategic.operational.competitive.innovative.creative.advanced.democratic.conservative.liberal.progressive.satisfactory.tenable".split("."), ce = /* @__PURE__ */ "crisis.shortage.conflict.unrest.violence.drought.flood.rainfall.wildfire.epidemic.instability.supply.demand.output.trade.disruption.inflation.recession.blockade.strike.tension.outbreak.failure.decline.collapse.delay.dispute.pressure.stagnation.slowdown.friction.hostility.turmoil.war.emergency.deficit.surplus.volatility.panic.sanction.embargo.penalty.hardship.struggle.impact.disaster.storm.weather.snowfall.heat.cyclone.hurricane.typhoon.avalanche.earthquake.eruption.landslide.tsunami.contamination.pollution.infection.famine.poverty.unemployment.bankruptcy.default.devaluation.chaos.riot.rebellion.insurgency.clash.confrontation.stalemate.deadlock.gridlock.impasse.bottleneck.scarcity.depletion.shortfall.glut.imbalance.fluctuation.uncertainty.vulnerability.risk.threat.hazard.danger.downturn.slump.contraction.austerity.boycott.walkout.stoppage.closure.shutdown.blackout.outage.breakdown.malfunction.defect.leak.spill.accident.crash.tragedy.catastrophe.incident.quandary.predicament.dilemma.plight.exigency.strife.tumult.adversity.affliction.agitation.alienation.anarchy.animosity.antagonism.anxiety.report.market.policy.program.system.country.government.president.election.campaign.economy.industry.community.company.security.council.budget.summit.treaty.border.reform.strategy.network.agency.coalition.alliance.foundation.commission.authority.parliament.court.trial.verdict.sentence.witness.evidence.justice.crime.police.investigation.arrest.charge.prison.defense.prosecution.education.research.university.science.technology.treatment.vaccine.medicine.surgery.team.season.match.victory.championship.tournament.stadium.record.league.crowd.rival.title.score.family.children.mother.father.district.neighbor.household.generation.finance.export.investment.growth.profit.revenue.stock.climate.energy.environment.forest.ocean.wildlife.resource.bridge.highway.airport.station.tunnel.harbor.terminal.office.building.project.contract.worker.union.salary.benefit.media.journalist.broadcast.headline.coverage.statement.interview.press.artist.museum.gallery.festival.performance.concert.theater.conflagration.blizzard.deluge.downpour.torrent.freeze.spillover.aftershock.fiasco.imbroglio.cataclysm".split("."), le = /* @__PURE__ */ "escalated.deepened.intensified.spread.persisted.continued.worsened.expanded.increased.emerged.lasted.stabilized.accelerated.eased.declined.recovered.erupted.struck.hit.developed.subsided.moderated.halted.softened.stiffened.lingered.unfolded.flared.raged.returned.ended.re-emerged.began.started.commenced.initiated.surged.spiked.soared.plunged.collapsed.faded.dissipated.vanished.ceased.stopped.concluded.receded.retreated.dwindled.diminished.lessened.relaxed.abated.slowed.stalled.paused.wavered.fluctuated.varied.shifted.changed.deteriorated.compounded.aggravated.exacerbated.heightened.magnified.multiplied.proliferated.surfaced.arose.accumulated.said.reported.claimed.argued.revealed.confirmed.announced.showed.warned.noted.added.explained.stated.described.planned.expected.sought.called.demanded.urged.proposed.requested.supported.endorsed.promoted.defended.protected.maintained.upheld.led.drove.guided.directed.managed.oversaw.controlled.monitored.created.built.designed.launched.introduced.established.formed.grew.rose.improved.advanced.strengthened.boosted.reduced.cut.lowered.dropped.fell.shrank.limited.faced.encountered.confronted.addressed.tackled.handled.regulated.resolved.joined.entered.attended.gathered.assembled.met.connected.opened.triggered.activated.enabled.closed.finished.terminated.suspended.moved.transferred.relocated.traveled.crossed.reached.approached.remained.stayed.endured.survived.held.provided.offered.delivered.supplied.gave.granted.allocated.distributed.received.got.obtained.gained.earned.collected.accepted.acquired.required.needed.compelled.involved.included.contained.covered.encompassed.allowed.permitted.awarded.authorized.approved.sanctioned.prevented.blocked.prohibited.restricted.banned.forbade.rejected.denied.transformed.modified.adjusted.adapted.altered.revised.updated.studied.examined.investigated.reviewed.analyzed.evaluated.assessed.produced.generated.manufactured.yielded.extracted.furnished.fabricated.constructed.tested.checked.inspected.verified.validated.certified.ratified.published.released.issued.circulated.relayed.broadcast.aired.transmitted.threatened.endangered.risked.challenged.undermined.destabilized.disrupted.weakened.believed.climbed.slipped.rebounded.peaked.bottomed.plateaued.escalated".split("."), ue = /* @__PURE__ */ "government.company.council.agency.coalition.commission.authority.parliament.court.union.university.school.foundation.alliance.community.board.cabinet.ministry.panel.committee.executive.department.federation.association.party.delegation.assembly.legislature.judiciary.tribunal.chamber.society.trust.consortium.syndicate.conglomerate.corporation.enterprise.firm.institution.academy.institute.administration.bureau.directorate.office.service.organization.group.body.unit.division.branch.section.wing.embassy.consulate.mission.deputation.legation.policy.program.system.strategy.plan.proposal.bill.law.act.measure.reform.treaty.agreement.accord.deal.pact.covenant.charter.protocol.framework.standard.guideline.directive.decree.regulation.statute.mandate.initiative.project.scheme.blueprint.roadmap.masterplan.agenda.schedule.venture.operation.campaign.inquiry.study.survey.audit.review.investigation.analysis.report.document.dossier.file.record.register.index.database.platform.software.algorithm.network.facility.plant.station.center.complex.hub.port.terminal.site.park.zone.region.district.sector.industry.market.exchange.bank.fund.treasury.portfolio.account.reserve.budget.subsidy.grant.loan.credit.mortgage.bond.contract.lease.deed.permit.license.patent.trademark.copyright.title.certificate.warrant.ruling.verdict.decision.order.command.instruction.guidance.advice.recommendation.suggestion.submission.application.petition.appeal.claim.demand.request.motion.resolution.amendment.code.rule.norm.practice.custom.convention.tradition.heritage.memorial.archive.library.museum.gallery.studio.theater.club.guild.league.conference.summit.forum.caucus.congress.senate.regime.state.nation.republic.kingdom.empire.bloc.monopoly.advisory.country.president.election.economy.security.border.conflict.trial.sentence.witness.evidence.justice.crime.police.arrest.charge.prison.penalty.defense.prosecution.education.research.science.technology.treatment.vaccine.medicine.surgery.team.season.match.victory.championship.tournament.stadium.dossiers.registries.blueprints.masterplans.subcommissions.archidioxes.bureaucracy.supercommittee.consortiums.syndicates".split("."), de = /* @__PURE__ */ "local.national.global.regional.domestic.public.private.rural.urban.international.federal.provincial.coastal.northern.eastern.western.southern.central.inland.remote.border.maritime.continental.worldwide.nationwide.statewide.citywide.countywide.districtwide.industrywide.systemwide.widespread.corporate.commercial.industrial.financial.economic.agricultural.municipal.metropolitan.suburban.territorial.overseas.foreign.internal.external.primary.secondary.core.key.main.major.overall.total.combined.general.broad.comprehensive.extensive.sweeping.prevailing.dominant.principal.leading.chief.prime.top.headline.baseline.average.annual.quarterly.monthly.weekly.daily.seasonal.structural.systemic.fundamental.operational.tactical.strategic.institutional.organizational.sectoral.market.retail.wholesale.trade.export.import.fiscal.monetary.budgetary.capital.credit.banking.investment.equity.bond.asset.liability.revenue.income.wage.salary.price.cost.profit.margin.yield.return.growth.output.supply.demand.cargo.freight.shipping.transport.energy.fuel.power.utility.resource.commodity.food.farm.crop.grain.steel.metal.mineral.chemical.digital.tech.software.media.service.consumer.labor.employment.housing.mortgage.construction.property.real-estate.insurance.healthcare.medical.pharmaceutical.transit.aviation.logistics.distribution.supply-chain.enterprise.manufacturing.mining.environmental.green.sustainable.renewable.nuclear.solar.wind.hydro.bio.telecom.network.infrastructure.civic.government.state.community.social.civil.legal.regulatory.policy.administrative.executive.legislative.judicial.court.official.formal.standard.basic.focal.heavy.light.critical.urgent.pressing.vital.essential.decisive.crucial.pivotal.underlying.ongoing.current.recent.existing.established.traditional.conventional.independent.separate.distinct.specific.particular.special.exclusive.scientific.technical.electronic.organic.raw.direct.successful.effective.efficient.productive.competitive.innovative.creative.advanced.popular.mainstream.secure.safe.ancient.historic.modern.contemporary.classic.authentic.normal.regular.common.typical.ordinary.dramatic.positive.negative.neutral.mixed.balanced.fair.equal.diverse.open.closed.active".split("."), fe = /* @__PURE__ */ "food.fuel.energy.consumer.industrial.agricultural.financial.trade.export.market.retail.wholesale.farm.crop.oil.gas.power.water.housing.mortgage.transport.freight.shipping.passenger.grain.wheat.steel.copper.gold.silver.timber.cotton.corn.soy.coffee.cocoa.sugar.meat.dairy.livestock.poultry.fish.chemical.paper.plastic.cement.mineral.metal.solar.wind.hydro.electric.nuclear.utility.telecom.digital.tech.software.medical.health.pharma.auto.vehicle.airline.transit.rail.highway.port.postal.media.news.bank.credit.loan.bond.stock.fund.asset.tax.tariff.wage.salary.labor.job.work.factory.plant.mine.mill.store.shop.home.land.estate.property.office.hotel.tour.travel.cargo.mail.express.parcel.cyber.cloud.data.net.web.phone.mobile.radio.tv.film.music.art.book.print.press.law.court.police.guard.defense.navy.army.air.space.satellite.rocket.drone.eco.green.bio.organic.raw.refined.fresh.frozen.processed.heavy.light.crude.clean.safe.bulk.liquid.solid.hard.soft.high.low.prime.core.main.key.top.chief.lead.major.mega.micro.macro.global.local.urban.rural.state.national.federal.public.private.joint.group.team.firm.corp.trust.note.bill.coin.cash.grid.pipe.line.road.track.dock.yard.site.zone.park.hub.node.link.center.unit.depot.terminal.station.branch.post.desk.counter.board.floor.exchange.bench.panel.system.network.service.program.project.strategy.policy.scheme.venture.brand.product.model.range.class.grade.tier.level.type.kind.form.sort.rate.index.yield.cost.price.value.worth.amount.share.equity.debt.claim.automotive.aerospace.biotech.cleantech.e-commerce.fintech.infotech.nanotech.new.political.economic.social.structural.systemic.multinational".split("."), pe = /* @__PURE__ */ "supply.output.production.growth.revenue.demand.trade.exports.imports.employment.traffic.sales.stocks.services.access.value.income.earnings.spending.consumption.yield.activity.volume.capacity.performance.turnover.margin.inflation.payroll.inventory.credit.borrowing.lending.liquidity.solvency.valuation.revenues.capital.assets.stimulus.commerce.fees.holdings.credits.debts.rents.dues.levies.surcharges.markups.budgets.wealth.proceeds.cargoes.recoveries.declines.drops.cuts.arrears.guarantees.claims.settlements.trades.deals.purchases.bids.offers.quotes.rates.estimates.projections.forecasts.targets.limits.caps.ranges.levels.figures.totals.sums.amounts.averages.medians.ratios.percentages.fractions.splits.portions.allocations.distributions.disbursements.payouts.stipends.grants.bounties.charges.tolls.fares.worth.capacities.volumes.outputs.turnovers.investments.payrolls.spendings.consumptions.incomes.aggregates.baselines.benchmarks.benchmarking.valuations.appraisals.evaluations.reviews.surveys.studies.analyses.allotments.allowances.appropriations.rebates.remittances.payments.clearings.transfers.withdrawals.vouchers.notes.securities.financing.accruals.accumulations.advancements.amalgamations.amortizations.annuities.report.market.policy.program.system.country.government.president.election.campaign.economy.industry.community.company.security.council.budget.crisis.summit.treaty.border.conflict.reform.strategy.network.agency.coalition.alliance.foundation.commission.authority.parliament.court.trial.verdict.sentence.witness.evidence.justice.crime.police.investigation.arrest.charge.prison.penalty.defense.prosecution.education.research.university.science.technology.treatment.vaccine.medicine.surgery.profit.stock.climate.energy.shortage.surplus.export.investment.cost.price.import.asset.wage.rate.finance.salary.benefit.resource.cargo.delivery.debt.level.attendance.service.record.harvest.crop.transport.coverage.shipment.liability.dividend.share.equity.bond.fund.return.loss.gain.balance.reserve.deposit.loan.expenditure.manufacturing.order.receipt.productivity.efficiency.unemployment.housing.payoffs.reimbursements.outlays.surpluses.deficits.inflows.outflows.allocators.remittals.repayments".split("."), me = /* @__PURE__ */ "rose.fell.declined.increased.dropped.shrank.improved.recovered.worsened.intensified.weakened.stalled.surged.persisted.tightened.expanded.grew.slumped.plunged.climbed.slipped.stabilized.rebounded.soared.dwindled.strengthened.accelerated.moderated.peaked.bottomed.plateaued.boosted.lowered.cut.gained.lost.changed.varied.eased.slowed.bounced.retreated.surpassed.leveled.fluctuated.shifted.doubled.tripled.halved.plummeted.spiked.tumbled.adjusted.aligned.altered.amplified.appreciated.broadened.collapsed.contracted.corrected.depreciated.diminished.dipped.diverged.drifted.escalated.flattened.floated.heightened.lessened.narrowed.normalized.outpaced.rallied.receded.regressed.reset.resumed.reversed.revived.settled.softened.solidified.stagnated.steepened.subsided.swelled.tapered.unraveled.upticked.yielded.accumulated.balanced.bounded.checked.consolidated.dampened.eclipsed.extended.faltered.folded.hinged.lagged.lengthened.mounted.multiplied.overtook.paced.paused.pivoted.poised.pressed.prospered.quickened.rebound.redefined.regained.relapsed.renewed.restabilized.restructured.retrenched.softer.spurred.stiffened.stimulated.swung.thrived.topped.trailed.transformed.transitioned.trended.tripped.trimmed.turned.unfolded.unsettled.upshot.wavered.widened.converged.reappeared.resurfaced.unseated.firmed.realigned.exceeded.outstripped.matched.paralleled.mirrored.abated.cooled.warmed.heated.eroded.decayed.de-escalated.slackened.advanced.averted.built.calculated.continued.faded.graduated.lasted.progressed.remained.absorbed.acclimated.accommodated.accorded.accrued.said.reported.claimed.argued.revealed.confirmed.announced.showed.warned.noted.added.explained.stated.described.planned.expected.sought.called.demanded.urged.proposed.requested.supported.endorsed.promoted.defended.protected.maintained.upheld.led.drove.guided.directed.managed.oversaw.controlled.monitored.created.developed.designed.launched.introduced.established.formed.reduced.limited.faced.encountered.confronted.addressed.tackled.handled.regulated.resolved.joined.entered.attended.gathered.assembled.met.connected.opened.began.started.initiated.commenced.triggered.activated.enabled.closed.ended.stopped.concluded.finished.halted.terminated.suspended.survived.achieved.acquired".split("."), he = [
	"finance",
	"governance",
	"diplomacy",
	"crisis"
], ge = {
	finance: /* @__PURE__ */ new Set(/* @__PURE__ */ "market.economy.budget.finance.trade.export.investment.growth.profit.revenue.stock.salary.benefit.rate.rates.value.cost.price.capital.assets.liabilities.dividends.shares.equities.bonds.funds.credit.income.earnings.yield.yields.tax.tariff.currency.dollar.euro.pound.oil.gas.gold.silver.bank.brokerage.inflation.output.sales.debt.spending.turnover.margin.margins.valuation.portfolio.rose.grew.fell.declined.expanded.surged.dropped.shrank.recovered.stabilized.boosted.lowered.cut.gained.lost.plunged".split(".")),
	governance: /* @__PURE__ */ new Set(/* @__PURE__ */ "government.president.council.agency.coalition.commission.authority.parliament.court.police.official.leader.minister.governor.senator.policy.program.reform.strategy.verdict.sentence.evidence.contract.statement.proposal.amendment.regulation.standard.guideline.framework.protocol.bill.act.measure.accord.resolution.mandate.decree.directive.statute.law.code.announced.approved.passed.signed.adopted.ratified.enacted.rejected.vetoed.repealed".split(".")),
	diplomacy: /* @__PURE__ */ new Set(/* @__PURE__ */ "summit.treaty.alliance.foundation.ambassador.diplomat.delegate.envoy.representatives.dignitary.emissary.talks.negotiations.discussions.debates.meetings.sessions.conferences.briefings.dialogues.proceedings.agreements.settlements.reconciliations.compromises.pacts.charters.covenants.washington.london.beijing.moscow.berlin.paris.tokyo.brussels.geneva.vienna.madrid.rome.seoul.cairo.warsaw.prague.stockholm.helsinki.reuters.bloomberg.guardian.stated.reported.confirmed.noted.argued.explained.revealed.declared.reaffirmed".split(".")),
	crisis: /* @__PURE__ */ new Set(/* @__PURE__ */ "drought.storm.flood.conflict.crisis.shortage.strike.blockade.recession.disruption.protest.fire.outbreak.failure.collapse.delay.dispute.war.epidemic.unrest.violence.wildfire.instability.pressure.tension.friction.embargo.sanction.disaster.snowfall.heat.cyclone.hurricane.earthquake.damage.threat.hazard.danger.downturn.hardship.struggle.calamity.upheaval.escalated.deepened.intensified.spread.persisted.worsened.erupted.struck.hit".split("."))
}, _e = /* @__PURE__ */ new Set(/* @__PURE__ */ "government.president.council.agency.coalition.alliance.foundation.commission.authority.parliament.court.police.school.student.teacher.university.hospital.patient.doctor.team.player.coach.athlete.league.crowd.rival.family.children.mother.father.neighbor.household.generation.worker.union.media.journalist.press.artist.director.actor.audience.author.publisher.soldier.battalion.commander.regiment.astronaut.citizen.resident.volunteer.activist.leader.minister.ambassador.diplomat.delegate.governor.senator.official.researcher.scholar.graduate.professor.faculty.company.industry.community.prosecution.defense.witness.movement".split(".")), ve = /* @__PURE__ */ new Set(/* @__PURE__ */ "report.policy.program.treaty.reform.strategy.verdict.sentence.evidence.contract.broadcast.headline.coverage.statement.interview.film.production.scene.screenplay.novel.chapter.story.edition.volume.archive.legend.memorial.forecast.petition.agreement.proposal.amendment.regulation.standard.guideline.framework.protocol.lecture.seminar.debate.opinion.analysis.survey.finding.conclusion.outcome.assessment.concept.theory.principle".split(".")), ye = /* @__PURE__ */ new Set(/* @__PURE__ */ "market.economy.budget.finance.trade.export.investment.growth.profit.revenue.stock.salary.benefit.temperature.rainfall.supply.demand.shortage.surplus.score.penalty.value.cost.price.rate.climate.energy.pollution.resource.production.outcome.shipment.cargo.delivery.forecast.employment.inflation.output.sales.debt.income.spending.volume.level.activity.traffic.attendance.capacity.earnings.imports.exports.operations.services.costs.prices.profits.performance.record.weather.harvest.crops.transport.coverage.yield.stocks.access.resources.deliveries.shortages.shipments.supplies.assets.liabilities.dividends.shares.equities.bonds.funds.capital.wealth.wages.payroll.rates.returns.losses.gains.balances.reserves.deposits.loans.credit.expenditure.consumption.manufacturing.orders.receipts.turnover.margin.margins.yields.productivity.efficiency.unemployment.housing.rent.mortgages.construction.index.indices.exchange.currency.dollar.euro.pound.oil.gas.coal.electricity.power.water.food.wheat.grain.steel.copper.gold.silver.cotton.timber.freight.shipping.passengers.inventory.inventories.stockpile".split(".")), be = /* @__PURE__ */ new Set(/* @__PURE__ */ "election.campaign.crisis.summit.border.conflict.trial.crime.investigation.arrest.charge.prison.justice.education.research.science.technology.treatment.vaccine.medicine.surgery.disease.season.match.victory.championship.tournament.protest.movement.demonstration.operation.deployment.mission.weather.storm.drought.flood.disaster.history.tradition.heritage.ceremony.performance.concert.festival.unrest.violence.wildfire.instability.epidemic.strike.blockade.recession.disruption.fire.outbreak.failure.decline.collapse.delay.accident.attack.heat.snowfall.wind.earthquake.eruption.avalanche".split(".")), xe = /* @__PURE__ */ new Set(/* @__PURE__ */ "system.country.district.network.stadium.climate.energy.environment.pollution.forest.ocean.wildlife.resource.bridge.highway.airport.railway.station.tunnel.harbor.terminal.office.building.project.museum.gallery.theater.culture.studio.library.monument.planet.orbit.rocket.spacecraft.telescope.weapon.missile.infrastructure.platform.software.database.server.algorithm.device.processor.signal.channel.frequency.spectrum.antenna.receiver.transmitter.module.campus.warehouse.shipment.cargo.delivery.language.symbol.pattern.structure.method".split("."));
function Se(e) {
	let t = e.toLowerCase();
	return _e.has(t) ? "AGENT" : ye.has(t) ? "METRIC" : ve.has(t) ? "DOCUMENT" : be.has(t) ? "EVENT" : xe.has(t) ? "SYSTEM_OBJECT" : "AGENT";
}
var x = /* @__PURE__ */ new Set(/* @__PURE__ */ "said.stated.reported.claimed.argued.suggested.warned.noted.added.explained.described.demanded.urged.proposed.requested.recounted.asserted.acknowledged.disclosed.pledged.voiced.insisted.reaffirmed.highlighted.underlined.specified".split(".")), S = /* @__PURE__ */ new Set([
	"showed",
	"indicated",
	"revealed",
	"confirmed",
	"noted",
	"explained",
	"detailed",
	"outlined",
	"highlighted",
	"focused",
	"addressed",
	"covered",
	"included",
	"contained",
	"published",
	"released",
	"issued",
	"presented",
	"announced",
	"approved",
	"suggested"
]), C = /* @__PURE__ */ new Set(/* @__PURE__ */ "grew.rose.fell.declined.expanded.shrank.dropped.increased.reduced.surged.recovered.stabilized.fluctuated.boosted.lowered.cut.gained.lost.changed.varied.remained.continued.plunged.climbed.slipped.rebounded.soared.dwindled.weakened.strengthened.accelerated.moderated.peaked.bottomed.plateaued".split(".")), w = /* @__PURE__ */ new Set([
	"began",
	"started",
	"ended",
	"concluded",
	"continued",
	"persisted",
	"escalated",
	"unfolded",
	"occurred",
	"loomed",
	"spread",
	"intensified",
	"worsened",
	"disrupted",
	"affected",
	"struck",
	"hit",
	"halted",
	"triggered",
	"followed",
	"threatened",
	"caused"
]), Ce = /* @__PURE__ */ new Set([
	"operated",
	"functioned",
	"performed",
	"worked",
	"failed",
	"expanded",
	"improved",
	"started",
	"connected",
	"ran",
	"processed",
	"transmitted",
	"generated",
	"changed"
]), we = /* @__PURE__ */ new Set(/* @__PURE__ */ "raised.lowered.increased.decreased.reduced.expanded.boosted.cut.gained.lost.adjusted.amplified.curbed.curtailed.slashed.trimmed.augmented.capped.doubled.elevated.enhanced.extended.halved.heightened.lifted.limited.maximized.minimized.moderated.modified.multiplied.narrowed.optimized.restrained.scaled.shortened.stabilized.stimulated.surpassed.tightened.tripled.widened.yielded.balanced.eased.slowed.stalled.bounced.leveled.fluctuated.shifted.plummeted.spiked.soared.slumped.tumbled.appreciated.broadened.collapsed.contracted.corrected.depreciated.diminished.dipped.drifted.flattened.floated.lessened.normalized.outpaced.rallied.receded.regressed.reset.resumed.reversed.revived.settled.softened.stagnated.steepened.subsided.swelled.tapered.accumulated.bounded.consolidated.dampened.faltered.lagged.lengthened.mounted.overtook.paced.pivoted.poised.prospered.quickened.regained.relapsed.renewed.retrenched.spurred.stiffened.swung.thrived.topped.trailed.trended.wavered".split(".")), Te = /* @__PURE__ */ new Set([
	"adopted",
	"approved",
	"amended",
	"enacted",
	"implemented",
	"introduced",
	"issued",
	"passed",
	"proposed",
	"ratified",
	"rejected",
	"revised",
	"signed",
	"upheld"
]), Ee = /* @__PURE__ */ new Set(/* @__PURE__ */ "sharply.steadily.rapidly.gradually.significantly.modestly.slightly.dramatically.quickly.slowly.noticeably.substantially.marginally.suddenly.steeply.precipitously.markedly.considerably.tremendously.immensely.drastically.severely.acutely.intensely.profoundly.deeply.greatly.hugely.massively.enormously.vastly.appreciably.perceptibly.visibly.moderately.progressively.continuously.extensively.alarmingly".split(".")), De = /* @__PURE__ */ new Set([
	...we,
	"fell",
	"grew",
	"rose",
	"declined",
	"shrank",
	"dropped",
	"surged",
	"recovered",
	"fluctuated",
	"plunged",
	"climbed",
	"slipped",
	"rebounded",
	"soared",
	"dwindled",
	"weakened",
	"strengthened",
	"accelerated",
	"moderated",
	"peaked",
	"bottomed",
	"plateaued"
]), Oe = /* @__PURE__ */ new Set([
	"a",
	"an",
	"another",
	"each",
	"every",
	"its",
	"one",
	"this"
]), ke = /* @__PURE__ */ new Set(/* @__PURE__ */ "access.advice.assistance.baggage.behavior.clothing.damage.education.evidence.equipment.finance.furniture.growth.hardware.homework.information.justice.knowledge.laughter.machinery.music.news.pollution.rainfall.research.software.traffic.transport.weather.work".split(".")), Ae = /* @__PURE__ */ new Set([
	"children",
	"men",
	"people",
	"police",
	"women"
]), je = /* @__PURE__ */ new Set([
	"analysis",
	"basis",
	"business",
	"campus",
	"consensus",
	"crisis",
	"gas",
	"glass",
	"headquarters",
	"means",
	"news",
	"series",
	"species",
	"status"
]);
function Me(e) {
	for (let t = e.length - 1; t >= 0; t--) {
		let n = e[t].toLowerCase();
		if (_e.has(n) || ve.has(n) || ye.has(n) || be.has(n) || xe.has(n) || Le.has(n)) {
			if (e.slice(Math.max(0, t - 4), t).map((e) => e.toLowerCase()).some((e) => Ie.has(e))) continue;
			return n;
		}
	}
	return "";
}
function Ne(e) {
	let t = e.toLowerCase();
	return Ae.has(t) ? !0 : !je.has(t) && /(?:s|ies|ves)$/.test(t) && !/(?:ss|us|is)$/.test(t);
}
function Pe(e) {
	let t = 2 ** Math.floor(Math.log2(e.length));
	return e.slice(0, t);
}
function Fe(e, t, n, r) {
	if (e.length < 2) return [...e];
	let i;
	if (n === "VP") {
		let n = Me(t);
		if (n) {
			let t = Se(n), r;
			t === "METRIC" ? r = /* @__PURE__ */ new Set([...C, ...we]) : t === "EVENT" ? r = /* @__PURE__ */ new Set([...w, ...C]) : t === "DOCUMENT" ? r = /* @__PURE__ */ new Set([
				...S,
				...x,
				...Te
			]) : t === "SYSTEM_OBJECT" ? r = /* @__PURE__ */ new Set([
				...Ce,
				...C,
				...w
			]) : t === "AGENT" && (i = e.filter((e) => !De.has(e.toLowerCase()))), r && (i = e.filter((e) => r.has(e.toLowerCase())));
		}
	} else n === "N" ? t.slice(-3).reverse().find((e) => Oe.has(e.toLowerCase())) && (i = e.filter((e) => !Ne(e) && !ke.has(e.toLowerCase()))) : n === "R" && C.has(t[t.length - 1]?.toLowerCase()) && (i = e.filter((e) => Ee.has(e.toLowerCase())));
	return i ||= [...e], i.length < 2 ? [...e] : Pe(i);
}
var Ie = /* @__PURE__ */ new Set(/* @__PURE__ */ "about.above.across.after.against.along.among.around.at.before.behind.below.beneath.beside.between.beyond.by.despite.during.for.from.in.into.near.of.off.on.onto.over.past.since.through.throughout.to.toward.towards.under.until.upon.with.within.without".split(".")), Le = /* @__PURE__ */ new Set(/* @__PURE__ */ "moon.river.forest.ocean.wind.rain.snow.cloud.sky.sea.tree.branch.leaf.flower.bird.stone.mountain.valley.meadow.shore.lake.stream.shadow.dawn.dusk.night.star.flame.garden.field.silence.season.frost.ember.mist.sunlight.starlight.comet.desert.island.pathway.horizon.reflection.echo.whisper.breeze.storm.twilight.harbor.cavern.glade.summit.pine.willow.feather.shell.tide.wave.spark.light.haven.clearing.canopy.solitude.time.memory.dream.music.solace.wonder.heart.spirit.sorrow.promise.presence.distance.passage.rhythm.secret.lullaby".split(".")), Re = /* @__PURE__ */ new Set([
	"whispered",
	"murmured",
	"spoke",
	"called",
	"sang",
	"echoed",
	"breathed",
	"waited",
	"faded",
	"flowed",
	"danced",
	"lingered",
	"glowed",
	"drifted",
	"shimmered",
	"shone",
	"rose",
	"fell",
	"awakened",
	"slumbered",
	"wandered",
	"slept",
	"rested",
	"bloomed"
]), ze = /* @__PURE__ */ new Set(/* @__PURE__ */ "the.a.an.this.that.these.those.some.any.no.one.its.each.every.another.my.our.his.her.your.their.in.of.to.for.on.with.at.by.from.into.about.after.during.between.through.across.over.under.before.since.against.around.among.within.toward.towards.upon.along.beyond.without.despite.until.throughout.above.below.beside.beneath.near.and.or.but.while.as.yet.although.because.though.whereas.unless.whether.when.where.if.it.they.them.we.us.he.him.she.i.me.you.which.who.whom.whose.is.was.are.were.be.been.being.has.have.had.do.does.did.can.could.will.would.shall.should.may.might.must.became.seemed.appeared".split(".")), Be = {
	report: {
		showed: 10,
		indicated: 10,
		revealed: 10,
		confirmed: 10,
		suggested: 9,
		detailed: 9,
		published: 8,
		released: 8
	},
	market: {
		rose: 10,
		fell: 10,
		grew: 10,
		declined: 10,
		expanded: 9,
		dropped: 9,
		surged: 9,
		recovered: 9
	},
	economy: {
		grew: 10,
		expanded: 10,
		slowed: 9,
		recovered: 9,
		shrank: 8,
		declined: 8
	},
	growth: {
		slowed: 10,
		accelerated: 10,
		continued: 9,
		remained: 8,
		dropped: 8
	},
	president: {
		announced: 10,
		stated: 10,
		signed: 9,
		visited: 9,
		urged: 9,
		met: 8,
		warned: 8
	},
	government: {
		announced: 10,
		approved: 10,
		confirmed: 9,
		proposed: 9,
		launched: 9,
		passed: 8
	},
	police: {
		arrested: 10,
		investigated: 10,
		searched: 9,
		detained: 9,
		confirmed: 8,
		reported: 8
	},
	court: {
		ruled: 10,
		decided: 10,
		rejected: 9,
		confirmed: 9,
		dismissed: 8,
		upheld: 8
	},
	minister: {
		stated: 10,
		confirmed: 10,
		urged: 9,
		emphasized: 9,
		promised: 8,
		announced: 8
	},
	company: {
		announced: 10,
		reported: 10,
		launched: 9,
		expanded: 9,
		acquired: 8,
		released: 8
	},
	council: {
		approved: 10,
		adopted: 9,
		passed: 9,
		met: 8,
		reviewed: 8
	},
	disease: {
		spread: 10,
		struck: 9,
		worsened: 9,
		affected: 8,
		persisted: 8
	},
	storm: {
		struck: 10,
		approached: 9,
		caused: 9,
		damaged: 8,
		passed: 8
	},
	crisis: {
		worsened: 10,
		deepened: 10,
		escalated: 9,
		continued: 9,
		began: 8
	},
	survey: {
		showed: 10,
		revealed: 10,
		indicated: 9,
		found: 9,
		suggested: 8
	},
	investigation: {
		revealed: 10,
		found: 10,
		continued: 9,
		focused: 8,
		concluded: 8
	},
	policy: {
		changed: 10,
		required: 9,
		improved: 9,
		failed: 8
	},
	system: {
		failed: 10,
		operated: 9,
		improved: 9,
		expanded: 8,
		changed: 8
	},
	database: {
		expanded: 10,
		updated: 9,
		stored: 8,
		grew: 8
	},
	user: {
		created: 10,
		updated: 10,
		saved: 9,
		shared: 9,
		deleted: 8
	},
	data: {
		showed: 10,
		indicated: 10,
		suggested: 9,
		revealed: 9
	},
	article: {
		reported: 10,
		described: 10,
		highlighted: 9,
		discussed: 9
	},
	note: {
		stated: 10,
		detailed: 10,
		included: 9,
		summarized: 9
	},
	page: {
		contained: 10,
		displayed: 10,
		showed: 9,
		featured: 9
	},
	wind: {
		blew: 10,
		whispered: 10,
		rose: 9,
		carried: 9,
		howled: 8
	},
	star: {
		shone: 10,
		glowed: 10,
		sparkled: 9,
		faded: 8
	},
	shadow: {
		fell: 10,
		lengthened: 10,
		danced: 9,
		vanished: 8
	},
	rain: {
		fell: 10,
		washed: 9,
		poured: 9,
		stopped: 8
	},
	sunlight: {
		warmed: 10,
		streamed: 10,
		filled: 9,
		faded: 8
	},
	energy: {
		output: 10,
		prices: 10,
		supply: 9,
		demand: 9,
		market: 8,
		crisis: 8
	},
	food: {
		prices: 10,
		supply: 10,
		production: 9,
		shortages: 9,
		market: 8
	},
	consumer: {
		prices: 10,
		spending: 10,
		demand: 9,
		confidence: 9,
		goods: 8
	},
	interest: {
		rates: 10,
		rate: 10
	},
	central: {
		bank: 10,
		government: 8
	},
	trade: {
		deficit: 10,
		surplus: 10,
		agreement: 9,
		policy: 9,
		volume: 8
	},
	severe: {
		shortage: 10,
		drought: 10,
		crisis: 9,
		storm: 9,
		impact: 8
	},
	shortage: {
		persisted: 10,
		worsened: 9,
		continued: 9,
		eased: 8
	},
	talks: {
		remained: 10,
		continued: 9,
		resumed: 8,
		ended: 8
	},
	proposal: {
		passed: 9,
		rejected: 10,
		approved: 10,
		accepted: 9
	},
	reform: {
		backed: 10,
		approved: 9,
		passed: 9,
		proposed: 8
	},
	rates: {
		rose: 10,
		fell: 10,
		increased: 9,
		dropped: 9
	},
	agency: {
		approved: 10,
		rejected: 10,
		announced: 9,
		reported: 9
	},
	coalition: {
		backed: 10,
		approved: 9,
		criticized: 8,
		formed: 8
	},
	the: {
		major: 10,
		global: 10,
		national: 10,
		public: 10,
		new: 10,
		economic: 9,
		government: 10,
		president: 10,
		market: 10,
		company: 9,
		report: 9,
		court: 8,
		council: 8,
		economy: 9,
		system: 8,
		country: 9,
		election: 8,
		minister: 8,
		official: 8,
		leader: 8,
		conference: 8,
		committee: 8,
		agency: 9,
		coalition: 9,
		energy: 9,
		food: 9,
		central: 9,
		moon: 10,
		river: 10,
		silent: 9,
		quiet: 9,
		ancient: 9,
		luminous: 9,
		endless: 9,
		golden: 9,
		sacred: 9,
		gentle: 9,
		starlight: 9,
		twilight: 9
	},
	a: {
		new: 10,
		major: 10,
		significant: 9,
		key: 9,
		recent: 8,
		large: 8,
		statement: 9,
		report: 9,
		decision: 9,
		meeting: 8,
		agreement: 9,
		plan: 8,
		proposal: 8,
		campaign: 8,
		strategy: 8,
		solution: 8,
		gentle: 10,
		quiet: 10,
		luminous: 9,
		soft: 9,
		fragile: 9,
		silent: 9,
		solitary: 9,
		distant: 9,
		radiant: 9,
		serene: 9
	},
	above: {
		the: 10,
		a: 9,
		each: 8,
		every: 8,
		her: 8,
		my: 8,
		our: 8,
		his: 8
	},
	beside: {
		the: 10,
		a: 9,
		each: 8,
		every: 8,
		her: 8,
		my: 8,
		our: 8,
		his: 8
	},
	beyond: {
		the: 10,
		a: 9,
		each: 8,
		every: 8,
		her: 8,
		my: 8,
		our: 8,
		his: 8
	},
	beneath: {
		the: 10,
		a: 9,
		each: 8,
		every: 8,
		her: 8,
		my: 8,
		our: 8,
		his: 8
	},
	through: {
		the: 10,
		a: 9,
		each: 8,
		every: 8,
		her: 8,
		my: 8,
		our: 8,
		his: 8
	},
	within: {
		the: 10,
		a: 9,
		each: 8,
		every: 8,
		her: 8,
		my: 8,
		our: 8,
		his: 8
	},
	quiet: {
		river: 10,
		flame: 10,
		solitude: 10,
		night: 9,
		stream: 9,
		breeze: 9,
		silence: 9,
		garden: 9,
		harbor: 8
	},
	silent: {
		night: 10,
		river: 10,
		shadow: 9,
		forest: 9,
		echo: 9,
		sky: 8
	},
	gentle: {
		breeze: 10,
		rain: 10,
		river: 10,
		whisper: 9,
		stream: 9,
		warmth: 9
	},
	luminous: {
		sky: 10,
		moon: 10,
		star: 9,
		radiance: 9,
		night: 9
	},
	an: {
		international: 10,
		official: 9,
		important: 9,
		annual: 9,
		early: 8,
		urgent: 8,
		extensive: 8,
		active: 8,
		economic: 8,
		immediate: 8
	},
	in: {
		washington: 10,
		london: 10,
		paris: 9,
		beijing: 9,
		europe: 9,
		america: 9,
		the: 10,
		a: 8,
		recent: 8,
		major: 8,
		public: 8,
		global: 8
	},
	on: {
		monday: 10,
		tuesday: 10,
		wednesday: 10,
		thursday: 10,
		friday: 10,
		the: 10,
		a: 8,
		policy: 9,
		trade: 9,
		security: 9,
		climate: 9
	},
	for: {
		the: 10,
		a: 8,
		national: 8,
		public: 8,
		economic: 8,
		global: 8,
		peace: 9,
		growth: 9,
		security: 9,
		reform: 9
	},
	with: {
		the: 10,
		a: 8,
		key: 8,
		senior: 8,
		international: 8,
		local: 8,
		support: 9,
		confidence: 8,
		enthusiasm: 8
	},
	at: {
		the: 10,
		a: 8,
		home: 9,
		present: 8,
		least: 8,
		night: 8,
		stanford: 8,
		harvard: 8,
		oxford: 8
	},
	by: {
		the: 10,
		a: 8,
		local: 8,
		federal: 8,
		official: 8,
		police: 9
	},
	from: {
		the: 10,
		a: 8,
		washington: 8,
		london: 8,
		china: 8,
		japan: 8
	},
	to: {
		the: 10,
		a: 8,
		support: 9,
		protect: 9,
		build: 9,
		expand: 9,
		improve: 9,
		address: 9,
		develop: 9,
		promote: 9
	},
	recently: {
		announced: 10,
		reported: 10,
		confirmed: 10,
		revealed: 9,
		approved: 9,
		launched: 9,
		published: 9,
		introduced: 9
	},
	officially: {
		announced: 10,
		confirmed: 10,
		launched: 9,
		approved: 9,
		opened: 9,
		started: 9,
		endorsed: 8
	},
	publicly: {
		supported: 10,
		defended: 9,
		stated: 9,
		criticized: 8,
		endorsed: 9,
		backed: 9,
		called: 8
	},
	major: {
		report: 10,
		policy: 10,
		summit: 10,
		agreement: 10,
		market: 9,
		reform: 9,
		crisis: 9,
		breakthrough: 9,
		project: 9,
		investment: 9
	},
	global: {
		market: 10,
		economy: 10,
		trade: 9,
		community: 9,
		network: 9,
		growth: 9,
		alliance: 8,
		crisis: 8,
		summit: 8
	},
	national: {
		security: 10,
		policy: 10,
		economy: 9,
		election: 9,
		council: 9,
		guard: 8,
		interest: 8,
		assembly: 8
	},
	economic: {
		growth: 10,
		policy: 10,
		reform: 9,
		crisis: 9,
		development: 9,
		recovery: 8,
		impact: 8,
		instability: 8
	},
	international: {
		community: 10,
		trade: 9,
		treaty: 9,
		summit: 9,
		alliance: 8,
		court: 8,
		law: 8,
		cooperation: 8
	},
	has: {
		announced: 10,
		confirmed: 10,
		launched: 9,
		approved: 9,
		revealed: 9,
		expanded: 8,
		increased: 8,
		signed: 8
	},
	have: {
		announced: 10,
		confirmed: 10,
		agreed: 9,
		reached: 9,
		demanded: 8,
		called: 8,
		supported: 8
	},
	was: {
		announced: 10,
		reported: 10,
		launched: 9,
		approved: 9,
		formed: 8,
		signed: 8,
		held: 8,
		completed: 8
	},
	were: {
		reported: 10,
		announced: 9,
		discovered: 8,
		arrested: 8,
		released: 8,
		held: 8,
		modified: 7
	}
}, Ve = {
	"the government": {
		announced: 10,
		approved: 10,
		confirmed: 9,
		proposed: 9,
		launched: 8
	},
	"the president": {
		announced: 10,
		stated: 9,
		visited: 8,
		met: 8,
		signed: 8
	},
	"the court": {
		ruled: 10,
		decided: 9,
		rejected: 8,
		confirmed: 8,
		dismissed: 8
	},
	"the minister": {
		stated: 10,
		confirmed: 9,
		urged: 8,
		emphasized: 8,
		promised: 8
	},
	"the company": {
		announced: 10,
		reported: 10,
		launched: 9,
		expanded: 8,
		acquired: 8
	},
	"the council": {
		approved: 10,
		adopted: 9,
		passed: 9,
		met: 8,
		reviewed: 8
	},
	"the agency": {
		approved: 10,
		rejected: 10,
		announced: 9,
		reported: 9
	},
	"the coalition": {
		backed: 10,
		approved: 9,
		criticized: 8,
		formed: 8
	},
	"the central": { bank: 10 },
	"central bank": {
		raised: 10,
		lowered: 10,
		kept: 9,
		cut: 9
	},
	"interest rates": {
		rose: 10,
		fell: 10,
		increased: 9,
		dropped: 9
	},
	"energy output": {
		rose: 10,
		fell: 10,
		increased: 9,
		dropped: 9
	},
	"food prices": {
		rose: 10,
		fell: 10,
		increased: 9,
		dropped: 9
	},
	"consumer prices": {
		rose: 10,
		fell: 10,
		increased: 9,
		dropped: 9
	},
	"severe shortage": {
		persisted: 10,
		worsened: 9,
		continued: 9
	},
	"the talks": {
		remained: 10,
		continued: 9,
		ended: 8
	},
	"remained unresolved": {
		as: 8,
		because: 8,
		while: 8
	},
	"in a": {
		recent: 10,
		major: 9,
		statement: 8,
		report: 8,
		meeting: 8
	},
	"according to": {
		reports: 10,
		officials: 9,
		sources: 9,
		experts: 8,
		data: 8
	},
	"a new": {
		policy: 10,
		report: 9,
		study: 9,
		project: 9,
		initiative: 8,
		system: 8
	},
	"a major": {
		step: 10,
		breakthrough: 10,
		agreement: 9,
		report: 9,
		summit: 8
	},
	"announced a": {
		new: 10,
		major: 10,
		plan: 9,
		agreement: 9,
		policy: 8
	},
	"confirmed the": {
		news: 10,
		report: 10,
		decision: 9,
		appointment: 8,
		agreement: 8
	},
	"led to": {
		a: 10,
		widespread: 8,
		significant: 8,
		major: 8,
		increased: 7
	},
	"focused on": {
		the: 10,
		economic: 8,
		national: 8,
		future: 8,
		building: 7
	},
	"the moon": {
		slept: 10,
		glowed: 10,
		rose: 9,
		shone: 9,
		drifted: 8
	},
	"the river": {
		flowed: 10,
		danced: 9,
		shimmered: 9,
		lingered: 8
	},
	"a gentle": {
		breeze: 10,
		river: 10,
		rain: 9,
		whisper: 9
	},
	"a quiet": {
		flame: 10,
		silence: 10,
		river: 9,
		night: 9
	},
	"a disease": {
		spread: 10,
		struck: 10,
		worsened: 9,
		affected: 9
	},
	"the disease": {
		spread: 10,
		struck: 10,
		worsened: 9,
		affected: 9
	},
	"a storm": {
		struck: 10,
		damaged: 9,
		passed: 8,
		caused: 8
	},
	"the storm": {
		struck: 10,
		damaged: 9,
		passed: 8,
		caused: 8
	},
	"the crisis": {
		worsened: 10,
		deepened: 10,
		escalated: 9,
		continued: 8
	},
	"a survey": {
		showed: 10,
		revealed: 10,
		indicated: 9,
		suggested: 8
	},
	"the survey": {
		showed: 10,
		revealed: 10,
		indicated: 9,
		suggested: 8
	},
	"the report": {
		showed: 10,
		indicated: 10,
		revealed: 9,
		confirmed: 9
	},
	"the policy": {
		changed: 10,
		improved: 9,
		required: 9,
		failed: 8
	},
	"the database": {
		expanded: 10,
		grew: 9,
		stored: 8
	},
	"the article": {
		reported: 10,
		stated: 10,
		described: 9,
		highlighted: 9
	},
	"the user": {
		saved: 10,
		created: 10,
		updated: 9,
		shared: 9
	},
	"the note": {
		stated: 10,
		detailed: 10,
		showed: 9,
		explained: 9
	},
	"the wind": {
		whispered: 10,
		blew: 10,
		rose: 9,
		howled: 8
	}
}, He = {
	"the prime minister": {
		announced: 10,
		confirmed: 10,
		stated: 9,
		visited: 8
	},
	"the secretary of": {
		state: 10,
		defense: 10,
		treasury: 9,
		energy: 8
	},
	"according to the": {
		report: 10,
		official: 9,
		minister: 8,
		president: 8
	},
	"a spokesman for": {
		the: 10,
		government: 9,
		company: 8,
		president: 8
	},
	"in a recent": {
		report: 10,
		statement: 10,
		interview: 9,
		speech: 8
	},
	"the united states": {
		announced: 10,
		signed: 9,
		warned: 8,
		supported: 8
	},
	"in a public": {
		statement: 10,
		report: 10,
		interview: 9,
		speech: 9
	},
	"an overnight military": {
		operation: 10,
		assault: 10,
		action: 9,
		strike: 9
	}
}, Ue = {
	"stated tuesday in a": {
		public: 10,
		recent: 10,
		official: 9,
		brief: 8
	},
	"stated on tuesday in": {
		a: 10,
		washington: 8
	},
	"tuesday in a public": {
		statement: 10,
		report: 10,
		interview: 9
	},
	"overnight military assault on": { the: 10 },
	"was shared ahead of": { time: 10 },
	"no intelligence was shared": {
		ahead: 10,
		before: 9
	}
};
function We(e, t, n) {
	let r = e.toLowerCase(), i = 0, a = t.length, o = a >= 1 ? t[a - 1].toLowerCase() : "", s = a >= 2 ? t[a - 2].toLowerCase() : "", c = a >= 3 ? t[a - 3].toLowerCase() : "", l = a >= 4 ? t[a - 4].toLowerCase() : "";
	if (o && s && c && l) {
		let e = Ue[`${l} ${c} ${s} ${o}`];
		e && e[r] && (i += 1e4 * e[r]);
	}
	if (o && s && c) {
		let e = He[`${c} ${s} ${o}`];
		e && e[r] && (i += 1e3 * e[r]);
	}
	if (o && s) {
		let e = Ve[`${s} ${o}`];
		e && e[r] && (i += 100 * e[r]);
	}
	if (o) {
		let e = Be[o];
		e && e[r] && (i += 10 * e[r]);
	}
	r.length >= 2 && r.length <= 12 && (i += 1);
	let u = Me(t);
	if (u) {
		let e = Le.has(u), t = Se(u);
		e ? Re.has(r) ? i += 50 : x.has(r) && (i -= 200) : t === "EVENT" ? w.has(r) || C.has(r) ? i += 50 : x.has(r) && (i -= 200) : t === "METRIC" ? C.has(r) || w.has(r) ? i += 50 : x.has(r) && (i -= 200) : t === "DOCUMENT" ? (S.has(r) || x.has(r)) && (i += 50) : t === "SYSTEM_OBJECT" ? Ce.has(r) || C.has(r) || w.has(r) ? i += 50 : x.has(r) && (i -= 200) : t === "AGENT" && (x.has(r) || S.has(r) || Ce.has(r)) && (i += 30);
	}
	return n && ge[n] && ge[n].has(r) && (i += 100), t.some((e) => e.toLowerCase() === r) && !ze.has(r) && (i -= 500), i;
}
function Ge(e, t, n) {
	if (!e || e.length <= 1) return e ? [...e] : [];
	let r = e.map((e, r) => ({
		word: e,
		originalIndex: r,
		score: We(e, t, n)
	}));
	return r.sort((e, t) => t.score === e.score ? e.originalIndex - t.originalIndex : t.score - e.score), r.map((e) => e.word);
}
function Ke(e, t, n) {
	if (t <= 0) return 0;
	let r = 1 << t;
	if (n < r) throw Error(`Candidate count N (${n}) is less than bit capacity 2^bitCount (${r}).`);
	if (e < 0 || e >= r) throw Error(`Value ${e} out of bounds for bitCount ${t} (valid range: 0..${r - 1}).`);
	return e;
}
function T(e, t, n) {
	if (t <= 0) return 0;
	let r = 1 << t;
	if (n < r) throw Error(`Candidate count N (${n}) is less than bit capacity 2^bitCount (${r}).`);
	if (e < 0 || e >= r) throw Error(`Rank ${e} out of bounds for bitCount ${t} (valid range: 0..${r - 1}).`);
	return e;
}
// src/nlg/index.ts
function E(e, t, n, r) {
	let i = {
		type: "data",
		list: e,
		label: t
	};
	return n && (i.punctuationAfter = n), r && (i.punctuationBefore = r), i;
}
function D(e, t, n, r) {
	let i = {
		type: "filler",
		list: e,
		label: t
	};
	return n && (i.punctuationAfter = n), r && (i.punctuationBefore = r), i;
}
function O(e, t = []) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		let e = t.trim().toLowerCase();
		e && n.add(e);
	}
	for (let e of t) {
		if (n.size >= 256) break;
		let t = e.trim().toLowerCase();
		t && n.add(t);
	}
	let r = Array.from(n);
	if (r.length < 256) throw Error(`List size ${r.length} is less than required 256.`);
	return r.slice(0, 256);
}
var k = O(/* @__PURE__ */ "report.market.policy.program.system.country.government.president.election.campaign.economy.industry.community.company.security.council.budget.crisis.summit.treaty.border.conflict.reform.strategy.network.agency.coalition.alliance.foundation.commission.authority.parliament.court.trial.verdict.sentence.witness.evidence.justice.crime.police.investigation.arrest.charge.prison.penalty.defense.prosecution.school.student.teacher.education.research.university.science.technology.hospital.patient.doctor.treatment.vaccine.medicine.surgery.disease.team.player.coach.season.match.victory.championship.tournament.stadium.record.athlete.league.crowd.rival.title.score.family.children.mother.father.district.neighbor.household.generation.finance.trade.export.investment.growth.profit.revenue.stock.climate.energy.environment.pollution.forest.ocean.wildlife.resource.bridge.highway.airport.railway.station.tunnel.harbor.terminal.office.building.project.contract.worker.union.salary.benefit.media.journalist.broadcast.headline.coverage.statement.interview.press.artist.museum.gallery.festival.performance.concert.theater.culture.film.director.actor.audience.production.studio.scene.screenplay.author.novel.chapter.story.library.publisher.edition.volume.history.tradition.heritage.ceremony.monument.archive.legend.memorial.weather.storm.forecast.temperature.rainfall.drought.flood.disaster.mission.satellite.rocket.spacecraft.planet.orbit.astronaut.telescope.soldier.battalion.commander.regiment.weapon.missile.operation.deployment.citizen.resident.volunteer.activist.protest.petition.movement.demonstration.leader.minister.ambassador.diplomat.delegate.governor.senator.official.agreement.proposal.amendment.regulation.standard.guideline.framework.protocol.infrastructure.platform.software.database.server.algorithm.device.processor.signal.channel.frequency.spectrum.antenna.receiver.transmitter.module.researcher.scholar.graduate.professor.faculty.campus.lecture.seminar.debate.opinion.analysis.survey.finding.conclusion.outcome.assessment.supply.demand.shortage.surplus.warehouse.shipment.cargo.delivery.language.symbol.pattern.structure.method.concept.theory.principle".split(".")), qe = O(/* @__PURE__ */ "says.reports.claims.argues.suggests.reveals.confirms.announces.shows.indicates.warns.notes.adds.explains.states.describes.plans.expects.seeks.calls.demands.urges.proposes.requests.supports.backs.endorses.promotes.defends.protects.maintains.upholds.leads.drives.guides.directs.manages.oversees.controls.monitors.creates.builds.develops.designs.launches.introduces.establishes.forms.increases.grows.expands.rises.improves.advances.strengthens.boosts.reduces.cuts.lowers.drops.declines.falls.shrinks.limits.faces.encounters.confronts.addresses.tackles.handles.regulates.resolves.joins.enters.participates.attends.gathers.assembles.meets.connects.opens.begins.starts.initiates.commences.triggers.activates.enables.closes.ends.stops.concludes.finishes.halts.terminates.suspends.moves.shifts.transfers.relocates.travels.crosses.reaches.approaches.remains.stays.continues.persists.endures.lasts.survives.holds.provides.offers.delivers.supplies.gives.grants.allocates.distributes.receives.gets.obtains.gains.earns.collects.accepts.acquires.requires.needs.compels.involves.includes.contains.covers.encompasses.allows.permits.empowers.lets.awards.authorizes.approves.sanctions.prevents.blocks.prohibits.restricts.bans.forbids.rejects.denies.changes.transforms.modifies.adjusts.adapts.alters.revises.updates.studies.examines.investigates.reviews.analyzes.evaluates.assesses.measures.produces.generates.manufactures.yields.outputs.furnishes.fabricates.constructs.tests.checks.inspects.verifies.validates.certifies.ratifies.audits.publishes.releases.issues.circulates.relays.broadcasts.airs.transmits.threatens.endangers.risks.challenges.undermines.destabilizes.disrupts.weakens.believes.considers.thinks.assumes.estimates.predicts.anticipates.speculates.works.operates.functions.performs.serves.contributes.assists.cooperates.raises.lifts.elevates.heightens.amplifies.escalates.intensifies.magnifies.wins.captures.secures.achieves.attains.retains.conquers.prevails.loses.misses.fails.forfeits.surrenders.concedes.withdraws.abandons.helps.aids.bolsters.facilitates.sustains.benefits.reinforces.rallies.teaches.trains.educates.instructs.mentors.coaches.steers.prepares".split(".")), A = O(/* @__PURE__ */ "said.reported.claimed.argued.suggested.revealed.confirmed.announced.showed.indicated.warned.noted.added.explained.stated.described.planned.expected.sought.called.demanded.urged.proposed.requested.supported.backed.endorsed.promoted.defended.protected.maintained.upheld.led.drove.guided.directed.managed.oversaw.controlled.monitored.created.built.developed.designed.launched.introduced.established.formed.increased.grew.expanded.rose.improved.advanced.strengthened.boosted.reduced.cut.lowered.dropped.declined.fell.shrank.limited.faced.encountered.confronted.addressed.tackled.handled.regulated.resolved.joined.entered.participated.attended.gathered.assembled.met.connected.opened.began.started.initiated.commenced.triggered.activated.enabled.closed.ended.stopped.concluded.finished.halted.terminated.suspended.moved.shifted.transferred.relocated.traveled.crossed.reached.approached.remained.stayed.continued.persisted.endured.lasted.survived.held.provided.offered.delivered.supplied.gave.granted.allocated.distributed.received.got.obtained.gained.earned.collected.accepted.acquired.required.needed.compelled.involved.included.contained.covered.encompassed.allowed.permitted.empowered.awarded.authorized.approved.sanctioned.prevented.blocked.prohibited.restricted.banned.forbade.rejected.denied.changed.transformed.modified.adjusted.adapted.altered.revised.updated.studied.examined.investigated.reviewed.analyzed.evaluated.assessed.measured.produced.generated.manufactured.yielded.extracted.furnished.fabricated.constructed.tested.checked.inspected.verified.validated.certified.ratified.audited.published.released.issued.circulated.relayed.broadcast.aired.transmitted.threatened.endangered.risked.challenged.undermined.destabilized.disrupted.weakened.believed.considered.thought.assumed.estimated.predicted.anticipated.speculated.worked.operated.functioned.performed.served.contributed.assisted.cooperated.raised.lifted.elevated.heightened.amplified.escalated.intensified.magnified.won.captured.secured.achieved.attained.retained.conquered.prevailed.lost.missed.failed.forfeited.surrendered.conceded.withdrew.abandoned.helped.aided.bolstered.facilitated.sustained.benefited.reinforced.rallied.taught.trained.educated.instructed.mentored.coached.steered.prepared.inspired".split(".")), j = O(/* @__PURE__ */ "new.major.local.national.public.political.economic.social.international.global.federal.regional.military.financial.legal.official.recent.current.former.senior.key.top.leading.primary.significant.critical.important.essential.serious.severe.growing.increasing.long.short.large.small.high.low.big.little.strong.weak.hard.soft.fast.slow.deep.broad.young.old.early.late.next.last.first.final.foreign.domestic.urban.rural.northern.southern.eastern.western.annual.daily.weekly.monthly.quarterly.ongoing.temporary.permanent.available.possible.likely.potential.expected.proposed.planned.scheduled.additional.further.continued.remaining.existing.established.traditional.conventional.independent.separate.distinct.unique.specific.particular.special.exclusive.medical.clinical.scientific.technical.digital.electronic.nuclear.chemical.environmental.sustainable.renewable.clean.green.natural.organic.raw.commercial.industrial.corporate.private.central.direct.strategic.operational.successful.effective.efficient.productive.competitive.innovative.creative.advanced.democratic.conservative.liberal.progressive.radical.moderate.popular.mainstream.violent.armed.dangerous.hostile.defensive.protective.secure.safe.ancient.historic.modern.contemporary.classic.fundamental.original.authentic.basic.standard.normal.regular.common.typical.ordinary.general.complex.difficult.challenging.controversial.sensitive.urgent.dramatic.unprecedented.positive.negative.neutral.mixed.balanced.fair.equal.diverse.open.closed.active.passive.busy.quiet.rapid.steady.rich.poor.expensive.cheap.free.joint.mutual.collective.clear.obvious.apparent.visible.transparent.known.familiar.recognized.fresh.warm.cold.dry.wet.bright.dark.sharp.deadly.massive.enormous.vast.widespread.comprehensive.extensive.sweeping.strict.tough.rigid.firm.flexible.loose.mild.gentle.rustic.coastal.inland.remote.focal.prime.capital.provincial.brief.lengthy.detailed.preliminary.initial.intermediate.secondary.alternate.concerned.worried.cautious.skeptical.optimistic.confident.determined.committed.capable.skilled.qualified.experienced.professional.expert.veteran.trained".split(".")), M = O(/* @__PURE__ */ "also.now.already.still.just.even.only.recently.currently.previously.initially.originally.finally.ultimately.immediately.promptly.often.usually.always.never.sometimes.rarely.frequently.occasionally.here.there.anywhere.everywhere.abroad.overseas.locally.nationally.very.quite.rather.fairly.extremely.highly.deeply.significantly.well.badly.carefully.quickly.slowly.steadily.rapidly.gradually.soon.early.late.again.once.twice.daily.annually.together.alone.apart.aside.ahead.behind.forward.backward.likely.possibly.probably.certainly.definitely.clearly.obviously.apparently.officially.formally.publicly.privately.openly.secretly.directly.indirectly.strongly.firmly.sharply.broadly.widely.largely.mostly.primarily.simply.merely.barely.hardly.nearly.almost.approximately.roughly.particularly.especially.specifically.notably.remarkably.increasingly.dramatically.substantially.successfully.effectively.efficiently.actively.consistently.continuously.repeatedly.persistently.separately.independently.collectively.jointly.mutually.simultaneously.respectively.accordingly.meanwhile.however.nevertheless.furthermore.moreover.consequently.fortunately.unfortunately.surprisingly.interestingly.reportedly.allegedly.supposedly.presumably.typically.normally.generally.commonly.traditionally.historically.conventionally.routinely.relatively.comparatively.proportionally.marginally.slightly.moderately.considerably.tremendously.exactly.precisely.accurately.correctly.properly.appropriately.adequately.sufficiently.surely.absolutely.entirely.completely.totally.fully.wholly.thoroughly.partly.partially.somewhat.modestly.mildly.minimally.nominally.technically.naturally.automatically.systematically.strategically.deliberately.intentionally.voluntarily.willingly.temporarily.permanently.indefinitely.briefly.momentarily.periodically.intermittently.sporadically.safely.securely.peacefully.calmly.quietly.silently.gently.smoothly.urgently.desperately.critically.seriously.severely.gravely.acutely.intensely.enthusiastically.eagerly.passionately.vigorously.energetically.aggressively.boldly.bravely.cautiously.reluctantly.hesitantly.nervously.anxiously.wearily.skeptically.warily.freely.generously.graciously.warmly.kindly.favorably.positively.constructively.strictly.tightly.rigidly.harshly.sternly.bluntly.candidly.plainly.equally.similarly.likewise.correspondingly.identically.uniformly.evenly.symmetrically.outward.worldwide.globally.regionally.domestically.internally.externally.laterally.swiftly.decisively.steadfastly.fiercely.vastly.hugely.massively.profoundly.immeasurably.immensely.boundlessly.infinitely.markedly.noticeably.visibly.conspicuously.prominently.strikingly.spectacularly.dazzlingly.brilliantly.splendidly.superbly.excellently.wonderfully.marvelously.admirably.flawlessly.impeccably.perfectly.seamlessly.effortlessly.easily.readily.uninterruptedly.tirelessly.relentlessly.unwaveringly.resolutely.determinedly.robustly.soundly.solidly.sturdily.stiffly.stringently.rigorously.meticulously.exhaustively.comprehensively.extensively.sweepingly.pervasively.ubiquitously.nationwide.statewide.citywide.outwardly.inwardly.upwardly.downwardly.sideways.centrally.focally.predominantly.essentially.fundamentally.basically.inherently.intrinsically.spontaneously.instinctively.intuitively.brightly.darkly.faintly.dimly.harshly.softly.loudly.quietly.calmly.wildly.fiercely.gently.kindly.cruelly.boldly.meekly.proudly.humbly.eagerly.keenly.fondly.warmly.coldly.coolly.hotly.neatly.loosely.tightly.firmly.slackly.sharply.bluntly.dully.keenly.briskly.swiftly.slowly.rapidly.promptly.tardily.early.late.before.after.instead.besides.otherwise.indeed.likewise.moreover".split(".")), N = /* @__PURE__ */ "washington.london.beijing.moscow.berlin.paris.tokyo.ottawa.brussels.geneva.vienna.madrid.rome.seoul.ankara.cairo.dublin.warsaw.prague.stockholm.oslo.helsinki.lisbon.athens.sydney.melbourne.toronto.vancouver.montreal.auckland.mumbai.delhi.shanghai.taipei.singapore.bangkok.jakarta.manila.hanoi.riyadh.tehran.baghdad.kabul.nairobi.lagos.pretoria.accra.addis.congress.parliament.pentagon.kremlin.downing.westminster.capitol.senate.bloomberg.reuters.guardian.chronicle.tribune.herald.observer.gazette.johnson.williams.thompson.anderson.mitchell.campbell.robinson.stewart.harrison.jackson.kennedy.morrison.sullivan.patterson.henderson.crawford.marshall.spencer.tucker.wallace.andrews.douglas.fleming.gardner.hamilton.lambert.maxwell.pearson.richards.sanders.warren.webster.stanford.harvard.oxford.cambridge.princeton.columbia.cornell.berkeley.amazon.microsoft.google.tesla.apple.samsung.intel.oracle.goldman.morgan.barclays.deutsche.citibank.nomura.fidelity.schwab.boeing.airbus.lockheed.raytheon.northrop.siemens.philips.hitachi.ferrari.porsche.honda.toyota.nissan.volvo.hyundai.renault.pfizer.moderna.novartis.merck.abbott.bristol.roche.sanofi.atlantic.pacific.arctic.mediterranean.caribbean.baltic.adriatic.caspian.sahara.congo.danube.thames.rhine.nile.ganges.yangtze.clinton.carter.nixon.reagan.lincoln.churchill.macron.trudeau.merkel.erdogan.netanyahu.kishida.albanese.starmer.scholz.sunak.africa.europe.america.australia.canada.mexico.brazil.argentina.colombia.chile.peru.ecuador.bolivia.uruguay.paraguay.venezuela.china.india.japan.korea.taiwan.thailand.vietnam.malaysia.indonesia.philippines.myanmar.pakistan.bangladesh.nepal.lanka.cambodia.germany.france.britain.spain.italy.poland.ukraine.romania.sweden.norway.denmark.finland.ireland.scotland.belgium.austria.egypt.turkey.iran.iraq.syria.jordan.lebanon.israel.nigeria.kenya.ghana.ethiopia.tanzania.uganda.rwanda.senegal.russia.georgia.belarus.armenia.serbia.croatia.bulgaria.hungary.nato.asean.opec.unesco.unicef.brics.interpol.europol".split("."), P = Array.from(/* @__PURE__ */ new Set(/* @__PURE__ */ "0.1%,0.2%,0.25%,0.3%,0.4%,0.5%,0.6%,0.7%,0.75%,0.8%,0.9%,1.0%,1.1%,1.2%,1.25%,1.3%,1.4%,1.5%,1.6%,1.7%,1.75%,1.8%,1.9%,2.0%,2.1%,2.2%,2.25%,2.3%,2.4%,2.5%,2.6%,2.7%,2.75%,2.8%,2.9%,3.0%,3.1%,3.2%,3.25%,3.3%,3.4%,3.5%,3.6%,3.7%,3.75%,3.8%,3.9%,4.0%,4.1%,4.2%,4.25%,4.3%,4.4%,4.5%,4.6%,4.7%,4.75%,4.8%,4.9%,5.0%,5.1%,5.2%,5.25%,5.3%,5.4%,5.5%,5.6%,5.7%,5.75%,5.8%,5.9%,6.0%,6.1%,6.2%,6.25%,6.3%,6.4%,6.5%,6.6%,6.7%,6.75%,6.8%,6.9%,7.0%,7.1%,7.2%,7.25%,7.3%,7.4%,7.5%,7.6%,7.7%,7.75%,7.8%,7.9%,8.0%,8.1%,8.2%,8.25%,8.3%,8.4%,8.5%,8.6%,8.7%,8.75%,8.8%,8.9%,9.0%,9.1%,9.2%,9.25%,9.3%,9.4%,9.5%,9.6%,9.7%,9.75%,9.8%,9.9%,10.0%,10.1%,10.2%,10.25%,10.5%,10.8%,11.0%,11.2%,11.25%,11.5%,11.8%,12.0%,12.1%,12.25%,12.5%,12.8%,13.0%,13.25%,13.5%,13.8%,14.0%,14.25%,14.5%,14.8%,15.0%,15.2%,15.23%,15.25%,15.5%,15.8%,16.0%,16.25%,16.5%,16.8%,17.0%,17.25%,17.5%,18.0%,18.25%,18.5%,19.0%,19.25%,19.5%,20.0%,20.25%,20.5%,21.0%,21.5%,22.0%,22.5%,23.0%,23.5%,24.0%,24.5%,25.0%,25.5%,26.0%,26.5%,27.0%,27.5%,28.0%,28.5%,29.0%,29.5%,30.0%,30.5%,31.0%,31.5%,32.0%,32.5%,33.0%,33.5%,34.0%,34.5%,35.0%,35.5%,36.0%,36.5%,37.0%,37.5%,38.0%,38.5%,39.0%,39.5%,40.0%,40.5%,41.0%,41.5%,42.0%,42.5%,43.0%,43.5%,44.0%,44.5%,45.0%,45.5%,46.0%,46.5%,47.0%,47.5%,48.0%,48.5%,49.0%,49.5%,50.0%,51.0%,52.0%,53.0%,54.0%,55.0%,56.0%,57.0%,58.0%,59.0%,60.0%,62.0%,64.0%,65.0%,66.0%,68.0%,70.0%,72.0%,75.0%,78.0%,80.0%,82.0%,85.0%,88.0%,90.0%,92.0%,95.0%,98.0%,100.0%,101.0%,102.0%,105.0%,110.0%".split(","))).slice(0, 256), F = [
	"the",
	"a",
	"this",
	"some",
	"any",
	"no",
	"one",
	"its"
], Je = /* @__PURE__ */ "in.of.for.on.with.at.by.from.to.into.about.after.during.between.through.across.over.under.before.since.against.around.among.within.toward.upon.along.beyond.without.despite.until.throughout".split("."), Ye = [
	"and",
	"but",
	"while",
	"as",
	"or",
	"yet",
	"although",
	"because",
	"since",
	"though",
	"whereas",
	"unless",
	"whether",
	"when",
	"where",
	"if"
], Xe = [
	"that",
	"which",
	"who",
	"whom",
	"whose",
	"where",
	"when",
	"why",
	"how",
	"whatever",
	"whichever",
	"whoever",
	"whomever",
	"wherever",
	"whenever",
	"however"
], Ze = [
	"they",
	"we",
	"he",
	"she",
	"it",
	"I",
	"you",
	"one"
], I = {
	N: k,
	V: qe,
	VP: A,
	A: j,
	R: M,
	NP: N,
	PCT: P,
	d: F,
	p: Je,
	c: Ye,
	r: Xe,
	pronoun: Ze
}, Qe = {}, $e = {};
for (let [e, t] of Object.entries(I)) {
	let n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
	for (let e = 0; e < t.length; e++) {
		let i = t[e].toLowerCase();
		r.add(i), n.has(i) || n.set(i, e);
	}
	$e[e] = n, Qe[e] = r;
}
var L = (() => {
	let e = /* @__PURE__ */ new Set();
	for (let t of Object.values(I)) for (let n of t) e.add(n.toLowerCase());
	return Array.from(e);
})(), et = L.slice(0, 2048), R = O(b, k), tt = O(ee, A), z = O(/* @__PURE__ */ "raised.lowered.increased.decreased.reduced.expanded.boosted.cut.gained.lost.adjusted.amplified.curbed.curtailed.slashed.trimmed.augmented.capped.doubled.elevated.enhanced.extended.halved.heightened.lifted.limited.maximized.minimized.moderated.modified.multiplied.narrowed.optimized.pushed.restrained.scaled.shortened.stabilized.stimulated.surpassed.sustained.tightened.tripled.upgraded.widened.yielded.balanced.checked.altered.varied.eased.slowed.stalled.bounced.retreated.leveled.fluctuated.shifted.plummeted.spiked.soared.slumped.tumbled.aligned.appreciated.broadened.collapsed.contracted.corrected.depreciated.diminished.dipped.diverged.drifted.escalated.flattened.floated.lessened.normalized.outpaced.rallied.receded.regressed.reset.resumed.reversed.revived.settled.softened.solidified.stagnated.steepened.subsided.swelled.tapered.unraveled.upticked.accumulated.bounded.consolidated.dampened.eclipsed.faltered.folded.hinged.lagged.lengthened.mounted.overtook.paced.paused.pivoted.poised.pressed.prospered.quickened.redefined.regained.relapsed.renewed.restabilized.restructured.retrenched.spurred.stiffened.swung.thrived.topped.trailed.transformed.transitioned.trended.turned.unfolded.unsettled.wavered.controlled.monitored.managed.regulated.directed.oversaw.administered.channeled.guided.steered.piloted.spearheaded.initiated.commenced.targeted.projected.estimated.calculated.budgeted.allocated.appropriated.assigned.designated.specified.secured.negotiated.finalized.approved.ratified.sanctioned.authorized.endorsed.supported.backed.promoted.championed.defended.protected.maintained.bolstered.reinforced.strengthened.upheld.preserved.retained.safeguarded.sheltered.shielded.fortified.anchored.tracked.recorded.registered.assessed.evaluated.audited.reviewed.analyzed.inspected.measured.quantified.valued.appraised.benchmarked.computed.determined.gauged.indexed.overhauled.recalculated.revaluated.scrutinized.surveyed.tallied.tested.weighted.abated.absorbed.accelerated.acclimated.accommodated.accrued.achieved.acquired.adapted.advanced.affected.aggregated.allotted.amended.annexed.anticipated.apportioned.approximated.arranged.assembled.assimilated.assumed.averaged.built.calibrated.canceled.captured.cataloged.classified.cleared.codified.collected.combined.commanded.commercialized.commissioned.committed.compacted.compared.compensated.compiled.completed.complicated.composed".split("."), A), B = O(te, k), V = O(ne, k), H = O(/* @__PURE__ */ "announced.supported.proposed.rejected.approved.launched.created.developed.introduced.published.released.signed.adopted.defended.backed.changed.submitted.issued.authorized.sanctioned.passed.ratified.endorsed.promoted.reviewed.revised.updated.modified.expanded.drafted.enacted.implemented.accepted.considered.presented.delayed.withdrew.suspended.challenged.examined.evaluated.assessed.directed.managed.led.organized.established.formed.structured.secured.negotiated.finalized.requested.demanded.ordered.urged.favored.opposed.condemned.praised.welcomed.criticized.discussed.debated.surveyed.investigated.audited.inspected.verified.validated.certified.unveiled.revealed.disclosed.outlined.detailed.summarized.clarified.explained.reaffirmed.emphasized.highlighted.underlined.stressed.voiced.expressed.stated.declared.proclaimed.asserted.claimed.confirmed.acknowledged.admitted.conceded.denied.refused.dismissed.overruled.vetoed.repealed.rescinded.revoked.cancelled.postponed.deferred.rescheduled.extended.renewed.restructured.reorganized.transformed.reformed.overhauled.modernized.upgraded.strengthened.reinforced.bolstered.boosted.enhanced.improved.broadened.scaled.increased.reduced.cut.lowered.curbed.restricted.limited.capped.constrained.regulated.controlled.monitored.supervised.guided.steered.piloted.spearheaded.initiated.commenced.triggered.instigated.pioneered.founded.built.constructed.designed.engineered.crafted.framed.formulated.devised.conceived.planned.projected.estimated.calculated.budgeted.allocated.appropriated.assigned.designated.appointed.nominated.selected.chose.named.elected.installed.stationed.deployed.positioned.dispatched.sent.transferred.relocated.moved.shifted.redirected.channeled.diverted.routed.delivered.supplied.provided.furnished.offered.granted.awarded.conferred.bestowed.pledged.guaranteed.promised.committed.dedicated.devoted.applied.utilized.employed.executed.enforced.administered.handled.conducted.chaired.hosted.sponsored.coordinated.facilitated.assisted.aided.helped.championed.shielded.safeguarded.protected.upheld.maintained.preserved.retained.commissioned.promulgated.decreed.instituted.orchestrated.oversaw.governed.standardized.formalized.advocated.articulated.assembled.authored.balanced.benchmarked.briefed.cataloged.chartered.circulated.classified.communicated.compiled.composed.conceptualized.consolidated.consulted.said.reported.argued.suggested.showed.indicated".split("."), A), U = O(re, N), W = O(/* @__PURE__ */ "washington.london.beijing.moscow.berlin.paris.tokyo.ottawa.brussels.geneva.vienna.madrid.rome.seoul.ankara.cairo.dublin.warsaw.prague.stockholm.oslo.helsinki.lisbon.athens.sydney.melbourne.toronto.vancouver.montreal.auckland.mumbai.delhi.shanghai.taipei.singapore.bangkok.jakarta.manila.hanoi.riyadh.tehran.baghdad.kabul.nairobi.lagos.pretoria.accra.addis.chicago.houston.phoenix.dallas.boston.atlanta.miami.seattle.denver.detroit.minneapolis.amsterdam.budapest.bucharest.kiev.zurich.frankfurt.munich.milan.naples.barcelona.valencia.porto.edinburgh.belfast.lyon.marseille.copenhagen.riga.vilnius.tallinn.zagreb.belgrade.sofia.bratislava.ljubljana.sarajevo.skopje.tirana.yerevan.tbilisi.baku.tashkent.almaty.astana.doha.dubai.muscat.amman.beirut.damascus.jerusalem.jeddah.alexandria.tunis.algiers.rabat.casablanca.khartoum.kampala.kigali.lusaka.harare.maputo.luanda.kinshasa.dakar.abidjan.johannesburg.canberra.perth.brisbane.adelaide.hobart.christchurch.wellington.osaka.kyoto.nagoya.fukuoka.sapporo.busan.incheon.guangzhou.shenzhen.chengdu.wuhan.xian.tianjin.chongqing.kolkata.chennai.bengaluru.hyderabad.ahmedabad.pune.karachi.lahore.islamabad.dhaka.colombo.kathmandu.male.vientiane.yangon.florence.venice.seville.nice.antwerp.rotterdam.africa.europe.america.australia.asia.canada.mexico.brazil.argentina.colombia.chile.peru.ecuador.bolivia.uruguay.paraguay.venezuela.china.india.japan.korea.taiwan.thailand.vietnam.malaysia.indonesia.philippines.myanmar.pakistan.bangladesh.nepal.lanka.cambodia.germany.france.britain.spain.italy.poland.ukraine.romania.sweden.norway.denmark.finland.ireland.scotland.belgium.austria.egypt.turkey.iran.iraq.syria.jordan.lebanon.israel.nigeria.kenya.ghana.ethiopia.tanzania.uganda.rwanda.senegal.russia.georgia.belarus.armenia.serbia.croatia.bulgaria.hungary.greece.portugal.netherlands.switzerland.morocco.algeria.tunisia.sudan.zambia.zimbabwe.angola.congo.qatar.oman.yemen.kuwait.bahrain.fiji.samoa.iceland.malta.cyprus.california.texas".split("."), N), G = O(/* @__PURE__ */ "said.stated.reported.announced.confirmed.noted.argued.warned.explained.claimed.suggested.indicated.detailed.revealed.declared.acknowledged.disclosed.added.described.emphasized.highlighted.underlined.stressed.asserted.reaffirmed.insisted.recounted.maintained.observed.commented.remarked.pointed.specified.clarified.outlined.summarized.reiterated.contended.pledged.vowed.promised.guaranteed.voiced.expressed.conceded.admitted.denied.refused.dismissed.rejected.countered.responded.replied.retorted.testified.swore.affirmed.certified.verified.validated.attested.endorsed.backed.supported.defended.urged.called.demanded.requested.proposed.recommended.advised.cautioned.admonished.appealed.pleaded.floated.mooted.tabled.presented.submitted.filed.issued.released.published.broadcast.aired.transmitted.circulated.distributed.disseminated.publicized.promoted.heralded.proclaimed.decreed.ordered.directed.commanded.instructed.charged.tasked.assigned.authorized.sanctioned.approved.ratified.signed.enacted.passed.adopted.championed.spearheaded.introduced.launched.unveiled.averred.vouched.corroborated.substantiated.seconded.echoed.concurred.agreed.acquiesced.assented.consented.subscribed.favored.advocated.pushed.pressed.lobbied.campaigned.strove.labored.worked.bound.committed.dedicated.devoted.warranted.assured.reassured.satisfied.convinced.persuaded.swayed.influenced.moved.prompted.inspired.motivated.driven.led.guided.steered.piloted.channeled.conducted.managed.administered.handled.signaled.professed.elaborated.postulated.conjectured.adjudged.appraised.estimated.calculated.projected.surmised.hypothesized.communicated.relayed.notified.informed.briefed.apprised.manifested.insinuated.intimated.promulgated.enunciated.articulated.formulated.framed.ventilated.asseverated.adjudicated.alleged.amplified.analysed.annotated.appended.applauded.approbated.authenticated.avouched.chided.chronicled.cited.classified.commentated.showed.planned.expected.sought.protected.upheld.drove.oversaw.controlled.monitored.created.built.developed.designed.established.formed.tackled.regulated.resolved.exhorted.enjoined.implored.stipulated.reasserted.reminded.explicated.predicated.proffered.clamored.deliberated.disclaimed.exclaimed.interjected.interrupted.invoked.lamented.objected.opined.petitioned.protested.reckoned.rejoined.remonstrated.repudiated.solicited.interrogated".split("."), A), nt = O(ie, j), rt = O(ae, k), it = O(oe, A), at = O(/* @__PURE__ */ "requested.demanded.proposed.approved.issued.submitted.offered.provided.released.published.adopted.presented.confirmed.announced.disclosed.rejected.sought.urged.called.drafted.authored.prepared.delivered.signed.passed.backed.supported.endorsed.promoted.tabled.floated.mooted.advanced.introduced.sponsored.recommended.advised.suggested.cautioned.appealed.pleaded.petitioned.solicited.requisitioned.ordered.directed.commanded.instructed.charged.tasked.assigned.authorized.sanctioned.ratified.enacted.promulgated.decreed.proclaimed.declared.stated.asserted.affirmed.maintained.contended.argued.insisted.emphasized.highlighted.underlined.stressed.accentuated.voiced.expressed.articulated.formulated.framed.devised.conceived.crafted.designed.engineered.constructed.built.established.founded.instituted.initiated.commenced.launched.spearheaded.piloted.pioneered.championed.pushed.advocated.lobbied.campaigned.strove.exerted.labored.worked.tried.endeavored.attempted.aimed.targeted.intended.planned.projected.estimated.calculated.budgeted.allocated.appropriated.designated.specified.secured.negotiated.finalized.arranged.coordinated.facilitated.assisted.aided.helped.shielded.safeguarded.protected.upheld.tendered.proffered.forwarded.transmitted.relayed.dispatched.communicated.implored.entreated.besought.importuned.prompted.adjudicated.alleged.allotted.amended.applied.said.reported.claimed.revealed.showed.indicated.warned.noted.added.explained.described.expected.defended.led.drove.guided.managed.oversaw.controlled.monitored.created.developed.formed.increased.improved.strengthened.boosted.reduced.cut.lowered.limited.faced.encountered.confronted.addressed.tackled.handled.regulated.resolved.joined.entered.attended.gathered.assembled.met.connected.opened.began.started.triggered.activated.enabled.closed.ended.stopped.concluded.finished.halted.terminated.suspended.moved.shifted.transferred.relocated.traveled.crossed.reached.approached.remained.stayed.continued.supplied.gave.granted.distributed.received.got.obtained.gained.earned.collected.accepted.acquired.required.needed.compelled.involved.included.contained.covered.encompassed.allowed.permitted.empowered.awarded.prevented.mandated.commissioned.authenticated.standardized.formalized.orchestrated.admonished.appealed.asked.begged.bade.claimed.implored.importuned.invited.motioned.petitioned.pledged.pleaded.pressed.prompted.proposed.requisitioned.solicited.sought.summoned".split("."), A), ot = O(/* @__PURE__ */ "remained.stayed.seemed.appeared.proved.became.ended.continued.felt.grew.turned.sounded.looked.stood.persisted.lingered.kept.ran.held.lay.sat.rested.evolved.showed.emerged.started.began.commenced.unfolded.transpired.happened.occurred.prevailed.existed.loomed.survived.endured.lasted.flourished.prospered.thrived.stagnated.stalled.halted.stopped.paused.wavered.hesitated.faltered.lagged.trailed.led.guided.soared.plummeted.slumped.rebounded.recovered.surged.slipped.dipped.dropped.rose.fell.declined.expanded.contracted.shrank.subsided.abated.moderated.eased.cooled.warmed.spiked.peaked.bottomed.bounced.advanced.gained.lost.eroded.decayed.depreciated.appreciated.escalated.leveled.flattened.accelerated.slowed.stiffened.softened.tightened.loosened.narrowed.broadened.deepened.heightened.intensified.weakened.strengthened.lengthened.shortened.stabilized.normalized.reset.resumed.reversed.revived.settled.solidified.swelled.tapered.unraveled.yielded.accumulated.balanced.consolidated.dampened.eclipsed.extended.folded.hinged.mounted.multiplied.paced.pivoted.poised.pressed.quickened.redefined.regained.relapsed.renewed.restabilized.restructured.retrenched.spurred.swung.topped.transformed.transitioned.trended.unsettled.widened.converged.diverged.drifted.floated.regressed.receded.rallied.upticked.diminished.corrected.amplified.altered.aligned.adjusted.tumbled.halved.tripled.doubled.shifted.fluctuated.varied.deteriorated.debased.degraded.devalued.dwindled.abided.acclimated.said.reported.claimed.argued.suggested.revealed.confirmed.announced.indicated.warned.noted.added.explained.stated.described.planned.expected.sought.called.demanded.urged.proposed.requested.supported.backed.endorsed.promoted.defended.protected.maintained.upheld.drove.directed.managed.oversaw.controlled.monitored.created.built.developed.designed.launched.introduced.established.formed.increased.improved.boosted.reduced.cut.lowered.limited.faced.encountered.confronted.addressed.tackled.handled.regulated.resolved.joined.entered.attended.gathered.assembled.met.connected.resulted.ebbed.waned.faded.dissipated.vanished.materialized.surfaced.arose.culminated.subsided.slackened.mellowed.rested.reposed.slept.settled".split("."), A), st = O(se, j), ct = [
	"because",
	"as",
	"since",
	"while"
], K = O(/* @__PURE__ */ "recently.publicly.strongly.formally.widely.closely.openly.repeatedly.quietly.quickly.carefully.directly.officially.successfully.privately.eventually.promptly.immediately.eagerly.boldly.bravely.cautiously.hesitantly.nervously.wearily.skeptically.warily.freely.generously.graciously.warmly.kindly.favorably.positively.constructively.strictly.tightly.rigidly.harshly.sternly.bluntly.candidly.plainly.equally.similarly.likewise.correspondingly.identically.uniformly.evenly.symmetrically.outward.worldwide.globally.regionally.domestically.internally.externally.laterally.swiftly.decisively.enthusiastically.passionately.vigorously.energetically.aggressively.actively.consistently.continuously.persistently.separately.independently.collectively.jointly.mutually.simultaneously.respectively.accordingly.meanwhile.however.nevertheless.furthermore.moreover.consequently.fortunately.unfortunately.surprisingly.interestingly.reportedly.allegedly.supposedly.presumably.typically.normally.generally.commonly.traditionally.historically.conventionally.routinely.relatively.comparatively.proportionally.intently.earnestly.resolutely.steadfastly.unflinchingly.strenuously.zealously.adequately.admirably.agilely.alertly.ambitiously.analytically.ardently.artfully.also.now.already.still.just.even.only.currently.previously.initially.originally.finally.ultimately.often.usually.always.never.sometimes.rarely.frequently.occasionally.here.there.anywhere.everywhere.abroad.overseas.locally.nationally.very.quite.rather.fairly.extremely.highly.deeply.significantly.well.badly.slowly.steadily.rapidly.gradually.soon.early.late.again.once.twice.daily.annually.together.alone.apart.aside.ahead.behind.forward.backward.likely.possibly.probably.certainly.definitely.clearly.obviously.apparently.secretly.indirectly.firmly.sharply.broadly.largely.mostly.primarily.simply.merely.barely.hardly.nearly.almost.approximately.roughly.particularly.especially.specifically.notably.remarkably.increasingly.dramatically.substantially.effectively.efficiently.marginally.slightly.moderately.considerably.tremendously.exactly.precisely.accurately.correctly.properly.appropriately.sufficiently.surely.absolutely.entirely.completely.totally.fully.wholly.thoroughly.partly.partially.somewhat.modestly.mildly.minimally.nominally.technically.naturally.automatically.systematically.strategically.deliberately.intentionally.voluntarily.willingly.temporarily.permanently.indefinitely.briefly.momentarily.periodically.intermittently.sporadically.safely".split("."), M), lt = O(/* @__PURE__ */ "however.meanwhile.nevertheless.nonetheless.instead.also.indeed.similarly.furthermore.additionally.still.otherwise.rather.likewise.conversely.ultimately.consequently.accordingly.thus.therefore.hence.besides.moreover.then.further.finally.initially.originally.subsequently.thereafter.afterward.contrariwise.alternatively.notwithstanding.regardlessly.anyway.anyhow.equally.correspondingly.identically.uniformly.consistently.compatibly.harmoniously.eventually.undoubtedly.assuredly.certainly.definitely.plainly.clearly.evidently.manifestly.patently.unmistakably.decisively.conclusively.emphatically.resolutely.firmly.steadfastly.unwaveringly.firstly.secondly.thirdly.lastly.incidentally.parenthetically.tangentially.coincidentally.admittedly.concededly.doubtless.indubitably.indisputably.unquestionably.now.already.just.even.only.recently.currently.previously.immediately.promptly.often.usually.always.never.sometimes.rarely.frequently.occasionally.here.there.anywhere.everywhere.abroad.overseas.locally.nationally.very.quite.fairly.extremely.highly.deeply.significantly.well.badly.carefully.quickly.slowly.steadily.rapidly.gradually.soon.early.late.again.once.twice.daily.annually.together.alone.apart.aside.ahead.behind.forward.backward.likely.possibly.probably.obviously.apparently.officially.formally.publicly.privately.openly.secretly.directly.indirectly.strongly.sharply.broadly.widely.largely.mostly.primarily.simply.merely.barely.hardly.nearly.almost.approximately.roughly.particularly.especially.specifically.notably.remarkably.increasingly.dramatically.substantially.successfully.effectively.efficiently.actively.continuously.repeatedly.persistently.separately.independently.collectively.jointly.mutually.simultaneously.respectively.fortunately.unfortunately.surprisingly.interestingly.reportedly.allegedly.supposedly.presumably.typically.normally.generally.commonly.traditionally.historically.conventionally.routinely.relatively.comparatively.proportionally.marginally.slightly.moderately.considerably.tremendously.exactly.precisely.accurately.correctly.properly.appropriately.adequately.sufficiently.surely.absolutely.entirely.completely.totally.fully.wholly.thoroughly.partly.partially.somewhat.modestly.mildly.minimally.nominally.technically.naturally.automatically.systematically.strategically.deliberately.intentionally.voluntarily.willingly.temporarily.permanently.indefinitely.briefly.momentarily.periodically.intermittently.sporadically.safely.securely.peacefully.calmly.quietly.silently.gently.smoothly.urgently".split("."), M), ut = O(/* @__PURE__ */ "sharply.steadily.rapidly.gradually.significantly.modestly.slightly.dramatically.quickly.slowly.noticeably.substantially.marginally.consistently.suddenly.further.steeply.precipitously.markedly.considerably.tremendously.immensely.drastically.severely.acutely.intensely.profoundly.deeply.greatly.hugely.massively.enormously.vastly.broadly.widely.largely.mostly.primarily.principally.chiefly.mainly.appreciably.perceptibly.visibly.clearly.manifestly.evidently.obviously.undoubtedly.certainly.definitely.decisively.conclusively.moderately.progressively.continuously.measureably.noticably.extensively.sweepingly.adaptively.adequately.aggressively.alarmingly.amplifiedly.astoundingly.also.now.already.still.just.even.only.recently.currently.previously.initially.originally.finally.ultimately.immediately.promptly.often.usually.always.never.sometimes.rarely.frequently.occasionally.here.there.anywhere.everywhere.abroad.overseas.locally.nationally.very.quite.rather.fairly.extremely.highly.well.badly.carefully.soon.early.late.again.once.twice.daily.annually.together.alone.apart.aside.ahead.behind.forward.backward.likely.possibly.probably.apparently.officially.formally.publicly.privately.openly.secretly.directly.indirectly.strongly.firmly.simply.merely.barely.hardly.nearly.almost.approximately.roughly.particularly.especially.specifically.notably.remarkably.increasingly.successfully.effectively.efficiently.actively.repeatedly.persistently.separately.independently.collectively.jointly.mutually.simultaneously.respectively.accordingly.meanwhile.however.nevertheless.furthermore.moreover.consequently.fortunately.unfortunately.surprisingly.interestingly.reportedly.allegedly.supposedly.presumably.typically.normally.generally.commonly.traditionally.historically.conventionally.routinely.relatively.comparatively.proportionally.exactly.precisely.accurately.correctly.properly.appropriately.sufficiently.surely.absolutely.entirely.completely.totally.fully.wholly.thoroughly.partly.partially.somewhat.mildly.minimally.nominally.technically.naturally.automatically.systematically.strategically.deliberately.intentionally.voluntarily.willingly.temporarily.permanently.indefinitely.briefly.momentarily.periodically.intermittently.sporadically.safely.securely.peacefully.calmly.quietly.silently.gently.smoothly.urgently.desperately.critically.seriously.gravely.enthusiastically.eagerly.passionately.vigorously.energetically.boldly.bravely.cautiously.reluctantly.hesitantly.nervously.anxiously.wearily.skeptically.warily".split("."), M), dt = O(ce, k), ft = O(le, A), pt = O(ue, k), q = O(/* @__PURE__ */ "officials.lawmakers.regulators.voters.ministers.leaders.researchers.judges.members.delegates.senators.residents.workers.analysts.witnesses.representatives.officers.detectives.investigators.inspectors.auditors.examiners.specialists.experts.advisors.consultants.strategists.economists.scientists.biologists.chemists.physicists.engineers.technicians.developers.programmers.designers.architects.planners.coordinators.managers.supervisors.administrators.directors.founders.trustees.investors.shareholders.traders.brokers.financiers.bankers.lenders.creditors.borrowers.merchants.vendors.suppliers.contractors.operators.employers.employees.laborers.staff.crew.participants.attendees.cadres.ranks.troops.personnel.veterans.pioneers.donors.sponsors.supporters.advocates.critics.opponents.allies.partners.rivals.competitors.candidates.contenders.entrants.nominees.appointees.successors.predecessors.deputies.assistants.aides.associates.colleagues.peers.fellows.observers.spectators.bystanders.victims.survivors.inhabitants.dwellers.locals.natives.foreigners.immigrants.refugees.migrants.travelers.visitors.guests.hosts.organizers.creators.writers.reporters.editors.broadcasters.columnists.correspondents.producers.filmmakers.musicians.singers.performers.legislators.attorneys.lawyers.prosecutors.jurors.magistrates.chancellors.premiers.mayors.governors.ambassadors.diplomats.envoys.dignitaries.spokesmen.spokespersons.spokeswomen.chairpersons.chairmen.chairwomen.stewards.guardians.custodians.monitors.agents.emissaries.commissioners.chiefs.heads.commanders.captains.marshals.constables.wardens.sheriffs.operatives.scholars.professors.academics.authors.journalists.reviewers.evaluators.assessors.arbitrators.mediators.negotiators.statesmen.politicians.campaigners.activists.lobbyists.patrons.benefactors.accountants.bureaucrats.ombudsmen.provosts.deans.rectors.cashiers.actuaries.statisticians.chairholders.parliamentarians.councillors.aldermen.delegations.ministries.associations.federations.syndicates.conglomerates.corporations.enterprises.agencies.authorities.boards.cabinets.chambers.commissions.committees.councils.courts.directorates.divisions.institutes.institutions.legislatures.panels.parties.societies.tribunals.trusts.unions.assemblies.consortiums.foundations.guilds.leagues.missions.organizations.alumni.artisans.bakers.biographers.businessmen.clerks.coaches.composers.counselors.curators.educators.historians.instructors.jurists.lecturers.mathematicians.notaries.physicians.pilots.practitioners.principals.sociologists.superintendents.surveyors.teachers".split("."), k), mt = O(/* @__PURE__ */ "criticized.backed.rejected.approved.supported.opposed.questioned.challenged.examined.endorsed.investigated.defended.reviewed.signed.blocked.adopted.praised.welcomed.condemned.disputed.debated.discussed.evaluated.audited.inspected.verified.validated.scrutinized.analyzed.assessed.surveyed.monitored.supervised.controlled.regulated.modified.revised.updated.amended.expanded.restricted.limited.sanctioned.authorized.passed.ratified.drafted.enacted.implemented.executed.administered.managed.directed.guided.steered.spearheaded.initiated.launched.created.developed.established.formed.structured.secured.negotiated.finalized.requested.demanded.ordered.urged.favored.proposed.submitted.presented.delayed.suspended.postponed.cancelled.revoked.repealed.rescinded.vetoed.overruled.dismissed.refused.denied.conceded.admitted.acknowledged.confirmed.asserted.claimed.proclaimed.declared.stated.expressed.voiced.stressed.underlined.highlighted.emphasized.reaffirmed.clarified.explained.summarized.detailed.outlined.disclosed.revealed.unveiled.certified.corroborated.substantiated.seconded.echoed.concurred.agreed.acquiesced.assented.consented.subscribed.advocated.pushed.pressed.lobbied.campaigned.strove.labored.worked.bound.committed.dedicated.devoted.guaranteed.warranted.assured.reassured.satisfied.convinced.persuaded.swayed.influenced.moved.prompted.inspired.motivated.driven.piloted.channeled.conducted.handled.operated.ran.governed.ruled.headed.chaired.hosted.sponsored.coordinated.organized.arranged.instructed.charged.tasked.assigned.designated.appointed.nominated.selected.chose.named.installed.stationed.deployed.positioned.dispatched.sent.transferred.relocated.shifted.redirected.diverted.routed.delivered.supplied.provided.furnished.offered.granted.awarded.conferred.bestowed.pledged.shielded.safeguarded.protected.upheld.maintained.preserved.accentuated.acclaimed.accommodated.accredited.acquired.actuated.said.reported.argued.suggested.announced.showed.indicated.warned.noted.added.described.planned.expected.sought.called.promoted.led.drove.oversaw.built.designed.introduced.increased.grew.rose.improved.advanced.strengthened.boosted.reduced.cut.lowered.dropped.declined.fell.shrank.faced.encountered.confronted.addressed.tackled.resolved.joined.entered.applauded.authenticated.championed.codified.formulated.framed.instituted.modernized.orchestrated.overhauled".split("."), A), ht = O(de, j), gt = O(fe, j), _t = O(pe, k), vt = O(me, A), yt = O(/* @__PURE__ */ "talks.negotiations.elections.hearings.discussions.debates.demonstrations.meetings.raids.clashes.investigations.consultations.interviews.strikes.trials.sessions.conferences.summits.audits.reviews.forums.panels.assemblies.polls.proceedings.deliberations.briefings.encounters.confrontations.conflicts.rallies.votes.ballots.referendums.primaries.conventions.symposia.caucuses.gatherings.summitry.dialogues.parleys.protests.walkouts.boycotts.stoppages.pickets.marches.processions.campaigns.drives.initiatives.operations.missions.maneuvers.exercises.drills.inspections.surveys.assessments.evaluations.inquiries.probes.inquests.examinations.screenings.tests.experiments.studies.workshops.keynotes.lectures.seminars.presentations.broadcasts.telecasts.podcasts.statements.addresses.speeches.discourses.exchanges.bargaining.arbitrations.mediations.conciliations.settlements.adjudications.rulings.verdicts.judgments.sentences.appeals.lawsuits.litigations.prosecutions.arraignments.indictments.depositions.affidavits.subpoenas.injunctions.decrees.directives.mandates.orders.resolutions.motions.petitions.amendments.reforms.revisions.overhauls.restructurings.reorganizations.transformations.transitions.shifts.developments.episodes.incidents.occurrences.events.affairs.scandals.crises.emergencies.disasters.tragedies.calamities.mishaps.accidents.collisions.skirmishes.battles.engagements.offensives.assaults.attacks.agreements.allegations.allocations.altercations.analyses.colloquia.conclaves.consults.dispatches.expositions.outbreaks.proclamations.pronouncements.receptions.roundtables.showdowns.standoffs.stipulations.testimonies.transcripts.treaties.undertakings.unfoldings.visitations.warranties.arguments.barters.commotions.disturbances.fights.combats.hostilities.wars.sorties.incursions.invasions.ambushes.barrages.bombardments.sieges.blockades.embargoes.sanctions.penalties.uprisings.riots.rebellions.insurgencies.mutinies.coups.disagreements.quarrels.wrangles.feuds.contentions.controversies.brawls.breakthroughs.impasses.deadlocks.gridlocks.bottlenecks.stalemates.reconciliations.compromises.concessions.fallouts.outbursts.upheavals.agitations.tumults.strifes.frictions.tensions.pressures.turmoils.clamors.manifestos.charters.protocols.compacts.pacts.debriefings.symposiums.colloquiums.parades.reconcilements.pleas.submissions.filings.declarations.announcements.pressers.briefs.dockets.minutes.records.logs.dossiers.registries.catalogs.directories.compendiums.whitepapers.bulletins.memos.memorandums.monographs.theses.manuscripts.treatises.addendums.appendices.atlases.circulars.clippings.digests.handbooks.leaflets.logbooks.manuals.pamphlets.periodicals.prospectuses.publications.summaries.tracts.paperbacks.hardcovers".split("."), k), bt = [
	"the",
	"some",
	"no",
	"any"
], J = [
	"the",
	"some",
	"no",
	"any"
], Y = [
	[
		E(F, "d"),
		E(j, "A"),
		E(R, "N"),
		E(tt, "VP"),
		D(["in"], "p"),
		E(W, "NP")
	],
	[
		E(F, "d"),
		E(j, "A"),
		E(R, "N"),
		E(tt, "VP"),
		E(ut, "R"),
		E(P, "PCT"),
		D(["in"], "p"),
		E(W, "NP")
	],
	[
		D(["if"], "c"),
		E(bt, "d"),
		E(dt, "N"),
		E(ft, "VP", ","),
		E(_t, "N"),
		E(vt, "VP"),
		E(P, "PCT")
	],
	[
		D(["after"], "p"),
		E(yt, "N", ","),
		E(lt, "R", ","),
		E(F, "d"),
		E(B, "N"),
		E(K, "R"),
		E(H, "VP"),
		E(J, "d"),
		E(V, "N")
	],
	[
		E(F, "d"),
		E(pt, "N", ","),
		D(["which"], "c"),
		E(q, "N"),
		E(K, "R"),
		E(mt, "VP", ","),
		E(K, "R"),
		E(H, "VP"),
		E(J, "d"),
		E(V, "N")
	],
	[
		E(ht, "A"),
		E(gt, "A"),
		E(_t, "N"),
		E(vt, "VP"),
		E(P, "PCT"),
		D(["in"], "p"),
		E(W, "NP"),
		E(ct, "c"),
		E(F, "d"),
		E(nt, "A"),
		E(rt, "N"),
		E(it, "VP")
	],
	[
		E(F, "d", void 0, "\""),
		E(j, "A"),
		E(B, "N"),
		E(z, "VP"),
		E(R, "N"),
		E(P, "PCT", "\","),
		E(U, "NP"),
		E(G, "VPR"),
		E(K, "R"),
		D(["in"], "p"),
		D(["an"], "d"),
		D(["interview"], "N"),
		D(["in"], "p"),
		E(W, "NP")
	],
	[
		E(U, "NP"),
		E(G, "VPR"),
		D(["that"], "c"),
		E(F, "d"),
		E(j, "A"),
		E(B, "N"),
		E(z, "VP"),
		E(R, "N"),
		E(P, "PCT", ","),
		D(["but"], "c"),
		E(F, "d"),
		E(B, "N"),
		E(H, "VP"),
		E(J, "d"),
		E(V, "N")
	],
	[
		E(F, "d", void 0, "\""),
		E(j, "A"),
		E(B, "N"),
		E(H, "VP"),
		E(J, "d"),
		E(V, "N", "\","),
		E(U, "NP"),
		E(G, "VPR"),
		D(["in"], "p"),
		E(W, "NP", ","),
		E(ct, "c", void 0, "\""),
		E(F, "d"),
		E(nt, "A"),
		E(rt, "N"),
		E(it, "VP"),
		D(["in"], "p"),
		E(W, "NP", "\"")
	],
	[
		E(J, "d"),
		E(q, "N", ","),
		D(["including"], "c"),
		E(J, "d"),
		E(q, "N", ","),
		E(at, "VP"),
		E(F, "d"),
		E(j, "A"),
		E(V, "N"),
		D(["because"], "c"),
		E(J, "d"),
		E(yt, "N"),
		E(ot, "VP"),
		E(st, "A", ","),
		E(U, "NP"),
		E(G, "VPR"),
		D(["on"], "p"),
		D(["Friday"], "NP")
	]
], X = /* @__PURE__ */ "moon.river.forest.ocean.wind.rain.snow.cloud.sky.sea.tree.branch.leaf.flower.bird.stone.mountain.valley.meadow.shore.lake.stream.shadow.dawn.dusk.night.star.flame.garden.field.silence.season.frost.ember.mist.sunlight.starlight.comet.desert.island.pathway.horizon.reflection.echo.whisper.breeze.storm.twilight.harbor.cavern.glade.summit.pine.willow.feather.shell.tide.wave.spark.light.haven.clearing.canopy.solitude.time.memory.dream.music.solace.wonder.heart.spirit.sorrow.promise.presence.distance.passage.rhythm.secret.lullaby.lantern.mirror.realm.temple.melody.reverie.slumber.breath.pulse.aura.cradle.shelter.embrace.vision.phantom.chime.veil.radiance.cascade.glen.threshold.hymn.murmur.trance.eternity.moment.sanctuary.sigh.desire.warmth.grace.repose.compass.oasis.thought.glance.yearning.citadel.fountain.brook.throne.chalice.voyage.recompense.beacon.shroud.serenade.harmony".split("."), Z = /* @__PURE__ */ "slept.glowed.drifted.shimmered.rested.wandered.whispered.faded.gathered.danced.fell.rose.flowed.bloomed.called.waited.lingered.trembled.moved.turned.passed.appeared.vanished.echoed.breathed.stirred.broke.shone.swayed.sang.dreamed.opened.soared.glided.awakened.softened.ignited.settled.floated.glimmered.folded.kindled.surged.cleared.descended.ascended.parted.guided.traveled.weaved.bounded.listened.welcomed.cherished.embraced.dissolved.sparkled.flashed.calmed.haunted.realigned.illuminated.subsided.thawed.recalled.treasured.sought.found.comforted.restored.soothed.rekindled.beckoned.entwined.murmured.transcended.resounded.flowered.surrendered.hushed.unfolded.enfolded.manifested.remained.perished.retreated.yielded.conveyed.anchored.adorned.crowned.dazzled.delayed.departed.distilled.enveloped.expanded.mourned.obscured.overspread.paused.persisted.pervaded.quieted.quickened.reawakened.reconnected.reflected.released.remembered.resonated.returned.revered.revived.rippled.scattered.slumbered.smoothed.traversed.vibrated.slid.glanced.sojourned.transformed.encircled.sanctified.charmed.entranced".split("."), Q = /* @__PURE__ */ "quiet.silver.pale.gentle.soft.wild.distant.dark.bright.still.golden.autumn.winter.cold.warm.blue.green.red.white.faint.hollow.lonely.misty.silent.shallow.deep.sleeping.fallen.hidden.ancient.new.morning.velvet.tender.amber.shadowy.serene.peaceful.endless.boundless.radiant.crystal.luminous.subtle.sacred.tranquil.solitary.timeless.fragile.graceful.mellow.vibrant.ethereal.pristine.dusky.snowy.goldenrod.azure.emerald.crimson.calm.dormant.halcyon.fleeting.hallowed.ephemeral.veiled.melodic.pensive.wistful.reverent.mystic.hushed.blessed.lofty.sublime.haunting.glowing.spacious.immense.infinite.unspoken.unbroken.crystalline.starry.verdant.celestial.unseen.restless.everlasting.immortal.translucent.arcane.seraphic.resonant.reposeful.quietistic.pure.pastoral.nocturnal.monumental.limpid.iridescent.incandescent.immemorial.illusive.harmonious.flawless.festive.enchanted.elusive.divine.cloudless.charmed.breezy.benign.astral.ageless.placid.stilly.vernal.sylvan.solemn.wondrous.winsome.untamed.untold.peerless".split("."), $ = [
	"the",
	"a",
	"this",
	"that",
	"some",
	"one",
	"our",
	"my",
	"your",
	"his",
	"her",
	"its",
	"each",
	"every",
	"another",
	"any"
], xt = [
	"above",
	"below",
	"beside",
	"beyond",
	"beneath",
	"near",
	"through",
	"over",
	"under",
	"across",
	"around",
	"among",
	"within",
	"behind",
	"against",
	"toward"
], St = [
	"and",
	"yet",
	"but",
	"or"
], Ct = [
	"and",
	"while",
	"as",
	"but",
	"yet",
	"though",
	"because",
	"when"
], wt = /* @__PURE__ */ "quietly.slowly.softly.gently.here.there.alone.away.brightly.faintly.still.deeply.wildly.lightly.calmly.nearby.tenderly.silently.swiftly.sweetly.gracefully.peacefully.smoothly.subtly.radiantly.serenely.anew.forever.afar.solemnly.warmly.purely".split("."), Tt = [
	[
		E($, "d"),
		E(X, "N"),
		E(Z, "VP")
	],
	[
		E($, "d"),
		E(Q, "A"),
		E(X, "N"),
		E(Z, "VP")
	],
	[
		E($, "d"),
		E(X, "N"),
		E(Z, "VP"),
		E(St, "c"),
		E(Z, "VP")
	],
	[
		E($, "d"),
		E(X, "N"),
		E(Z, "VP"),
		E(xt, "p"),
		E($, "d"),
		E(X, "N")
	],
	[
		E($, "d"),
		E(X, "N"),
		E(Z, "VP"),
		E(Ct, "c"),
		E($, "d"),
		E(X, "N"),
		E(Z, "VP")
	],
	[
		E($, "d"),
		E(Q, "A"),
		E(X, "N"),
		E(Z, "VP"),
		E(xt, "p"),
		E($, "d"),
		E(Q, "A"),
		E(X, "N")
	],
	[
		E($, "d"),
		E(Q, "A"),
		E(X, "N"),
		E(Z, "VP"),
		E(Ct, "c"),
		E($, "d"),
		E(Q, "A"),
		E(X, "N"),
		E(Z, "VP")
	],
	[
		E(wt, "R"),
		E($, "d"),
		E(Q, "A"),
		E(X, "N"),
		E(Z, "VP"),
		E(Ct, "c"),
		E($, "d"),
		E(Q, "A"),
		E(X, "N"),
		E(Z, "VP")
	]
];
function Et(e, t = Y) {
	let n = e.length, r = t.findIndex((e) => e.length === n);
	if (r === -1) throw Error(`No template matches sentence length ${n}.`);
	return r;
}
function Dt(e) {
	let t = e.split(/[.;?]+/).map((e) => e.trim()).filter((e) => e.length > 0), n = e.toLowerCase().match(/[a-z0-9.%]+/g) || [];
	if (n.length === 0) return {
		wordCount: 0,
		sentenceCount: 0,
		avgSentenceLength: 0,
		vocabularyCoverage: 0,
		bigramUniqueness: 0,
		perplexityEstimate: Infinity
	};
	let r = new Set(L), i = 0;
	for (let e of n) r.has(e) && i++;
	let a = [];
	for (let e = 0; e < n.length - 1; e++) a.push(`${n[e]} ${n[e + 1]}`);
	let o = new Set(a), s = 0;
	for (let e of n) {
		let t = r.has(e) ? 1 / 256 : 1 / 1e4;
		s += Math.log2(t);
	}
	let c = 2 ** (-s / n.length);
	return {
		wordCount: n.length,
		sentenceCount: t.length,
		avgSentenceLength: n.length / (t.length || 1),
		vocabularyCoverage: i / n.length,
		bigramUniqueness: a.length > 0 ? o.size / a.length : 0,
		perplexityEstimate: c
	};
}
// src/encoding/bitstream.ts
var Ot = class {
	bytes;
	byteIndex = 0;
	bitIndex = 0;
	constructor(e) {
		this.bytes = e;
	}
	get remainingBits() {
		return Math.max(0, (this.bytes.length - this.byteIndex) * 8 - this.bitIndex);
	}
	get hasBits() {
		return this.remainingBits > 0;
	}
	readBits(e) {
		let t = 0;
		for (let n = 0; n < e; n++) if (this.byteIndex >= this.bytes.length) t <<= 1;
		else {
			let e = this.bytes[this.byteIndex] >> 7 - this.bitIndex & 1;
			t = t << 1 | e, this.bitIndex++, this.bitIndex === 8 && (this.bitIndex = 0, this.byteIndex++);
		}
		return t >>> 0;
	}
}, kt = class {
	bytes = [];
	currentByte = 0;
	bitCount = 0;
	totalBitsWritten = 0;
	writeBits(e, t) {
		for (let n = t - 1; n >= 0; n--) {
			let t = e >> n & 1;
			this.currentByte = this.currentByte << 1 | t, this.bitCount++, this.totalBitsWritten++, this.bitCount === 8 && (this.bytes.push(this.currentByte), this.currentByte = 0, this.bitCount = 0);
		}
	}
	toBytes() {
		if (this.bitCount > 0) {
			let e = this.currentByte << 8 - this.bitCount & 255;
			return new Uint8Array([...this.bytes, e]);
		}
		return new Uint8Array(this.bytes);
	}
}, At = {
	".": "0",
	";": "10",
	"...": "110",
	"…": "111"
}, jt = {
	0: ".",
	10: ";",
	110: "...",
	111: "…"
}, Mt = {
	the: "0",
	a: "10",
	this: "1100",
	its: "1101",
	some: "1110",
	no: "11110",
	any: "111110",
	one: "111111"
}, Nt = {
	0: "the",
	10: "a",
	1100: "this",
	1101: "its",
	1110: "some",
	11110: "no",
	111110: "any",
	111111: "one"
}, Pt = { 7: [
	"00",
	"01",
	"100",
	"101",
	"110",
	"1110",
	"1111"
] };
for (let e = 8; e <= Y.length; e++) Pt[e] = ["0", ...Pt[e - 1].map((e) => `1${e}`)];
var Ft = 3;
function It(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		r.type === "data" && (n === 0 ? t += r.label === "d" ? 2.5 : Math.log2(r.list.length) : r.label === "d" ? t += r.list.length < F.length ? Math.log2(r.list.length) : 2.5 : t += Math.log2(r.list.length));
	}
	return (t + 4) / e.length;
}
function Lt(e, t, n = !0) {
	let i = Array.from({ length: e.length }, (e, t) => t);
	if (n) for (let e of t) {
		let t = i.indexOf(e);
		t !== -1 && i.splice(t, 1);
	}
	let a = /* @__PURE__ */ new Map();
	if (!n) return i.forEach((e, t) => a.set(e, t.toString(2).padStart(3, "0"))), a;
	let o = Pt[i.length];
	if (!o) throw new r("Template count does not support the recent-template repetition rule.");
	let s = [...o].sort((e, t) => e.length - t.length), c = i.includes(Ft) ? s.pop() : void 0;
	return i.filter((e) => e !== Ft || c === void 0).sort((t, n) => It(e[n]) - It(e[t]) || t - n).forEach((e, t) => a.set(e, s[t])), c !== void 0 && a.set(Ft, c), a;
}
function Rt(e, t) {
	let n = t.length >= 1 ? t[t.length - 1] : void 0, r = e.filter((e) => e.toLowerCase() !== n).map((e, t) => ({
		word: e,
		weight: e.toLowerCase() === "the" ? 8 : 1,
		order: t
	}));
	for (; r.length > 1;) {
		r.sort((e, t) => e.weight - t.weight || e.order - t.order);
		let e = r.shift(), t = r.shift();
		r.push({
			weight: e.weight + t.weight,
			order: Math.min(e.order, t.order),
			left: e,
			right: t
		});
	}
	let i = /* @__PURE__ */ new Map(), a = (e, t) => {
		e.word === void 0 ? (e.left && a(e.left, `${t}0`), e.right && a(e.right, `${t}1`)) : i.set(e.word, t || "0");
	};
	return a(r[0], ""), i;
}
var zt = [
	".",
	" —",
	"...",
	","
], Bt = {
	".": 0,
	" —": 1,
	"...": 2,
	",": 3,
	"?": 0
};
function Vt(e) {
	return e.charAt(0).toUpperCase() + e.slice(1);
}
function Ht(e) {
	let t = e.toLowerCase();
	return /^(?:ewe|eul|euro|one|once|uni(?:corn|form|fy|on|t|vers|que)|use|usual|user|utility|utopia)/.test(t) ? !1 : /^(?:hour|honest|honor|heir)/.test(t) ? !0 : /^[aeiou]/i.test(e);
}
function Ut(e, t = a.encoding) {
	if (!e || e.length === 0) return "";
	if (t.style === "llm") throw new r("LLM steganography style requires the full LLM build. Please import from \"ngram-cipher/llm\".");
	let n = t.style === "poetry", i = e.length, o = /* @__PURE__ */ new Uint8Array(2);
	new DataView(o.buffer).setUint16(0, i, !1);
	let s = new Uint8Array(e.length + 2);
	s.set(e, 0), s.set(o, e.length);
	let c = new Ot(s), l = [], u = n ? Tt : Y, d = [], f = [], p = 0, m = n ? void 0 : he[s[0] >> 6 & 3];
	for (; c.hasBits;) {
		let e = Lt(u, f, !n), i = new Map(Array.from(e, ([e, t]) => [t, e])), a = "", o;
		for (let e = 0; e < 16 && (a += c.readBits(1).toString(), o = i.get(a), o === void 0); e++);
		if (o === void 0) throw new r("Unable to decode sentence template.");
		let s = u[o], h = [], g = [];
		for (let e of s) {
			let t = e.list && e.list.length > 0 ? e.list : et, i = p === 0 || n ? void 0 : m, a = Ge(e.type === "data" && !n ? Fe(t, g, e.label, i) : t, g, i);
			if (e.type === "filler") {
				let e = a[0];
				h.push(e), g.push(e.toLowerCase());
				continue;
			}
			let o;
			if (!n && h.length === 0) {
				let e = Rt(a, d), t = new Map(Array.from(e, ([e, t]) => [t, e])), n = "", i;
				for (let e = 0; e < 16 && (n += c.readBits(1).toString(), i = t.get(n), !i); e++);
				if (!i) throw new r("Unable to decode sentence opening word.");
				o = i;
			} else if (!n && e.label === "d" && t.length < F.length) {
				let e = Math.floor(Math.log2(a.length));
				o = a[Ke(c.hasBits ? c.readBits(e) : 0, e, a.length) % a.length];
			} else if (!n && e.label === "d") {
				let e = "", t;
				for (let n = 0; n < 6 && (e += c.readBits(1).toString(), t = Nt[e], !t); n++);
				if (!t) throw new r("Unable to decode determiner prefix code.");
				o = t;
			} else {
				let e = Math.floor(Math.log2(a.length)) || 8;
				o = a[Ke(c.hasBits ? c.readBits(e) : 0, e, a.length) % a.length];
			}
			h.push(o), g.push(o.toLowerCase());
		}
		if (h.length === 0) break;
		for (let e = 0; e < h.length; e++) h[e].toLowerCase() === "a" && e + 1 < h.length && Ht(h[e + 1]) && (h[e] = h[e] === "A" ? "An" : "an");
		for (let e = 0; e < h.length; e++) {
			let t = s[e]?.label, n = h[e];
			(e === 0 || t === "NP") && (h[e] = Vt(n));
		}
		let _ = ".";
		if (t.sentenceEndingVariance) {
			if (n) _ = zt[(c.hasBits ? c.readBits(2) : 0) % zt.length];
			else {
				let e = "", t;
				for (let n = 0; n < 4 && (e += (c.hasBits ? c.readBits(1) : 0).toString(), t = jt[e], !t); n++);
				_ = t ?? ".";
			}
		}
		let v = h.map((e, t) => `${s[t].punctuationBefore ?? ""}${e}${s[t].punctuationAfter ?? ""}`), y, b = v[v.length - 1];
		if (b.endsWith("\"") ? (v[v.length - 1] = b.slice(0, -1) + _ + "\"", y = v.join(" ")) : y = v.join(" ") + _, l.push(y), n || (f.push(o), f.length > 2 && f.shift()), !n) {
			let e = h[0].toLowerCase();
			d.push(e === "an" ? "a" : e), d.length > 2 && d.shift();
		}
		p++;
	}
	if (n) {
		let n = (e[0] || 42) % 2 == 0 ? 3 : 2, r = 0, i = [];
		for (let a = 0; a < l.length; a++) {
			let o = l[a];
			a === l.length - 1 && o.endsWith(",") && !t.sentenceEndingVariance && (o = o.slice(0, -1) + "."), a > 0 && r === 0 && i.push(""), i.push(o), r++, r >= n && (r = 0, n = (e[(a + 1) % e.length] || 1) % 2 == 0 ? 3 : 2);
		}
		return i.join("\n");
	}
	let h = [];
	for (let e = 0; e < l.length; e += 2) {
		let t = l.slice(e, e + 2);
		h.push(t.join(" "));
	}
	return h.join("\n\n");
}
function Wt(e, t = a.encoding) {
	if (!e || typeof e != "string" || e.trim().length === 0) return /* @__PURE__ */ new Uint8Array();
	if (t.style === "llm") throw new r("LLM steganography style requires the full LLM build. Please import from \"ngram-cipher/llm\".");
	let n = t.style === "poetry", i = e.replace(/[\r\n]+/g, "\n").trim(), o = [];
	if (n) {
		let e = i.split("\n").map((e) => e.trim()).filter((e) => e.length > 0);
		for (let t of e) {
			let e = t, n = ".";
			t.endsWith("...") ? (n = "...", e = t.slice(0, -3).trim()) : t.endsWith(" —") ? (n = " —", e = t.slice(0, -2).trim()) : t.endsWith("—") ? (n = " —", e = t.slice(0, -1).trim()) : /[,.!?]$/.test(t) && (n = t.slice(-1), e = t.slice(0, -1).trim()), e.length > 0 && o.push({
				sentenceStr: e,
				endingStr: n
			});
		}
	} else {
		let e = i.replace(/\n+/g, " ").match(/.*?(?:\.\.\.|…|;(?![\w])|\?(?![\w])|\.(?!\d))["'”’]*/g) || [];
		for (let t of e) {
			let e = t.trim();
			if (!e) continue;
			let n = ".", r = e;
			if (e.endsWith("...\"") || e.endsWith("...")) n = "...", r = e.replace(/\.\.\.["'”’]*$/, "").trim();
			else if (e.endsWith("…\"") || e.endsWith("…")) n = "…", r = e.replace(/…["'”’]*$/, "").trim();
			else {
				let t = e.match(/([.;?])["'”’]*$/);
				t && (n = t[1], r = e.replace(/([.;?])["'”’]*$/, "").trim());
			}
			r.length > 0 && o.push({
				sentenceStr: r,
				endingStr: n
			});
		}
	}
	let s = new kt(), c = n ? Tt : Y, l = [], u = [], d;
	for (let e = 0; e < o.length; e++) {
		let { sentenceStr: i, endingStr: a } = o[e], f = i.split(/\s+/).filter((e) => e.length > 0);
		if (f.length === 0) continue;
		let p = Et(f, c), m = Lt(c, u, !n).get(p);
		if (!m) throw new r(`Sentence template repeats within the previous two sentences at sentence ${e + 1}.`);
		for (let e of m) s.writeBits(Number(e), 1);
		let h = c[p], g = 0, _ = [], v = "";
		for (let t of h) {
			if (g >= f.length) break;
			let i = f[g], a = i.replace(/^[ "'“‘]+/g, "").replace(/[ "'”’.,!?;:]+$/g, "").replace(/[\u2013\u2014]/g, "").toLowerCase();
			t.type === "data" && a === "an" && t.label === "d" && (a = "a");
			let o = e === 0 || n ? void 0 : d, c = t.list && t.list.length > 0 ? t.list : et, u = Ge(t.type === "data" && !n ? Fe(c, _, t.label, o) : c, _, o), p = !n && g === 0 && t.type === "data" ? Rt(u, l) : void 0, m = u.findIndex((e) => e.toLowerCase() === a);
			if (m === -1) throw new r(`Invalid or unrecognized token in cipher text: "${i}" (not in carrier vocabulary, sentence ${e + 1})`);
			if (t.type === "data") {
				if (p) {
					let t = p.get(a);
					if (!t) throw new r(`Invalid repeated sentence opening word: "${i}" (sentence ${e + 1}, previous openers: ${l.join(", ")})`);
					for (let e of t) s.writeBits(Number(e), 1);
				} else if (!n && t.label === "d" && c.length < F.length) {
					let e = Math.floor(Math.log2(u.length)), t = T(m, e, u.length);
					s.writeBits(t, e);
				} else if (!n && t.label === "d") {
					let e = Mt[a];
					if (!e) throw new r(`No determiner code is defined for "${a}".`);
					for (let t of e) s.writeBits(Number(t), 1);
				} else {
					let e = Math.floor(Math.log2(u.length)) || 8, t = T(m, e, u.length);
					s.writeBits(t, e);
				}
			}
			g === 0 && (v = a), _.push(a), g++;
		}
		if (e === 0 && !n) {
			let e = s.toBytes();
			e.length > 0 && (d = he[e[0] >> 6 & 3]);
		}
		if (t.sentenceEndingVariance) {
			if (n) {
				let e = Bt[a] ?? 0;
				s.writeBits(e, 2);
			} else {
				let e = At[a] ?? "0";
				for (let t of e) s.writeBits(Number(t), 1);
			}
		}
		!n && v && (l.push(v), l.length > 2 && l.shift()), n || (u.push(p), u.length > 2 && u.shift());
	}
	let f = s.toBytes();
	if (f.length < 2) return /* @__PURE__ */ new Uint8Array();
	let p = -1;
	for (let e = f.length - 2; e >= 0; e--) {
		let t = f[e] << 8 | f[e + 1];
		if (t === e) {
			p = t;
			break;
		}
	}
	return p === -1 ? /* @__PURE__ */ new Uint8Array() : f.subarray(0, p);
}
export { L as $, vt as A, Je as B, E as C, i as Ct, _t as D, ut as E, c as Et, P as F, q as G, N as H, Tt as I, U as J, mt as K, I as L, W as M, z as N, ht as O, k as P, A as Q, Qe as R, tt as S, e as St, lt as T, s as Tt, Xe as U, Ze as V, pt as W, ot as X, Y, qe as Z, st as _, m as _t, K as a, Se as at, Ye as b, r as bt, H as c, Ke as ct, yt as d, y as dt, Dt as et, at as f, g as ft, it as g, p as gt, rt as h, f as ht, kt as i, Fe as it, D as j, gt as k, j as l, _ as lt, nt as m, h as mt, Wt as n, he as nt, V as o, Ge as ot, et as p, d as pt, G as q, Ot as r, We as rt, B as s, T as st, Ut as t, Et as tt, M as u, v as ut, dt as v, t as vt, F as w, o as wt, R as x, n as xt, ft as y, a as yt, $e as z };

//# sourceMappingURL=encoding-DzGs7C5N.js.map