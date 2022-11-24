import { Test, TestingModule } from "@nestjs/testing";
import { createMock } from "@golevelup/ts-jest";
import { TransactionService } from "./transaction.service";
import { Transaction } from "./entities/transaction.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

describe("TransactionService", () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: createMock<Repository<Transaction>>(),
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
