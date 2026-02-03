import { AzureBlobStorageService } from 'src/azure-blob-storage/azure-blob-storage.service';
import { ImageCompression } from 'src/common/constants';

export const isBase64 = (value: string | undefined): Promise<boolean> => {
  if (typeof value !== 'string' || !value) return Promise.reject(false);
  return Promise.resolve(
    value?.substring(0, 20).trim().startsWith('data:image/'),
  );
};

// CHECK IMAGES UPLOAD BUCKET
export const getUploadedImageUrl = async (
  filepath: string,
  callbackRemove: () => void,
  flag: string,
  fileToUpload: any,
  sectionID: string,
  fileType?: string,
) => {
  // REMOVE IMAGE BEFORE SAVED
  flag === 'update' && (await callbackRemove());

  const createParams = {
    filepath,
    filetype: fileType ?? ImageCompression.defaultFormat,
    base64: fileToUpload,
    fileID: sectionID,
  };
  const azureBlobStorageService = new AzureBlobStorageService();
  const file = await azureBlobStorageService.upload(createParams);
  return file.Location;
};
