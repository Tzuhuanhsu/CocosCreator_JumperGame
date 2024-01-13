import * as cc from "cc";
export const STRING = {
    GAME_START: "Let Go !!!",
    GAME_OVER: "Game Over !!!",
    WIN: "You Win !!!"
}


export interface IFloorEnemy extends cc.Component
{
    onHit(attackVal: number): void;
    CanHit(): boolean;
}