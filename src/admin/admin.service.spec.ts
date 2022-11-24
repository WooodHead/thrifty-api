import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { createMock } from "@golevelup/ts-jest";
import { User } from "@user/entities/user.entity";
import { Repository } from "typeorm";
import { AdminService } from "./admin.service";
import { Account } from "@account/entities/account.entity";
import { Transaction } from "@transaction/entities/transaction.entity";
import { SavingsGroup } from "@savings-group/entities/savings-group.entity";

describe("AdminService", () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
        {
          provide: getRepositoryToken(Account),
          useValue: createMock<Repository<Account>>(),
        },
        {
          provide: getRepositoryToken(Account),
          useValue: createMock<Repository<Account>>(),
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: createMock<Repository<Transaction>>(),
        },
        {
          provide: getRepositoryToken(SavingsGroup),
          useValue: createMock<Repository<SavingsGroup>>(),
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
