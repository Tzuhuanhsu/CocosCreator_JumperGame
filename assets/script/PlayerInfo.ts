import * as cc from "cc"

const { ccclass, property } = cc._decorator;

@ccclass("PlayerInfo")
export class PlayerInfo extends cc.Component
{
    @property({ type: cc.ProgressBar, tooltip: "HP Bar" }) hpBar: cc.ProgressBar;
    @property({ type: cc.Label, tooltip: "資訊欄位" }) infoLabel: cc.Label;
    // 累積長度
    private accumulateLength: number = 0;
    // 累積時間
    private accumulateTime: number = 0;
    private playerName: string = "";
    private time: number = 0;

    set AccumulateLength(length: number)
    {
        this.accumulateLength = length;
    }

    get AccumulateLength(): number
    {
        return this.accumulateLength;
    }

    set AccumulateTime(time: number)
    {
        this.accumulateTime = time;
    }

    get AccumulateTime(): number
    {
        return this.accumulateTime;
    }

    set HP(hp: number)
    {
        this.hpBar.progress = hp;
    }

    get HP(): number
    {
        return this.hpBar.progress;
    }

    set countTime(time: number)
    {
        this.time = time;
        this.refreshInfo();
    }

    get countTime(): number
    {
        return this.time;
    }

    set name(name: string)
    {
        this.playerName = name;
        this.refreshInfo();
    }

    get name(): string
    {
        return this.playerName;
    }

    getFormateTime(): string
    {
        return this.getCountTimeFormat(this.countTime)
    }

    private refreshInfo()
    {
        this.infoLabel.string = `Player:${this.name}\nTime:${this.getCountTimeFormat(this.countTime)}`;
    }

    private PrefixInteger(num: number, length: number)
    {
        return (Array(length).join('0') + num).slice(-length);
    }

    private getCountTimeFormat(time: number): string
    {
        const yy = this.PrefixInteger(Math.floor(time / (60 * 24)), 2);
        const mm = this.PrefixInteger(Math.floor(time / 60), 2);
        const ss = this.PrefixInteger(Math.floor(time), 2);
        return `${yy}:${mm}:${ss}`;
    }
}