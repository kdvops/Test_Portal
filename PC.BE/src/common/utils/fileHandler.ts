import { AzureBlobStorageService } from '../../azure-blob-storage/azure-blob-storage.service';
import { ImageDetailInput, ImageDetailInputUpdate } from '../types/common.type';
import { getUploadedImageUrl, isBase64 } from './imageManager';
import { Types } from 'mongoose';

//CLONE FILES
export const cloneFiles = async (
  filename: string,
  fileID: string,
  filepath?: string,
) => {
  if (!filename) return null;
  const azureBlobStorageService = new AzureBlobStorageService();
  const params = {
    filepath: filepath,
    fileID,
    filename,
  };
  try {
    const file = await azureBlobStorageService.copy(params);
    return file.Location;
  } catch (err) {
    return null;
  }
};

export const getImageUrl = async (
  filepath,
  source,
  sectionId,
  flag,
  callback: () => void,
) => {
  const url =
    (await isBase64(source)) === true
      ? await getUploadedImageUrl(filepath, callback, flag, source, sectionId)
      : (source ?? null);
  return url;
};

/**
 * @param _id
 * @param image
 * @param imageDetail
 * @param filepath the location on the bucket of the filie
 * @param callbackRemove
 * @param action
 * @returns
 */
export const getImageDetail = async (
  _id: Types.ObjectId,
  image: string,
  imageDetail: ImageDetailInput | ImageDetailInputUpdate,
  filepath: string,
  callbackRemove: () => void,
  action: string = 'update',
) => {
  const isImageDetailEmpty =
    !imageDetail?.image || imageDetail.image.trim() === '';
  const isImageEmpty = !image || image.trim() === '';
  if (isImageDetailEmpty && isImageEmpty) {
    return null;
  }
  const imageUrl = async () => {
    const imgUrl = await getImageUrl(
      filepath,
      imageDetail.image,
      _id,
      action,
      callbackRemove,
    );
    return imgUrl;
  };
  const imageDetailed = {
    ...imageDetail,
    image: !isImageDetailEmpty ? await imageUrl() : image,
  };
  return imageDetailed;
};
