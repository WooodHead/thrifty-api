import { Test, TestingModule } from "@nestjs/testing";
import { createMock } from "@golevelup/ts-jest";
import { SavingsGroup } from "./entities/savings-group.entity";
import { SavingsGroupService } from "./savings-group.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@user/entities/user.entity";
import { UserToSavingsGroup } from "@common/entities/user-to-savingsgroup.entity";

describe("SavingsGroupService", () => {
  let service: SavingsGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavingsGroupService,
        {
          provide: getRepositoryToken(SavingsGroup),
          useValue: createMock<Repository<SavingsGroup>>(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
        {
          provide: getRepositoryToken(UserToSavingsGroup),
          useValue: createMock<Repository<UserToSavingsGroup>>(),
        },
      ],
    }).compile();

    service = module.get<SavingsGroupService>(SavingsGroupService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
