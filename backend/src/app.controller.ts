import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Endpoint pour obtenir la liste des channels
  @Get('channels')
  getChannels() {
    return this.appService.getChannels();
  }

  // Endpoint pour créer un channel
  @Post('channels')
  createChannel(@Body() body: { name: string }) {
    return this.appService.createChannel(body.name);
  }

  // Endpoint pour rejoindre un channel
  @Post('join/:channelName')
  joinChannel(@Param('channelName') channelName: string) {
    return this.appService.joinChannel(channelName);
  }
}
