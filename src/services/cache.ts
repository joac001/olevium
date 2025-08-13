const isBrowser = typeof window !== 'undefined';

const adapter = isBrowser ? localStorage : null;

const get = (key: string) => {
    return isBrowser ? adapter?.getItem(key) : null;
}

const set = (key: string, value: string) => {
    if (isBrowser) {
        adapter?.setItem(key, value);
    }
}

const remove = (key: string) => {
    if (isBrowser) {
        adapter?.removeItem(key);
    }
}

const cache = {
    get,
    set,
    remove
}

export default cache;