import { NextFunction, Request, Response } from 'express';
import resolveTemplateRepresentative from './resolveTemplateRepresentative';
import resolveNormalizedPath from '../../../helpers/resolveNormalizedPath';
import resolveRedirect from './resolveRedirect';
import resolveResponse from './resolveResponse';
import RedirectCandidate from '../models/Redirect';
import ResponseCandidate from '../models/Response';
import resolveCandidate from './resolveCandidate';
import logger from '../../../instances/logger';
import resolveNormalizedPathWithBase from '../../../helpers/resolveNormalizedPathWithBase';

type TSvelteServerSideComponent = {
  render: (props?: {}, options?: {}) => TSvelteServerSideRenderResult;
}

type TSvelteServerSideRenderResult = {
  head: string;
  html: any;
  css: {
    code: string;
    map: any;
  };
}

type TPreloadCallbackLocation = { base: string; path: string; inner: string; query: { [key: string]: any } };

type TPreloadCallbackHelpers = { redirect: typeof resolveRedirect; response: typeof resolveResponse };

type TPreloadCallbackResult = { [key: string]: any } | RedirectCandidate | ResponseCandidate;

type TPreloadCallback = (location: TPreloadCallbackLocation, resolve: typeof resolveCandidate, helpers: TPreloadCallbackHelpers) => Promise<TPreloadCallbackResult>;

type TOptions = {
  base: string;
  component: TSvelteServerSideComponent;
  preload?: TPreloadCallback,
  pathToTemplate: string,
  targetSelector: string;
  verbose?: boolean;
  debug?: boolean;
};

/**
 * Create middleware to render application from template with desired options.
 * {
 *  component: svelte component with render generated for server side rendering,
 *  preload: callback to preload component data,
 *  pathToTemplate: path to html template file,
 *  target: html element target selector,
 *  }
 * @param options
 */
export default function createRenderMiddleware(options: TOptions): (req: Request, res: Response, next: NextFunction) => Promise<any> {
  const { component, pathToTemplate, targetSelector } = options;
  const base = resolveNormalizedPath(options.base);
  const preload = options.preload || (() => Promise.resolve({}));
  const verbose = typeof options.verbose !== 'undefined' ? options.verbose : false;
  const debug = typeof options.debug !== 'undefined' ? options.debug : false;

  // create preload helpers
  const redirect = resolveRedirect;
  const response = resolveResponse;
  const helpers: TPreloadCallbackHelpers = { redirect, response };

  logger.info(`Use render middleware to serve server side rendering results from '${base}'`);

  if (!base) {
    throw new Error('Option \'base\' is required to serve server side rendering results');
  }

  if (!component) {
    throw new Error('Option \'component\' is required for this middleware: please, pass svelte component built for server side rendering');
  }

  if (!pathToTemplate) {
    throw new Error('Option \'pathToTemplate\' is required for this middleware: please, pass path to final index template file');
  }

  if (!targetSelector) {
    throw new Error('Option \'target\' is required for this middleware: please, pass target html element selector');
  }

  // save dom nodes to the variables
  const { original, clone } = resolveTemplateRepresentative(pathToTemplate, targetSelector);

  return async(req: Request, res: Response, next: NextFunction): Promise<any> => {
    const path = resolveNormalizedPath(req.path);
    const inner = resolveNormalizedPath(path.slice(base.length));
    const query = req.query;
    const location: TPreloadCallbackLocation = { base, path, inner, query };

    verbose && logger.trace(`Render request candidate: '${req.path}'`);

    // serve render only from desired base
    if (path.indexOf(base) !== 0) {
      verbose && logger.warning(`Request is outside of the base path '${base}'`, 1);
      return next();
    }

    // preload component data
    let result: TPreloadCallbackResult;
    try {
      result = await preload(location, resolveCandidate, helpers);
      verbose && logger.success('Preload request successfully performed', 1);
      debug && logger.inspect(result);
    } catch (error) {
      verbose && logger.error(`Preload request failed: ${error.message}`, 1);
      return next(error);
    }

    if (result instanceof RedirectCandidate) {
      const urlWithBase = resolveNormalizedPathWithBase(base, result.url);
      verbose && logger.trace(`Preload request returned redirect to '${result.url}' with status '${result.status}' but actual redirect will be '${urlWithBase}' because of the base path`, 1);
      return res.redirect(result.status, urlWithBase);
    }

    if (result instanceof ResponseCandidate) {
      verbose && logger.trace(`Preload request returned plain response: '${result.body}' with status '${result.status}'`, 1);
      return res.status(result.status).send(result.body);
    }

    // render component with preloaded data
    const props = { ...location, ...result };
    let head;
    let html;
    try {
      const rendered = component.render(props);
      head = rendered.head;
      html = rendered.html;
    } catch (error) {
      verbose && logger.error(`Render failed: '${error.message}'`, 1);
      return next(error);
    }

    // set clone content from original one with rendered one
    const baseTag = `<base href="${base}" />`;
    const propsScript = `<script type="text/javascript">window.$$props = ${JSON.stringify(props)};</script>`;
    clone.head.set_content(`${baseTag}${propsScript}${original.head.innerHTML}${head}`, {
      script: true,
      style: true,
    });
    clone.target.set_content(html, { script: true, style: true });

    // send rendered result
    verbose && logger.success('Render successfully performed', 1);
    res.contentType('text/html')
      .send(clone.dom.toString());
  };
}
