import {_decorator, Component, Prefab, instantiate, Node, Label, CCInteger, Vec3} from 'cc';
import {PlayerController} from "db://assets/Scripts/PlayerController";

const {ccclass, property} = _decorator;

// 赛道格子类型，坑（BT_NONE）或者实路（BT_STONE）
enum BlockType {
    BT_NONE,
    BT_STONE
}

// 游戏状态，初始化（GS_INIT）、游戏进行中（GS_PLAYING）或者结束（GS_END）
enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END
}

@ccclass('GameManager')
export class GameManager extends Component {

    // 赛道预制
    @property({type: Prefab})
    public cubePrefab: Prefab | null = null;
    // 赛道长度
    @property
    public roadLength = 50;
    private _road: BlockType[] = [];
    // startMenu 节点的引用
    @property({type: Node})
    public startMenu: Node | null = null;
    // PlayerController 脚本的引用
    @property({type: PlayerController})
    public playerCtrl: PlayerController | null = null;
    // Steps 标签节点的引用
    @property({type: Label})
    public stepsLabel: Label | null = null;

    start() {
        this.curState = GameState.GS_INIT;
        // 监听角色跳跃消息，并调用判断函数
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    /**
     * 初始化函数
     */
    init() {
        // 激活主界面
        if (this.startMenu) {
            this.startMenu.active = true;
        }
        // 生成赛道
        this.generateRoad();
        if (this.playerCtrl) {
            // 禁止接收用户操作人物移动指令
            this.playerCtrl.setInputActive(false);
            // 重置人物位置
            this.playerCtrl.node.setPosition(Vec3.ZERO);
            // 重置跳跃步数
            this.playerCtrl.reset();
        }
    }

    set curState(value: GameState) {
        switch (value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                if (this.startMenu) {
                    this.startMenu.active = false;
                }
                if (this.stepsLabel) {
                    // 将步数重置为0
                    this.stepsLabel.string = '0';
                }
                // 设置active为true时会直接开始监听鼠标事件，此时鼠标抬起事件还未派发
                // 会出现的现象就是，游戏开始的瞬间人物已经开始移动
                // 因此，这里需要做延时处理
                setTimeout(() => {
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 0.1);
                break;
            case GameState.GS_END:
                break;
        }
    }

    /**
     * 生成赛道函数
     */
    generateRoad() {
        // 防止游戏重新开始时，赛道还是旧的赛道
        // 因此，需要移除旧赛道，清除旧赛道数据
        this.node.removeAllChildren();
        this._road = [];
        // 确保游戏运行时，人物一定站在实路上
        this._road.push(BlockType.BT_STONE);

        // 确定好每一格赛道类型
        for (let i = 1; i < this.roadLength; i++) {
            // 如果上一格赛道是坑，那么这一格一定不能为坑
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }

        // 根据赛道类型生成赛道
        for (let j = 0; j < this._road.length; j++) {
            let block: Node = this.spawnBlockByType(this._road[j]);
            // 判断是否生成了道路，因为 spawnBlockByType 有可能返回坑（值为null）
            if (block) {
                this.node.addChild(block);
                block.setPosition(j, -1.5, 0);
            }
        }
    }

    /**
     * 生成赛道石块的函数
     * @param type 赛道格子类型
     */
    spawnBlockByType(type: BlockType) {
        if (!this.cubePrefab) {
            return null;
        }

        let block: Node | null = null;
        // 赛道类型为实路时才生成
        switch (type) {
            case BlockType.BT_STONE:
                block = instantiate(this.cubePrefab);
                break;
        }

        return block;
    }

    /**
     * Play按钮点击事件函数
     */
    onStartButtonClicked() {
        this.curState = GameState.GS_PLAYING;
    }

    /**
     * 监听跳跃结束事件函数
     * @param moveIndex 跳跃步数索引
     */
    checkResult(moveIndex: number) {
        if (moveIndex < this.roadLength) {
            // 跳到了坑上
            if (this._road[moveIndex] == BlockType.BT_NONE) {
                this.curState = GameState.GS_INIT;
            }
        } else {
            // 跳过了最大长度
            this.curState = GameState.GS_INIT;
        }
    }

    /**
     * 响应角色跳跃的函数
     * @param moveIndex 跳跃步数索引
     */
    onPlayerJumpEnd(moveIndex: number) {
        if (this.stepsLabel) {
            // 因为在最后一步可能出现步伐大的跳跃，但是此时无论跳跃是步伐大还是步伐小，都不应该多增加分数
            this.stepsLabel.string = '' + (moveIndex >= this.roadLength ? this.roadLength : moveIndex);
        }
        this.checkResult(moveIndex);
    }

    update(deltaTime: number) {

    }

}