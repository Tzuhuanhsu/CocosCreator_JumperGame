import * as cc from 'cc'
import { Floor, FloorType } from './Floor';
import { MoveState, Player } from './Player';
import { Menu } from './Menu';
import FiniteState from './StateMachine';
import { STRING } from './Define';

const { ccclass, property } = cc._decorator;

//Game State
enum GameState
{
    Idle,
    Init,
    Play,
    Playing,
    End
}
//遊戲狀態動畫
const GAME_START_ACTION = "gameStart";
//地板最小長度
const MIN_FLOOR_LENGTH = 3;

@ccclass("GameMgr")
export class GameMgr extends cc.Component
{
    @property({ type: cc.Prefab, tooltip: "地板Prefab" }) floorPrefab: cc.Prefab = null;
    @property({ type: cc.CCInteger, tooltip: "地板長度", min: MIN_FLOOR_LENGTH }) floorLength: number = null;
    @property({ type: Player, tooltip: "Player" }) player: Player = null;
    @property({ type: Menu, tooltip: "Menu" }) menu: Menu = null;
    @property({ type: cc.Animation, tooltip: "GameAction" }) gameAnimation: cc.Animation = null;
    @property({ type: cc.Node, tooltip: "地板節點" }) FloorNode: cc.Node;
    @property({ type: cc.UIOpacity, tooltip: "遊戲狀態" }) gameStartLabelOpacity: cc.UIOpacity;
    @property({ type: cc.Label, tooltip: "計時器" }) countTimer: cc.Label;
    @property({ type: cc.Node, tooltip: "Game end menu" }) gameEndMenu: cc.Node;
    @property({ type: cc.Button, tooltip: "Restart game button" }) restartGameButton: cc.Button;
    @property({ type: cc.Camera, tooltip: "game camera" }) gameCamera: cc.Camera;

    // 遊戲狀態機
    private gameStateMachine: FiniteState = new FiniteState(GameState.Idle);
    // 起點位置
    private stPosition: cc.Vec3 = new cc.Vec3(0, 0, 0);
    // 終點位置
    private endPosition: cc.Vec3 = new cc.Vec3(0, 0, 0);
    //Map floors
    private floors: Floor[] = [];
    start()
    {
        //檢查設定地板長度
        if (this.floorLength < MIN_FLOOR_LENGTH)
            this.floorLength = MIN_FLOOR_LENGTH;
        this.gameEndMenu.active = false;
        this.gameCamera.node.active = false;
    }
    update(deltaTime: number)
    {
        this.gameStateMachine.Trigger();
        switch (this.gameStateMachine.Current)
        {
            case GameState.Idle:
                if (this.gameStateMachine.isEnter)
                    this.onGameIdle();
                break;
            case GameState.Init:
                if (this.gameStateMachine.isEnter)
                    this.onGameInit();
                break;
            case GameState.Play:
                if (this.gameStateMachine.isEnter)
                    this.onGamePlay();
                break;
            case GameState.Playing:
                if (this.gameStateMachine.isEnter)
                    this.player.onGameStart();
                if (this.player.MoveState == MoveState.Moving || this.player.IsJump)
                    this.checkMoveBorder();
                this.countTime();
                this.checkFloorWithPlayer();
                break;
            case GameState.End:
                if (this.gameStateMachine.isEnter)
                    this.onGameEnd();
                break;
            default:
                console.error("On Handle game state", this.gameStateMachine.Current);
                break
        }
    }
    // 遊戲準備開始
    private onGameIdle()
    {
        this.menu.node.parent.active = true;
        this.menu.node.active = true;
        this.gameEndMenu.active = false;
        this.gameCamera.node.active = false;
        this.player.node.active = false;
        this.gameStartLabelOpacity.node.active = false;
        this.menu.setGamePlayButtonEvent(() =>
        {
            this.menu.node.parent.active = false;
            this.gameStateMachine.NextState = GameState.Init;
        });
    }

    // 遊戲開始
    private onGamePlay()
    {
        this.player.node.active = true;
        this.gameCamera.node.active = true;
        this.gameStartLabelOpacity.node.active = true;
        this.gameAnimation.play(GAME_START_ACTION);
        this.gameAnimation.once(cc.Animation.EventType.FINISHED, () =>
        {
            cc.tween(this.gameStartLabelOpacity)
                .to(1, { opacity: 0 })
                .call(() => { this.gameStateMachine.NextState = GameState.Playing; })
                .start();
            cc.tween(this.gameStartLabelOpacity.node)
                .to(1, { worldPosition: this.player.node.getWorldPosition() })
                .start();
        });
    }
    //玩家遊戲結束
    private onGameOver()
    {
        this.gameStartLabelOpacity.node.getComponent(cc.Label).string = STRING.GAME_OVER;
    }

    //遊戲勝利
    private onGameWin()
    {
        this.gameStartLabelOpacity.node.getComponent(cc.Label).string = STRING.WIN;
    }

    //該局遊戲結束
    private onGameEnd()
    {
        this.gameStartLabelOpacity.opacity = 255;
        this.gameAnimation.play(GAME_START_ACTION);
        cc.tween(this.gameStartLabelOpacity.node)
            .to(1, { worldPosition: this.player.node.getWorldPosition() })
            .call(() =>
            {
                this.gameEndMenu.active = true;
                this.gameEndMenu.setWorldPosition(this.player.node.worldPosition.x, this.gameEndMenu.worldPosition.y, 1);
                this.restartGameButton.node.once(cc.Button.EventType.CLICK, () =>
                {
                    this.gameStateMachine.NextState = GameState.Idle;
                });
            })
            .start();
        this.player.onGameEnd();
    }

    private countTime()
    {
        this.countTimer.string = `Time:${this.getCountTimeFormat(this.gameStateMachine.Elapsed)}`
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

    //game start
    private onGameInit()
    {
        this.gameStartLabelOpacity.node.getComponent(cc.Label).string = STRING.GAME_START;
        this.player.onGameInit();
        this.generateFloor();
        this.gameStateMachine.NextState = GameState.Play;
        this.countTimer.string = `Time:${this.getCountTimeFormat(0)}`;
    }
    /**
     * 產生地板
     */
    private generateFloor()
    {

        this.FloorNode.removeAllChildren();
        for (let i = 0; i < this.floorLength; i++)
        {
            let floor: Floor = this.floors[i] != null ? this.floors[i] : this.spawnFloor();
            if (floor)
            {
                floor.node.setPosition(i * floor.node.getComponent(cc.UITransform).contentSize.width, 0, 0);
                this.FloorNode.addChild(floor.node);

                if (i < 2)
                {
                    floor.isTrap = false;
                    if (i == 0)
                        //取出起始邊界
                        floor.node.getWorldPosition(this.stPosition);
                }
                else if (i == this.floorLength - 1)
                {
                    floor.isTrap = false;
                    floor.isEnd = true;
                    //取出終點邊界
                    floor.node.getWorldPosition(this.endPosition);
                }
                else if (this.floors[i - 1]?.isTrap === true)
                {
                    floor.isTrap = false;
                }
                else
                {
                    floor.isTrap = Math.floor(Math.random() * 2) == FloorType.Trap ? true : false;
                }

                this.floors.push(floor);
            }
        }
    }
    //檢查地板與Player關係
    private checkFloorWithPlayer()
    {
        this.floors.forEach((floor: Floor, index: number) =>
        {
            //面積的1/2為踩踏有效範圍
            const playerDistance = cc.Vec3.distance(this.player.node.worldPosition, floor.node.worldPosition)
            if (playerDistance < (this.player.BodySize.width / 2))
            {
                if (floor.isTrap && this.player.IsJump == false)
                    this.player.onHit(playerDistance);


                if (floor.isEnd || this.player.HP <= 0)
                {
                    if (this.player.HP <= 0)
                        this.onGameOver();
                    if (floor.isEnd)
                        this.onGameWin();
                    //notify machine game end
                    this.gameStateMachine.NextState = GameState.End;
                }
            }
        });
    }


    // 確認邊界
    private checkMoveBorder()
    {
        if (this.player.node.worldPosition.x - this.stPosition.x < 0)
        {
            this.player.node.setWorldPosition(this.stPosition);
        }

        if (this.endPosition.x - this.player.node.worldPosition.x < 0)
        {
            this.player.node.setWorldPosition(this.endPosition);
        }
    }

    // 產出地板
    private spawnFloor(): Floor
    {
        if (!this.floorPrefab)
        {
            return null;
        }
        let floor: Floor = cc.instantiate(this.floorPrefab).getComponent(Floor);
        floor.isEnd = false;
        return floor;
    }
}