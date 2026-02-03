import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { MessagesService } from './messages.service';

// IMPORT RESOLVERS
import { MessagesResolver } from './messages.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Messages, MessagesSchema } from './schema/messages.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Messages.name, schema: MessagesSchema },
    ]),
  ],
  providers: [MessagesService, MessagesResolver],
  exports: [MessagesService],
})
export class MessagesModule {}
