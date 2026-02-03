import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { TypeLocation } from 'src/common/enums/locations.enum';

import { LocationsService } from './locations.service';
import { Locations } from './schema/locations.schema';

const makeObjectId = () => new Types.ObjectId();

describe('LocationsService', () => {
  let service: LocationsService;
  let locationModel: any;

  beforeEach(async () => {
    locationModel = {
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        { provide: getModelToken(Locations.name), useValue: locationModel },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);

    jest.clearAllMocks();
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      label: 'Branch',
      type: TypeLocation.locationBranches,
      address: 'Address',
      city: 'City',
      latitude: '0.1',
      longitude: '0.2',
      hours: [],
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      locationID: makeObjectId(),
      location: {
        label: 'Branch',
        type: TypeLocation.locationBranches,
        address: 'Address',
        city: 'City',
        latitude: '0.1',
        longitude: '0.2',
        hours: [],
      },
      ...overrides,
    }) as any;

  describe('createLocations', () => {
    it('creates a location with new id', async () => {
      const dto = makeCreateDto();
      locationModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createLocations(dto);

      const payload = locationModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.label).toBe('Branch');
    });
  });

  describe('updateLocation', () => {
    it('updates location fields', async () => {
      const dto = makeUpdateDto();
      locationModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.locationID,
      });

      await service.updateLocation(dto);

      expect(locationModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: dto.locationID },
        expect.objectContaining({ $set: dto.location }),
        { new: true },
      );
    });
  });

  describe('removeLocation', () => {
    it('soft deletes location', async () => {
      const locationID = makeObjectId();
      locationModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: locationID,
      });

      await service.removeLocation(locationID);

      const payload = locationModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.$set.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('findLocationById', () => {
    it('returns a location', async () => {
      const locationID = makeObjectId();
      locationModel.findById.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue({ _id: locationID }),
      });

      await expect(service.findLocationById(locationID)).resolves.toEqual({
        _id: locationID,
      });
    });
  });

  describe('locations', () => {
    it('returns non-deleted locations', async () => {
      locationModel.find.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue([]),
      });

      await service.locations();

      expect(locationModel.find).toHaveBeenCalledWith({ deletedAt: null });
    });
  });
});
