
import { _decorator, Component, EventMouse, Vec3 } from 'cc';
import { Jumper } from './Jumper';
import * as cc from "cc";
import { IFloorEnemy } from './Define';
import { PlayerInfo } from './PlayerInfo';

const { ccclass, property } = _decorator;
const Default_Move_Time = 0.5;
//預設血量
const Default_HP = 1;

//移動基礎值
const Base_Move_Distance = 1.5;
export enum MoveState
{
    Idle = 0,
    Moving = 1,
    End = 2
}
@ccclass('player')
export class Player extends Component implements IFloorEnemy
{
    @property({ type: Jumper, tooltip: "Player Body" }) jumper: Jumper;
    @property({ type: cc.UITransform, tooltip: "body" }) body: cc.UITransform;
    @property({ type: PlayerInfo, tooltip: "角色資訊" }) playerInfo: PlayerInfo;
    @property({ type: cc.Color, tooltip: "Hit Color" }) hitColor: cc.Color;
    @property({ type: cc.Sprite, tooltip: "Body Sprite" }) bodySprite: cc.Sprite;
    @property({ type: cc.AudioClip, tooltip: "Running sound" }) runningAudioClip: cc.AudioClip;
    @property({ type: cc.AudioClip, tooltip: "Hit sound" }) hitAudioClip: cc.AudioClip;

    private moveTime: number = Default_Move_Time;
    private step: number = 0;
    private currentTime: number = 0;
    private speed: number = 0;
    private currentPosition: Vec3 = new Vec3(0, 0, 0);
    private deltaPosition: Vec3 = new Vec3(0, 0, 0);
    private targetPosition: Vec3 = new Vec3(0, 0, 0);
    private moveState: MoveState = MoveState.Idle
    private originalColor: cc.Color = null;
    private audioSource: cc.AudioSource = new cc.AudioSource();

    start()
    {
        this.originalColor = this.bodySprite.color.clone();
    }

    //受到攻擊
    onHit(attackVal: number)
    {
        this.playerInfo.HP -= attackVal;
        cc.tween(this.bodySprite)
            .to(0.5, { color: this.hitColor })
            .call(() =>
            {
                this.bodySprite.color = this.originalColor;
            })
            .start();
        this.audioSource.playOneShot(this.hitAudioClip);
    }

    set name(name: string)
    {
        this.playerInfo.name = name;
    }

    set time(time: number)
    {
        this.playerInfo.countTime = time;
    }

    getFormatCountTime(): string
    {
        return this.playerInfo.getFormateTime();
    }

    get HP(): number
    {
        return this.playerInfo.HP;
    }
    //Game init
    onGameInit()
    {
        this.node.setPosition(cc.Vec3.ZERO);
        this.playerInfo.HP = Default_HP;
    }

    //game start
    onGameStart()
    {
        this.moveState = MoveState.Idle;
    }
    //game End
    onGameEnd()
    {
        this.moveState = MoveState.End;
        this.stopMoveSound();
    }

    update(deltaTime: number)
    {

        if (this.moveState == MoveState.Moving)
        {
            this.currentTime += deltaTime;
            if (this.isMoveEnd())
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
    onMouseUp()
    {

        this.moveState = MoveState.End;
        this.stopMoveSound();
        this.jumper.jumpByStep(Base_Move_Distance);
    }

    //Mouse down
    onMouseDown()
    {
        this.moveState = MoveState.Idle;
        this.moveByStep(Base_Move_Distance);
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
        this.playMoveSound();
        Vec3.add(this.targetPosition, this.node.getPosition(this.currentPosition), cc.v3(step * this.body.contentSize.width, 0, 0));
    }
    //播放移動音效
    private playMoveSound()
    {
        if (this.audioSource.playing)
            return;
        if (this.audioSource.clip != this.runningAudioClip)
            this.audioSource.clip = this.runningAudioClip;
        else
            this.audioSource.currentTime = 0;

        this.audioSource.play();

    }
    //停止播放移動音效
    private stopMoveSound()
    {
        this.audioSource.stop();
    }

    //移動結束
    isMoveEnd(): boolean
    {
        return this.currentTime > this.moveTime;
    }
    //移動狀態
    get MoveState(): MoveState
    {
        return this.moveState;
    }
    //是否跳耀中
    CanHit(): boolean
    {
        return this.jumper.IsJump;
    }
    //取得player size
    get BodySize(): cc.Size
    {
        return this.body.contentSize;
    }
}

