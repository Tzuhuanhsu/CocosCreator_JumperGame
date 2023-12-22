
export default class FiniteState
{
    //目前得狀態
    private currentState: number;
    //下一個狀態
    private nextState: number;
    //記錄狀態時間
    private transitTime: number = 0;
    //是否可以進行轉移
    private transit: boolean = true;
    //強制轉移
    private force: boolean = false;
    //是否可以執行
    private enter: boolean = false;

    constructor (initState: number)
    {
        this.currentState = initState;
        this.nextState = initState;
    }

    //觸發
    Trigger()
    {
        if (this.transit)
        {
            this.currentState = this.nextState;
            this.transitTime = new Date().getTime() / 1000;
            this.transit = !this.transit;
            this.force = false;
            this.enter = true;
        }
        else
        {
            this.enter = false;
        }
    }
    //強制轉移
    ForceTransit(state: number)
    {
        this.nextState = state;
        this.transit = true;
        this.force = true;
    }
    //下個狀態
    set NextState(state: number)
    {
        if (this.force == true)
            return;
        this.nextState = state;
        this.transit = true;
    }
    //目前狀態
    get Current(): number
    {
        return this.currentState;
    }
    //狀態時間
    get Elapsed(): number
    {
        return (new Date().getTime() / 1000) - this.transitTime;
    }
    //是否可以進入
    get isEnter(): boolean
    {
        return this.enter;
    }
}

