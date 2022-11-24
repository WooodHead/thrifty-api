import { Test, TestingModule } from "@nestjs/testing";
import { createMock } from "@golevelup/ts-jest";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";

describe("AccountController", () => {
  let controller: AccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: createMock<AccountService>(),
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
