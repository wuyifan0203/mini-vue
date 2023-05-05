/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-24 23:31:29
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-05-05 23:47:31
 * @FilePath: /my-vue/example/patchChildren/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createApp, h, ref } from '../../lib/my-vue.esm.js';



const ArrayToText = {
    render() {
        const self = this;
        const nextChild = 'This is text child';
        const prevChild = [h('span', {}, 'A'), h('span', {}, 'B')];
        return h('div', {},
            self.isChange ? nextChild : prevChild
        )
    },

    setup() {
        const isChange = ref(false);
        window.ArrayToTextIsChange = isChange;
        return {
            isChange
        }
    }
};

const TextToText = {
    render() {
        const self = this;
        const nextChild = 'new child';
        const prevChild = 'old child';
        return h('div', {},
            self.isChange ? nextChild : prevChild
        )
    },

    setup() {
        const isChange = ref(false);
        window.TextToTextIsChange = isChange;
        return {
            isChange
        }
    }
}

const TextToArray = {
    render() {
        const self = this;
        const prevChild = 'This is text child';
        const nextChild = [h('span', {}, 'C'), h('span', {}, 'D')];
        return h('div', {},
            self.isChange ? nextChild : prevChild
        )
    },

    setup() {
        const isChange = ref(false);
        window.TextToArrayIsChange = isChange;
        return {
            isChange
        }
    }
}

const ArrayToArray = {
    render() {
        const self = this;
        // 左侧对比
        // (A,B),C
        // (A,B),D,E,F
        const leftPrev = [
            h('p', { key: 'A' }, 'A'),
            h('p', { key: 'B' }, 'B'),
            h('p', { key: 'C' }, 'C'),
        ]

        const leftNext = [
            h('p', { key: 'A' }, 'A'),
            h('p', { key: 'B' }, 'B'),
            h('p', { key: 'D' }, 'D'),
            h('p', { key: 'E' }, 'E'),
            h('p', { key: 'F' }, 'F'),
        ];

        // 右侧对比
        // A,(B,C)
        // E,F,G,(B,C)
        const righttPrev = [
            h('p', { key: 'A' }, 'A'),
            h('p', { key: 'B' }, 'B'),
            h('p', { key: 'C' }, 'C'),
        ]

        const rightNext = [
            h('p', { key: 'E' }, 'E'),
            h('p', { key: 'F' }, 'F'),
            h('p', { key: 'G' }, 'G'),
            h('p', { key: 'B' }, 'B'),
            h('p', { key: 'C' }, 'C'),
        ];

        // 新的比老的长
        // 左侧对比
        // (A,B)
        // (A,B),C,D
        const leftLongerPrev = [
            h('p', { key: 'A' }, 'A'),
            h('p', { key: 'B' }, 'B'),
        ];
        const leftLongerNext = [
            h('p', { key: 'A' }, 'A'),
            h('p', { key: 'B' }, 'B'),
            h('p', { key: 'C' }, 'C'),
            h('p', { key: 'D' }, 'D'),
        ];

        // 新的比老的长
        // 右侧对比
        // (A,B)
        // (A,B),C,D
        const rightLongerPrev = [
            h('p', { key: 'A' }, 'A'),
            h('p', { key: 'B' }, 'B'),
        ];
        const rightLongerNext = [
            h('p', { key: 'D' }, 'D'),
            h('p', { key: 'C' }, 'C'),
            h('p', { key: 'A' }, 'A'),
            h('p', { key: 'B' }, 'B'),
        ];

        // 老的比新的长
        // 左侧对比
        // (A,B),C
        // (A,B)

        const leftOlderLongerPrev = [
            h('p', { key: 'A' }, 'A'),
            h('p', { key: 'B' }, 'B'),
            h('p', { key: 'D' }, 'D'),
            h('p', { key: 'C' }, 'C'),
        ];
        const leftOlderLongerNext = [
            h('p', { key: 'A' }, 'A'),
            h('p', { key: 'B' }, 'B'),
        ];


        // 老的比新的长
        // 右侧对比
        // A,B,(C,D)
        //     (C,D)

        const rightOlderLongerPrev = [
            h('p', { key: 'A' }, 'A'),
            h('p', { key: 'B' }, 'B'),
            h('p', { key: 'D' }, 'D'),
            h('p', { key: 'C' }, 'C'),
        ];
        const rightOlderLongerNext = [
            h('p', { key: 'D' }, 'D'),
            h('p', { key: 'C' }, 'C'),
        ];

        //中间部分对比
        // 老的里面存在，新的里面不存在，删除老的
        // A,B,(C,D),F,G
        // A,B,(E,C),F,G

        // const midDelOlderPrev = [
        //     h('p', { key: 'A' }, 'A'),
        //     h('p', { key: 'B' }, 'B'),
        //     h('p', { key: 'C' ,id:'C-prev'}, 'C'),
        //     h('p', { key: 'D' }, 'D'),
        //     h('p', { key: 'F' }, 'F'),
        //     h('p', { key: 'G' }, 'G'),
        // ]

        // const midDelOlderNext = [
        //     h('p', { key: 'A' }, 'A'),
        //     h('p', { key: 'B' }, 'B'),
        //     h('p', { key: 'E' }, 'E'),
        //     h('p', { key: 'C',id:'C-Next' }, 'C'),
        //     h('p', { key: 'F' }, 'F'),
        //     h('p', { key: 'G' }, 'G'),
        // ]

        // 优化点
        // 当老的数量多于以patch的新节点数量，其余的可以直接删除
        const midDelOlderPrev = [
            h('p', { key: 'A' }, 'A'),
            h('p', { key: 'B' }, 'B'),
            h('p', { key: 'C' ,id:'C-prev'}, 'C'),
            h('p', { key: 'D' }, 'D'),
            h('p', { key: 'H' }, 'H'),
            h('p', { key: 'I' }, 'I'),
            h('p', { key: 'F' }, 'F'),
            h('p', { key: 'G' }, 'G'),
        ]

        const midDelOlderNext = [
            h('p', { key: 'A' }, 'A'),
            h('p', { key: 'B' }, 'B'),
            h('p', { key: 'E' }, 'E'),
            h('p', { key: 'C',id:'C-Next' }, 'C'),
            h('p', { key: 'F' }, 'F'),
            h('p', { key: 'G' }, 'G'),
        ]


        return h('div', { key: 'root' },
            [
                // h('div', {}, '左侧对比'),
                // h('div', {}, self.isChange ? leftNext : leftPrev),
                // h('div', {}, '右侧对比'),
                // h('div', {}, self.isChange ? rightNext : righttPrev),
                // h('div', {}, '新的比老的长，左侧对比'),
                // h('div', {}, self.isChange ? leftLongerNext : leftLongerPrev),
                // h('div', {}, '新的比老的长，右侧对比'),
                // h('div', {}, self.isChange ? rightLongerNext : rightLongerPrev),
                // h('div', {}, '老的比新的长，左侧对比'),
                // h('div', {}, self.isChange ? leftOlderLongerNext : leftOlderLongerPrev),
                // h('div', {}, '老的比新的长，右侧对比'),
                // h('div', {}, self.isChange ? rightOlderLongerNext : rightOlderLongerPrev),
                h('div',{},'中间对比，老的有，新的没有，需要删除'),
                h('div', {}, self.isChange ? midDelOlderNext : midDelOlderPrev),
            ]
        )
    },

    setup() {
        const isChange = ref(false);
        window.ArrayToArrayIsChange = isChange;
        return {
            isChange
        }

    }
}

const App = {
    render() {
        return h('div', { tid: 1 }, [
            h('p', { key: 'main' }, 'main'),
            // 老的是array 新的是text
            // h(ArrayToText),
            // // 老的是Text 新的也是Text
            // h(TextToText),
            // // 老的是Text， 新的是Array
            // h(TextToArray),
            // 新的是Array，老的还是Array
            h(ArrayToArray)
        ]);
    },
    setup() { }
};

const appDom = document.querySelector('#app')
const app = createApp(App);
app.mount(appDom);