import { ConsoleLogger, Injectable, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { createLogger, format, transports } from "winston";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import configuration from "@config/configuration";

config();

const configService = new ConfigService(configuration);

const { align, combine, colorize, printf, timestamp, errors } = format;

const logtail = new Logtail(configService.get<string>("LOGTAIL_SOURCE_TOKEN"));

const logger = createLogger({
  level: "http", // Logs anything from info level and above
  format: combine(
    colorize({ all: true }),
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  defaultMeta: { service: "thrifty-api" },
  exitOnError: false,
  transports: [new transports.Console(), new LogtailTransport(logtail)],
});

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLogger extends ConsoleLogger {
  log(message: any, ...optionalParams: any[]) {
    logger.info(message, ...optionalParams);
  }
  error(message: any, ...optionalParams: any[]) {
    logger.error(message, ...optionalParams);
  }
  warn(message: any, ...optionalParams: any[]) {
    logger.warn(message, ...optionalParams);
  }
}
