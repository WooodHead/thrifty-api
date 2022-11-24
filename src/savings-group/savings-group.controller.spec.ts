import { Test, TestingModule } from "@nestjs/testing";
import { createMock } from "@golevelup/ts-jest";
import { SavingsGroupController } from "./savings-group.controller";
import { SavingsGroupService } from "./savings-group.service";
import { FeatureFlagService } from "@admin/feature-flag/feature-flag.service";

describe("SavingsGroupController", () => {
  let controller: SavingsGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavingsGroupController],
      providers: [
        {
          provide: SavingsGroupService,
          useValue: createMock<SavingsGroupService>(),
        },
        {
          provide: FeatureFlagService,
          useValue: createMock<FeatureFlagService>(),
        },
      ],
    }).compile();

    controller = module.get<SavingsGroupController>(SavingsGroupController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
