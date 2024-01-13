import * as cc from "cc"
import { SoundButton } from "./SoundButton";
const { ccclass, property } = cc._decorator;


const Default_Player_Name = "Richard";
@ccclass("Menu")
export class Menu extends cc.Component
{
    @property({ type: SoundButton, tooltip: "Game Play Button" }) gamePlayButton: cc.Button = null;
    @property({ type: cc.EditBox, tooltip: "玩家名稱" }) playerNameEditBox: cc.EditBox;

    private gameButtonEvent: () => void = null
    private playerName: string = Default_Player_Name;
    //設定遊戲選單按鈕執行事件
    setGamePlayButtonEvent(gameButtonEvent: () => void)
    {
        this.gameButtonEvent = gameButtonEvent;
    }

    start()
    {
        if (this.playerNameEditBox)
            this.playerNameEditBox.placeholderLabel.string = `請輸入玩家名稱`;

        this.gamePlayButton.node.on(cc.Button.EventType.CLICK, () =>
        {

            if (this.gameButtonEvent)
            {
                if (this.playerNameEditBox)
                    this.PlayerName = this.playerNameEditBox.string;
                this.gameButtonEvent();
            }

        })
    }

    // 設定玩家名稱
    set PlayerName(name: string)
    {
        this.playerName = name;
    }

    // 取得玩家名稱
    get PlayerName()
    {
        return this.playerName;
    }
}