import * as cc from "cc";
const { ccclass, property } = cc._decorator;

@ccclass("RankingCell")
export class RankingCell extends cc.Component
{
    @property({ type: cc.Label, tooltip: "Name" }) nameLabel: cc.Label;
    @property({ type: cc.Label, tooltip: "Score" }) scoreLabel: cc.Label;
    @property({ type: cc.Label, tooltip: "Rank" }) rankLabel: cc.Label;


    set name(name: string)
    {
        this.nameLabel.string = name;
    }

    set score(score: string | number)
    {
        this.scoreLabel.string = `${score}`;
    }

    set Rank(rank: string)
    {
        this.rankLabel.string = rank;
    }
}