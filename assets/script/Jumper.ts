import { Component, Size, Vec3 } from "cc";
import * as cc from 'cc'
const { ccclass, property } = cc._decorator

//跳耀狀態
export enum JumpState
{
    Idle = 0,
    Jumping = 1,
}
//跳耀時間
const DEFAULT_JUMP_TIME: number = 0.1;
//跳躍準備動畫
const PRE_JUMP_ANIMATION_CLIP = "pre_jump";
//跳耀動畫
const JUMP_ANIMATION_CLIP = "jump";

@ccclass("Jumper")
export class Jumper extends Component
{
    @property({ type: cc.UITransform, tooltip: "jumper body" }) body: cc.UITransform = null;
    @property({ type: cc.Animation, tooltip: "animation" }) animation: cc.Animation = null;
    @property({ type: cc.AudioClip, tooltip: "Jump audio clip" }) jumpAudioClip: cc.AudioClip;
    private jumpState: JumpState = JumpState.Idle;
    private jumpStep: number = 0;
    private jumpTime: number = DEFAULT_JUMP_TIME;
    private currentPosition: Vec3 = new Vec3(0, 0, 0);
    private deltaPosition: Vec3 = new Vec3(0, 0, 0);
    private audioSource: cc.AudioSource = new cc.AudioSource();

    jumpByStep(step: number)
    {
        if (this.IsJump == true)
            return;

        this.animation.play(PRE_JUMP_ANIMATION_CLIP)
        this.animation.once(cc.Animation.EventType.FINISHED, () =>
        {
            //跳躍
            this.State = JumpState.Jumping;
            this.jumpStep = step;
            this.jumpTime = this.animation.getState(JUMP_ANIMATION_CLIP).duration;
            this.animation.play(JUMP_ANIMATION_CLIP)
            this.audioSource.playOneShot(this.jumpAudioClip);
            this.animation.once(cc.Animation.EventType.FINISHED, () =>
            {
                this.State = JumpState.Idle;
                //落地
                this.animation.getState(PRE_JUMP_ANIMATION_CLIP).wrapMode = cc.AnimationClip.WrapMode.Reverse
                this.animation.play(PRE_JUMP_ANIMATION_CLIP);
            });
        });
    }

    onUpdate(deltaTime: number)
    {
        if (this.IsJump == true)
        {
            this.node.parent.getPosition(this.currentPosition);
            this.deltaPosition = cc.v3(this.Speed * deltaTime, 0, 0);
            cc.Vec3.add(this.currentPosition, this.currentPosition, this.deltaPosition);
            this.node.parent.setPosition(this.currentPosition);
        }
    }

    get IsJump(): boolean
    {
        return this.jumpState == JumpState.Jumping ? true : false
    }

    set State(state: JumpState)
    {
        this.jumpState = state;
    }

    get Speed(): number
    {
        return this.jumpStep * this.body.contentSize.width / this.jumpTime;
    }

}