import * as cc from "cc";
const { ccclass, property } = cc._decorator;
const Object_Name = "FireworkNode";
@ccclass("Fireworks")
export class Fireworks extends cc.Component
{
    @property({ type: cc.Prefab, tooltip: "煙火 Prefab" }) fireworkPrefab: cc.Prefab;
    @property({ type: cc.CCInteger, tooltip: "每個煙火回收時間" }) collectionTime: number = 1;
    @property({ type: cc.CCInteger, tooltip: "煙火次數" }) shootTimes: number = 1;
    @property({ type: cc.AudioClip, tooltip: "ExplosionSound" }) explosionSound: cc.AudioClip;
    @property({ type: [cc.Color], tooltip: "煙火顏色" }) fireworkColors: cc.Color[] = [];

    private audioSound: cc.AudioSource = new cc.AudioSource();
    private pool: cc.NodePool = new cc.NodePool();
    private border: cc.Size = new cc.Size(0, 0);
    private interval: number = 1;
    start()
    {
        this.Border = cc.size(cc.view.getDesignResolutionSize().width, cc.view.getDesignResolutionSize().height);
    }
    //設定煙火邊界
    set Border(size: cc.Size)
    {
        this.border = size;
    }

    get Border(): cc.Size
    {
        return this.border;
    }
    //設定煙火發射次數
    set ShootTimes(times: number)
    {
        this.shootTimes = times;
        this.createFirework();
    }

    get ShootTimes(): number
    {
        return this.shootTimes;
    }

    //煙火回收時間
    set CollectionTime(time: number)
    {
        this.collectionTime = time;
    }

    get CollectionTime(): number
    {
        return this.collectionTime;
    }

    //建立煙火 pool
    private createFirework()
    {
        if (this.pool.size() >= this.ShootTimes)
            return;

        this.pool.put(cc.instantiate(this.fireworkPrefab));
        this.createFirework();
    }
    //施放煙火
    play()
    {
        this.createFirework();
        this.schedule(() =>
        {
            let particleNode: cc.Node = this.pool.get();

            if (particleNode == null)
            {
                console.error("Fireworks pool not enough");
                return;
            }
            const particle = particleNode.getComponent(cc.ParticleSystem2D);
            particleNode.parent = this.node;
            particleNode.name = Object_Name;
            //set position
            particleNode.setPosition(cc.v3((Math.random() * (this.border.width / 2)) - (this.border.width / 4),
                (Math.random() * (this.border.height / 2)) - ((this.border.height / 4)), 1));

            if (this.fireworkColors.length > 0)
            {
                const color = this.fireworkColors[Math.floor(Math.random() * this.fireworkColors.length)];
                particle.startColor = color.clone();
                particle.endColor = color.clone();
            }

            particle.resetSystem();
            this.audioSound.playOneShot(this.explosionSound);
            this.scheduleOnce(() =>
            {
                // collection firework node
                particle.stopSystem();
                this.pool.put(particleNode);

            }, this.CollectionTime);
        }, this.interval, this.ShootTimes - 1);
    }
    //關閉煙火
    stop()
    {
        let particles: cc.ParticleSystem2D[] = [];
        this.unscheduleAllCallbacks();
        this.node.children.forEach(node =>
        {
            if (node.name === Object_Name)
                particles.push(node.getComponent(cc.ParticleSystem2D));
        });
        particles.forEach(particle =>
        {
            particle.stopSystem();
            this.pool.put(particle.node);
        })
    }
}