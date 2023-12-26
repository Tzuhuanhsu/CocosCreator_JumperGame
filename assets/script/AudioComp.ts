import * as cc from "cc";
const { property, ccclass } = cc._decorator;

@ccclass("AudioComp")
export class AudioComp extends cc.AudioSource
{
    @property({ type: cc.AudioClip, tooltip: "background music" }) bgMusics: cc.AudioClip;
    @property({ type: cc.AudioClip, tooltip: "start game music" }) startGameMusic: cc.AudioClip;
    @property({ type: cc.AudioClip, tooltip: "game over music" }) gameOverMusic: cc.AudioClip;
    @property({ type: cc.AudioClip, tooltip: "winner music" }) winnerMusic: cc.AudioClip;

    //播放預設的遊戲背景音樂
    playBgMusic()
    {
        this.playMusic(this.bgMusics);
    }
    //播放遊戲開始音樂
    playGameStartMusic()
    {
        this.playMusic(this.startGameMusic);
    }
    //播放遊戲結束音樂
    playGameOverMusic()
    {
        this.playMusic(this.gameOverMusic);
    }
    //播放勝利音樂
    playGameWinnerMusic()
    {
        this.playMusic(this.winnerMusic);
    }
    //播放音樂的主要function
    private playMusic(audioClip: cc.AudioClip)
    {
        if (this.playing)
            this.stop();
        if (this.clip != audioClip)
            this.clip = audioClip;
        this.play()
    }
}