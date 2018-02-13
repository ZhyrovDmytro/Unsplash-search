export default function init(Fn, container, ...args) {
    if (container) {
        return new Fn(container, ...args);
    }

    return undefined;
}
