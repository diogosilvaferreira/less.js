module.exports = function(less, tree) {
    var functions = {};
    functions.functionRegistry = require("./function-registry.js");
    functions.functionCaller = require("./function-caller.js")(functions);

    //register functions
    require("./color.js")(functions, tree);
    require("./color-blending.js")(functions, tree);
    require("./data-uri.js")(functions, tree, less);
    require("./default.js")(functions, tree);
    require("./math.js")(functions, tree);
    require("./number.js")(functions, tree);
    require("./string.js")(functions, tree);
    require("./svg.js")(functions, tree, less);
    require("./types.js")(functions, tree);

    return functions;
};