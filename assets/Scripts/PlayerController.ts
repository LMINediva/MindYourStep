import {_decorator, Component, input, Input, EventMouse, Vec3, SkeletalAnimation} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    // @property({type: Animation})
    // public BodyAnim: Animation | null = null;

    // 主角模型动画引用
    @property({type: SkeletalAnimation})
    public CocosAnim: SkeletalAnimation | null = null;

    // 是否接收到跳跃指令
    private _startJump: boolean = false;
    // 跳跃步长
    private _jumpStep: number = 0;
    // 当前跳跃时间
    private _curJumpTime: number = 0;
    // 每次跳跃时长
    private _jumpTime: number = 0.3;
    // 当前跳跃速度
    private _curJumpSpeed: number = 0;
    // 当前角色位置
    private _curPos: Vec3 = new Vec3();
    // 每次跳跃过程中，当前帧移动位置差
    private _deltaPos: Vec3 = new Vec3(0, 0, 0);
    // 角色目标位置
    private _targetPos: Vec3 = new Vec3();
    // 跳跃步数
    private _curMoveIndex: number = 0;

    start() {

    }

    /**
     * 跳跃步数重置函数
     */
    reset() {
        this._curMoveIndex = 0;
    }

    /**
     * 动态地开启和关闭角色对鼠标消息的监听
     * @param active 对鼠标消息的监听是否开启
     */
    setInputActive(active: boolean) {
        if (active) {
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    /**
     * 鼠标弹起事件函数
     * @param event 鼠标事件
     */
    onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
            // 点击鼠标左键，跳1步
            this.jumpByStep(1);
        } else if (event.getButton() === 2) {
            // 点击鼠标右键，跳2步
            this.jumpByStep(2);
        }
    }

    /**
     * 计算目标位置、速度的函数
     * @param step 跳跃步数
     */
    jumpByStep(step: number) {
        // 跳跃时，忽略用户输入
        if (this._startJump) {
            return;
        }
        // 表示开始跳跃
        this._startJump = true;
        // 本次跳跃的步数
        this._jumpStep = step;
        // 重置下跳跃的时间
        this._curJumpTime = 0;
        // 计算跳跃的速度
        this._curJumpSpeed = this._jumpStep / this._jumpTime;
        // 获取角色当前的位置
        this.node.getPosition(this._curPos);
        // 目标位置 = 当前位置 + 步长
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0));
        // 播放跳跃动画
        if (this.CocosAnim) {
            // 跳跃动画时间比较长，这里加速播放
            this.CocosAnim.getState('cocos_anim_jump').speed = 3.5;
            // 播放跳跃动画
            this.CocosAnim.play('cocos_anim_jump');
        }
        this._curMoveIndex += step;
    }

    /**
     * 跳跃结束函数
     */
    onOnceJumpEnd() {
        // 主角变为待机状态，播放待机动画
        if (this.CocosAnim) {
            this.CocosAnim.play('cocos_anim_idle');
        }
        this.node.emit('JumpEnd', this._curMoveIndex);
    }

    update(deltaTime: number) {
        if (this._startJump) {
            // 处理跳跃的分支逻辑
            this._curJumpTime += deltaTime;
            if (this._curJumpTime > this._jumpTime) {
                // 跳跃结束
                // 强制位移到目标位置
                this.node.setPosition(this._targetPos);
                // 标记跳跃结束
                this._startJump = false;
                this.onOnceJumpEnd();
            } else {
                // 跳跃中
                // 获取当前的位置
                this.node.getPosition(this._curPos);
                // 计算本帧应该位移的长度
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                // 将当前位置加上位移的长度
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                // 设置位移后的位置
                this.node.setPosition(this._curPos);
            }
        }
    }

}