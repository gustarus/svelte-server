import aes from 'crypto-js/aes';
import utf8 from 'crypto-js/enc-utf8';
import { DEFAULT_SECRET_SALT } from '../../../constants';
/**
 * Create clean express server.
 * {
 *   component: svelte frontend component,
 *   target: html selector to render component inside,
 * }
 */
export default function renderClient(options) {
    const { component, target } = options;
    const secretSalt = options.secretSalt || DEFAULT_SECRET_SALT;
    const props = options.props || {};
    const includeServerLocation = typeof options.includeServerLocation !== 'undefined'
        ? options.includeServerLocation : false;
    if (!component) {
        throw new Error('Option \'component\' should be passed: please, define svelte component to render inside the target');
    }
    if (!target) {
        throw new Error('Option \'target\' should be passed: please, define html selector to render component inside');
    }
    const el = document.querySelector(target);
    if (!el) {
        throw new Error(`Unable to find target html element for selector '${target}'`);
    }
    // resolve props from server side rendering
    // we encrypt props on server side to protect spam robots sensitive data
    const encrypted = typeof window !== 'undefined' && typeof window.$$props !== 'undefined'
        ? window.$$props : undefined;
    const resolved = encrypted
        ? aes.decrypt(encrypted, secretSalt).toString(utf8) : undefined;
    const parsed = resolved && JSON.parse(resolved) || {};
    // merge server side rendering props with client props
    for (const name in props) {
        parsed[name] = typeof props[name] !== 'undefined'
            ? props[name] : parsed[name];
    }
    if (!includeServerLocation) {
        // delete props which
        // must be taken from the frontend
        delete parsed.path;
        delete parsed.query;
    }
    // clean target element
    el.innerHTML = '';
    // TODO Use hydrate flag to update elements instead of rerender them
    // create component inside the target node
    // @ts-ignore
    new component({ target: el, props: parsed });
}
