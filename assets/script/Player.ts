
import { _decorator, Component, EventMouse, Node, Vec3 } from 'cc';
import { Jumper } from './Jumper';
import * as cc from "cc"
const { ccclass, property } = _decorator;
const Default_Move_Time = 0.5;
//預設血量
const Default_HP = 1;
const Base_Hit_Value = 0.01;

export enum MoveState
{
    Idle = 0,
    Moving = 1,
    End = 2
}
@ccclass('player')
export class Player extends Component
{
    @property({ type: Jumper, tooltip: "Player Body" }) jumper: Jumper;
    @property({ type: cc.UITransform, tooltip: "body" }) body: cc.UITransform;
    @property({ type: cc.ProgressBar, tooltip: "HP Bar" }) hpBar: cc.ProgressBar;
    @property({ type: cc.Color, tooltip: "Hit Color" }) hitColor: cc.Color;
    @property({ type: cc.Sprite, tooltip: "Body Sprite" }) bodySprite: cc.Sprite;
    private moveTime: number = Default_Move_Time;
    private step: number = 0;
    private currentTime: number = 0;
    private speed: number = 0;
    private currentPosition: Vec3 = new Vec3(0, 0, 0);
    private deltaPosition: Vec3 = new Vec3(0, 0, 0);
    private targetPosition: Vec3 = new Vec3(0, 0, 0);
    private moveState: MoveState = MoveState.Idle
    private originalColor: cc.Color = null;

    start()
    {
        this.originalColor = this.bodySprite.color.clone();
    }

    //受到攻擊
    onHit(distance: number)
    {
        //傷害公式:基礎傷害 * 距離 * 0.1
        const totalHitValue = Base_Hit_Value * distance * 0.1;
        this.hpBar.progress -= totalHitValue;
        cc.tween(this.bodySprite)
            .to(0.5, { color: this.hitColor })
            .call(() =>
            {
                this.bodySprite.color = this.originalColor;
            })
            .start();
    }

    get HP(): number
    {
        return this.hpBar.progress;
    }
    //Game init
    onGameInit()
    {
        this.node.setPosition(cc.Vec3.ZERO);
        this.hpBar.progress = Default_HP;
    }
    //game start
    onGameStart()
    {
        cc.input.on(cc.Input.EventType.MOUSE_UP, this.onMouseUp, this);
        cc.input.on(cc.Input.EventType.MOUSE_DOWN, this.onMouseDown, this);


    }
    onGameEnd()
    {
        cc.input.off(cc.Input.EventType.MOUSE_UP);
        cc.input.off(cc.Input.EventType.MOUSE_DOWN);
        this.moveState = MoveState.End;
    }

    update(deltaTime: number)
    {

        if (this.moveState == MoveState.Moving)
        {
            this.currentTime += deltaTime;
            if (this.moveEnd())
            {
                this.moveState = MoveState.Idle;
                this.moveByStep(this.step);
            }
            else
            {
                this.node.getPosition(this.currentPosition);
                this.deltaPosition = cc.v3(this.speed * deltaTime, 0, 0);
                cc.Vec3.add(this.currentPosition, this.currentPosition, this.deltaPosition);
                this.node.setPosition(this.currentPosition);;
            }
        }
        this.jumper.onUpdate(deltaTime);
    }

    /**
     * Mouse Event Listener
     * @param event 
     */
    onMouseUp(event: EventMouse)
    {

        const left: number = 0
        const right: number = 2
        this.moveState = MoveState.End;
        if (event.getButton() === left)
        {
            this.jumper.jumpByStep(2);
        }
    }

    //Mouse down
    onMouseDown(event: cc.EventMouse)
    {
        const left: number = 0
        const right: number = 2
        this.moveState = MoveState.Idle;
        if (event.getButton() === left)
        {
            this.moveByStep(1);
        }

    }

    moveByStep(step: number)
    {
        if (this.moveState != MoveState.Idle)
            return;
        if (this.jumper.IsJump == true)
            return;
        this.moveState = MoveState.Moving;
        this.step = step;
        this.currentTime = 0;
        this.speed = step * this.body.contentSize.width * 1.2 / this.moveTime;
        Vec3.add(this.targetPosition, this.node.getPosition(this.currentPosition), cc.v3(step * this.body.contentSize.width, 0, 0));
    }

    //移動結束
    moveEnd(): boolean
    {
        return this.currentTime > this.moveTime;
    }
    //移動狀態
    get MoveState(): MoveState
    {
        return this.moveState;
    }
    //是否跳耀中
    get IsJump(): boolean
    {
        return this.jumper.IsJump;
    }
    //取得player size
    get BodySize(): cc.Size
    {
        return this.body.contentSize;
    }
}

