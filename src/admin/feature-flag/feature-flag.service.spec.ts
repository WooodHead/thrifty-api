import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { createMock } from "@golevelup/ts-jest";
import { FeatureFlag } from "../entities/featureFlag.entity";
import { FeatureFlagService } from "./feature-flag.service";

describe("FeatureFlagService", () => {
  let service: FeatureFlagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagService,
        {
          provide: getRepositoryToken(FeatureFlag),
          useValue: createMock<Repository<FeatureFlag>>(),
        },
      ],
    }).compile();

    service = module.get<FeatureFlagService>(FeatureFlagService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
