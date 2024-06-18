export default function get (object, path, defaultValue) {
    // make sure we have a path and a valid object
    if (!path) return
    if (!object || typeof object !== 'object') return

    // make sure the path is an array
    if (!Array.isArray(path)) path = path.split('.');

    // maintain a reference to the relevant attribute
    let target = object

    // get the last index
    let lastIndex = path.length - 1

    // iterate through keys in the path
    for (let index = 0; index <= lastIndex; index += 1) {
        // get the key
        let key = path[index]

        // get the value at target[key]
        if (index === lastIndex) {
            if (typeof target[key] === "undefined") return defaultValue;
            else return target[key];
        } else {
            // fail on any non-object attributes
            if (!target[key] || typeof target[key] !== 'object') {
                return defaultValue
            }

            // reference the next relevant attribute
            target = target[key]
        }
    }

    // just in case
    return object
}
