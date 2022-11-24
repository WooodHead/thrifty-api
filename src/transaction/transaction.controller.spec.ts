import { Test, TestingModule } from "@nestjs/testing";
import { createMock } from "@golevelup/ts-jest";
import { TransactionController } from "./transaction.controller";
import { TransactionService } from "./transaction.service";

describe("TransactionController", () => {
  let controller: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: createMock<TransactionService>(),
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
