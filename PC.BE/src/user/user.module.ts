import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT USER SCHEMA AND DOCUMENT
import { User, UserSchema } from './schema/user.schema';

// IMPORT SERVICES
import { UserService } from './user.service';

// IMPORT RESOLVER
import { UserResolver } from './user.resolver';

// IMPORT AUTHENTICATION
import { AuthenticationProvider } from 'src/authentication/providers/authentication.providers';
import { AuthenticationService } from '../authentication/authentication.service';

// IMPORT S3 STORAGE
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT JWT SERVICE
import { JwtService } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    UserResolver,
    UserService,
    AuthenticationProvider,
    AuthenticationService,
    AzureBlobStorageService,
    ConfigService,
    JwtService,
  ],
  exports: [UserService],
})
export class UserModule {}
