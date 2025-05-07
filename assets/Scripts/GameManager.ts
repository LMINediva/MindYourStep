import {_decorator, Component, Prefab} from 'cc';

const {ccclass, property} = _decorator;

// 赛道格子类型，坑（BT_NONE）或者实路（BT_STONE）
enum BlockType {
    BT_NONE,
    BT_STONE
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

    start() {
        this.generateRoad();
    }

    /**
     * 生成赛道格子函数
     */
    generateRoad() {

    }

    update(deltaTime: number) {

    }

}