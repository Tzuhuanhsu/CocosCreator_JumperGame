import * as cc from "cc"

const { ccclass, property } = cc._decorator

export enum FloorType 
{
    Trap = 0,
    Stone = 1,
}

@ccclass("Floor")
export class Floor extends cc.Component
{
    @property({ type: cc.Node, tooltip: "終點" }) endNode: cc.Node;
    @property({ type: cc.Color, tooltip: "陷阱方塊顏色" }) trapColor: cc.Color;
    @property({ type: cc.Color, tooltip: "道路顏色" }) roadColor: cc.Color;
    @property({ type: cc.Sprite, tooltip: "Floor root node sprite component" }) rootSprite: cc.Sprite;

    private end: boolean = false;
    private trap: boolean = false;

    //初始化地板
    init()
    {
        this.isEnd = false;
        this.isTrap = false;
    }

    //是否為終點
    set isEnd(end: boolean)
    {
        this.end = end;
        if (end == true)
            this.endNode.active = true;
        else
            this.endNode.active = false;
    }
    get isEnd(): boolean
    {
        return this.end;
    }

    //是否為陷阱
    set isTrap(isTrap: boolean)
    {
        this.trap = isTrap;
        if (isTrap)
        {
            this.rootSprite.color = this.trapColor;
        }
        else
        {
            this.rootSprite.color = this.roadColor;
        }
    }

    get isTrap(): boolean
    {
        return this.trap;
    }
}