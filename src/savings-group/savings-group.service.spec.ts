import { Test, TestingModule } from "@nestjs/testing";
import { SavingsGroupService } from "./savings-group.service";

describe("SavingsGroupService", () => {
  let service: SavingsGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SavingsGroupService],
    }).compile();

    service = module.get<SavingsGroupService>(SavingsGroupService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
