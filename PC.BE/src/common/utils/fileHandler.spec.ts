import { Types } from 'mongoose';

import { cloneFiles, getImageDetail, getImageUrl } from './fileHandler';
import { getUploadedImageUrl, isBase64 } from './imageManager';
import { AzureBlobStorageService } from '../../azure-blob-storage/azure-blob-storage.service';

jest.mock('./imageManager', () => ({
  getUploadedImageUrl: jest.fn(),
  isBase64: jest.fn(),
}));

jest.mock('../../azure-blob-storage/azure-blob-storage.service', () => ({
  AzureBlobStorageService: jest.fn(),
}));

const mockGetUploadedImageUrl = getUploadedImageUrl as jest.Mock;
const mockIsBase64 = isBase64 as jest.Mock;

describe('fileHandler utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cloneFiles returns null when filename is empty', async () => {
    const result = await cloneFiles('', 'id');

    expect(result).toBeNull();
  });

  it('cloneFiles returns Location when copy succeeds', async () => {
    const copy = jest.fn().mockResolvedValue({ Location: 'cloned-url' });
    (AzureBlobStorageService as jest.Mock).mockImplementation(() => ({ copy }));

    const result = await cloneFiles('file.png', 'id', 'path');

    expect(copy).toHaveBeenCalledWith({
      filepath: 'path',
      fileID: 'id',
      filename: 'file.png',
    });
    expect(result).toBe('cloned-url');
  });

  it('cloneFiles returns null when copy fails', async () => {
    const copy = jest.fn().mockRejectedValue(new Error('fail'));
    (AzureBlobStorageService as jest.Mock).mockImplementation(() => ({ copy }));

    const result = await cloneFiles('file.png', 'id');

    expect(result).toBeNull();
  });

  it('getImageUrl uploads when source is base64', async () => {
    mockIsBase64.mockResolvedValueOnce(true);
    mockGetUploadedImageUrl.mockResolvedValueOnce('uploaded-url');
    const remove = jest.fn();

    const result = await getImageUrl(
      'path',
      'data:image/png;base64,abc',
      'id',
      'create',
      remove,
    );

    expect(mockGetUploadedImageUrl).toHaveBeenCalledWith(
      'path',
      remove,
      'create',
      'data:image/png;base64,abc',
      'id',
    );
    expect(result).toBe('uploaded-url');
  });

  it('getImageUrl returns original source when not base64', async () => {
    mockIsBase64.mockResolvedValueOnce(false);

    const result = await getImageUrl(
      'path',
      'https://example.com/img.png',
      'id',
      'update',
      jest.fn(),
    );

    expect(mockGetUploadedImageUrl).not.toHaveBeenCalled();
    expect(result).toBe('https://example.com/img.png');
  });

  it('getImageDetail returns null when image and imageDetail are empty', async () => {
    const result = await getImageDetail(
      new Types.ObjectId(),
      '',
      { image: '' } as any,
      'financially',
      jest.fn(),
    );

    expect(result).toBeNull();
  });

  it('getImageDetail resolves base64 image detail', async () => {
    const id = new Types.ObjectId();
    mockIsBase64.mockResolvedValueOnce(true);
    mockGetUploadedImageUrl.mockResolvedValueOnce('uploaded-url');

    const result = await getImageDetail(
      id,
      '',
      { image: 'data:image/png;base64,abc', alt: 'Alt' } as any,
      'financially',
      jest.fn(),
      'create',
    );

    expect(result).toEqual({
      image: 'uploaded-url',
      alt: 'Alt',
    });
  });

  it('getImageDetail keeps existing image when imageDetail is empty', async () => {
    const id = new Types.ObjectId();
    const result = await getImageDetail(
      id,
      'existing-url',
      { image: '' } as any,
      'financially',
      jest.fn(),
    );

    expect(result).toEqual({ image: 'existing-url' });
    expect(mockGetUploadedImageUrl).not.toHaveBeenCalled();
  });
});
