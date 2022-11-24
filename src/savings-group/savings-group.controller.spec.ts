import { Test, TestingModule } from "@nestjs/testing";
import { SavingsGroupController } from "./savings-group.controller";
import { SavingsGroupService } from "./savings-group.service";

describe("SavingsGroupController", () => {
  let controller: SavingsGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavingsGroupController],
      providers: [SavingsGroupService],
    }).compile();

    controller = module.get<SavingsGroupController>(SavingsGroupController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
