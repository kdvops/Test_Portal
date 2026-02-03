import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { ProfitsService } from './profits.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { ProfitsResolver } from './profits.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Profits, ProfitsSchema } from './schema/profits.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Profits.name, schema: ProfitsSchema }]),
  ],
  providers: [ProfitsService, ProfitsResolver, AzureBlobStorageService],
  exports: [ProfitsService],
})
export class ProfitsModule {}
