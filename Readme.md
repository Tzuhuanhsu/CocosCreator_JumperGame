Game Name: Jumper

目錄結構

├── assets
│   ├── Image --> 圖片資源
│   │   ├── champion.png
│   │   └── champion.png.meta
│   ├── Image.meta
│   ├── animation --> 遊戲動畫
│   │   ├── game --> 場景動畫
│   │   │   ├── gameStart.anim
│   │   │   └── gameStart.anim.meta
│   │   ├── game.meta
│   │   ├── jump --> 跳耀動畫
│   │   │   ├── end_jump.anim
│   │   │   ├── end_jump.anim.meta
│   │   │   ├── jump.anim
│   │   │   ├── jump.anim.meta
│   │   │   ├── pre_jump.anim
│   │   │   └── pre_jump.anim.meta
│   │   └── jump.meta
│   ├── animation.meta
│   ├── material
│   │   ├── hdcSky.mtl
│   │   ├── hdcSky.mtl.meta
│   │   ├── plane.mtl
│   │   ├── plane.mtl.meta
│   │   ├── seafloor.mtl
│   │   ├── seafloor.mtl.meta
│   │   ├── shield.mtl
│   │   ├── shield.mtl.meta
│   │   ├── soldier.mtl
│   │   ├── soldier.mtl.meta
│   │   ├── stone.mtl
│   │   ├── stone.mtl.meta
│   │   ├── tree.mtl
│   │   └── tree.mtl.meta
│   ├── material.meta
│   ├── perfab
│   │   ├── Floor.prefab
│   │   ├── Floor.prefab.meta
│   │   ├── Menu.prefab
│   │   └── Menu.prefab.meta
│   ├── perfab.meta
│   ├── scene
│   │   ├── main.scene
│   │   └── main.scene.meta
│   ├── scene.meta
│   ├── script -->主要腳本
│   │   ├── Define.ts
│   │   ├── Define.ts.meta
│   │   ├── Floor.ts -->遊戲地板物件
│   │   ├── Floor.ts.meta
│   │   ├── GameMgr.ts -->遊戲主場控制
│   │   ├── GameMgr.ts.meta
│   │   ├── Jumper.ts -->遊戲跳耀功能
│   │   ├── Jumper.ts.meta
│   │   ├── Menu.ts -->遊戲選單
│   │   ├── Menu.ts.meta
│   │   ├── Player.ts -->遊戲操作物件
│   │   ├── Player.ts.meta
│   │   ├── StateMachine.ts -->有限狀態機
│   │   └── StateMachine.ts.meta
│   └── script.meta
├── package.json
├── profiles
│   └── v2
│       └── packages
│           ├── builder.json
│           ├── preview.json
│           ├── reference-image.json
│           └── scene.json
├── settings
│   ├── 1.2.0
│   │   └── packages
│   │       ├── builder.json
│   │       ├── engine.json
│   │       └── project.json
│   └── v2
│       ├── default-profiles
│       └── packages
│           ├── builder.json
│           ├── cocos-service.json
│           ├── engine.json
│           └── project.json
└── tsconfig.json
