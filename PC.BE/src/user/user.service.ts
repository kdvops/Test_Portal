import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// IMPORT USER SCHEMA
import { User, UserDocument } from './schema/user.schema';

// IMPORT USER INPUT
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { FetchUsersArgsDto, UserType } from './dto/params.users.dto';

import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { AuthenticationProvider } from 'src/authentication/providers/authentication.providers';
import { ImageCompression } from 'src/common/constants';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private authenticationProvider: AuthenticationProvider,
    private azureBlobStorageService: AzureBlobStorageService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const password = await this.authenticationProvider.generateHash(
      createUserDto.password,
    );
    const displayName = `${createUserDto.firstName.charAt(
      0,
    )}${createUserDto.lastName.charAt(0)}`;
    return this.userModel.create({ ...createUserDto, displayName, password });
  }

  async findOneUser(user: any): Promise<UserType> {
    return (await this.userModel
      .findOne({ email: user.email })
      .lean()) as unknown as UserType;
  }

  async findUserByRoles(payload: Array<string>): Promise<User[]> {
    return (await this.userModel
      .find({ roles: payload })
      .lean()) as unknown as User[];
  }

  async findUserById(userID: Types.ObjectId): Promise<User> {
    return (await this.userModel.findById(userID).lean()) as unknown as User;
  }

  async users(params: FetchUsersArgsDto): Promise<User[]> {
    // GET ARGS SEARCH
    const search = {
      $or: [
        {
          $expr: {
            $regexMatch: {
              input: {
                $toString: '$firstName',
              },
              regex: params.search,
              options: 'i',
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: {
                $toString: '$email',
              },
              regex: params.search,
              options: 'i',
            },
          },
        },
      ],
    };

    // CREATE PIPELINE MATCH USER
    const pipeline = [
      {
        $match: { ...search },
      },
    ];

    // AGGREGATE
    return await this.userModel.aggregate(pipeline);
  }

  // UPDATE USER
  async updateUser(updateUserDto: UpdateUserDto): Promise<User> {
    const displayName = `${updateUserDto.user.firstName.charAt(
      0,
    )}${updateUserDto.user.lastName.charAt(0)}`;

    // CHECK FILES TO UPLOAD
    const avatarUser = updateUserDto.newUploadAvatar;

    // GET AND SET NEW IMAGES
    const avatar =
      avatarUser && avatarUser[0] && avatarUser[0].img && avatarUser[0].filetype
        ? await this.checkUploadImageUser(
            'avatar',
            avatarUser,
            updateUserDto.userID,
          )
        : updateUserDto.user.avatar;
    // GET AND SET NEW IMAGES

    return await this.userModel
      .findOneAndUpdate(
        { _id: updateUserDto.userID },
        { $set: updateUserDto.user, displayName, avatar },
        { new: true },
      )
      .exec();
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageUser(
    flag: string,
    imageUser: any,
    userID: Types.ObjectId,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    await this.removeFiles(flag, imageUser, userID);

    // UPLOAD NEW IMAGE
    const image: any = await this.uploadFiles(imageUser, userID);
    return image.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, userID: Types.ObjectId) {
    const createParams = {
      filepath: 'users',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: userID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(flag: string, file: any, userID: Types.ObjectId) {
    const removeObject = [];
    const userQuery = this.userModel.findById(userID);
    if (!userQuery || typeof userQuery.select !== 'function') {
      return;
    }
    const user = await userQuery.select('avatar').lean();
    if (!user || !user.avatar) {
      return;
    }
    removeObject.push({
      Key: `kousaluxuryspace${user.avatar.split('kousaluxuryspace')[2]}`,
    });
    if (removeObject.length === 0) {
      return;
    }
    return await this.azureBlobStorageService.remove(removeObject);
  }
}
