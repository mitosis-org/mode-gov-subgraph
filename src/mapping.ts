import { store } from "@graphprotocol/graph-ts";
import { Voted, Reset } from "../generated/ModeGov/Gov";

import { Token, Voter, Gauge, Vote } from "../generated/schema";

export function handleVoted(event: Voted): void {
  let params = event.params;

  let token = Token.load(params.tokenId.toHex());
  if (!token) {
    token = new Token(params.tokenId.toHex());
    token.save();
  }

  let voter = Voter.load(params.voter.toHex());
  if (!voter) {
    voter = new Voter(params.voter.toHex());
    voter.save();
  }

  let gauge = Gauge.load(params.gauge.toHex());
  if (!gauge) {
    gauge = new Gauge(params.gauge.toHex());
  }
  gauge.totalVotingPower = params.totalVotingPowerInGauge;
  gauge.save();

  let voteId = `${params.gauge.toHex()}-${params.tokenId.toHex()}`;
  let vote = new Vote(voteId);
  vote.epoch = params.epoch;
  vote.votingPower = params.votingPowerCastForGauge;
  vote.totalVotingPower = params.totalVotingPowerInContract;
  vote.timestamp = params.timestamp;
  vote.gauge = gauge.id;
  vote.token = token.id;
  vote.voter = voter.id;
  vote.save();
}

export function handleReset(event: Reset): void {
  let params = event.params;

  let voteId = `${params.gauge.toHex()}-${params.tokenId.toHex()}`;
  store.remove("Vote", voteId);

  let gauge = Gauge.load(params.gauge.toHex())!;
  gauge.totalVotingPower = params.totalVotingPowerInGauge;
  gauge.save();
}
