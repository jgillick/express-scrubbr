import Scrubbr, { ScrubbrOptions } from "scrubbr";
import { Request, Response, NextFunction } from "express";

type MiddlewareRequestValues = {
  schemaName: string;
  config?: Scrubbr | ScrubbrOptions;
  serialized: boolean;
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
 * @param initialScrubbr - The default scrubbr instance to be cloned for this request.
 */
const scrubbrMiddleware =
  (initialScrubbr: Scrubbr) =>
  (_req: Request, res: Response, next: NextFunction) => {
    const jsonFn = res.json;

    // Clone scrubbr to prevent memory leaking between requests
    res.locals.scrubbr = initialScrubbr.clone();

    /**
     * Serialize the data before sending (called by response.json() and response.send())
     */
    const serialize = (data: unknown) => {
      const scrubbrContext: MiddlewareRequestValues =
        res.locals._scrubbrContext || {};
      const { schemaName, config, serialized } = scrubbrContext;

      // The response has already been serialized
      if (serialized) {
        return data;
      }
      res.locals._scrubbrContext = {
        ...scrubbrContext,
        serialized: true,
      };

      // No schema to serialize to
      if (!schemaName) {
        return data;
      }

      let scrubbr: Scrubbr = res.locals.scrubbr;
      if (config instanceof Scrubbr) {
        scrubbr = config;
      } else if (config && typeof config === "object") {
        scrubbr = scrubbr.clone(config);
      }
      return scrubbr.serialize(schemaName, data);
    };

    /**
     * Define the schema name to serialize to
     */
    res.scrubbr = (schemaName: string, config?: Scrubbr | ScrubbrOptions) => {
      res.locals._scrubbrContext = {
        schemaName,
        config,
        serialized: false,
      };
      return res;
    };

    /**
     * Override the express json/send function to serialize the data before sending.
     */
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
