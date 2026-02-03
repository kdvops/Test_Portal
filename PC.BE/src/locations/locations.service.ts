import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// IMPORT LOCATIONS SCHEMA
import { Locations, LocationsDocument } from './schema/locations.schema';

// IMPORT LOCATIONS INPUT
import { CreateLocationDto } from './dto/create.location.dto';
import { UpdateLocationDto } from './dto/update.location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Locations.name)
    private locationModel: Model<LocationsDocument>,
  ) {}

  // CREATE LOCATIONS
  async createLocations(
    createLocationDto: CreateLocationDto,
  ): Promise<Locations> {
    // CREATE ID
    const _id: any = new Types.ObjectId();

    // RETURN LOCATIONS
    return await this.locationModel.create({
      // SET ALL DATA DTO
      ...createLocationDto,
      // SET ID
      _id,
    });
  }

  // UPDATE LOCATIONS
  async updateLocation(
    updateLocationDto: UpdateLocationDto,
  ): Promise<Locations> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    return await this.locationModel.findOneAndUpdate(
      { _id: updateLocationDto.locationID },
      {
        $set: updateLocationDto.location,
        updatedAt,
      },
      { new: true },
    );
  }

  // REMOVE LOCATIONS
  async removeLocation(locationID: Types.ObjectId): Promise<Locations> {
    // REMOVE EPISODE PODCAST DATE
    const deletedAt: Date = new Date();

    return await this.locationModel.findOneAndUpdate(
      { _id: locationID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // FIND LOCATION BY ID
  async findLocationById(locationID: Types.ObjectId): Promise<Locations> {
    return (await this.locationModel.findById(locationID).lean()) as unknown as Locations;
  }

  // LOCATIONS
  async locations(): Promise<Locations[]> {
    return (await this.locationModel
      .find({ deletedAt: null })
      .lean()) as unknown as Locations[];
  }
}
