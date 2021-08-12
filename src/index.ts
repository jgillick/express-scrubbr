import Scrubbr, { ScrubbrOptions } from "scrubbr";
import { Request, Response, NextFunction } from "express";

type MiddlewareRequestValues = {
  schemaName: string;
  config?: Scrubbr | ScrubbrOptions;
};

/**
 * Express middleware that automatically serializes data before sending.
 *
 * @example
 *
 *  // Initialization
 *  const scrubbr = new Scrubbr('./schema.ts');
 *  app.use(scrubbrMiddleware(scrubbr));
 *
 *  // Route
 *  app.get('/users', (req, res) => {
 *  const userData = fetchDataHere();
 *
 *  resp.status(200)
 *    .scrubbr('UserList')
 *    .send(userData);
 *   }
 *
 * @param defaultScrubbr - The default scrubbr instance to use.
 */
const scrubbrMiddleware =
  (defaultScrubbr: Scrubbr) =>
  (_req: Request, res: Response, next: NextFunction) => {
    const sendFn = res.send;
    const jsonFn = res.json;

    const serialize = (data: unknown) => {
      const scrubbrContext: MiddlewareRequestValues = res.locals.scrubbr || {};
      const { schemaName, config } = scrubbrContext;

      // No schema to serialize to
      if (!schemaName) {
        return data;
      }

      let scrubbr: Scrubbr;
      if (config instanceof Scrubbr) {
        scrubbr = config;
      } else {
        scrubbr = defaultScrubbr.clone(config);
      }
      return scrubbr.serialize(schemaName, data);
    };

    res.scrubbr = (schemaName: string, config?: Scrubbr | ScrubbrOptions) => {
      res.locals.scrubbr = {
        schemaName,
        config,
      };
      return res;
    };
    res.send = (data: unknown) => {
      const serialized = serialize(data);
      return sendFn.call(res, serialized);
    };
    res.json = (data: unknown) => {
      const serialized = serialize(data);
      return jsonFn.call(res, serialized);
    };

    next();
  };

export default scrubbrMiddleware;

// Extend the express types
declare global {
  namespace Express {
    interface Response {
      /**
       * Set the schema name that scrubbr will use to serialize the data with in the send method.
       * @param schemaName - The name of the schema to serialize to.
       * @param config - Either the scrubbr options or scrubbr instance to use for serialization.
       */
      scrubbr(schemaName: string, config?: Scrubbr | ScrubbrOptions): this;
    }
  }
}
