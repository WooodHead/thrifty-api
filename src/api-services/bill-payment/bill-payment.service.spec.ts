import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { createMock } from "@golevelup/ts-jest";
import { BillPaymentService } from "./bill-payment.service";

describe("BillPaymentService", () => {
  let service: BillPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillPaymentService,
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        {
          provide: HttpService,
          useValue: createMock<HttpService>(),
        },
      ],
    }).compile();

    service = module.get<BillPaymentService>(BillPaymentService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
