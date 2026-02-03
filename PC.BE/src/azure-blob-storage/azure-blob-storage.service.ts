import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import { compressFromBase64 } from 'src/common/utils/imageCompressor';
import { ASContainerName } from 'src/common/constants';

@Injectable()
export class AzureBlobStorageService {
  private readonly logger = new Logger(AzureBlobStorageService.name);
  private blobServiceClient: BlobServiceClient;
  private containerClient;
  private sasToken;

  constructor() {
    const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

    this.sasToken = sasToken;
    // LOG ACCOUNT INFORMATION
    this.logger.log(`Account: ${account}`);
    this.logger.log(`SAS Token: ${sasToken}`);
    this.logger.log(`Container Name: ${containerName}`);

    // THROW ERROR IF ENVIRONMENT VARIABLES ARE MISSING
    if (!account || !sasToken || !containerName) {
      throw new InternalServerErrorException(
        'Missing Azure storage environment variables',
      );
    }

    // INITIALIZE AZURE BLOB SERVICE CLIENT
    const blobServiceClientUrl = `https://${account}.blob.core.windows.net?${sasToken}`;
    this.blobServiceClient = new BlobServiceClient(blobServiceClientUrl);
    this.containerClient =
      this.blobServiceClient.getContainerClient(containerName);
  }

  // METHOD TO UPLOAD A BLOB TO AZURE
  async upload(params: any): Promise<any> {
    // GENERATE A UNIQUE FILENAME
    const filename =
      Math.floor(Math.random() * 9999999 + 1111111).toString() +
      '-' +
      new Date().getTime().toString();
    const filetype = params.filetype;
    const base64Data =
      filetype === 'pdf'
        ? Buffer.from(
            params.base64.replace(/^data:application\/\w+;base64,/, ''),
            'base64',
          )
        : await compressFromBase64(
            Buffer.from(
              params.base64.replace(/^data:image\/\w+;base64,/, ''),
              'base64',
            ),
            filetype,
          );

    // CREATE BLOB NAME INCLUDING FOLDER PATH AND FILE ID
    const blobName = `${params.filepath}/${params.fileID}/${filename}.${filetype}`;
    this.logger.log(`Uploading blob: ${blobName}`);
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    // UPLOAD BLOB TO AZURE STORAGE
    await blockBlobClient.upload(base64Data, base64Data.length, {
      blobHTTPHeaders: {
        blobContentType:
          filetype === 'pdf' ? `application/${filetype}` : `image/${filetype}`,
      },
    });
    this.logger.log(`Blob uploaded: ${blockBlobClient.url}`);
    return {
      Location: blockBlobClient.url,
    };
  }

  // METHOD TO UPLOAD A BLOB TO AZURE
  async copy(params: any): Promise<any> {
    // GENERATE A UNIQUE FILENAME
    const filename: string = params.filename;

    const blobKey = filename.split(`${ASContainerName}/`)[1];
    const sourceFile = blobKey.split('?')[0];

    const newFilename: string =
      Math.floor(Math.random() * 9999999 + 1111111).toString() +
      '-' +
      new Date().getTime().toString();
    const filetype: string = sourceFile.substring(
      sourceFile.lastIndexOf('.') + 1,
      sourceFile.length,
    );

    // CREATE BLOB NAME INCLUDING FOLDER PATH AND FILE ID
    const newBlobName = `${params.filepath}/${params.fileID}/${newFilename}.${filetype}`;

    // Get a client for the SOURCE blob (the one you want to copy)
    const sourceBlockBlobClient =
      this.containerClient.getBlockBlobClient(sourceFile);

    // Get a client for the DESTINATION blob (the new copy)
    const destinationBlockBlobClient =
      this.containerClient.getBlockBlobClient(newBlobName);

    await destinationBlockBlobClient.syncCopyFromURL(
      `${sourceBlockBlobClient.url}`,
    );

    this.logger.log(
      `Blob copied from: ${sourceBlockBlobClient.url}, to: ${destinationBlockBlobClient.url}`,
    );
    return {
      Location: destinationBlockBlobClient.url,
    };
  }

  // METHOD TO DELETE A BLOB FROM AZURE
  async remove(objectsKeyRemoves: Array<{ Key: string }>): Promise<void> {
    await Promise.all(
      objectsKeyRemoves.map(async (blob: { Key: string }) => {
        // LOGGER BLOB NAME TO REMOVE
        this.logger.log(`Deleting blob: ${blob.Key}`);

        try {
          const blobKey = blob.Key.split(`${ASContainerName}/`)[1];
          if (!blobKey) {
            this.logger.error(`Invalid blob key: ${blob.Key}`);
            return true;
          }
          const blobName = blobKey.split('?')[0];

          // INSTANCE BLOB CLIENT CONTAINER
          const blockBlobClient =
            this.containerClient.getBlockBlobClient(blobName);
          // CALL DELETE METHOD FROM AZURE BLOB SERVICE
          await await blockBlobClient.delete();
          return { message: 'File deleted successfully' };
        } catch (error) {
          // LOG ERROR AND THROW HTTP EXCEPTION
          this.logger.error(`Error deleting file`, error.message, error.stack);
          return true;
        }
      }),
    );
  }
}
