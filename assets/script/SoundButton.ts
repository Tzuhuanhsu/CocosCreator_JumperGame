import * as cc from "cc"
const { ccclass, property } = cc._decorator;

@ccclass("SoundButton")
export class SoundButton extends cc.Button
{
    @property({ type: cc.AudioClip, tooltip: "Button effect sound" }) effectAudio: cc.AudioClip;
    private audioSource: cc.AudioSource = new cc.AudioSource();

    start()
    {
        this.node.on(cc.Button.EventType.CLICK, () =>
        {
            this.playEffectMusic();
        });

    }
    //播放按鈕音效
    private playEffectMusic()
    {
        if (this.audioSource.playing)
        {
            this.audioSource.stop();
        }
        this.audioSource.playOneShot(this.effectAudio);
    }
}