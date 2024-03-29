import * as cc from 'cc'
import { Floor, FloorType } from './Floor';
import { MoveState, Player } from './Player';
import { Menu } from './Menu';
import FiniteState from './StateMachine';
import { STRING } from './Define';
import { AudioComp } from './AudioComp';
import { Fireworks } from './Fireworks';
import { Rank } from './Rank';

const { ccclass, property } = cc._decorator;

//Game State
enum GameState
{
    Idle,
    Init,
    Play,
    Playing,
    LevelUp,
    End
}
//遊戲狀態動畫
const GAME_START_ACTION = "gameStart";
//地板最小長度
const MIN_FLOOR_LENGTH = 3;
// 每次增加的地板難度
const FLOOR_LEVEL_UP_INTERVAL = 10;
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
    @property({ type: Menu, tooltip: "Game end menu" }) gameEndMenu: Menu;
    @property({ type: cc.Camera, tooltip: "game camera" }) gameCamera: cc.Camera;
    @property({ type: cc.UITransform, tooltip: "click node" }) clickNode: cc.UITransform;
    @property({ type: AudioComp, tooltip: "遊戲音效模組" }) audioComp: AudioComp;
    @property({ type: Fireworks, tooltip: "煙火模組" }) firework: Fireworks;
    @property({ type: Rank, tooltip: "Rank" }) rank: Rank;

    // 遊戲狀態機
    private gameStateMachine: FiniteState = new FiniteState(GameState.Idle);
    // 起點位置
    private stPosition: cc.Vec3 = new cc.Vec3(0, 0, 0);
    // 終點位置
    private endPosition: cc.Vec3 = new cc.Vec3(0, 0, 0);
    //Map floors
    private floors: Floor[] = [];
    //isWinner?
    private isWinner: boolean = false;
    // init floor length
    private initFloorLength: number = 0;
    start()
    {
        //檢查設定地板長度
        if (this.floorLength < MIN_FLOOR_LENGTH)
            this.floorLength = MIN_FLOOR_LENGTH;
        this.initFloorLength = this.floorLength;
        this.gameEndMenu.node.active = false;
        this.gameCamera.node.active = false;
        this.clickNode.setContentSize(cc.size(cc.view.getDesignResolutionSize().width * 2, cc.view.getDesignResolutionSize().height));
    }
    update()
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
                    this.onGameStart();
                if (this.player.MoveState == MoveState.Moving || this.player.CanHit())
                    this.checkMoveBorder();
                //計時 and 確認邊界
                this.player.time = this.gameStateMachine.Elapsed;
                this.checkFloorWithPlayer();
                break;
            case GameState.End:
                if (this.gameStateMachine.isEnter)
                    this.onGameEnd();
                break;
            case GameState.LevelUp:
                if (this.gameStateMachine.isEnter)
                    this.onGameLevelUp();
                break;
            default:
                console.error("On Handle game state", this.gameStateMachine.Current);
                break
        }
    }
    // 遊戲準備開始
    private onGameIdle()
    {
        this.floorLength = this.initFloorLength;
        this.menu.node.parent.active = true;
        this.menu.node.active = true;
        this.gameEndMenu.node.active = false;
        this.gameCamera.node.active = false;
        this.player.node.active = false;
        this.gameStartLabelOpacity.node.active = false;
        this.menu.setGamePlayButtonEvent(() =>
        {
            this.menu.node.parent.active = false;
            this.gameStateMachine.NextState = GameState.Init;
            this.player.name = this.menu.PlayerName;
        });
        this.player.init();
    }

    // 遊戲開始
    private onGamePlay()
    {
        this.clickNode.node.active = true;
        this.player.node.active = true;
        this.gameCamera.node.active = true;
        this.gameStartLabelOpacity.node.active = true;
        this.gameEndMenu.node.active = false;
        this.audioComp.playBgMusic();
        this.firework.stop();
        this.gameAnimation.play(GAME_START_ACTION);
        this.gameAnimation.once(cc.Animation.EventType.FINISHED, () =>
        {
            this.gameStartLabelOpacity.opacity = 255;
            cc.tween(this.gameStartLabelOpacity)
                .to(1.5, { opacity: 100 })
                .call(() =>
                {
                    this.gameStartLabelOpacity.node.active = false;
                    this.gameStateMachine.NextState = GameState.Playing;
                    this.audioComp.playGameStartMusic();
                })
                .start();
            cc.tween(this.gameStartLabelOpacity.node)
                .to(1.5, { worldPosition: this.player.node.getWorldPosition() })
                .start();
        });
    }
    // 玩家可以開始操作角色
    private onGameStart()
    {
        this.player.onGameStart();
        this.clickNode.node.on(cc.Node.EventType.TOUCH_START, this.player.onMouseDown.bind(this.player));
        this.clickNode.node.on(cc.Node.EventType.TOUCH_END, this.player.onMouseUp.bind(this.player));

    }
    //玩家遊戲結束
    private onGameOver()
    {
        this.gameStartLabelOpacity.node.getComponent(cc.Label).string = STRING.GAME_OVER;
        this.audioComp.playGameOverMusic();
        this.isWinner = false;
        this.gameStateMachine.NextState = GameState.End;
    }

    //遊戲勝利
    private onGameWin()
    {
        this.player.setAccumulateLength(this.player.getAccumulateLength() + this.floorLength);
        this.player.setAccumulateTime(this.player.getAccumulateTime() + this.player.time);
        this.gameStartLabelOpacity.node.getComponent(cc.Label).string = `${STRING.WIN} \n 成績是:${Math.floor(this.floorLength / this.player.time)}`;
        this.audioComp.playGameWinnerMusic();
        this.firework.play();
        this.isWinner = true;
        this.gameStateMachine.NextState = GameState.End;
    }

    //該局遊戲結束
    private onGameEnd()
    {
        this.gameStartLabelOpacity.opacity = 255;
        this.gameAnimation.play(GAME_START_ACTION);

        cc.tween(this.gameStartLabelOpacity.node)
            .to(1, { worldPosition: this.player.node.getWorldPosition() })
            .delay(3)
            .call(() =>
            {
                if (this.isWinner == false)
                {
                    this.rank.node.setWorldPosition(this.player.node.worldPosition);
                    this.rank.insertData(this.player.name, this.player.time);
                    this.rank.show();
                    this.rank.setOnCloseEvent(() =>
                    {
                        this.gameEndMenu.node.active = true;
                        this.gameEndMenu.node.setWorldPosition(this.player.node.worldPosition.x, this.gameEndMenu.node.worldPosition.y, 1);
                        this.gameEndMenu.setGamePlayButtonEvent(() =>
                        {
                            this.gameStateMachine.NextState = GameState.Idle;
                        });
                    });
                }
                else
                {
                    this.gameStateMachine.NextState = GameState.LevelUp;
                }

            })
            .start();
        this.clickNode.node.active = false;
        this.clickNode.node.off(cc.Node.EventType.TOUCH_START);
        this.clickNode.node.off(cc.Node.EventType.TOUCH_END);
        this.player.onGameEnd();
    }

    private onGameLevelUp()
    {
        this.floorLength = this.floorLength + FLOOR_LEVEL_UP_INTERVAL;;
        this.gameStartLabelOpacity.node.getComponent(cc.Label).string = STRING.GAME_START;
        this.player.onGameInit();
        this.generateFloor();
        this.player.time = 0;
        this.gameStateMachine.NextState = GameState.Play;
    }

    //game start
    private onGameInit()
    {
        this.gameStartLabelOpacity.node.getComponent(cc.Label).string = STRING.GAME_START;
        this.player.onGameInit();
        this.generateFloor();
        this.gameStateMachine.NextState = GameState.Play;
        this.player.time = this.gameStateMachine.Elapsed;

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
            floor.init();
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
        }
    }
    //檢查地板與Player關係
    private checkFloorWithPlayer()
    {
        this.floors.forEach((floor: Floor) =>
        {
            //面積的1/2為踩踏有效範圍
            const playerDistance = cc.Vec3.distance(this.player.node.worldPosition, floor.node.worldPosition)
            if (playerDistance < (floor.Size.width / 2))
            {
                floor.attack(this.player)

                if (this.player.HP <= 0)
                    this.onGameOver();
                if (floor.isEnd)
                    this.onGameWin();
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
        this.floors.push(floor);
        return floor;
    }
}