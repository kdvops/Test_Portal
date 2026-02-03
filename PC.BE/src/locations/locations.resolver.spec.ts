import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { TypeLocation } from 'src/common/enums/locations.enum';

import { LocationsResolver } from './locations.resolver';
import { LocationsService } from './locations.service';
import { Locations } from './schema/locations.schema';

describe('LocationsResolver', () => {
  let resolver: LocationsResolver;
  let service: jest.Mocked<LocationsService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<LocationsService> = {
      updateLocation: jest.fn(),
      removeLocation: jest.fn(),
      createLocations: jest.fn(),
      locations: jest.fn(),
      findLocationById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsResolver,
        { provide: LocationsService, useValue: serviceMock },
        { provide: getModelToken(Locations.name), useValue: {} },
      ],
    }).compile();

    resolver = module.get<LocationsResolver>(LocationsResolver);
    service = module.get(LocationsService) as jest.Mocked<LocationsService>;
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
      locationID: new Types.ObjectId().toString(),
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

  describe('invalid ids', () => {
    it('rejects removeLocation', async () => {
      await expect(resolver.removeLocation('not-an-id')).rejects.toThrow(
        'Invalid locationID',
      );
      expect(service.removeLocation).not.toHaveBeenCalled();
    });

    it('rejects findLocationById', () => {
      expect(() => resolver.findLocationById('not-an-id')).toThrow(
        'Invalid locationID',
      );
      expect(service.findLocationById).not.toHaveBeenCalled();
    });
  });

  describe('createLocation', () => {
    it('normalizes missing hours', async () => {
      service.createLocations.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createLocation(makeCreateDto({ hours: undefined }));

      expect(service.createLocations).toHaveBeenCalledWith(
        expect.objectContaining({ hours: [] }),
      );
    });

    it('delegates with valid payload', async () => {
      service.createLocations.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createLocation(makeCreateDto());

      expect(service.createLocations).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'Branch' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createLocation(makeCreateDto({ extraField: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createLocations).not.toHaveBeenCalled();
    });

    it('rejects invalid type enum', async () => {
      await expect(
        resolver.createLocation(makeCreateDto({ type: 'unknown' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createLocations).not.toHaveBeenCalled();
    });

    it('rejects null hours', async () => {
      await expect(
        resolver.createLocation(makeCreateDto({ hours: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createLocations).not.toHaveBeenCalled();
    });
  });

  describe('updateLocation', () => {
    it('normalizes missing hours', async () => {
      const dto = makeUpdateDto({
        location: { ...makeUpdateDto().location, hours: undefined },
      });
      service.updateLocation.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.updateLocation(dto);

      expect(service.updateLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          location: expect.objectContaining({ hours: [] }),
        }),
      );
    });

    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateLocation.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.updateLocation(dto);

      expect(service.updateLocation).toHaveBeenCalledWith(dto);
    });

    it('rejects extra root fields', async () => {
      await expect(
        resolver.updateLocation(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateLocation).not.toHaveBeenCalled();
    });

    it('rejects extra location fields', async () => {
      const dto = makeUpdateDto({
        location: { ...makeUpdateDto().location, extra: 'bad' },
      });

      await expect(resolver.updateLocation(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateLocation).not.toHaveBeenCalled();
    });

    it('rejects invalid type enum', async () => {
      const dto = makeUpdateDto({
        location: { ...makeUpdateDto().location, type: 'unknown' },
      });

      await expect(resolver.updateLocation(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateLocation).not.toHaveBeenCalled();
    });

    it('rejects null hours', async () => {
      const dto = makeUpdateDto({
        location: { ...makeUpdateDto().location, hours: null },
      });

      await expect(resolver.updateLocation(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateLocation).not.toHaveBeenCalled();
    });
  });

  describe('locations', () => {
    it('delegates to service', async () => {
      service.locations.mockResolvedValueOnce([]);

      await resolver.locations();

      expect(service.locations).toHaveBeenCalledWith();
    });
  });
});
