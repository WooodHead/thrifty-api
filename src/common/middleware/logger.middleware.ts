import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { WinstonLogger } from "@logger/winston-logger/winston-logger.service";

// Controller level logging middleware for all routes
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new WinstonLogger("HTTP");

  use(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
      const { method, originalUrl } = req;
      const { statusCode, statusMessage } = res;

      const message = `${method} ${originalUrl} ${statusCode} ${statusMessage}`;

      if (statusCode >= 500) {
        return this.logger.error(message);
      }

      if (statusCode >= 400) {
        return this.logger.warn(message);
      }

      return this.logger.log(message);
    });
    next();
  }
}
