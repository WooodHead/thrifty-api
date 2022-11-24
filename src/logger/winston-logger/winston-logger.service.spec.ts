import { Test, TestingModule } from "@nestjs/testing";
import { WinstonLogger } from "./winston-logger.service";

describe("WinstonLoggerService", () => {
  let service: WinstonLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WinstonLogger],
    }).compile();

    service = await module.resolve<WinstonLogger>(WinstonLogger);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
