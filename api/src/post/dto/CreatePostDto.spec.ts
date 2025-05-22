import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import CreatePostDto from './CreatePostDto';

describe('CreatePostDto', () => {
  it('should pass validation with valid input', async () => {
    const dto = plainToInstance(CreatePostDto, {
      description: 'Valid description',
      tags: ['tag1', 'tag2'],
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with empty tags', async () => {
    const dto = plainToInstance(CreatePostDto, {
      description: 'Valid description',
      tags: [],
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation without tags', async () => {
    const dto = plainToInstance(CreatePostDto, {
      description: 'Valid description',
    });

    const errors = await validate(dto, { skipMissingProperties: true });
    expect(errors.length).toBe(0);
  });

  it('should pass validation without description', async () => {
    const dto = plainToInstance(CreatePostDto, {
      tags: ['tag1', 'tag2'],
    });

    const errors = await validate(dto, { skipMissingProperties: true });
    expect(errors.length).toBe(0);
  });

  it('should fail validation with non-string description', async () => {
    const dto = plainToInstance(CreatePostDto, {
      description: 123,
      tags: ['tag1', 'tag2'],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
  });

  it('should fail validation with non-array tags', async () => {
    const dto = plainToInstance(CreatePostDto, {
      description: 'Valid description',
      tags: 'not-an-array',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('tags');
  });

  it('should fail validation with non-string elements in tags array', async () => {
    const dto = plainToInstance(CreatePostDto, {
      description: 'Valid description',
      tags: ['valid', 123, 'also-valid'],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('tags');
  });
});
