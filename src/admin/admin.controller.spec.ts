import { Test, TestingModule } from "@nestjs/testing";
import { createMock } from "@golevelup/ts-jest";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { FeatureFlagService } from "./feature-flag/feature-flag.service";
import { BillPaymentService } from "@api-services/bill-payment/bill-payment.service";

describe("AdminController", () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: createMock<AdminService>(),
        },
        {
          provide: FeatureFlagService,
          useValue: createMock<FeatureFlagService>(),
        },
        {
          provide: BillPaymentService,
          useValue: createMock<BillPaymentService>(),
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
