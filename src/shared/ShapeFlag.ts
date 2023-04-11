export const enum ShapeFlag {
    ELEMENT = 1,// 0001
    STATEFUL_COMPONENT = 2,// 0010
    TEXT_CHILDREN = 4,//0100
    ARRAY_CHILDREN = 8, // 1000
    SLOT_CHILDREN = 16, // 10000
}