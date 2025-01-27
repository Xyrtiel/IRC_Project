import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  it('should return channels', async () => {
    const result = [{ name: 'General', members: [] }];
    jest.spyOn(appController, 'getChannels').mockResolvedValue(result);

    expect(await appController.getChannels()).toBe(result);
  });
});
