const path = require("path");

module.exports = {
    mode:"development",
    entry:["./src/main"],
    output:{
        path:path.resolve(__dirname,"./dist"),
        filename:"daodaoExcel.js"
    }
}