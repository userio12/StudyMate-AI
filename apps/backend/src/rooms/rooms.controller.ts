import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateRoomSchema } from '@studymate/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { RoomsService } from './rooms.service.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Post()
  createRoom(
    @Body(new ZodValidationPipe(CreateRoomSchema)) body: { name: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.roomsService.createRoom(body.name, user.userId);
  }

  @Post(':inviteCode/join')
  joinRoom(
    @Param('inviteCode') inviteCode: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.roomsService.joinRoom(inviteCode, user.userId);
  }

  @Get()
  listRooms(@CurrentUser() user: CurrentUserPayload) {
    return this.roomsService.listRooms(user.userId);
  }

  @Get(':id')
  getRoom(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.roomsService.getRoom(id, user.userId);
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string) {
    return this.roomsService.getMessages(id);
  }
}
