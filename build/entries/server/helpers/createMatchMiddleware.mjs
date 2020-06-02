var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import resolveNormalizedPath from '../../../helpers/resolveNormalizedPath';
import logger from '../../../instances/logger';
/**
 * Create middleware to serve static files.
 * If there is a client development server running we are using proxy to serve files.
 * Client development server port will be taken from node js server launch arguments.
 */
export default function createMatchMiddleware(options, callback) {
    const base = resolveNormalizedPath(options.base);
    const match = options.match;
    const verbose = typeof options.verbose !== 'undefined' ? options.verbose : false;
    logger.info(`Use custom middleware to handle base related requests for '${match.toString()}'`);
    if (!base) {
        throw new Error('Option \'base\' is required to serve match requests');
    }
    if (!match) {
        throw new Error('Option \'match\' is required to serve match requests');
    }
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        verbose && logger.trace(`Match request candidate: '${req.path}'`);
        // serve redirects only from desired base
        if (req.path.indexOf(base) !== 0) {
            verbose && logger.warning(`Request is outside of the base path '${base}'`, 1);
            return next();
        }
        // compare request path with match pattern string
        const pathWithoutBase = '/' + req.path.slice(base.length);
        if (typeof match === 'string' && pathWithoutBase !== match) {
            verbose && logger.warning(`Request path is not equal to the string match template '${match.toString()}'`, 1);
            return next();
        }
        else if (typeof match === 'object' && match instanceof RegExp && !match.test(pathWithoutBase)) {
            verbose && logger.warning(`Request path is not matches to the match expression '${match.toString()}'`, 1);
            return next();
        }
        verbose && logger.success(`Perform match request callback for '${req.path}': matched with '${match.toString()}'`, 1);
        callback(req, res, next);
    });
}
