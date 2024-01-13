import * as cc from "cc"
import { IFloorEnemy } from "./Define";

const { ccclass, property } = cc._decorator

export enum FloorType 
{
    Trap = 0,
    Stone = 1,
}
//血量計算基礎值
const Base_Hit_Value = 0.01;
@ccclass("Floor")
export class Floor extends cc.Component
{
    @property({ type: cc.Node, tooltip: "終點" }) endNode: cc.Node;
    @property({ type: cc.Color, tooltip: "陷阱方塊顏色" }) trapColor: cc.Color;
    @property({ type: cc.Color, tooltip: "道路顏色" }) roadColor: cc.Color;
    @property({ type: cc.Sprite, tooltip: "Floor root node sprite component" }) rootSprite: cc.Sprite;
    @property({ type: cc.UITransform, tooltip: "Floor UITransform" }) transForm: cc.UITransform;
    private end: boolean = false;
    private trap: boolean = false;
    get Size(): cc.Size
    {
        return this.transForm.contentSize;
    }
    //初始化地板
    init()
    {
        this.isEnd = false;
        this.isTrap = false;
    }

    public attack(player: IFloorEnemy)
    {
        // 跳耀中
        if (player.CanHit())
            return;
        // 非陷阱
        if (this.trap == false)
            return;
        const playerDistance = cc.Vec3.distance(player.node.worldPosition, this.node.worldPosition);
        //傷害公式:基礎傷害 * 距離 * 0.1
        const attackVal = Base_Hit_Value * playerDistance * 0.05;
        player.onHit(attackVal);
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