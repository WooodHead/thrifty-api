import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { createMock } from "@golevelup/ts-jest";
import { AccountService } from "./account.service";
import { Account } from "./entities/account.entity";
import { User } from "@user/entities/user.entity";
import { CACHE_MANAGER } from "@nestjs/common";
import { BillPaymentService } from "@api-services/bill-payment/bill-payment.service";

describe("AccountService", () => {
  let service: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getRepositoryToken(Account),
          useValue: createMock<Repository<Account>>(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
        {
          provide: DataSource,
          useValue: createMock<DataSource>(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: BillPaymentService,
          useValue: createMock<BillPaymentService>(),
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
