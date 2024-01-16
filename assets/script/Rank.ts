import * as cc from "cc";
import { SoundButton } from "./SoundButton";
import { RankingCell } from "./RankingCell";
const { ccclass, property } = cc._decorator;
export type RankData =
    {
        name: string,
        score: number,
        rank?: number
    }

@ccclass("Rank")
export class Rank extends cc.Component
{
    @property({ type: SoundButton, tooltip: "確認按鈕" }) confirmButton: SoundButton;
    @property({ type: cc.Prefab, tooltip: "Rank cell" }) rankCellPrefab: cc.Prefab;
    @property({ type: cc.Layout, tooltip: "ScrollView Content" }) scrollViewContent: cc.Layout;

    private rankData: RankData[] = [];
    private rankCells: RankingCell[] = [];
    private onCloseEvent: () => void = null;
    start()
    {
        this.confirmButton.node.on(cc.Button.EventType.CLICK, () =>
        {
            this.node.active = false;
            if (this.onCloseEvent)
                this.onCloseEvent();
        })
    }

    insertData(name: string, score: number)
    {
        this.rankData.push({
            name: name,
            score: score
        });
    }

    setOnCloseEvent(event: () => void)
    {
        if (event)
            this.onCloseEvent = event;
    }

    show()
    {
        this.refreshUI();
        this.node.active = true;
    }

    refreshUI()
    {
        this.scrollViewContent.node.removeAllChildren();
        this.refreshPool();
        this.refreshSort();
        const firstCell = this.rankCells.pop();
        firstCell.name = "Player";
        firstCell.score = "Score";
        firstCell.Rank = "排名";
        firstCell.node.active = true;
        this.scrollViewContent.node.addChild(firstCell.node);

        for (let x = 0; x < this.rankData.length; x++)
        {
            const rankCell = this.rankCells.pop();
            rankCell.name = this.rankData[x].name;
            rankCell.score = `,${Math.floor(this.rankData[x].score)},`;
            rankCell.Rank = `No.${this.rankData[x].rank}`;
            rankCell.node.active = true;
            this.scrollViewContent.node.addChild(rankCell.node);
        }

    }

    getData(): RankData[]
    {
        return this.rankData;
    }


    private refreshSort()
    {
        this.rankData = this.rankData.sort((a, b) =>
        {
            return -(a.score - b.score);
        });

        for (let x = 0; x < this.rankData.length; x++)
        {
            this.rankData[x].rank = x + 1;
        }
    }

    private refreshPool()
    {
        const lackSize = (this.rankData.length + 1) - this.rankCells.length;
        if (lackSize > 0)
        {
            for (let x = 0; x < lackSize; x++)
            {
                this.rankCells.push(cc.instantiate(this.rankCellPrefab).getComponent(RankingCell));
            }
        }

        this.rankCells.forEach(cell =>
        {
            cell.node.active = false;
        });
    }
}

