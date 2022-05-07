import { Test, TestingModule } from '@nestjs/testing';
import { EmailApiService } from './email-api.service';

describe('EmailApiService', () => {
  let service: EmailApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailApiService],
    }).compile();

    service = module.get<EmailApiService>(EmailApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
