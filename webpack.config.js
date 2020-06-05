const path = require("path");

module.exports = {
   // mode:"development",
    mode:'production',
    entry:["./src/main"],
    output:{
        libraryTarget: 'umd', //类库加载方式
        path:path.resolve(__dirname,"./dist"),
        filename:"daodaoExcel.js"
    }
}