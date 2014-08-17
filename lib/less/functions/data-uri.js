module.exports = function(functions, tree, less) {
    functions.functionRegistry.add("data-uri", function(mimetypeNode, filePathNode) {

        if (!less.environment.supportsDataURI(this.env)) {
            return new tree.URL(filePathNode || mimetypeNode, this.currentFileInfo).eval(this.env);
        }

        var mimetype = mimetypeNode.value;
        var filePath = (filePathNode && filePathNode.value);

        var useBase64 = false;

        if (arguments.length < 2) {
            filePath = mimetype;
        }

        var fragmentStart = filePath.indexOf('#');
        var fragment = '';
        if (fragmentStart!==-1) {
            fragment = filePath.slice(fragmentStart);
            filePath = filePath.slice(0, fragmentStart);
        }

        if (this.env.isPathRelative(filePath)) {
            if (this.currentFileInfo.relativeUrls) {
                filePath = less.environment.join(this.currentFileInfo.currentDirectory, filePath);
            } else {
                filePath = less.environment.join(this.currentFileInfo.entryPath, filePath);
            }
        }

        // detect the mimetype if not given
        if (arguments.length < 2) {

            mimetype = less.environment.mimeLookup(this.env, filePath);

            // use base 64 unless it's an ASCII or UTF-8 format
            var charset = less.environment.charsetLookup(this.env, mimetype);
            useBase64 = ['US-ASCII', 'UTF-8'].indexOf(charset) < 0;
            if (useBase64) { mimetype += ';base64'; }
        }
        else {
            useBase64 = /;base64$/.test(mimetype);
        }

        var buf = less.environment.readFileSync(filePath);

        // IE8 cannot handle a data-uri larger than 32KB. If this is exceeded
        // and the --ieCompat flag is enabled, return a normal url() instead.
        var DATA_URI_MAX_KB = 32,
            fileSizeInKB = parseInt((buf.length / 1024), 10);
        if (fileSizeInKB >= DATA_URI_MAX_KB) {

            if (this.env.ieCompat !== false) {
                if (!this.env.silent) {
                    console.warn("Skipped data-uri embedding of %s because its size (%dKB) exceeds IE8-safe %dKB!", filePath, fileSizeInKB, DATA_URI_MAX_KB);
                }

                return new tree.URL(filePathNode || mimetypeNode, this.currentFileInfo).eval(this.env);
            }
        }

        buf = useBase64 ? buf.toString('base64')
            : encodeURIComponent(buf);

        var uri = "\"data:" + mimetype + ',' + buf + fragment + "\"";
        return new(tree.URL)(new(tree.Anonymous)(uri));
    });
};