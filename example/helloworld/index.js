
const App = {
    render(){
        return h('div','Hellow ' + this.message);
    },

    setup(){
        return {
            message:'world'
        }
    }
};
const app = createApp(App);
app.mount("#app");