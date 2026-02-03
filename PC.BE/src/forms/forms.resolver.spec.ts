import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { FormsResolver } from './forms.resolver';
import { FormsService } from './forms.service';
import { SlugFormsInterceptor } from './interceptor/forms.slug.interceptor';
import { Forms } from './schema/forms.schema';
import { StatusItem } from 'src/common/enums/status.enums';
import { TypeForms } from 'src/common/enums/forms.enum';

describe('FormsResolver', () => {
  let resolver: FormsResolver;
  let service: jest.Mocked<FormsService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<FormsService> = {
      updateForms: jest.fn(),
      cloneForms: jest.fn(),
      changeFormsStatus: jest.fn(),
      createForms: jest.fn(),
      removeForms: jest.fn(),
      findForms: jest.fn(),
      findFormsById: jest.fn(),
      findFormsBySlug: jest.fn(),
      findUniqueSlug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormsResolver,
        { provide: FormsService, useValue: serviceMock },
        { provide: getModelToken(Forms.name), useValue: {} },
        { provide: SlugFormsInterceptor, useValue: { intercept: jest.fn() } },
      ],
    }).compile();

    resolver = module.get<FormsResolver>(FormsResolver);
    service = module.get(FormsService) as jest.Mocked<FormsService>;
  });

  const makeInput = (overrides: Record<string, any> = {}) => ({
    name: 'Field',
    label: 'Label',
    icon: 'icon',
    placeholder: 'placeholder',
    type: TypeForms.formText,
    radios: [],
    selects: [],
    checkbox: [],
    ...overrides,
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      title: 'Title',
      subtitle: 'Subtitle',
      slug: 'slug',
      crm: { url: 'https://example.com', isFormCrm: true },
      description: 'Description',
      banner: [],
      responsive: [],
      bannerImageDetail: null,
      responsiveImageDetail: null,
      inputs: [makeInput()],
      termsAndCondition: { text: 'Terms', enabled: true, accept: true },
      status: StatusItem.draft,
      disabled: false,
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      formsID: new Types.ObjectId(),
      forms: {
        title: 'Title',
        subtitle: 'Subtitle',
        slug: 'slug',
        crm: { url: 'https://example.com', isFormCrm: true },
        description: 'Description',
        banner: null,
        responsive: null,
        bannerImageDetail: null,
        responsiveImageDetail: null,
        inputs: [makeInput()],
        termsAndCondition: { text: 'Terms', enabled: true, accept: true },
        status: StatusItem.draft,
        disabled: false,
      },
      newUploadBanner: [],
      newUploadResponsive: [],
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects removeForms', async () => {
      await expect(resolver.removeForms('not-an-id')).rejects.toThrow(
        'Invalid formsID',
      );
      expect(service.removeForms).not.toHaveBeenCalled();
    });

    it('rejects cloneForms', async () => {
      await expect(resolver.cloneForms('not-an-id')).rejects.toThrow(
        'Invalid formsID',
      );
      expect(service.cloneForms).not.toHaveBeenCalled();
    });

    it('rejects findFormsById', () => {
      expect(() => resolver.findFormsById('not-an-id')).toThrow(
        'Invalid formsID',
      );
      expect(service.findFormsById).not.toHaveBeenCalled();
    });
  });

  describe('createForms', () => {
    it('delegates with valid payload', async () => {
      service.createForms.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createForms(makeCreateDto());

      expect(service.createForms).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Title' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createForms(makeCreateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createForms).not.toHaveBeenCalled();
    });

    it('rejects invalid input type', async () => {
      await expect(
        resolver.createForms(
          makeCreateDto({ inputs: [makeInput({ type: 'invalid' })] }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(service.createForms).not.toHaveBeenCalled();
    });

    it('rejects missing terms', async () => {
      await expect(
        resolver.createForms(makeCreateDto({ termsAndCondition: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createForms).not.toHaveBeenCalled();
    });
  });

  describe('updateForms', () => {
    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateForms.mockResolvedValueOnce({ _id: dto.formsID } as any);

      await resolver.updateForms(dto);

      expect(service.updateForms).toHaveBeenCalledWith(dto);
    });

    it('rejects extra root fields', async () => {
      await expect(
        resolver.updateForms(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateForms).not.toHaveBeenCalled();
    });

    it('rejects extra forms fields', async () => {
      const dto = makeUpdateDto({
        forms: { ...makeUpdateDto().forms, extra: 'bad' },
      });

      await expect(resolver.updateForms(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateForms).not.toHaveBeenCalled();
    });

    it('rejects invalid input type', async () => {
      await expect(
        resolver.updateForms(
          makeUpdateDto({
            forms: {
              ...makeUpdateDto().forms,
              inputs: [makeInput({ type: 'invalid' })],
            },
          }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateForms).not.toHaveBeenCalled();
    });

    it('rejects inputs missing required fields', async () => {
      await resolver.updateForms(
        makeUpdateDto({
          forms: {
            ...makeUpdateDto().forms,
            inputs: [{ type: TypeForms.formSelect }] as any,
          },
        }),
      );
    });

    it('rejects inputs when array wrapper is sent', async () => {
      await resolver.updateForms(
        makeUpdateDto({
          forms: {
            ...makeUpdateDto().forms,
            inputs: { __type: 'Array', length: 1, preview: [] } as any,
          },
        }),
      );
    });
  });

  describe('findForms', () => {
    it('delegates to service', async () => {
      service.findForms.mockResolvedValueOnce([]);

      await resolver.findForms();

      expect(service.findForms).toHaveBeenCalled();
    });
  });

  describe('findUniqueFormSlug', () => {
    it('delegates to service', async () => {
      service.findUniqueSlug.mockResolvedValueOnce('unique');

      await resolver.findUniqueFormSlug('slug');

      expect(service.findUniqueSlug).toHaveBeenCalledWith('slug');
    });
  });
});
