const tsPreprocessor = require("ts-jest/preprocessor");

module.exports = {
    process: function(src, path, config, transformOptions) {
        src = tsPreprocessor.process(src, path, config, transformOptions);

        return src;
    }
};
