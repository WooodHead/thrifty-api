import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { createMock } from "@golevelup/ts-jest";
import { AuthService } from "./auth.service";
import { UserService } from "@user/user.service";
import { EmailService } from "@api-services/email/email.service";
import { WinstonLogger } from "@logger/winston-logger/winston-logger.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "@user/entities/user.entity";
import { ResetCode } from "./entities/resetCode.entity";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        {
          provide: EmailService,
          useValue: createMock<EmailService>(),
        },
        {
          provide: WinstonLogger,
          useValue: createMock<WinstonLogger>(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
        {
          provide: getRepositoryToken(ResetCode),
          useValue: createMock<Repository<ResetCode>>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
