import * as cc from "cc"
const { ccclass, property } = cc._decorator;



@ccclass("Menu")

export class Menu extends cc.Component
{
    @property({ type: cc.Button, tooltip: "Game Play Button" }) gamePlayButton: cc.Button = null
    private gameButtonEvent: () => void = null

    //設定遊戲選單按鈕執行事件
    setGamePlayButtonEvent(gameButtonEvent: () => void)
    {
        this.gameButtonEvent = gameButtonEvent;
    }

    start()
    {
        this.gamePlayButton.node.on(cc.Button.EventType.CLICK, () =>
        {
            if (this.gameButtonEvent)
            {
                this.gameButtonEvent();
            }
        })
    }
}