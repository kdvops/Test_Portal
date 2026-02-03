import { Model, Types } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';

// IMPORT SECTIONS SCHEMA
import { Sections, SectionsDocument } from './schema/sections.schema';

// IMPORT SECTIONS ENUMS
import { TypeSection } from '../common/enums/sections.enums';

// IMPORT SECTIONS INPUT
import {
  AttachmentSectionInputCreate,
  AttachmentSectionInputUpdate,
  CardsSectionInputUpdate,
  GalleryItemInputCreateType,
  GalleryItemInputUpdateType,
  GalleryItemType,
  GallerySectionType,
  GridSectionInputCreate,
  GridSectionInputUpdate,
  GridSectionType,
  LayoutInputCreateType,
  LayoutInputUpdateType,
  LayoutType,
  SectionInputCreate,
  SectionType,
} from '../common/types/sections.type';

// IMPORT DTO
import { UpdateSectionDto } from './dto/update.section.dto';

// IMPORT S3 STORAGE SERVICE
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import { ASContainerName, ImageCompression } from 'src/common/constants';

@Injectable()
export class SectionsService {
  private readonly logger = new Logger(SectionsService.name);
  constructor(
    @InjectModel(Sections.name)
    private sectionModel: Model<SectionsDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
  ) {}

  // CLONE SECTIONS
  async cloneSections(section: SectionType): Promise<Sections> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id: sId, ...existingSection } = section;
    // CREATE ID SECTION
    const newId: any = new Types.ObjectId();

    const cards =
      existingSection.type === TypeSection.sectionCards && existingSection.cards
        ? await Promise.all(
            existingSection.cards.map(async (card) => {
              const pictureImageDetail =
                card.picture || card.pictureImageDetail
                  ? {
                      ...card.pictureImageDetail,
                      image: card.pictureImageDetail
                        ? await cloneFiles(
                            card.pictureImageDetail.image,
                            String(newId),
                          )
                        : await cloneFiles(card.picture, String(newId)),
                    }
                  : null;
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { _id, ...cardData } = card;
              return {
                ...cardData,
                ...(pictureImageDetail && pictureImageDetail),
                _id: new Types.ObjectId(),
              };
            }),
          )
        : [];

    let banner = null;
    if (
      existingSection.type === TypeSection.sectionBanner &&
      existingSection.banner
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id: bId, ...bannerData } = existingSection.banner;

      const pictureImageDetail =
        existingSection.banner.picture ||
        existingSection.banner.pictureImageDetail
          ? {
              ...existingSection.banner.pictureImageDetail,
              image: existingSection.banner.pictureImageDetail
                ? await cloneFiles(
                    existingSection.banner.pictureImageDetail.image,
                    String(newId),
                  )
                : await cloneFiles(
                    existingSection.banner.picture,
                    String(newId),
                  ),
            }
          : null;

      banner = {
        ...bannerData,
        picture: null,
        pictureImageDetail,
        _id: new Types.ObjectId(),
      };
    }

    const attachments =
      existingSection.type === TypeSection.sectionAttachments &&
      existingSection.attachments
        ? await Promise.all(
            existingSection.attachments.map(async (attachment) => {
              const picture = await cloneFiles(attachment.file, String(newId));
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { _id, ...attachmentData } = attachment;
              return {
                ...attachmentData,
                ...(picture && picture),
                _id: new Types.ObjectId(),
              };
            }),
          )
        : [];

    const grids =
      existingSection.type === TypeSection.sectionGrids && existingSection.grids
        ? await Promise.all(
            existingSection.grids.map(async (grid) => {
              const layouts = await Promise.all(
                grid.layouts.map(async (layout) => {
                  let button = null;
                  const imageDetail =
                    layout.image || layout.imageDetail.image
                      ? {
                          ...layout.imageDetail,
                          image: await cloneFiles(
                            layout.image ?? layout.imageDetail.image,
                            String(newId),
                          ),
                        }
                      : null;
                  if (layout.button) {
                    button = {
                      ...layout.button,
                      pictureImageDetail:
                        layout.button?.picture ||
                        layout.button?.pictureImageDetail?.image
                          ? {
                              ...layout.button.pictureImageDetail,
                              image: await cloneFiles(
                                layout.button?.picture ??
                                  layout.button.pictureImageDetail.image,
                                String(newId),
                              ),
                            }
                          : null,
                      iconImageDetail:
                        layout.button?.icon ||
                        layout.button?.iconImageDetail?.image
                          ? {
                              ...layout.button.iconImageDetail,
                              image: await cloneFiles(
                                layout.button?.icon ??
                                  layout.button.iconImageDetail.image,
                                String(newId),
                              ),
                            }
                          : null,
                    };
                  }
                  return {
                    ...layout,
                    button,
                    image: null,
                    imageDetail,
                    _id: new Types.ObjectId(),
                  };
                }),
              );
              return {
                ...grid,
                _id: new Types.ObjectId(),
                layouts,
              };
            }),
          )
        : [];

    const galleryItems =
      existingSection.type === TypeSection.sectionGallery &&
      existingSection.gallery
        ? await Promise.all(
            existingSection.gallery.items.map(async (item) => {
              const imageDetail =
                item.image || item.imageDetail
                  ? {
                      ...item.imageDetail,
                      image: item.imageDetail
                        ? await cloneFiles(
                            item.imageDetail.image,
                            String(newId),
                          )
                        : await cloneFiles(item.image, String(newId)),
                    }
                  : null;

              const iconImageDetail =
                item.icon || item.iconImageDetail
                  ? {
                      ...item.iconImageDetail,
                      image: item.iconImageDetail
                        ? await cloneFiles(
                            item.iconImageDetail.image,
                            String(newId),
                          )
                        : await cloneFiles(item.icon, String(newId)),
                    }
                  : null;

              return {
                ...item,
                imageDetail,
                iconImageDetail,
                _id: new Types.ObjectId(),
              };
            }),
          )
        : [];
    const gallery = galleryItems.length > 0 ? { items: galleryItems } : null;

    let image = null;
    let imageDetail;
    if (
      existingSection.type === TypeSection.sectionImage &&
      existingSection.image
    ) {
      image = {
        _id: new Types.ObjectId(),
        url: await cloneFiles(existingSection.image.url, String(newId)),
      };

      imageDetail =
        existingSection.imageDetail || existingSection.image.url
          ? {
              ...existingSection.imageDetail,
              image: existingSection.imageDetail
                ? await cloneFiles(
                    existingSection.imageDetail.image,
                    String(newId),
                  )
                : await cloneFiles(existingSection.image.url, String(newId)),
            }
          : null;
    }

    // RETURN SECTIONS
    return await this.sectionModel.create({
      // SET ALL DATA DTO
      ...existingSection,

      // SET ID
      _id: newId,

      // SET CARDS
      cards,

      // SET BANNER
      banner,

      // SET ATTACHMENTS
      attachments,
      grids,
      gallery,
      // SET IMAGE
      ...(image ?? {}),
      ...(imageDetail ?? {}),
    });
  }

  // CREATE SECTIONS
  async createSections(
    createSectionsDto: SectionInputCreate,
  ): Promise<Sections> {
    // CREATE ID SECTION
    const _id: any = new Types.ObjectId();

    // VALIDATE TYPE SECTION FIRST
    const cards =
      createSectionsDto.type === TypeSection.sectionCards &&
      createSectionsDto.cards.length > 0
        ? await this.uploadCardsSections(createSectionsDto, _id)
        : [];

    const banner =
      createSectionsDto.type === TypeSection.sectionBanner &&
      createSectionsDto.banner
        ? await this.uploadBannerSections(createSectionsDto, _id)
        : null;

    const attachments =
      createSectionsDto.type === TypeSection.sectionAttachments &&
      createSectionsDto.attachments.length > 0
        ? await this.uploadAttachmentsSections(createSectionsDto, _id)
        : [];

    const imageDetail = await getImageDetail(
      _id,
      null,
      createSectionsDto.imageDetail,
      'sections',
      null,
      'create',
    );

    const grids =
      createSectionsDto.type === TypeSection.sectionGrids &&
      createSectionsDto.grids?.length > 0
        ? await this.mapToGridsCreationType(createSectionsDto.grids, _id)
        : null;

    const gallery =
      createSectionsDto.type === TypeSection.sectionGallery &&
      createSectionsDto.gallery?.items.length > 0
        ? await this.mapToGalleryCreationType(createSectionsDto, _id)
        : null;

    // RETURN SECTIONS
    return await this.sectionModel.create({
      // SET ALL DATA DTO
      ...createSectionsDto,

      // SET ID
      _id,

      // SET CARDS
      cards,

      // SET BANNER
      banner,

      // SET ATTACHMENTS
      attachments,

      // SET IMAGE
      image: null,
      imageDetail,

      // SET GRID
      grids,

      //SET GALLERY
      gallery,
    });
  }

  // UPDATE SECTIONS
  async updateSections(updateSectionDto: UpdateSectionDto): Promise<Sections> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    // VALIDATE TYPE SECTION FIRST
    const updateBannerSection =
      updateSectionDto.section.type === TypeSection.sectionBanner &&
      updateSectionDto.section.banner
        ? await this.updateBannerSection(updateSectionDto)
        : updateSectionDto.section.banner;

    // VALIDATE TYPE SECTION FIRST
    const imageDetail = await getImageDetail(
      updateSectionDto.sectionID,
      updateSectionDto.section.image?.url,
      updateSectionDto.section.imageDetail,
      'sections',
      async () =>
        await this.removeFilesItem(updateSectionDto.sectionID, null, 'image'),
    );

    // VALIDATE TYPE SECTION FIRST
    const updateCardsSection =
      updateSectionDto.section.type === TypeSection.sectionCards &&
      updateSectionDto.section.cards.length > 0
        ? await this.updateCardsSections(updateSectionDto)
        : updateSectionDto.section.cards;

    // VALIDATE TYPE SECTION FIRST
    const updateGridsSections =
      updateSectionDto.section.type === TypeSection.sectionGrids &&
      updateSectionDto.section.grids
        ? await this.updateGridsSections(
            updateSectionDto.section.grids,
            updateSectionDto.sectionID,
          )
        : updateSectionDto.section.grids;

    // VALIDATE TYPE SECTION FIRST
    const updateGallerySections =
      updateSectionDto.section.type === TypeSection.sectionGallery &&
      updateSectionDto.section.gallery
        ? await this.updateGallerySections(updateSectionDto)
        : updateSectionDto.section.gallery;

    // VALIDATE TYPE SECTION FIRST
    const updateAttachmentsSection =
      updateSectionDto.section.type === TypeSection.sectionAttachments &&
      updateSectionDto.section.attachments.length > 0
        ? await this.updateAttachmentsSections(updateSectionDto)
        : updateSectionDto.section.attachments;

    return await this.sectionModel.findOneAndUpdate(
      { _id: updateSectionDto.sectionID },
      {
        $set: updateSectionDto.section,
        image: null,
        imageDetail,
        banner: updateBannerSection,
        cards: updateCardsSection,
        attachments: updateAttachmentsSection,
        grids: updateGridsSections,
        gallery: updateGallerySections,
        updatedAt,
      },
      { new: true },
    );
  }

  // UPDATE SECTIONS BANNER
  async updateBannerSection(updateSectionDto: UpdateSectionDto) {
    // SET NEW BANNER
    const pictureImageDetail = await getImageDetail(
      updateSectionDto.sectionID,
      updateSectionDto.section.banner?.picture,
      updateSectionDto.section.banner?.pictureImageDetail,
      'sections',
      async () =>
        await this.removeFilesItem(updateSectionDto.sectionID, null, 'banner'),
    );

    // REMOVE UNNECESSARY ATTRIBUTES
    const bannerClean = _.omit(updateSectionDto.section.banner, [
      'newUploadPictureItem',
    ]);

    // RETURN CARD UPDATE
    return {
      ...bannerClean,
      _id: bannerClean._id,
      picture: null,
      pictureImageDetail,
    };
  }

  // UPDATE SECTIONS BANNER
  async updateImageSection(updateSectionDto: UpdateSectionDto) {
    // SET NEW BANNER
    const newUrlImage =
      updateSectionDto.section.image.newUploadPictureItem &&
      updateSectionDto.section.image.newUploadPictureItem[0] &&
      updateSectionDto.section.image.newUploadPictureItem[0].img &&
      updateSectionDto.section.image.newUploadPictureItem[0].filetype
        ? await this.checkUploadFileSection(
            'update',
            updateSectionDto.section.image.newUploadPictureItem,
            updateSectionDto.sectionID,
            'image',
            'image',
          )
        : updateSectionDto.section.image.url;
    // SET NEW BANNER

    // REMOVE UNNECESSARY ATTRIBUTES
    const imageClean = _.omit(updateSectionDto.section.image, [
      'newUploadPictureItem',
    ]);

    // RETURN CARD UPDATE
    return {
      ...imageClean,
      _id: imageClean._id,
      url: newUrlImage,
    };
  }

  // UPDATE SECTIONS ATTACHMENT
  async updateAttachmentsSections(updateSectionDto: UpdateSectionDto) {
    // UPLOAD ATTACHMENT
    const attachments = await Promise.all(
      updateSectionDto.section.attachments.map(
        async (attachment: AttachmentSectionInputUpdate) => {
          // VALIDATE ATTACHMENT STATUS
          if (attachment.status === 'remove') {
            // REMOVE SECTION ATTACHMENT
            attachment._id &&
              (await this.removeFilesItem(
                updateSectionDto.sectionID,
                attachment._id,
                'attachments',
              ));

            // REMOVE ATTACHMENT
            return null;
          } else if (attachment.status === 'update') {
            // SET NEW FILE
            const fileAttachment =
              attachment.newUploadFileItem &&
              attachment.newUploadFileItem[0] &&
              attachment.newUploadFileItem[0].file &&
              attachment.newUploadFileItem[0].filetype
                ? await this.checkUploadFileSection(
                    'update',
                    attachment.newUploadFileItem,
                    updateSectionDto.sectionID,
                    'file',
                    'attachments',
                    attachment._id,
                  )
                : attachment.file;
            // SET NEW FILE

            // REMOVE UNNECESSARY ATTRIBUTES
            const attachmentClean = _.omit(attachment, [
              'newUploadFileItem',
              'status',
            ]);

            // RETURN CARD UPDATE
            return {
              ...attachmentClean,
              _id: attachmentClean._id,
              file: fileAttachment,
            };
          } else if (attachment.status === 'create') {
            // CREATE ID SECTION
            const _id: any = new Types.ObjectId();

            // SET NEW FILE
            const fileAttachment =
              attachment.newUploadFileItem &&
              attachment.newUploadFileItem[0] &&
              attachment.newUploadFileItem[0].file &&
              attachment.newUploadFileItem[0].filetype
                ? await this.checkUploadFileSection(
                    'create',
                    attachment.newUploadFileItem,
                    updateSectionDto.sectionID,
                    'file',
                    'attachments',
                  )
                : attachment.file;
            // SET NEW FILE

            // REMOVE NEW PICTURE CARD
            const attachmentClean = _.omit(attachment, [
              'newUploadFileItem',
              'status',
            ]);

            // RETURN ATTACHMENT CREATE
            return {
              // SET ALL DATA DTO
              ...attachmentClean,

              // SET ID
              _id,

              // SET FILE UPLOAD
              file: fileAttachment,
            };
          } else {
            // REMOVE UNNECESSARY ATTRIBUTES
            const attachmentClean = _.omit(attachment, [
              'newUploadFileItem',
              'status',
            ]);

            // RETURN ATTACHMENT UPDATE
            return {
              ...attachmentClean,
              _id: attachmentClean._id,
            };
          }
        },
      ),
    );

    // REMOVE NULL ATTACHMENTS
    const cleanAttachments = attachments.filter(
      (attachment) => attachment !== null,
    );

    // RETURN ATTACHMENTS
    return cleanAttachments;
  }

  // UPDATE SECTIONS CARDS
  async updateCardsSections(updateSectionDto: UpdateSectionDto) {
    // UPLOAD CARDS
    const cards = await Promise.all(
      updateSectionDto.section.cards.map(
        async (card: CardsSectionInputUpdate) => {
          // VALIDATE CARD STATUS
          if (card.status && card.status === 'remove') {
            // REMOVE SECTION CARDS
            card._id &&
              (await this.removeFilesItem(
                updateSectionDto.sectionID,
                card._id,
                'cards',
              ));

            // REMOVE CARD
            return null;
          } else if (card.status && card.status === 'update') {
            // SET NEW IMAGES
            const pictureImageDetail = await getImageDetail(
              updateSectionDto.sectionID,
              card.picture,
              card.pictureImageDetail,
              'sections',
              async () =>
                await this.removeFilesItem(
                  updateSectionDto.sectionID,
                  card._id,
                  'cards',
                ),
            );
            // SET NEW IMAGES

            // REMOVE NEW PICTURE CARD
            const cardClean = _.omit(card, ['newUploadPictureItem', 'status']);

            // RETURN CARD UPDATE
            return {
              ...cardClean,
              _id: cardClean._id,
              picture: null,
              pictureImageDetail,
            };
          } else if (card.status && card.status === 'create') {
            // CREATE ID SECTION
            const _id: any = new Types.ObjectId();

            const pictureImageDetail = await getImageDetail(
              updateSectionDto.sectionID,
              null,
              card.pictureImageDetail,
              'sections',
              null,
              'create',
            );
            // SET NEW IMAGES

            // REMOVE NEW PICTURE CARD
            const cardClean = _.omit(card, ['newUploadPictureItem', 'status']);

            // RETURN CARD CREATE
            return {
              // SET ALL DATA DTO
              ...cardClean,

              // SET ID
              _id,

              // SET PICTURE UPLOAD
              picture: null,
              pictureImageDetail,
            };
          } else {
            // REMOVE UNNECESSARY ATTRIBUTES
            const cardClean = _.omit(card, ['newUploadPictureItem', 'status']);

            // RETURN CARD UPDATE
            return {
              ...cardClean,
              _id: cardClean._id,
            };
          }
        },
      ),
    );

    // REMOVE NULL CARDS
    const cleanCards = cards.filter((card) => card !== null);

    // RETURN CARDS
    return cleanCards;
  }

  async isBase64(value: string | undefined): Promise<boolean> {
    if (typeof value !== 'string' || !value) return false;
    return value?.substring(0, 20).trim().startsWith('data:image/');
  }

  // UPDATE SECTIONS CARDS
  async updateGallerySections(updateSectionDto: UpdateSectionDto) {
    const gallery = updateSectionDto.section.gallery;
    // UPLOAD CARDS
    const items = await Promise.all(
      gallery?.items.map(async (galleryItem: GalleryItemInputUpdateType) => {
        // VALIDATE CARD STATUS
        if (galleryItem.status && galleryItem.status === 'remove') {
          // REMOVE SECTION CARDS
          galleryItem._id &&
            (await this.removeFilesItem(
              updateSectionDto.sectionID,
              String(galleryItem._id),
              'gallery',
            ));

          // REMOVE CARD
          return null;
        } else if (
          (galleryItem.status && galleryItem.status === 'update') ||
          galleryItem._id
        ) {
          const imageDetail = await getImageDetail(
            updateSectionDto.sectionID,
            galleryItem.image,
            galleryItem.imageDetail,
            'sections',
            async () =>
              await this.removeFilesItem(
                updateSectionDto.sectionID,
                String(galleryItem._id),
                'gallery.imageDetail',
              ),
          );

          const iconImageDetail = await getImageDetail(
            updateSectionDto.sectionID,
            galleryItem.icon,
            galleryItem.iconImageDetail,
            'sections',
            async () =>
              await this.removeFilesItem(
                updateSectionDto.sectionID,
                String(galleryItem._id),
                'gallery.iconImageDetail',
              ),
          );

          // REMOVE NEW PICTURE CARD
          const galleryClean = _.omit(galleryItem, ['status']);
          // RETURN CARD UPDATE
          return {
            ...galleryClean,
            _id: galleryClean._id,
            icon: null,
            image: null,
            imageDetail,
            iconImageDetail,
          };
        } else if (
          (galleryItem.status && galleryItem.status === 'create') ||
          !galleryItem._id
        ) {
          // CREATE ID SECTION
          const _id: any = new Types.ObjectId();
          const imageDetail = await getImageDetail(
            updateSectionDto.sectionID,
            galleryItem.image,
            galleryItem.imageDetail,
            'sections',
            null,
            'create',
          );

          const iconImageDetail = await getImageDetail(
            updateSectionDto.sectionID,
            galleryItem.icon,
            galleryItem.iconImageDetail,
            'sections',
            null,
            'create',
          );

          // REMOVE NEW PICTURE CARD
          const galleryClean = _.omit(galleryItem, ['status']);

          // RETURN CARD CREATE
          return {
            // SET ALL DATA DTO
            ...galleryClean,

            // SET ID
            _id,
            icon: null,
            image: null,
            imageDetail,
            iconImageDetail,
          };
        } else {
          // REMOVE UNNECESSARY ATTRIBUTES
          const galleryItemClean = _.omit(galleryItem, ['status']);

          // RETURN CARD UPDATE
          return {
            ...galleryItemClean,
            _id: galleryItemClean._id,
          };
        }
      }),
    );

    // REMOVE NULL CARDS
    const cleanItems = items.filter((card) => card !== null);

    // RETURN CARDS
    return { ...gallery, items: cleanItems };
  }

  // REMOVE SECTION COMPLETE
  async removeSections(section: any) {
    // REMOVE SECTION CARDS
    section.type === TypeSection.sectionCards &&
      (await this.removeFiles(section._id, 'cards'));

    // REMOVE SECTION ATTACHMENTS
    section.type === TypeSection.sectionAttachments &&
      (await this.removeFiles(section._id, 'attachments'));

    // REMOVE SECTION CARDS
    section.type === TypeSection.sectionBanner &&
      (await this.removeFiles(section._id, 'banner'));

    // REMOVE SECTION CARDS
    section.type === TypeSection.sectionImage &&
      (await this.removeFiles(section._id, 'image'));

    // REMOVE SECTION CARDS
    section.type === TypeSection.sectionGrids &&
      (await this.removeFiles(section._id, 'grids'));

    // REMOVE SLIDER DATE
    const deletedAt: Date = new Date();

    // SET EMPTY TO ARRAY
    const cards: Array<any> = [];
    const attachments: Array<any> = [];
    const banner: any = null;
    const image: any = null;

    return await this.sectionModel.findOneAndUpdate(
      { _id: section._id },
      { $set: { deletedAt, cards, attachments, banner, image } },
      { new: true },
    );
  }

  // UPLOAD SECTIONS CARDS
  async uploadCardsSections(
    section: SectionInputCreate,
    sectionID: Types.ObjectId,
  ) {
    // UPLOAD CARDS
    const cards = await Promise.all(
      section.cards.map(async (card: CardsSectionInputUpdate) => {
        // CREATE ID SECTION
        const _id: any = new Types.ObjectId();

        // SET NEW IMAGES
        const pictureImageDetail = await getImageDetail(
          sectionID,
          null,
          card.pictureImageDetail,
          'sections',
          null,
          'create',
        );
        // SET NEW IMAGES

        // REMOVE NEW PICTURE CARD
        const cardClean = _.omit(card, ['newUploadPictureItem']);

        const finalCard = {
          // SET ALL DATA DTO
          ...cardClean,

          // SET ID
          _id,

          // SET PICTURE UPLOAD
          picture: null,
          pictureImageDetail,
        };

        // RETURN SECTIONS
        return finalCard;
      }),
    );

    // RETURN CARDS
    return cards;
  }

  // UPLOAD SECTIONS ATTACHMENTS
  async uploadAttachmentsSections(
    section: SectionInputCreate,
    sectionID: Types.ObjectId,
  ) {
    // UPLOAD ATTACHMENTS
    const attachments = await Promise.all(
      section.attachments.map(
        async (attachment: AttachmentSectionInputCreate) => {
          // CREATE ID SECTION
          const _id: any = new Types.ObjectId();

          // SET NEW IMAGES
          const fileAttachment =
            attachment.newUploadFileItem &&
            attachment.newUploadFileItem[0] &&
            attachment.newUploadFileItem[0].file &&
            attachment.newUploadFileItem[0].filetype
              ? await this.checkUploadFileSection(
                  'create',
                  attachment.newUploadFileItem,
                  sectionID,
                  'file',
                )
              : attachment.file;
          // SET NEW IMAGES

          // REMOVE NEW PICTURE PROMOTION
          const attachmentsClean = _.omit(attachment, ['newUploadFileItem']);

          const finalAttachment = {
            // SET ALL DATA DTO
            ...attachmentsClean,

            // SET ID
            _id,

            // SET FILE UPLOAD
            file: fileAttachment,
          };

          // RETURN SECTIONS
          return finalAttachment;
        },
      ),
    );

    // RETURN CARDS
    return attachments;
  }

  // UPLOAD SECTIONS IMAGE
  async uploadImageSections(
    section: SectionInputCreate,
    sectionID: Types.ObjectId,
  ) {
    // CREATE ID SECTION
    const _id: any = new Types.ObjectId();

    // SET NEW IMAGES
    const urlPicture =
      section.image.newUploadPictureItem &&
      section.image.newUploadPictureItem[0] &&
      section.image.newUploadPictureItem[0].img &&
      section.image.newUploadPictureItem[0].filetype
        ? await this.checkUploadFileSection(
            'create',
            section.image.newUploadPictureItem,
            sectionID,
            'image',
          )
        : section.image.url;
    // SET NEW IMAGES

    return {
      // SET ID
      _id,

      // SET IMAGE UPLOAD
      url: urlPicture,
    };
  }

  // UPLOAD SECTIONS ATTACHMENTS
  async uploadBannerSections(
    section: SectionInputCreate,
    sectionID: Types.ObjectId,
  ) {
    // CREATE ID SECTION
    const _id: any = new Types.ObjectId();

    const pictureImageDetail = await getImageDetail(
      sectionID,
      null,
      section.banner.pictureImageDetail,
      'sections',
      null,
      'create',
    );

    // REMOVE NEW PICTURE BANNER
    const bannerClean = _.omit(section.banner, ['newUploadPictureItem']);

    return {
      // SET ALL DATA DTO
      ...bannerClean,

      // SET ID
      _id,

      // SET IMAGE UPLOAD
      picture: null,
      pictureImageDetail,
    };
  }

  async mapToGridCreationType(
    grid: GridSectionInputCreate,
    sectionID: Types.ObjectId,
    setId?: boolean,
  ) {
    const _id: any = setId ? new Types.ObjectId() : null;
    // UPLOAD IMAGES ON LAYOUTS
    const layouts = await Promise.all(
      grid.layouts.map(async (layout: LayoutInputCreateType) =>
        this.mapToLayoutCreationType(layout, sectionID),
      ),
    );

    // RETURN CARDS
    return { ...grid, ...(setId && { _id }), layouts };
  }

  async mapToGridsCreationType(
    grids: GridSectionInputCreate[],
    sectionID: Types.ObjectId,
  ) {
    // UPLOAD IMAGES ON LAYOUTS
    const gridsResult = await Promise.all(
      grids.map(async (grid) =>
        this.mapToGridCreationType(grid, sectionID, true),
      ),
    );

    return gridsResult;
  }

  async mapToGalleryCreationType(
    section: SectionInputCreate,
    sectionID: Types.ObjectId,
  ) {
    // UPLOAD IMAGES ON LAYOUTS
    const items = await Promise.all(
      section.gallery.items.map(async (gallery: GalleryItemInputCreateType) => {
        // CREATE ID SECTION
        const _id: any = new Types.ObjectId();
        const imageDetail = await getImageDetail(
          sectionID,
          null,
          gallery.imageDetail,
          'sections',
          null,
          'create',
        );

        const iconImageDetail = await getImageDetail(
          sectionID,
          null,
          gallery.iconImageDetail,
          'sections',
          null,
          'create',
        );

        const layoutResult = {
          // SET ALL DATA DTO
          ...gallery,
          // SET ID
          _id,
          imageDetail,
          iconImageDetail,
        };

        // RETURN SECTIONS
        return layoutResult;
      }),
    );

    // RETURN CARDS
    return { ...section.gallery, items };
  }

  // UPDATE SECTIONS CARDS
  async updateGridSections(
    grid: GridSectionInputUpdate,
    sectionID: Types.ObjectId,
    setId?: boolean,
  ) {
    const { status, ...cleanGrid } = grid;
    const _id: any = setId
      ? new Types.ObjectId(status === 'update' ? String(grid._id) : null)
      : null;

    // UPLOAD CARDS
    const layouts = await Promise.all(
      grid.layouts.map(async (gridLayout: LayoutInputUpdateType) => {
        // VALIDATE CARD STATUS
        if (gridLayout.status && gridLayout.status === 'remove') {
          gridLayout._id &&
            (await this.removeFilesItem(sectionID, sectionID, 'grids'));
          return null;
        } else if (gridLayout.status && gridLayout.status === 'update') {
          return this.mapToLayoutUpdateType(gridLayout, sectionID, grid._id);
        } else if (gridLayout.status && gridLayout.status === 'create') {
          return this.mapToLayoutCreationType(gridLayout, sectionID);
        } else {
          // REMOVE UNNECESSARY ATTRIBUTES
          const gridLayoutClean = _.omit(gridLayout, ['status']);
          return {
            ...gridLayoutClean,
          };
        }
      }),
    );
    const cleanLayouts = layouts.filter((card) => card !== null);
    // RETURN CARDS
    return {
      ...cleanGrid,
      ...(setId && { _id }),
      layouts: cleanLayouts,
    };
  }

  // UPDATE SECTIONS CARDS
  async updateGridsSections(
    grids: GridSectionInputUpdate[],
    sectionID: Types.ObjectId,
  ) {
    // UPLOAD CARDS
    const mappedGrids = await Promise.all(
      grids.map(async (grid) => this.updateGridSections(grid, sectionID, true)),
    );

    return mappedGrids;
  }

  async mapToLayoutCreationType(
    layout: LayoutInputCreateType,
    sectionID: Types.ObjectId,
  ) {
    // CREATE ID SECTION
    const _id: any = new Types.ObjectId();

    // SET NEW IMAGES
    const imageDetail = await getImageDetail(
      sectionID,
      null,
      layout.imageDetail,
      'sections',
      null,
      'create',
    );

    const button = {
      ...layout.button,
      picture: null,
      icon: null,
      pictureImageDetail: layout.button?.pictureImageDetail
        ? await getImageDetail(
            sectionID,
            null,
            layout.button?.pictureImageDetail,
            'sections',
            null,
            'create',
          )
        : null,
      iconImageDetail: layout.button?.iconImageDetail
        ? await getImageDetail(
            sectionID,
            null,
            layout.button?.iconImageDetail,
            'sections',
            null,
            'create',
          )
        : null,
    };

    const layoutClean = _.omit(layout, ['status']);
    const layoutResult = {
      // SET ALL DATA DTO
      ...layoutClean,
      // SET ID
      _id,
      i: _id.toString(),
      image: null,
      imageDetail,
      button,
    };

    // RETURN SECTIONS
    return layoutResult;
  }

  async mapToLayoutUpdateType(
    layout: LayoutInputUpdateType,
    sectionID: Types.ObjectId,
    gridID: Types.ObjectId,
  ) {
    // SET NEW IMAGES
    const imageDetail = await getImageDetail(
      sectionID,
      layout.image,
      layout.imageDetail,
      'sections',
      async () =>
        await this.removeFilesItem(sectionID, layout._id, 'grids.imageDetail'),
    );

    const button = {
      ...layout.button,
      picture: null,
      icon: null,
      pictureImageDetail:
        layout.button?.picture || layout.button?.pictureImageDetail
          ? await getImageDetail(
              sectionID,
              layout.button?.picture,
              layout.button?.pictureImageDetail,
              'sections',
              async () =>
                await this.removeFilesItem(
                  sectionID,
                  layout._id,
                  'grids.button.pictureImageDetail',
                ),
            )
          : null,
      iconImageDetail:
        layout.button?.icon || layout.button?.iconImageDetail
          ? await getImageDetail(
              sectionID,
              layout.button?.icon,
              layout.button?.iconImageDetail,
              'sections',
              async () =>
                await this.removeFilesItem(
                  sectionID,
                  layout._id,
                  'grids.button.iconImageDetail',
                ),
            )
          : null,
    };

    // REMOVE NEW PICTURE CARD
    const layoutClean = _.omit(layout, ['status']);
    // RETURN CARD UPDATE
    return {
      ...layoutClean,
      _id: layoutClean._id,
      button,
      image: null,
      imageDetail,
    };
  }

  // CHECK IMAGES UPLOAD BUCKET
  async retrieveUploadedImageUrl(
    flag: string,
    fileToUpload: any,
    sectionID: Types.ObjectId,
    target?: string,
    itemID?: Types.ObjectId | string | null,
    fileType?: string,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' &&
      (await this.removeFilesItem(sectionID, itemID, target));

    const createParams = {
      filepath: 'sections',
      filetype: fileType ?? ImageCompression.defaultFormat,
      base64: fileToUpload,
      fileID: sectionID,
    };
    const file = await this.azureBlobStorageService.upload(createParams);
    return file.Location;
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadFileSection(
    flag: string,
    fileSection: any,
    sectionID: Types.ObjectId,
    type: string,
    target?: string,
    itemID?: Types.ObjectId | string | null,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' &&
      (await this.removeFilesItem(sectionID, itemID, target));

    // UPLOAD NEW IMAGE
    const file: any = await this.uploadFiles(fileSection, sectionID, type);
    return file.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, sectionID: Types.ObjectId, type: string) {
    const createParams = {
      filepath: 'sections',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: type === 'file' ? file[0].file : file[0].img,
      fileID: sectionID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(sectionID: Types.ObjectId, target: string) {
    const removeObject = [];
    const sectionQuery = this.sectionModel.findById(sectionID);
    if (!sectionQuery || typeof sectionQuery.select !== 'function') {
      return;
    }
    const section = await sectionQuery
      .select('cards attachments banner image grids gallery')
      .lean();
    if (!section) {
      return;
    }

    if (target === 'banner') {
      if (section.banner?.picture) {
        removeObject.push({
          Key: `${ASContainerName}${section.banner.picture.split(ASContainerName)[1]}`,
        });
      }
    } else if (target === 'image') {
      if (section.image?.url) {
        removeObject.push({
          Key: `${ASContainerName}${section.image.url.split(ASContainerName)[1]}`,
        });
      }
    } else if (target === 'cards') {
      section.cards?.forEach((card: any) => {
        if (card?.picture) {
          removeObject.push({
            Key: `${ASContainerName}${card.picture.split(ASContainerName)[1]}`,
          });
        }
      });
    } else if (target === 'attachments') {
      section.attachments?.forEach((attachment: any) => {
        if (attachment?.file) {
          removeObject.push({
            Key: `${ASContainerName}${attachment.file.split(ASContainerName)[1]}`,
          });
        }
      });
    } else if (target === 'grids') {
      section.grids?.forEach((grid: GridSectionType) => {
        grid.layouts?.forEach((layout: LayoutType) => {
          if (layout.image) {
            removeObject.push({
              Key: `${ASContainerName}${layout.image.split(ASContainerName)[1]}`,
            });
          }
          if (layout.button) {
            if (layout.button.picture) {
              removeObject.push({
                Key: `${ASContainerName}${layout.button.picture.split(ASContainerName)[1]}`,
              });
            }
            if (layout.button.icon) {
              removeObject.push({
                Key: `${ASContainerName}${layout.button.icon.split(ASContainerName)[1]}`,
              });
            }
          }
        });
      });
    } else if (target === 'gallery') {
      section.gallery?.items?.forEach((item: GalleryItemType) => {
        if (item?.image) {
          removeObject.push({
            Key: `${ASContainerName}${item.image.split(ASContainerName)[1]}`,
          });
        }
      });
    }

    // RETURN REMOVE FILES
    if (removeObject.length === 0) {
      return;
    }
    return await this.azureBlobStorageService.remove(removeObject);
  }

  // REMOVE ITEMS BUCKET
  async removeFilesItem(
    sectionID: Types.ObjectId,
    itemID: Types.ObjectId | string | null,
    target: string,
  ) {
    const removeObject = [];
    const sectionQuery = this.sectionModel.findById(sectionID);
    if (!sectionQuery || typeof sectionQuery.select !== 'function') {
      return;
    }
    const section = await sectionQuery.select(target).lean();
    if (!section) {
      return;
    }

    if (target === 'banner') {
      if (section.banner?.picture) {
        removeObject.push({
          Key: `${ASContainerName}${section.banner.picture.split(ASContainerName)[1]}`,
        });
      } else if (
        section.banner?.pictureImageDetail &&
        section.banner.pictureImageDetail.image
      ) {
        removeObject.push({
          Key: `${ASContainerName}${section.banner.pictureImageDetail.image.split(ASContainerName)[1]}`,
        });
      }
    } else if (target === 'image') {
      if (section.image?.url) {
        removeObject.push({
          Key: `${ASContainerName}${section.image.url.split(ASContainerName)[1]}`,
        });
      } else if (section.imageDetail?.image) {
        removeObject.push({
          Key: `${ASContainerName}${section.imageDetail?.image.split(ASContainerName)[1]}`,
        });
      }
    } else if (target === 'cards') {
      section.cards?.find((card: any) => {
        if (String(card._id) === String(itemID)) {
          if (card.picture) {
            removeObject.push({
              Key: `${ASContainerName}${card.picture.split(ASContainerName)[1]}`,
            });
          } else if (card.pictureImageDetail) {
            removeObject.push({
              Key: `${ASContainerName}${card.pictureImageDetail.image.split(ASContainerName)[1]}`,
            });
          }
        }
        return String(card._id) === String(itemID);
      });
    } else if (target === 'attachments') {
      section.attachments?.find((attachment: any) => {
        String(attachment._id) === String(itemID) &&
          attachment.file &&
          removeObject.push({
            Key: `${ASContainerName}${attachment.file.split(ASContainerName)[1]}`,
          });
      });
    } else if (target.includes('grids')) {
      const [gridID, layoutID] = String(itemID).split('_');
      const grid = section.grids?.find(
        (grid: GridSectionType) => String(grid._id) === String(gridID),
      );

      const layout = grid?.layouts.find(
        (layout: any) => String(layout._id) === String(layoutID),
      );

      if (layout) {
        if (target.includes('grids.image') && layout.image) {
          removeObject.push({
            Key: `${ASContainerName}${layout.image.split(ASContainerName)[1]}`,
          });
        }
        if (target.includes('grids.button') && layout.button) {
          if (
            target.includes('grids.button.picture') &&
            layout.button.picture
          ) {
            removeObject.push({
              Key: `${ASContainerName}${layout.button.picture.split(ASContainerName)[1]}`,
            });
          }
          if (target.includes('grids.button.icon') && layout.button.icon) {
            removeObject.push({
              Key: `${ASContainerName}${layout.button.icon.split(ASContainerName)[1]}`,
            });
          }
        }
      }
    } else if (target.includes('gallery')) {
      const item = section.gallery?.items?.find(
        (galleryItem: GalleryItemType) =>
          String(galleryItem._id) === String(itemID),
      );

      if (item) {
        if (target.includes('gallery.image') && item.image) {
          removeObject.push({
            Key: `${ASContainerName}${item.image.split(ASContainerName)[1]}`,
          });
        }
        if (target.includes('grids.icon') && item.icon) {
          removeObject.push({
            Key: `${ASContainerName}${item.icon.split(ASContainerName)[1]}`,
          });
        }
        if (target.includes('gallery.imageDetail') && item.image) {
          removeObject.push({
            Key: `${ASContainerName}${item.imageDetail.image.split(ASContainerName)[1]}`,
          });
        }
        if (target.includes('grids.iconImageDetail') && item.icon) {
          removeObject.push({
            Key: `${ASContainerName}${item.iconImageDetail.image.split(ASContainerName)[1]}`,
          });
        }
      }
    }

    // RETURN REMOVE FILES
    if (removeObject.length === 0) {
      return;
    }
    return await this.azureBlobStorageService.remove(removeObject);
  }
}
